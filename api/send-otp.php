<?php
require __DIR__ . '/src/PHPMailer.php';
require __DIR__ . '/src/SMTP.php';
require __DIR__ . '/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// -------------------
// Headers for CORS
// -------------------
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

// -------------------
// Database Connection (MySQLi)
// -------------------
$host = "localhost";
$user = "ktkdvcdj_root";
$pass = "victor47009A";
$db   = "ktkdvcdj_bluevult";

$mysqli = new mysqli($host, $user, $pass, $db);
if ($mysqli->connect_errno) {
    echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $mysqli->connect_error]);
    exit;
}

// -------------------
// Get Request Data
// -------------------
$data = json_decode(file_get_contents("php://input"), true);
$uid = isset($data['uid']) ? intval($data['uid']) : 0;

if (!$uid) {
    echo json_encode(['success' => false, 'error' => 'User ID not provided']);
    exit;
}

// -------------------
// Fetch User
// -------------------
$stmt = $mysqli->prepare("SELECT user_name, user_email FROM user_details WHERE user_id = ?");
$stmt->bind_param("i", $uid);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();
$stmt->close();

if (!$user) {
    echo json_encode(['success' => false, 'error' => 'User not found']);
    exit;
}

$user_name = $user['user_name'];
$user_email = $user['user_email'];

// -------------------
// Generate OTP
// -------------------
$otp = substr(strval($uid * 724923), 0, 6);

// -------------------
// Store OTP in DB
// -------------------
$updateStmt = $mysqli->prepare("UPDATE user_details SET user_otp = ? WHERE user_id = ?");
$updateStmt->bind_param("ii", $otp, $uid);
$updateStmt->execute();
$updateStmt->close();

// -------------------
// Send Email via PHPMailer
// -------------------
try {
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = 'mail.bluevult.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'support@bluevult.com';
    $mail->Password   = 'victor47009A';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL
    $mail->Port       = 465;

    $mail->setFrom('info@bluevult.com', 'BlueVult');
    $mail->addAddress($user_email, $user_name);
    $mail->addReplyTo('info@bluevult.com');

    $mail->isHTML(true);
    $mail->Subject = "OTP Verification for BlueVult SignUp";

    $mail->Body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
            .container { max-width:600px; margin:20px auto; background:#fff; padding:20px; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.1); }
            h2 { color:#2e6c80; text-align:center; }
            .otp-box { background:#f0f0f0; padding:15px; border-radius:5px; border-left:4px solid #2e6c80; text-align:center; font-size:1.2em; font-weight:bold; margin:15px 0; }
            .footer { text-align:center; font-size:0.75em; color:#888; margin-top:20px; }
            .footer a { color:#2e6c80; text-decoration:none; margin:0 5px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div style='text-align:center;margin-bottom:20px;'>
                <a href='https://bluevult.com'>
                    <img 
                src='https://bluevult.com/img/BlurVultage.png'
                alt='BlueVult'
                style='
                    width:100%;
                    max-width:520px;
                    height:auto;
                    display:block;
                    margin:0 auto;
                    border-radius:6px;
                '
            />
                </a>
            </div>

            <h2>🔑 OTP Confirmation</h2>
            <p>Hello {$user_name},</p>
            <p>Use the OTP below to confirm your action:</p>
            <div class='otp-box'>{$otp}</div>
            <p>If you did not request this, please ignore this email.</p>

            <div class='footer'>
                <a href='#'>Features</a>|
                <a href='#'>Pricing</a>|
                <a href='#'>About Us</a>|
                <a href='#'>Contact</a>|
                <a href='#'>Privacy Policy</a>
                <p>© 2024 BlueVult. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    ";

    $mail->send();

    echo json_encode(['success' => true,  'otp' => 'check mail']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $mail->ErrorInfo]);
}
