<?php
// backend/forgot_password.php
require_once 'config.php';
require_once 'mailer_real.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Әдіс қолдау көрсетілмейді']);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = trim($data['email'] ?? '');

if (empty($email)) {
    sendJsonResponse(['success' => false, 'message' => 'Email міндетті']);
}

$conn = getDBConnection();
if (!$conn) {
    sendJsonResponse(['success' => false, 'message' => 'Дерекқорға қосылу қатесі']);
}

try {
    // Ищем пользователя ТОЛЬКО с подтвержденным email
    $stmt = $conn->prepare("SELECT id, username FROM users WHERE email = ? AND email_verified = 1");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        sendJsonResponse([
            'success' => false, 
            'message' => 'Бұл email-мен пайдаланушы табылмады немесе email расталмаған'
        ]);
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    // Генерируем токен восстановления
    $reset_token = md5(uniqid(rand(), true));
    $reset_expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    error_log("🔄 Generated token: " . $reset_token . " for user: " . $user['email']);

    // Сохраняем токен
    $update_stmt = $conn->prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?");
    if (!$update_stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $update_stmt->bind_param("ssi", $reset_token, $reset_expires, $user['id']);

    if ($update_stmt->execute()) {
        error_log("✅ Token saved successfully for user: " . $user['email']);
        
        // Двойная проверка что токен сохранился
        $check_stmt = $conn->prepare("SELECT reset_token, reset_token_expires FROM users WHERE id = ?");
        $check_stmt->bind_param("i", $user['id']);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $saved_data = $check_result->fetch_assoc();
        $check_stmt->close();
        
        error_log("🔍 Token in database: " . $saved_data['reset_token']);
        error_log("🔍 Token expires: " . $saved_data['reset_token_expires']);
        
        // Отправляем email восстановления
        $email_sent = RealMailer::sendPasswordResetEmail($email, $reset_token);
        
        if ($email_sent) {
            sendJsonResponse([
                'success' => true, 
                'message' => 'Құпиясөзді қалпына келтіру нұсқаулары email-ға жіберілді',
                'debug_token' => $reset_token // Тестілеу үшін
            ]);
        } else {
            sendJsonResponse([
                'success' => true, 
                'message' => 'Хат жіберілмеді, бірақ токен жасалды: ' . $reset_token
            ]);
        }
    } else {
        error_log("❌ Token save failed: " . $update_stmt->error);
        sendJsonResponse(['success' => false, 'message' => 'Токенді сақтау қатесі: ' . $update_stmt->error]);
    }
    
    $update_stmt->close();
    
} catch (Exception $e) {
    error_log("❌ Exception in forgot_password: " . $e->getMessage());
    sendJsonResponse(['success' => false, 'message' => 'Қате: ' . $e->getMessage()]);
} finally {
    $conn->close();
}
?>