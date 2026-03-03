<?php
// backend/reset_password.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Әдіс қолдау көрсетілмейді']);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$token = $data['token'] ?? '';
$password = $data['password'] ?? '';
$confirm_password = $data['confirm_password'] ?? '';

error_log("🔄 Reset password attempt with token: " . $token);

// Валидация
if (empty($token) || empty($password) || empty($confirm_password)) {
    sendJsonResponse(['success' => false, 'message' => 'Барлық өрістер міндетті']);
}

if ($password !== $confirm_password) {
    sendJsonResponse(['success' => false, 'message' => 'Құпиясөздер сәйкес келмейді']);
}

if (strlen($password) < 6) {
    sendJsonResponse(['success' => false, 'message' => 'Құпиясөз кемінде 6 таңбадан тұруы керек']);
}

$conn = getDBConnection();
if (!$conn) {
    sendJsonResponse(['success' => false, 'message' => 'Дерекқорға қосылу қатесі']);
}

try {
    // Ищем пользователя с действующим токеном
    $stmt = $conn->prepare("SELECT id, reset_token, reset_token_expires FROM users WHERE reset_token = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        error_log("❌ Token not found: " . $token);
        
        // Покажем какие токены есть в базе для отладки
        $all_tokens = $conn->query("SELECT reset_token FROM users WHERE reset_token IS NOT NULL LIMIT 5");
        $tokens_list = [];
        while ($row = $all_tokens->fetch_assoc()) {
            $tokens_list[] = $row['reset_token'];
        }
        error_log("🔍 Available tokens: " . implode(', ', $tokens_list));
        
        sendJsonResponse(['success' => false, 'message' => 'Токен дұрыс емес. Қолжетімді токендер: ' . count($tokens_list)]);
    }

    $user = $result->fetch_assoc();
    
    // Токеннің жарамдылық мерзімін тексереміз
    $current_time = time();
    $token_expires = strtotime($user['reset_token_expires']);
    
    error_log("🔍 Token check - Current: " . date('Y-m-d H:i:s', $current_time) . ", Expires: " . $user['reset_token_expires']);
    
    if ($token_expires < $current_time) {
        error_log("❌ Token expired: " . $token . " Expires: " . $user['reset_token_expires']);
        sendJsonResponse(['success' => false, 'message' => 'Токеннің мерзімі өтіп кеткен']);
    }
    
    error_log("✅ Token valid. User ID: " . $user['id'] . " Expires: " . $user['reset_token_expires']);

    // Хешируем новый пароль
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Обновляем пароль и очищаем токен
    $update_stmt = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?");
    if (!$update_stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $update_stmt->bind_param("si", $hashed_password, $user['id']);

    if ($update_stmt->execute()) {
        error_log("✅ Password reset successful for user ID: " . $user['id']);
        sendJsonResponse(['success' => true, 'message' => 'Құпиясөз сәтті өзгертілді']);
    } else {
        error_log("❌ Password reset failed: " . $update_stmt->error);
        sendJsonResponse(['success' => false, 'message' => 'Құпиясөзді өзгерту қатесі: ' . $update_stmt->error]);
    }
    
    $update_stmt->close();
    
} catch (Exception $e) {
    error_log("❌ Reset password exception: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'message' => 'Қате: ' . $e->getMessage()]);
} finally {
    $conn->close();
}
?>