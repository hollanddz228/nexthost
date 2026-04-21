<?php
class Config {
    // === СТАРЫЙ КОД (сохранен для истории) ===
    // public static $db_host = "localhost";
    // public static $db_username = "root"; 
    // public static $db_password = "";
    // public static $db_name = "nexthost";
    // public static $site_url = "http://localhost"; // Поменяешь на домен когда будешь на хостинге

    // === НОВЫЙ КОД (DevOps подход с поддержкой Docker) ===
    public static $db_host = getenv('DB_HOST') ?: "localhost";
    public static $db_username = getenv('DB_USER') ?: "root"; 
    public static $db_password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : "";
    public static $db_name = getenv('DB_NAME') ?: "nexthost";
    public static $site_url = getenv('SITE_URL') ?: "http://localhost";
    
    // ТВОИ РЕАЛЬНЫЕ ДАННЫЕ ПОЧТЫ:
    public static $smtp_host = "smtp.gmail.com";
    public static $smtp_port = 587;
    public static $smtp_username = "my.nexthost222@gmail.com";
    public static $smtp_password = "nlfx dkzl dbxt kxnj";
    public static $from_email = "my.nexthost222@gmail.com";
}

function getDBConnection() {
    $conn = new mysqli(
        Config::$db_host,
        Config::$db_username, 
        Config::$db_password,
        Config::$db_name
    );
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8");
    return $conn;
}

function sendJsonResponse($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}
?>