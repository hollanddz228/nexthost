<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Әкімші құпия сөзі (өзіңіздің құпия сөзіңізге өзгертіңіз!)
define('ADMIN_PASSWORD', 'nexthost2024');

// Токен жасау уақыты (24 сағат)
define('TOKEN_LIFETIME', 86400);

$input = json_decode(file_get_contents("php://input"), true);
$password = $input['password'] ?? '';

if (empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Құпия сөз енгізілмеген"
    ]);
    exit;
}

if ($password === ADMIN_PASSWORD) {
    // Токен жасау
    $token = bin2hex(random_bytes(32));
    $expiry = time() + TOKEN_LIFETIME;
    
    // Токенді файлға сақтау (немесе БД-ға)
    $tokenData = [
        "token" => $token,
        "expiry" => $expiry,
        "created" => date("Y-m-d H:i:s")
    ];
    
    file_put_contents(__DIR__ . "/admin_token.json", json_encode($tokenData));
    
    echo json_encode([
        "success" => true,
        "token" => $token,
        "message" => "Сәтті кірдіңіз!"
    ]);
} else {
    // Қате әрекетті логқа жазу
    $logFile = __DIR__ . "/failed_logins.log";
    $logEntry = date("Y-m-d H:i:s") . " | IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . " | Қате құпия сөз\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    
    echo json_encode([
        "success" => false,
        "message" => "Қате құпия сөз"
    ]);
}
?>
