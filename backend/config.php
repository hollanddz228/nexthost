<?php
// backend/config.php

class Config {
    public static $db_host;
    public static $db_username;
    public static $db_password;
    public static $db_name;
    public static $site_url;

    public static function init() {
        // Docker контейнер ішіндегі айнымалыларды оқимыз
        self::$db_host     = getenv('DB_HOST') ?: "nexthost_db"; 
        self::$db_username = getenv('DB_USER') ?: "nexthost_user";
        self::$db_password = getenv('DB_PASS') ?: "secretpassword";
        self::$db_name     = getenv('DB_NAME') ?: "nexthost";
        self::$site_url    = getenv('SITE_URL') ?: "http://localhost";
    }
}

// Конфигурацияны іске қосу
Config::init();

/**
 * MySQLi байланысы (register.php үшін)
 */
function getDBConnection() {
    $conn = new mysqli(Config::$db_host, Config::$db_username, Config::$db_password, Config::$db_name);
    if ($conn->connect_error) {
        header('Content-Type: application/json');
        die(json_encode(['success' => false, 'error' => "DB Connection failed: " . $conn->connect_error]));
    }
    $conn->set_charset("utf8");
    return $conn;
}

/**
 * JSON жауап қайтару функциясы (ОСЫ ФУНКЦИЯ СЕНДЕ ЖОҚ БОЛДЫ)
 */
function sendJsonResponse($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}
?>