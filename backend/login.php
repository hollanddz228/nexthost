<?php
// backend/login.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Метод не поддерживается']);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    sendJsonResponse(['success' => false, 'message' => 'Email и пароль обязательны']);
}

$conn = getDBConnection();

// Ищем пользователя
$stmt = $conn->prepare("SELECT id, username, email, password, balance, email_verified FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendJsonResponse(['success' => false, 'message' => 'Пользователь не найден']);
}

$user = $result->fetch_assoc();

// 🔒 ПРОВЕРЯЕМ ПОДТВЕРЖДЕНИЕ EMAIL
if (!$user['email_verified']) {
    sendJsonResponse([
        'success' => false, 
        'message' => 'Подтвердите ваш email перед входом. Проверьте вашу почту.'
    ]);
}

// Проверяем пароль
if (password_verify($password, $user['password'])) {
    sendJsonResponse([
        'success' => true,
        'message' => 'Вход успешен',
        'user' => [
            'id' => $user['id'],
            'name' => $user['username'],
            'email' => $user['email'],
            'balance' => $user['balance']
        ]
    ]);
} else {
    sendJsonResponse(['success' => false, 'message' => 'Неверный пароль']);
}

$stmt->close();
$conn->close();
?>