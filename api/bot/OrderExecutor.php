<?php

class OrderExecutor {
    private $conn;
    private $logger;
    private $binance;

    public function __construct($conn, $logger, $binance) {
        $this->conn = $conn;
        $this->logger = $logger;
        $this->binance = $binance;
    }

    public function placeOrder($userId, $asset, $direction, $amount, $price, $settings, $duration = '1m') {
        // 1. Attempt to place order on Binance if API keys are present
        $binanceOrderId = null;
        if (!empty($settings['binance_api_key']) && !empty($settings['binance_api_secret'])) {
            // Determine quantity (this is a simple approximation for MARKET orders)
            $quantity = round($amount / $price, 5);
            $side = ($direction === 'up') ? 'BUY' : 'SELL';

            $res = $this->binance->placeOrder(
                $settings['binance_api_key'],
                $settings['binance_api_secret'],
                $asset,
                $side,
                'MARKET',
                $quantity
            );

            if (isset($res['orderId'])) {
                $binanceOrderId = $res['orderId'];
                $this->logger->log("Binance Order Placed: " . $binanceOrderId, $userId);
            } else {
                $this->logger->log("Binance Order Failed: " . ($res['msg'] ?? 'Unknown error'), $userId);
                // Depending on requirements, we might want to stop here if exchange trade is mandatory
                // For now, we continue to log it in local DB
            }
        }

        // 2. Record in local database
        $this->conn->begin_transaction();
        try {
            $stmt = $this->conn->prepare("UPDATE trading_wallets SET balance = balance - ? WHERE user_id = ?");
            $stmt->bind_param("di", $amount, $userId);
            $stmt->execute();

            $isBot = 1;
            $status = 'open';

            // Calculate SL and TP prices (e.g., 2% SL, 5% TP as per default or settings)
            $sl_pct = (float)($settings['stop_loss'] ?? 2.0) / 100;
            $tp_pct = (float)($settings['take_profit'] ?? 5.0) / 100;

            if ($direction === 'up') {
                $sl_price = $price * (1 - $sl_pct);
                $tp_price = $price * (1 + $tp_pct);
            } else {
                $sl_price = $price * (1 + $sl_pct);
                $tp_price = $price * (1 - $tp_pct);
            }

            $stmt = $this->conn->prepare("INSERT INTO trades (user_id, asset_symbol, direction, amount, entry_price, status, is_bot, duration, sl_price, tp_price, start_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->bind_param("issddsdSdd", $userId, $asset, $direction, $amount, $price, $status, $isBot, $duration, $sl_price, $tp_price);
            $stmt->execute();
            $tradeId = $this->conn->insert_id;

            $msg = "Bot opened $direction trade for $asset at $price with amount $amount";
            if ($binanceOrderId) $msg .= " (Binance Order ID: $binanceOrderId)";

            $stmt = $this->conn->prepare("INSERT INTO trade_logs (trade_id, message) VALUES (?, ?)");
            $stmt->bind_param("is", $tradeId, $msg);
            $stmt->execute();

            $this->conn->commit();
            $this->logger->log($msg, $userId);
            return $tradeId;
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->logger->log("Order local record failed: " . $e->getMessage(), $userId);
            return false;
        }
    }
}
