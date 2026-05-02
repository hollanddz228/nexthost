<?php
// backend/chat_api.php
header('Content-Type: application/json');
require_once 'config.php';

try {
    // PDO арқылы базаға қосылу
    $dsn = "mysql:host=" . Config::$db_host . ";dbname=" . Config::$db_name . ";charset=utf8";
    $pdo = new PDO($dsn, Config::$db_username, Config::$db_password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'error' => 'PDO Connection failed: ' . $e->getMessage()]);
    exit;
}

$action = $_GET['action'] ?? '';

// 1-функция: Сайттан хабарламаларды алу
if ($action === 'get_new') {
    $session_id = $_GET['session_id'] ?? '';
    if (!$session_id) {
        echo json_encode(['success' => false, 'error' => 'No session_id']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id, message FROM live_chat WHERE session_id = ? AND sender = 'admin' AND is_read = 0 ORDER BY id ASC");
    $stmt->execute([$session_id]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($messages) > 0) {
        $stmtUpdate = $pdo->prepare("UPDATE live_chat SET is_read = 1 WHERE session_id = ? AND sender = 'admin' AND is_read = 0");
        $stmtUpdate->execute([$session_id]);
    }

    echo json_encode(['success' => true, 'messages' => $messages]);
    exit;
}

// 2-функция: ТГ боттан хабарлама қабылдау
if ($action === 'admin_send') {
    $session_id = $_POST['session_id'] ?? '';
    $message = $_POST['message'] ?? '';

    if (!$session_id || !$message) {
        echo json_encode(['success' => false, 'error' => 'Missing data']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO live_chat (session_id, sender, message) VALUES (?, 'admin', ?)");
    $stmt->execute([$session_id, $message]);

    echo json_encode(['success' => true]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Invalid action']);
?>