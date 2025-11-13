<?php
// backend/register.php
require_once 'config.php';
require_once 'mailer_real.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Метод не поддерживается']);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

// Валидация
if (empty($name) || empty($phone) || empty($email) || empty($password)) {
    sendJsonResponse(['success' => false, 'message' => 'Все поля обязательны']);
}

if ($password !== ($data['confirm_password'] ?? '')) {
    sendJsonResponse(['success' => false, 'message' => 'Пароли не совпадают']);
}

if (strlen($password) < 6) {
    sendJsonResponse(['success' => false, 'message' => 'Пароль должен быть не менее 6 символов']);
}

$conn = getDBConnection();

// Проверяем email
$check_stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check_stmt->bind_param("s", $email);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows > 0) {
    sendJsonResponse(['success' => false, 'message' => 'Email уже зарегистрирован']);
}
$check_stmt->close();

// Регистрируем пользователя С ПОДТВЕРЖДЕНИЕМ
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$verification_code = md5(uniqid(rand(), true));

// email_verified = 0 - значит не подтвержден!
$insert_stmt = $conn->prepare("INSERT INTO users (username, phone, email, password, verification_code, email_verified, date_created) VALUES (?, ?, ?, ?, ?, 0, NOW())");
$insert_stmt->bind_param("sssss", $name, $phone, $email, $hashed_password, $verification_code);

if ($insert_stmt->execute()) {
    // Отправляем email
    $email_sent = RealMailer::sendVerificationEmail($email, $name, $verification_code);
    
    if ($email_sent) {
        sendJsonResponse([
            'success' => true, 
            'message' => 'Регистрация успешна! Проверьте почту для подтверждения email.'
        ]);
    } else {
        sendJsonResponse([
            'success' => false, 
            'message' => 'Ошибка отправки email. Попробуйте позже.'
        ]);
    }
} else {
    sendJsonResponse(['success' => false, 'message' => 'Ошибка базы данных']);
}

$insert_stmt->close();
$conn->close();
?>