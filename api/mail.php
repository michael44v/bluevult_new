<?php
require __DIR__ . '/src/PHPMailer.php';
require __DIR__ . '/src/SMTP.php';
require __DIR__ . '/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'] ?? 'Anonymous';
$email = $data['email'] ?? 'michaelstanleynwankwo14@gmail.com';
$subject = $data['subject'] ?? 'No Subject';
$messageText = $data['message'] ?? 'No message provided';
$link =  $data['link'] ?? '#';

try {
    $mail = new PHPMailer(true);

    // ===== SMTP Config =====
    $mail->isSMTP();
    $mail->Host       = 'mail.bluevult.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'support@bluevult.com';
    $mail->Password   = 'victor47009A';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL
    $mail->Port       = 465;

    $mail->CharSet = 'UTF-8';

    // ===== Sender & Recipient =====
    $mail->setFrom('support@bluevult.com', 'BlueVult'); // Must be your verified domain
    $mail->addAddress($email, $name); // User

    // ===== Email Content =====
    $mail->isHTML(true);
    $mail->Subject = $subject;

    // ===== Plain text fallback =====
    $mail->AltBody = "Dear $name,\n\n$subject\n\n$messageText\n\nBlueVult Ltd.";

    // ===== HTML Content =====


$linkButton = $link !== '#' ? "
<div style='text-align:center; margin:24px 0;'>
    <a href='$link' style='
        display:inline-block;
        background:#10b981;
        color:#ffffff;
        text-decoration:none;
        padding:12px 32px;
        border-radius:8px;
        font-weight:bold;
        font-size:15px;
        letter-spacing:0.5px;
    '>Reset Password</a>
</div>
" : "";

$mail->Body = "
<html>
<body style='font-family:Arial,sans-serif; background:#0d1421; color:#ffffff; padding:0; margin:0;'>
<div style='max-width:600px; margin:20px auto; background:#17212d; padding:30px; border-radius:16px; border: 1px solid #1a2535;'>
    <div style='text-align:center; margin-bottom:30px;'>
        <a href='https://bluevult.com' style='display:inline-block; text-decoration:none;'>
            <h1 style='color:#3861fb; margin:0; font-size:32px; font-weight:bold;'>BlueVult</h1>
        </a>
    </div>
    <div style='margin-bottom:25px;'>
        <h2 style='color:#ffffff; margin-top:0; font-size:24px;'>Hello $name,</h2>
        <div style='color:#8a919e; line-height:1.6; font-size:16px;'>
            " . nl2br($messageText) . "
        </div>
    </div>
    $linkButton
    <div style='margin-top:30px; padding-top:20px; border-top:1px solid #1a2535; text-align:center;'>
        <a href='https://bluevult.com/dashboard' style='display:inline-block; background:#3861fb; color:#ffffff; text-decoration:none; padding:12px 25px; border-radius:8px; font-weight:bold;'>Go to Dashboard</a>
    </div>
    <div style='font-size:12px; color:#4a5568; text-align:center; margin-top:30px;'>
        <strong>BlueVult Ltd.</strong><br/>
        <a href='https://bluevult.com' style='color:#3861fb;'>Website</a> |
        <a href='https://bluevult.com/privacy-policy' style='color:#3861fb;'>Privacy Policy</a><br/>
        © " . date("Y") . " BlueVult. All rights reserved.<br/>
        This email was sent automatically. Do not reply.
    </div>
</div>
</body>
</html>
";


    // Optional: Enable debug output if email fails
    //$mail->SMTPDebug = 2; // Uncomment for detailed SMTP logs

    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Email sent successfully'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $mail->ErrorInfo
    ]);
}
