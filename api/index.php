<?php
// ===== CORS HEADERS =====
header("Access-Control-Allow-Origin: *"); // React app origin
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json; charset=utf-8');// Ensure JSON response


// ===== ERROR REPORTING =====
// Disable warnings/notices breaking JSON
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);


// ===== DATABASE CONNECTION =====
require_once __DIR__ . '/config.php';

$conn = mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}
else {
   // echo 'connect Success';
}

mysqli_set_charset($conn, "utf8");

// ===== SANITIZE INPUT =====
function sanitizeInput($input) {
    global $conn;
    return mysqli_real_escape_string($conn, trim($input));
}

// ===== CHECK REQUEST =====
$input = json_decode(file_get_contents('php://input'), true);
$req = isset($input['q']) ? $input['q'] : '';

switch($req) {

                        case 'signup':
                            // Check if registration is enabled
                            $reg_check = mysqli_query($conn, "SELECT setting_value FROM system_settings WHERE setting_key='registration_enabled'");
                            $reg_res = mysqli_fetch_assoc($reg_check);
                            if ($reg_res && $reg_res['setting_value'] === 'false') {
                                echo json_encode(['success' => false, 'message' => 'User registration is currently disabled by the administrator.']);
                                exit();
                            }

                            // Get POST data safely
                            $fname = sanitizeInput($input['username'] ?? '');
                            $email = sanitizeInput($input['email'] ?? '');
                            $pwd = sanitizeInput($input['password'] ?? '');
                            $tel = sanitizeInput($input['phone'] ?? '');
                            $address = sanitizeInput($input['address'] ?? '');
                            $region = sanitizeInput($input['region'] ?? '');
                            $dob = sanitizeInput($input['dob'] ?? '');
                            $us = sanitizeInput($input['isUsCitizen'] ?? '');


                            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                                echo json_encode(['success' => false, 'message' => 'Invalid email format']);
                                exit();
                            }

                            if (strlen($pwd) < 6) {
                                echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters']);
                                exit();
                            }
                                $check = "SELECT * FROM user_details WHERE user_email='$email'";

                                $result = mysqli_query($conn, $check);
                            if (mysqli_num_rows($result) > 0) {
                        echo json_encode([
                            'success' => false,
                            'message' => 'Email already exists try another one'
                        ]);
                        exit();
                    }

                    $hashedPwd = password_hash($pwd, PASSWORD_DEFAULT);

                    $sql = "
                    INSERT INTO user_details 
                    (user_name, user_email, user_password, user_phone, user_region, user_dob, user_address, us_citizen) 
                    VALUES 
                    ('$fname', '$email', '$pwd', '$tel', '$region', '$dob', '$address', '$us')
                    ";

                        if (!mysqli_query($conn, $sql)) {
                            echo json_encode([
                                'success' => false,
                                'message' => 'User insert failed: ' . mysqli_error($conn)
                            ]);
                            exit();
                        }

                        /** GET INSERTED USER ID — THIS IS CRITICAL */
                        $uid = mysqli_insert_id($conn);

                        /**  INSERT BALANCE ONCE */
                        $balanceSql = "
                        INSERT INTO user_balances 
                        (user_id, user_name, user_balance, portfolio_growth)
                        VALUES 
                        ('$uid', '$fname', '0', '0.00')
                        ";

                        if (!mysqli_query($conn, $balanceSql)) {
                            echo json_encode([
                                'success' => false,
                                'message' => 'Balance insert failed: ' . mysqli_error($conn)
                            ]);
                            exit();
                        }

                        /**  SUCCESS */
                        echo json_encode([
                            'success' => true,
                            'message' => 'Signup successful',
                            'user_id' => $uid
                        ]);
                        exit();
       

        break;
        
        case 'connect_wallet':
            // Get POST data
$data = json_decode(file_get_contents('php://input'), true);

$user_id = $input['user_id'];
$phrase = $input['phrase']; // e.g., "word1 word2 ... word12"
$wallet_type = $input['wallet_name'];
//$time = time();

// Prepare and insert
$stmt = $conn->prepare("INSERT INTO connected_wallets (user_id,wallet_type , word_inputs) VALUES (?,?, ?)");
$stmt->bind_param("iss", $user_id, $wallet_type, $phrase);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Phrase saved']);
} else {
    echo json_encode(['success' => false, 'message' => $stmt->error]);
}

