<?php

require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/BinanceClient.php';
require_once __DIR__ . '/StrategyEngine.php';
require_once __DIR__ . '/RiskManager.php';
require_once __DIR__ . '/OrderExecutor.php';
require_once __DIR__ . '/Logger.php';

set_time_limit(55);

$db = new Database();
$conn = $db->getConnection();
$logger = new Logger();
$binance = new BinanceClient();
$strategy = new StrategyEngine();
$risk = new RiskManager();
$executor = new OrderExecutor($conn, $logger, $binance);

$logger->log("Bot execution started");

// Assets to trade
$assets = ['BTC', 'ETH', 'SOL'];

// 1. Process Trading Sessions
$sql = "SELECT bs.*, tw.balance as wallet_balance
        FROM bot_sessions bs
        JOIN trading_wallets tw ON bs.user_id = tw.user_id
        WHERE bs.status = 'running'";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    // Fetch signals for each asset
    $signals = [];
    $prices = [];
    $candleTimestamps = [];

    foreach ($assets as $asset) {
        $latestCandle = $binance->getLatestCandle($asset);
        if ($latestCandle) {
            $klines = $binance->getKlines($asset);
            $signals[$asset] = $strategy->analyze($klines);
            $prices[$asset] = $latestCandle['close'];
            $candleTimestamps[$asset] = $latestCandle['timestamp'];
        }
    }

    while ($session = $result->fetch_assoc()) {
        $userId = $session['user_id'];
        $walletBalance = (float)$session['wallet_balance'];

        $stmt = $conn->prepare("SELECT * FROM bot_settings WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $settings = $stmt->get_result()->fetch_assoc();

        if (!$settings) {
            $conn->query("INSERT INTO bot_settings (user_id) VALUES ($userId)");
            $stmt->execute();
            $settings = $stmt->get_result()->fetch_assoc();
        }

        foreach ($assets as $asset) {
            if (!isset($signals[$asset]) || !$signals[$asset]) continue;

            // Check if already traded in this candle
            $candleTime = date("Y-m-d H:i:s", $candleTimestamps[$asset] / 1000);
            $checkStmt = $conn->prepare("SELECT trade_id FROM trades WHERE user_id = ? AND asset_symbol = ? AND is_bot = 1 AND start_time >= ?");
            $checkStmt->bind_param("iss", $userId, $asset, $candleTime);
            $checkStmt->execute();
            if ($checkStmt->get_result()->num_rows > 0) continue;

            // Force 5% risk per trade as per requirement
            $tradeAmount = (5 / 100) * $walletBalance;
            if ($tradeAmount < 1) $tradeAmount = 1;

            if ($risk->canTrade($userId, $tradeAmount, $settings, $walletBalance)) {
                $executor->placeOrder($userId, $asset, $signals[$asset], $tradeAmount, $prices[$asset], $settings);
            }
        }
    }
}

// 2. Automatically close expired trades (1m duration)
$stmt = $conn->prepare("SELECT * FROM trades WHERE status = 'open' AND is_bot = 1");
$stmt->execute();
$openTrades = $stmt->get_result();

while ($trade = $openTrades->fetch_assoc()) {
    $startTime = strtotime($trade['start_time']);
    $duration = (int)$trade['duration'];
    $asset = $trade['asset_symbol'];

    $currentCandle = $binance->getLatestCandle($asset);
    if (!$currentCandle) continue;
    $currentPrice = $currentCandle['close'];

    $shouldClose = false;
    $closeReason = "";

    // 1. Check SL/TP
    $slPrice = $trade['sl_price'] ? (float)$trade['sl_price'] : null;
    $tpPrice = $trade['tp_price'] ? (float)$trade['tp_price'] : null;
    $direction = $trade['direction'];

    if ($direction === 'up') {
        if ($slPrice && $currentPrice <= $slPrice) {
            $shouldClose = true;
            $closeReason = "Stop Loss Hit";
        } else if ($tpPrice && $currentPrice >= $tpPrice) {
            $shouldClose = true;
            $closeReason = "Take Profit Hit";
        }
    } else {
        if ($slPrice && $currentPrice >= $slPrice) {
            $shouldClose = true;
            $closeReason = "Stop Loss Hit";
        } else if ($tpPrice && $currentPrice <= $tpPrice) {
            $shouldClose = true;
            $closeReason = "Take Profit Hit";
        }
    }

    // 2. Check Duration
    if (!$shouldClose && time() >= ($startTime + ($duration * 60))) {
        $shouldClose = true;
        $closeReason = "Duration Expired";
    }

    if ($shouldClose) {
        $exitPrice = $currentPrice;
        $entryPrice = (float)$trade['entry_price'];
        $amount = (float)$trade['amount'];

        $pctDiff = ($exitPrice - $entryPrice) / $entryPrice;
        if ($direction === 'up') {
            $pnl = $pctDiff * $amount;
        } else {
            $pnl = -$pctDiff * $amount;
        }

        $returnAmt = $amount + $pnl;
        $status = ($pnl >= 0) ? 'won' : 'lost';
        $userId = $trade['user_id'];
        $tradeId = $trade['trade_id'];

        $conn->begin_transaction();
        try {
            $upd1 = $conn->prepare("UPDATE trading_wallets SET balance = balance + ? WHERE user_id = ?");
            $upd1->bind_param("di", $returnAmt, $userId);
            $upd1->execute();

            $upd2 = $conn->prepare("UPDATE trades SET status = ?, exit_price = ?, pnl = ?, end_time = NOW() WHERE trade_id = ?");
            $upd2->bind_param("sddi", $status, $exitPrice, $pnl, $tradeId);
            $upd2->execute();

            $conn->commit();
            $logger->log("Bot trade #$tradeId closed. Result: $status, PnL: $pnl", $userId);
        } catch (Exception $e) {
            $conn->rollback();
            $logger->log("Failed to close trade #$tradeId: " . $e->getMessage(), $userId);
        }
    }
}

$logger->log("Bot execution completed");
$conn->close();
