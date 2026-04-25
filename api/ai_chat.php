<?php
header("Access-Control-Allow-Origin: *"); // lock to domain in production
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --------------------
// READ INPUT
// --------------------
$input = json_decode(file_get_contents("php://input"), true);
$message = trim($input['message'] ?? '');

if ($message === '') {
    echo json_encode(["reply" => "Please enter a message."]);
    exit;
}

if (strlen($message) > 500) {
    echo json_encode(["reply" => "Message too long."]);
    exit;
}

// --------------------
// LOAD KNOWLEDGE
// --------------------
$aboutFile = __DIR__ . "/about.txt";

if (!file_exists($aboutFile)) {
    echo json_encode(["reply" => "Knowledge base missing."]);
    exit;
}

$about = file_get_contents($aboutFile);

// --------------------
// BUILD PROMPT
// --------------------
$prompt = <<<PROMPT
You are a customer support AI.
Answer ONLY using the information below.
If the answer is not present, say:
"I'm sorry, I don't have that information."

INFORMATION:
$about

QUESTION:
$message
PROMPT;

// --------------------
// CALL GROQ
// --------------------
$reply = callGroq($prompt);

echo json_encode(["reply" => $reply]);
exit;

// =====================================================

function callGroq(string $prompt): string
{
   
    $apiKey = getenv('GROQ_API_KEY');

    if (!$apiKey) {
        return "Server error: API key not configured.";
    }

    $url = "https://api.groq.com/openai/v1/chat/completions";

    $payload = [
       // "model" => "llama3-8b-8192", 
        "model" => "llama-3.1-8b-instant",// MOST STABLE FREE MODEL
        "messages" => [
            [
                "role" => "system",
                "content" => "You are a helpful customer support assistant."
            ],
            [
                "role" => "user",
                "content" => $prompt
            ]
        ],
        "temperature" => 0.2
    ];

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            "Authorization: Bearer {$apiKey}",
            "Content-Type: application/json"
        ],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_TIMEOUT => 30
    ]);

    $response = curl_exec($ch);

    if ($response === false) {
        $error = curl_error($ch);
        curl_close($ch);
        return "cURL error: {$error}";
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $json = json_decode($response, true);

    if ($httpCode !== 200) {
        return "Groq API error ({$httpCode}): " .
               ($json['error']['message'] ?? $response);
    }

    if (!isset($json['choices'][0]['message']['content'])) {
        return "Invalid API response.";
    }

    return $json['choices'][0]['message']['content'];
}