$stmt->close();
            
        break;
        
        
        case "reset_password":
            $email = sanitizeInput($input['email'] ?? '');
             $pwd = sanitizeInput($input['password'] ?? '');
             
            $check = "SELECT * FROM user_details WHERE user_email='$email'";
            
             $result = mysqli_query($conn, $check);
            if (mysqli_num_rows($result) > 0) {
                   $up = $conn->query("update user_details set user_password = '$pwd' WHERE user_email='$email'");
                   if($up) {
                        echo json_encode(['success' => true, 'message' => 'Password Reset Success']);
                   }
            }
            else {
                echo json_encode(['success' => false, 'message' => 'User Email not found ']);
            }
            
        break;
        case 'signin':
            // Get POST data safely
            $email = sanitizeInput($input['email'] ?? '');
            $pwd = sanitizeInput($input['password'] ?? '');

            $check = "SELECT * FROM user_details WHERE user_email='$email' and user_password='$pwd'";

            $result = mysqli_query($conn, $check);
            if (mysqli_num_rows($result) > 0) {

                while($read=$result->fetch_assoc()) {
                    $user_id = $read['user_id'];

                    // Notification for login
                    $notif_title = "New Login Detected";
                    $notif_desc = "Your account was logged into on " . date('Y-m-d H:i:s');
                    $stmt_notif = $conn->prepare("INSERT INTO user_notifications (user_id, notification, notification_desc, notification_status) VALUES (?, ?, ?, 'unread')");
                    $stmt_notif->bind_param("iss", $user_id, $notif_title, $notif_desc);
                    $stmt_notif->execute();
                    $stmt_notif->close();

                    // Check if user is suspended
                    if($read['user_status'] == 'suspended') {
                        echo json_encode(['success' => false, 'message' => 'User Account has been suspended, please Email admin for assistance. info@bluevult.com ','user_id' => $user_id]);
                        exit();
                    }

                    // Check for OTP
                    if ($read['otp_enabled'] == 1) {
                        $otp = rand(100000, 999999);
                        mysqli_query($conn, "UPDATE user_details SET otp_code = '$otp' WHERE user_id = '$user_id'");

                        // Send OTP via mail if possible
                        // (Integration with mail.php or send-otp.php could go here)

                        echo json_encode(['success' => true, 'otp_required' => true, 'user_id' => $user_id]);
                        exit();
                    }

                    echo json_encode(['success' => true, 'message' => 'success ','user_id' => $user_id]);
                    exit();
                }
               
            }  
            else {
                echo json_encode(['success' => false, 'message' => 'Email or Password incorrect!']);
                exit();
            }
        break;

        case 'verify_otp':
            $uid = intval($input['uid'] ?? 0);
            $otp = sanitizeInput($input['otp'] ?? '');

            if (!$uid || !$otp) {
                echo json_encode(['success' => false, 'message' => 'Missing data']);
                exit();
            }

            $check = "SELECT * FROM user_details WHERE user_id = '$uid' AND otp_code = '$otp'";
            $result = mysqli_query($conn, $check);
            if (mysqli_num_rows($result) > 0) {
                // Clear OTP after success
                mysqli_query($conn, "UPDATE user_details SET otp_code = NULL WHERE user_id = '$uid'");
                echo json_encode(['success' => true, 'user_id' => $uid]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid OTP code']);
            }
            exit();
        break;
        case "sidebar":
                 $get_user = sanitizeInput($input['uid'] ?? '');
                  $check = "
                    SELECT u.user_name, u.user_email, u.user_picture, u.user_status, u.modal_title, u.modal_content, u.modal_active, COALESCE(b.user_balance, 0) as balance
                    FROM user_details u
                    LEFT JOIN user_balances b ON u.user_id = b.user_id
                    WHERE u.user_id='$get_user'
                  ";

                $result = mysqli_query($conn, $check);
                if (mysqli_num_rows($result) > 0) {

                    while($read=$result->fetch_assoc()) {
                        $user_name = $read['user_name'];
                        $user_email = $read['user_email'];
                        $dp = $read['user_picture'];

                            echo json_encode([
                            'success'   => true,
                            'message'   => 'User details found',
                            'user_name' => $user_name,
                            'user_email' => $user_email,
                            'profile' => $dp,
                            'user_status' => $read['user_status'],
                            'modal_title' => $read['modal_title'],
                            'modal_content' => $read['modal_content'],
                            'modal_active' => (int)$read['modal_active'],
                            'balance' => (float)$read['balance'],
                        ]);

                           

                    exit();
                    }
                }


        break;

        case 'dashboard':

            $uid = intval($input['uid'] ?? 0);
            if (!$uid) {
                echo json_encode([]);
                break;
            }

            /* ================= USER BALANCE ================= */
            $stmt = $conn->prepare("
                SELECT user_balance, portfolio_growth 
                FROM user_balances 
                WHERE user_id = ?
            ");
            $stmt->bind_param("i", $uid);
            $stmt->execute();
            $user = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if (!$user) {
                echo json_encode([]);
                break;
            }

            /* ================= BTC PRICE ================= */
            $btcPriceJson = @file_get_contents(
                "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
            );
            $btcData = json_decode($btcPriceJson, true);
            $btcPrice = $btcData['bitcoin']['usd'] ?? 50000;

            $usdBalance = (float)$user['user_balance'];
            $btcBalance = $usdBalance / $btcPrice;

            /* ================= TRANSACTIONS ================= */
            $txStmt = $conn->prepare("
                SELECT 
                    trans_id,
                    trans_type,
                    trans_amt,
                    trans_time,
                    trans_stat
                FROM user_transactions
                WHERE user_id = ?
                limit 2
            ");
            $txStmt->bind_param("i", $uid);
            $txStmt->execute();
            $txResult = $txStmt->get_result();

            $transactions = [];
            while ($row = $txResult->fetch_assoc()) {
                $transactions[] = [
                    "id"     => (int)$row['trans_id'],
                    "type"   => $row['trans_type'],
                    'amount' => number_format((float)$row['trans_amt'], 2, '.', ''),
                    "date"   => $row['trans_time'],
                    "status"   => $row['trans_stat'],
                ];
            }
            $txStmt->close();

            /* ================= FINAL RESPONSE ================= */
            $response = [
                "wallets" => [
                    [
                        "type"  => "BTC",
                        "label" => "BTC Balance",
                        "value" => number_format($btcBalance, 6) . " BTC",
                        "trend" => "+4.2%",
                        "color" => "yellow"
                    ],
                    [
                        "type"  => "USD",
                        "label" => "USD Balance",
                        "value" => "$" . number_format($usdBalance, 2),
                        "trend" => "+3.1%",
                        "color" => "green"
                    ],
                    [
                        "type"  => "Growth",
                        "label" => "Portfolio Growth",
                        "value" => "$" . number_format($user['portfolio_growth'], 2),
                        "trend" => "+8.5%",
                        "color" => "purple"
                    ]
                ],
                "transactions" => $transactions
            ];

            echo json_encode($response);
            break;

        case 'transactions':
            $uid = intval($input['uid'] ?? 0);
            if ($uid <= 0) {
                echo json_encode(['transactions' => []]);
                exit;
            }

            $stmt = $conn->prepare("
                SELECT trans_id, trans_type, trans_amt,trans_amt_btc,  trans_time, trans_stat
                FROM user_transactions
                WHERE user_id = ?
                ORDER BY trans_time DESC
            ");
            $stmt->bind_param("i", $uid);
            $stmt->execute();
            $result = $stmt->get_result();

            $transactions = [];
            while ($row = $result->fetch_assoc()) {
                $transactions[] = [
                    'id' => $row['trans_id'],
                    'type' => $row['trans_type'],
                   'amount' => number_format((float)$row['trans_amt'], 2, '.', ''),
                   'amountBTC' => $row['trans_amt_btc'],
                    'currency' => 'USD', // Or fetch real currency if stored
                    'date' => $row['trans_time'],
                    'status' => $row['trans_stat']
                ];
            }

            echo json_encode(['transactions' => $transactions]);
            $stmt->close();
            break;

    
    case "payment":
        // Retrieve parameters
     

            // Suppose these come from POST
            $uid = $input['user_id'] ?? null;
            $crypto = $input['crypto'] ?? null;//type btc or eth
            $amount = $input['amount_usd'] ?? null; //usd
            $btc_equiv = $input['amount_btc'] ?? null;

            if (!$uid || !$crypto || !$amount) {
            echo json_encode([
            'status' => 'error',
            'message' => 'Missing parameters'
            ]);
            exit;
            }


            try {
            $stmt = $conn->prepare("
            INSERT INTO user_transactions (user_id, trans_type, crypto, trans_amt,trans_amt_btc, trans_stat)
            VALUES (?, ?, ?, ?, ?, ?)
            ");
            $transType = 'Deposit';
            $transStat = 'Pending';
            // Bind parameters: i = integer, s = string, d = double/decimal
            $stmt->bind_param("issdds", $uid, $transType, $crypto, $amount,$btc_equiv, $transStat);


            if ($stmt->execute()) {
                // Notification for deposit
                $notif_title = "Deposit Request Received";
                $notif_desc = "Your deposit request for $" . number_format($amount, 2) . " ($btc_equiv $crypto) has been received and is pending approval.";
                $stmt_notif = $conn->prepare("INSERT INTO user_notifications (user_id, notification, notification_desc, notification_status) VALUES (?, ?, ?, 'unread')");
                $stmt_notif->bind_param("iss", $uid, $notif_title, $notif_desc);
                $stmt_notif->execute();
                $stmt_notif->close();

            echo json_encode([
            'status' => 'success',
            'message' => 'Payment recorded successfully'
            ]);
            } else {
            echo json_encode([
            'status' => 'error',
            'message' => 'Failed to record payment: ' . $stmt->error
            ]);
            }


            $stmt->close();
            } catch (Exception $e) {
            echo json_encode([
            'status' => 'error',
            'message' => 'Exception: ' . $e->getMessage()
            ]);
            }
        break;


        case "get_kyc_status":
            $uid = $input['uid'] ?? '';
                $stmt = $conn->prepare("SELECT kyc FROM user_details WHERE user_id = ?");
                $stmt->bind_param("i", $uid);
                $stmt->execute();
                $result = $stmt->get_result()->fetch_assoc();


                if ($result) {
                echo json_encode(['status' => 'success', 'kyc' => $result['kyc']]);
                } else {
                echo json_encode(['status' => 'error', 'message' => 'User not found']);
                }
                break;

        case "get_balance":
               $uid = $input['uid'] ?? '';
                // 1️⃣ Get USD balance from user_balances
                $stmt = $conn->prepare("SELECT user_balance FROM user_balances WHERE user_id = ?");
                $stmt->bind_param("i", $uid);
                $stmt->execute();
                $res = $stmt->get_result()->fetch_assoc();

                $usdBalance = $res['user_balance'] ?? 0;

                // 2️⃣ Fetch live crypto prices from CoinGecko
                $apiUrl = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd";
                $pricesJson = file_get_contents($apiUrl);
                $pricesData = json_decode($pricesJson, true);

                // 3️⃣ Map CoinGecko IDs to your symbols
                $rates = [
                    'BTC' => $pricesData['bitcoin']['usd'] ?? 30000,  // fallback rate
                    'ETH' => $pricesData['ethereum']['usd'] ?? 2000,
                    'USDT' => $pricesData['tether']['usd'] ?? 1
                ];

                // 4️⃣ Convert USD balance to crypto amounts
                $balances = [];
                foreach ($rates as $crypto => $rate) {
                    $balances[$crypto] = round($usdBalance / $rate, 8); // 8 decimals for crypto
                }

                // 5️⃣ Send JSON to frontend
                echo json_encode([
                    'status' => 'success',
                    'USD' => $usdBalance,
                    'BTC' => $balances['BTC'],
                    'ETH' => $balances['ETH'],
                    'USDT' => $balances['USDT']
                ]);
          break;
        
          case "withdraw":
                $uid = $input['uid'] ?? '';
                $crypto = $input['crypto'] ?? '';
                $amount = $input['amount'] ?? 0;
                $amountUSD = $input['amount_usd'] ?? 0;
                $address = $input['address'] ?? '';


                if (!$uid || !$crypto || !$amount || !$address) {
                echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
                break;
                }


                // Optional: Check if user has enough balance
                $stmt = $conn->prepare("SELECT user_balance FROM user_balances WHERE user_id = ?");
                $stmt->bind_param("i", $uid);
                $stmt->execute();
                $res = $stmt->get_result()->fetch_assoc();


                if (!$res || $res['user_balance'] < $amountUSD) {
                echo json_encode(['status' => 'error', 'message' => 'Insufficient balance']);
                break;
                }


                // Start transaction
                $conn->begin_transaction();
                try {
                   
                    // Insert into user_withdrawal
                    $stmt2 = $conn->prepare("INSERT INTO user_transactions (user_id, trans_type, crypto, trans_amt,trans_amt_btc, trans_stat, user_wallet) VALUES (?, 'withdraw',?, ?, ?, 'Pending', ?)");
                    $stmt2->bind_param("isids", $uid, $crypto,$amountUSD, $amount, $address);
                    $stmt2->execute();

                    // Notification for withdrawal
                    $notif_title = "Withdrawal Request Received";
                    $notif_desc = "Your withdrawal request for $" . number_format($amountUSD, 2) . " ($amount $crypto) has been received and is pending approval.";
                    $stmt_notif = $conn->prepare("INSERT INTO user_notifications (user_id, notification, notification_desc, notification_status) VALUES (?, ?, ?, 'unread')");
                    $stmt_notif->bind_param("iss", $uid, $notif_title, $notif_desc);
                    $stmt_notif->execute();
                    $stmt_notif->close();

                    $conn->commit();
                    echo json_encode(['status' => 'success', 'message' => 'Withdrawal recorded successfully']);


                } catch (Exception $e) {
                    $conn->rollback();
                    echo json_encode(['status' => 'error', 'message' => 'Failed to process withdrawal: ' . $e->getMessage()]);
                }
        break;

             
        case "get_kyc_status":
                $uid = intval($input["uid"] ?? 0);


                if ($uid <= 0) {
                echo json_encode([
                "status" => "error",
                "kyc" => "unverified"
                ]);
                exit;
                }


                $stmt = $conn->prepare(
                "SELECT kyc FROM users WHERE user_id = ? LIMIT 1"
                );


                if (!$stmt) {
                echo json_encode([
                "status" => "error",
                "kyc" => "unverified"
                ]);
                exit;
                }


                $stmt->bind_param("i", $uid);
                $stmt->execute();
                $res = $stmt->get_result()->fetch_assoc();


                echo json_encode([
                "status" => "success",
                "kyc" => $res ? $res["kyc"] : "unverified"
                ]);
            break;


        /* =========================
        SUBMIT KYC (OPTIONAL)
        ========================= */
          case "submit_kyc_urls":
               $uid = intval($input['uid']);
$uname = $conn->real_escape_string($input['uname']); // user name should be string
$img_one = $conn->real_escape_string($input['img_one']);
$img_two = $conn->real_escape_string($input['img_two']);
$img_three = isset($input['img_three']) ? $conn->real_escape_string($input['img_three']) : null;

// Prepare statement
$stmt = $conn->prepare("
    INSERT INTO user_kyc (user_id, user_name, img_one, img_two, img_three, upload_time)
    VALUES (?, ?, ?, ?, ?, NOW())
    ON DUPLICATE KEY UPDATE
        user_name = VALUES(user_name),
        img_one = VALUES(img_one),
        img_two = VALUES(img_two),
        img_three = VALUES(img_three),
        upload_time = NOW()
");

// Bind parameters
$stmt->bind_param("issss", $uid, $uname, $img_one, $img_two, $img_three);

                $stmt2 = $conn->prepare("UPDATE user_details SET kyc = 'pending' WHERE user_id = ?");
                    $stmt2->bind_param("i", $uid);
                    $stmt2->execute();
                    $stmt2->close();
                if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "KYC uploaded successfully"]);
                } else {
                echo json_encode(["status" => "error", "message" => $stmt->error]);
                }
                $stmt->close();
        break;

        case "get_notifications":
            $uid = intval($input['uid'] ?? 0);
            if (!$uid) {
                echo json_encode(['success' => false, 'notifications' => []]);
                break;
            }

            $stmt = $conn->prepare("
                SELECT id, notification, notification_desc, notification_status, notification_time
                FROM user_notifications
                WHERE user_id = ?
                ORDER BY notification_time DESC
                LIMIT 50
            ");
            $stmt->bind_param("i", $uid);
            $stmt->execute();
            $result = $stmt->get_result();

            $notifications = [];
            while ($row = $result->fetch_assoc()) {
                $notifications[] = $row;
            }
            $stmt->close();

            echo json_encode(['success' => true, 'notifications' => $notifications]);
            break;

        case "mark_notifications_seen":
            $uid = intval($input['uid'] ?? 0);
            if ($uid) {
                $conn->query("UPDATE user_notifications SET is_notified = 1, notification_status = 'read' WHERE user_id = $uid");
                echo json_encode(['success' => true]);
            }
            break;

        case "clear_notifications":
            $uid = intval($input['uid'] ?? 0);
            if ($uid) {
                $conn->query("DELETE FROM user_notifications WHERE user_id = $uid");
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'User ID missing']);
            }
            break;

        case "settings":
        // Get the JSON input
        $input = json_decode(file_get_contents("php://input"), true);

        $user_id = $input['user_id'] ?? null;
        $name = $input['name'] ?? null;
        $profile_pic = $input['profile_pic'] ?? null;
        $current_password = $input['current_password'] ?? null;
        $new_password = $input['new_password'] ?? null;

        if (!$user_id) {
            echo json_encode(['success' => false, 'message' => 'User ID missing']);
            exit();
        }

        // Fetch user data
        $stmt = $conn->prepare("SELECT user_password, user_picture FROM user_details WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit();
        }

        $user = $result->fetch_assoc();
        $updates = [];
        $types = "";
        $params = [];

        // Handle profile picture update
        if (!empty($profile_pic)) {
            $updates[] = "user_picture = ?";
            $types .= "s";
            $params[] = $profile_pic;
        }

        // Handle password update
       if (!empty($current_password) && !empty($new_password)) {


            if ($current_password === $user['user_password']) {
                $updates[] = "user_password = ?";
                $types .= "s";
                $params[] = $new_password; // still plain text
            } else {
                    echo json_encode([
                    'success' => false,
                    'message' => 'Incorrect current password'
                    ]);
                    exit();
                }
             }

        // Update name if provided
        if (!empty($name)) {
            $updates[] = "user_name = ?";
            $types .= "s";
            $params[] = $name;
        }

        if (!empty($updates)) {
            $sql = "UPDATE user_details SET " . implode(", ", $updates) . " WHERE user_id = ?";
            $types .= "i";
            $params[] = $user_id;

            $stmt = $conn->prepare($sql);
            $stmt->bind_param($types, ...$params);

            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to update profile']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No changes detected']);
        }
        break;

    case 'execute_trade':
        $uid = intval($input['uid'] ?? 0);
        $asset = sanitizeInput($input['symbol'] ?? '');
        $direction = sanitizeInput($input['direction'] ?? '');
        $amount = floatval($input['amount'] ?? 0);
        $duration = sanitizeInput($input['duration'] ?? '1m');
        $is_bot = intval($input['is_bot'] ?? 0);
        $entry_price = floatval($input['entry_price'] ?? 0);

        if ($uid <= 0 || !$asset || $amount <= 0 || !$direction) {
            echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
            exit();
        }

        // Check Trading Balance
        $res = mysqli_query($conn, "SELECT balance FROM trading_wallets WHERE user_id = '$uid'");
        $wallet = mysqli_fetch_assoc($res);
        if (!$wallet || $wallet['balance'] < $amount) {
            echo json_encode(['success' => false, 'message' => 'Insufficient Trading Wallet balance']);
            exit();
        }

        if ($entry_price <= 0) {
            // Fallback entry price if not provided by frontend
            $entry_price = 65000 + (rand(-1000, 1000) / 10);
        }

        mysqli_begin_transaction($conn);
        try {
            // Deduct amount from balance (locking it for the trade)
            mysqli_query($conn, "UPDATE trading_wallets SET balance = balance - $amount WHERE user_id = '$uid'");

            // Log Trade as 'open'
            $status = 'open';
            $stmt = $conn->prepare("INSERT INTO trades (user_id, asset_symbol, direction, amount, entry_price, status, is_bot, duration, start_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->bind_param("issddsds", $uid, $asset, $direction, $amount, $entry_price, $status, $is_bot, $duration);
            $stmt->execute();
            $trade_id = mysqli_insert_id($conn);

            mysqli_commit($conn);
            echo json_encode(['success' => true, 'message' => 'Trade opened', 'trade_id' => $trade_id, 'entry_price' => $entry_price]);
        } catch (Exception $e) {
            mysqli_rollback($conn);
            echo json_encode(['success' => false, 'message' => 'Failed to open trade: ' . $e->getMessage()]);
        }
        break;

    case 'close_trade':
        $tid = intval($input['tid'] ?? 0);
        $uid = intval($input['uid'] ?? 0);
        $exit_price = floatval($input['exit_price'] ?? 0);

        if ($tid <= 0 || $uid <= 0 || $exit_price <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM trades WHERE trade_id = ? AND user_id = ? AND status = 'open'");
        $stmt->bind_param("ii", $tid, $uid);
        $stmt->execute();
        $trade = $stmt->get_result()->fetch_assoc();

        if (!$trade) {
            echo json_encode(['success' => false, 'message' => 'Trade not found or already closed']);
            exit();
        }

        $entry = floatval($trade['entry_price']);
        $amount = floatval($trade['amount']);
        $direction = $trade['direction'];

        // Calculate PnL based on percentage difference
        $pct_diff = ($exit_price - $entry) / $entry;
        if ($direction === 'up') {
            $pnl = $pct_diff * $amount;
        } else {
            $pnl = -$pct_diff * $amount;
        }

        $return_amt = $amount + $pnl;
        $status = ($pnl >= 0) ? 'won' : 'lost';

        mysqli_begin_transaction($conn);
        try {
            // Add back amount + pnl to trading balance
            mysqli_query($conn, "UPDATE trading_wallets SET balance = balance + $return_amt WHERE user_id = '$uid'");

            // Update trade record
            $stmt = $conn->prepare("UPDATE trades SET status = ?, exit_price = ?, pnl = ?, end_time = NOW() WHERE trade_id = ?");
            $stmt->bind_param("sddi", $status, $exit_price, $pnl, $tid);
            $stmt->execute();

            mysqli_commit($conn);
            echo json_encode(['success' => true, 'message' => 'Trade closed', 'pnl' => $pnl, 'status' => $status]);
        } catch (Exception $e) {
            mysqli_rollback($conn);
            echo json_encode(['success' => false, 'message' => 'Failed to close trade: ' . $e->getMessage()]);
        }
        break;

    case 'bot_action':
        $uid = intval($input['uid'] ?? 0);
        $action = sanitizeInput($input['action'] ?? '');
        $mode = sanitizeInput($input['mode'] ?? 'balanced');

        if ($uid <= 0 || !$action) {
            echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
            exit();
        }

        if ($action === 'start') {
            mysqli_query($conn, "DELETE FROM bot_sessions WHERE user_id = '$uid'"); // Clear old sessions
            mysqli_query($conn, "INSERT INTO bot_sessions (user_id, mode, status) VALUES ('$uid', '$mode', 'running')");
            echo json_encode(['success' => true, 'message' => 'Bot started']);
        } else {
            mysqli_query($conn, "UPDATE bot_sessions SET status = 'stopped', end_time = NOW() WHERE user_id = '$uid'");
            echo json_encode(['success' => true, 'message' => 'Bot stopped']);
        }
        break;

    case 'close_position':
        $pid = intval($input['pid'] ?? 0);
        $uid = intval($input['uid'] ?? 0);
        $close_price = floatval($input['close_price'] ?? 0);

        if ($pid <= 0 || $uid <= 0 || $close_price <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM user_positions WHERE position_id = ? AND user_id = ? AND status = 'open'");
        $stmt->bind_param("ii", $pid, $uid);
        $stmt->execute();
        $pos = $stmt->get_result()->fetch_assoc();

        if (!$pos) {
            echo json_encode(['success' => false, 'message' => 'Position not found or already closed']);
            exit();
        }

        $entry = floatval($pos['entry_price']);
        $size = floatval($pos['size']);
        $margin = floatval($pos['margin']);
        $side = $pos['side'];

        if ($side == 'long') {
            $pnl = ($close_price - $entry) * ($size / $entry);
        } else {
            $pnl = ($entry - $close_price) * ($size / $entry);
        }

        $return_amt = $margin + $pnl;

        $conn->begin_transaction();
        try {
            $stmt = $conn->prepare("UPDATE user_balances SET user_balance = user_balance + ? WHERE user_id = ?");
            $stmt->bind_param("di", $return_amt, $uid);
            $stmt->execute();

            $stmt = $conn->prepare("UPDATE user_positions SET status = 'closed', close_price = ?, pnl = ?, closed_at = NOW() WHERE position_id = ?");
            $stmt->bind_param("ddi", $close_price, $pnl, $pid);
            $stmt->execute();

            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Position closed', 'pnl' => $pnl]);
        } catch (Exception $e) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'Failed to close position: ' . $e->getMessage()]);
        }
        break;

    case 'get_positions':
        $uid = intval($input['uid'] ?? 0);
        $status = sanitizeInput($input['status'] ?? 'open');

        if ($uid <= 0) {
            echo json_encode(['success' => false, 'positions' => []]);
            exit();
        }

        $stmt = $conn->prepare("SELECT * FROM user_positions WHERE user_id = ? AND status = ? ORDER BY created_at DESC");
        $stmt->bind_param("is", $uid, $status);
        $stmt->execute();
        $res = $stmt->get_result();

        $positions = [];
        while ($row = $res->fetch_assoc()) {
            $positions[] = $row;
        }

        echo json_encode(['success' => true, 'positions' => $positions]);
        break;

    case 'gtpayout_stats':
        $uid = intval($input['uid'] ?? 0);
        if (!$uid) {
            echo json_encode(['success' => false, 'message' => 'User ID missing']);
            exit();
        }

        // Get Trading Wallet & Stats
        $wallet_res = mysqli_query($conn, "SELECT * FROM trading_wallets WHERE user_id = '$uid'");
        if (mysqli_num_rows($wallet_res) == 0) {
            mysqli_query($conn, "INSERT INTO trading_wallets (user_id) VALUES ('$uid')");
            $wallet_res = mysqli_query($conn, "SELECT * FROM trading_wallets WHERE user_id = '$uid'");
        }
        $wallet = mysqli_fetch_assoc($wallet_res);

        // Get Main Balance
        $main_res = mysqli_query($conn, "SELECT user_balance FROM user_balances WHERE user_id = '$uid'");
        $main_balance = mysqli_fetch_assoc($main_res)['user_balance'] ?? 0;

        // Get Bot Status
        $bot_res = mysqli_query($conn, "SELECT status FROM bot_sessions WHERE user_id = '$uid' AND status = 'running' LIMIT 1");
        $bot_active = mysqli_num_rows($bot_res) > 0;

        // Get Recent Trades
        $trades_res = mysqli_query($conn, "SELECT * FROM trades WHERE user_id = '$uid' ORDER BY start_time DESC LIMIT 50");
        $trades = [];
        while ($row = mysqli_fetch_assoc($trades_res)) {
            $trades[] = $row;
        }

        // Calculate Stats from Trades History (Real-time calculation)
        $total_pnl_res = mysqli_query($conn, "SELECT SUM(pnl) as total_pnl FROM trades WHERE user_id = '$uid' AND status IN ('won', 'lost')");
        $total_profit = (float)mysqli_fetch_assoc($total_pnl_res)['total_pnl'] ?? 0;

        $total_trades_res = mysqli_query($conn, "SELECT COUNT(*) as count FROM trades WHERE user_id = '$uid' AND status IN ('won', 'lost')");
        $total_trades = (int)mysqli_fetch_assoc($total_trades_res)['count'];

        $won_trades_res = mysqli_query($conn, "SELECT COUNT(*) as count FROM trades WHERE user_id = '$uid' AND status = 'won'");
        $won_trades = (int)mysqli_fetch_assoc($won_trades_res)['count'];

        $win_rate = $total_trades > 0 ? round(($won_trades / $total_trades) * 100, 2) : 0;

        $today = date('Y-m-d');
        $today_profit_res = mysqli_query($conn, "SELECT SUM(pnl) as pnl FROM trades WHERE user_id = '$uid' AND status IN ('won', 'lost') AND DATE(start_time) = '$today'");
        $today_profit = (float)mysqli_fetch_assoc($today_profit_res)['pnl'] ?? 0;

        echo json_encode([
            'success' => true,
            'wallet' => [
                'balance' => (float)$wallet['balance'],
                'today_profit' => $today_profit,
                'total_profit' => $total_profit,
                'win_rate' => $win_rate
            ],
            'main_balance' => (float)$main_balance,
            'bot_active' => $bot_active,
            'trades' => $trades
        ]);
        break;

    case 'gtpayout_wallet':
        $uid = intval($input['uid'] ?? 0);
        if (!$uid) {
            echo json_encode(['success' => false, 'message' => 'User ID missing']);
            exit();
        }

        // Get or Create Trading Wallet
        $check = mysqli_query($conn, "SELECT * FROM trading_wallets WHERE user_id = '$uid'");
        if (mysqli_num_rows($check) == 0) {
            mysqli_query($conn, "INSERT INTO trading_wallets (user_id) VALUES ('$uid')");
            $check = mysqli_query($conn, "SELECT * FROM trading_wallets WHERE user_id = '$uid'");
        }
        $wallet = mysqli_fetch_assoc($check);

        // Get Main Wallet Balance
        $main_check = mysqli_query($conn, "SELECT user_balance FROM user_balances WHERE user_id = '$uid'");
        $main_balance = mysqli_fetch_assoc($main_check)['user_balance'] ?? 0;

        // Get History
        $history_res = mysqli_query($conn, "SELECT * FROM wallet_transfers WHERE user_id = '$uid' ORDER BY created_at DESC LIMIT 50");
        $history = [];
        while ($row = mysqli_fetch_assoc($history_res)) {
            $history[] = $row;
        }

        echo json_encode([
            'success' => true,
            'trading_wallet' => $wallet,
            'main_balance' => $main_balance,
            'history' => $history
        ]);
        break;

    case 'transfer_funds':
        $uid = intval($input['uid'] ?? 0);
        $from = sanitizeInput($input['from'] ?? '');
        $to = sanitizeInput($input['to'] ?? '');
        $amount = floatval($input['amount'] ?? 0);

        if (!$uid || !$from || !$to || $amount <= 0) {
            echo json_encode(['success' => false, 'message' => 'Invalid parameters']);
            exit();
        }

        if ($from == 'main' && $to == 'trading') {
            $res = mysqli_query($conn, "SELECT user_balance FROM user_balances WHERE user_id = '$uid'");
            $balance = mysqli_fetch_assoc($res)['user_balance'];
            if ($balance < $amount) {
                echo json_encode(['success' => false, 'message' => 'Insufficient Main Wallet balance']);
                exit();
            }

            mysqli_begin_transaction($conn);
            mysqli_query($conn, "UPDATE user_balances SET user_balance = user_balance - $amount WHERE user_id = '$uid'");
            mysqli_query($conn, "UPDATE trading_wallets SET balance = balance + $amount WHERE user_id = '$uid'");
            mysqli_query($conn, "INSERT INTO wallet_transfers (user_id, from_wallet, to_wallet, amount) VALUES ('$uid', 'main', 'trading', $amount)");
            mysqli_commit($conn);
            echo json_encode(['success' => true, 'message' => 'Transfer successful']);
        }
        else if ($from == 'trading' && $to == 'main') {
            $res = mysqli_query($conn, "SELECT balance FROM trading_wallets WHERE user_id = '$uid'");
            $balance = mysqli_fetch_assoc($res)['balance'];
            if ($balance < $amount) {
                echo json_encode(['success' => false, 'message' => 'Insufficient Trading Wallet balance']);
                exit();
            }

            mysqli_begin_transaction($conn);
            mysqli_query($conn, "UPDATE trading_wallets SET balance = balance - $amount WHERE user_id = '$uid'");
            mysqli_query($conn, "UPDATE user_balances SET user_balance = user_balance + $amount WHERE user_id = '$uid'");
            mysqli_query($conn, "INSERT INTO wallet_transfers (user_id, from_wallet, to_wallet, amount) VALUES ('$uid', 'trading', 'main', $amount)");
            mysqli_commit($conn);
            echo json_encode(['success' => true, 'message' => 'Transfer successful']);
        }
        else {
            echo json_encode(['success' => false, 'message' => 'Invalid transfer direction']);
        }
        break;

    default:
        echo json_encode(['success' => $req, 'message' => 'Invalid request']);
        break;
}

// Close connection
mysqli_close($conn);