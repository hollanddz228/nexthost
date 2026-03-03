<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

function checkAdminAuth() {
    $headers = getallheaders();
    $token = $headers['Authorization'] ?? '';
    
    // "Bearer " префиксін алып тастау
    if (strpos($token, 'Bearer ') === 0) {
        $token = substr($token, 7);
    }
    
    if (empty($token)) {
        return false;
    }
    
    $tokenFile = __DIR__ . "/admin_token.json";
    
    if (!file_exists($tokenFile)) {
        return false;
    }
    
    $tokenData = json_decode(file_get_contents($tokenFile), true);
    
    if (!$tokenData || $tokenData['token'] !== $token) {
        return false;
    }
    
    // Токен мерзімін тексеру
    if (time() > $tokenData['expiry']) {
        return false;
    }
    
    return true;
}

// Тікелей шақырылса
if (basename($_SERVER['PHP_SELF']) === 'check_auth.php') {
    if (checkAdminAuth()) {
        echo json_encode(["success" => true, "message" => "Авторизация жарамды"]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Авторизация қажет"]);
    }
}
?>
