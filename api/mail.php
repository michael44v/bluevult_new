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
<body style='font-family:Arial,sans-serif; background:#f4f4f4; padding:0; margin:0;'>
<div style='max-width:600px; margin:20px auto; background:#fff; padding:20px; border-radius:8px;'>
    <div style='text-align:center; margin-bottom:20px;'>
        <a href='https://bluevult.com' style='display:block;'>
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
    <h2 style='color:#2e6c80; text-align:center;'>$subject</h2>
    <p>Dear <strong>$name</strong>,</p>
    <p>Email: $email</p>
    <p>$messageText</p>
    $linkButton
    <hr style='margin:20px 0;'/>
    <p style='font-size:12px; color:#888; text-align:center;'>
        <strong>BlueVult Ltd.</strong><br/>
        <a href='https://bluevult.com'>Website</a> |
        <a href='https://bluevult.com/privacy-policy'>Privacy Policy</a><br/>
        © 2024 BlueVult. All rights reserved.<br/>
        This email was sent automatically. Do not reply.
    </p>
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
