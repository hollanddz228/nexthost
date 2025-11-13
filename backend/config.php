<?php
class Config {
    public static $db_host = "localhost";
    public static $db_username = "root"; 
    public static $db_password = "";
    public static $db_name = "nexthost";
    
    // ТВОИ РЕАЛЬНЫЕ ДАННЫЕ ПОЧТЫ:
    public static $smtp_host = "smtp.gmail.com";
    public static $smtp_port = 587;
    public static $smtp_username = "my.nexthost222@gmail.com";
    public static $smtp_password = "nlfx dkzl dbxt kxnj";
    public static $from_email = "my.nexthost222@gmail.com";
    public static $site_url = "http://localhost"; // Поменяешь на домен когда будешь на хостинге
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