<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit(0);

// -------------------
// Get POST data
// -------------------
$data = json_decode(file_get_contents("php://input"), true);
$uid = $data['uid'] ?? null;
$otp = $data['otp'] ?? null;

if (!$uid || !$otp) {
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'User ID or OTP not provided'
    ]);
    exit;
}

// -------------------
// Database connection
// -------------------
$host = "localhost";
$user = "ktkdvcdj_root";
$password = "victor47009A";
$dbname = "ktkdvcdj_bluevult";

$conn = new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Database connection failed'
    ]);
    exit;
}

// -------------------
// Fetch user and OTP
// -------------------
$stmt = $conn->prepare("SELECT user_otp FROM user_details WHERE user_id = ?");
$stmt->bind_param("i", $uid);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'User not found'
    ]);
    exit;
}

$row = $result->fetch_assoc();
$storedOtp = $row['user_otp'];

// -------------------
// Compare OTP
// -------------------
if ($storedOtp == $otp) {
    // OTP is correct
    // Optional: Clear OTP so it can't be reused
    $update = $conn->prepare("UPDATE user_details SET user_otp = NULL WHERE user_id = ?");
    $update->bind_param("i", $uid);
    $update->execute();

    echo json_encode([
        'success' => true,
        'status' => 'ok',
        'message' => 'OTP verified successfully'
    ]);
} else {
    // ❌ is wrong
    echo json_encode([
        'success' => false,
        'status' => 'error',
        'message' => 'Invalid OTP'
    ]);
}

$stmt->close();
$conn->close();
