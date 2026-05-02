<?php
// backend/register.php
require_once 'config.php';
require_once 'mailer_real.php';

// Тек POST сұраныстарын қабылдаймыз
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Әдіс қолдау көрсетілмейді']);
}

// JSON деректерді оқу
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$confirm_password = $data['confirm_password'] ?? '';

// Валидация
if (empty($name) || empty($phone) || empty($email) || empty($password)) {
    sendJsonResponse(['success' => false, 'message' => 'Барлық өрістер міндетті']);
}

if ($password !== $confirm_password) {
    sendJsonResponse(['success' => false, 'message' => 'Құпиясөздер сәйкес келмейді']);
}

if (strlen($password) < 6) {
    sendJsonResponse(['success' => false, 'message' => 'Құпиясөз кемінде 6 таңбадан тұруы керек']);
}

$conn = getDBConnection();

// Email-дың бар-жоғын тексеру
$check_stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$check_stmt->bind_param("s", $email);
$check_stmt->execute();
$check_stmt->store_result();

if ($check_stmt->num_rows > 0) {
    $check_stmt->close();
    $conn->close();
    sendJsonResponse(['success' => false, 'message' => 'Email тіркелген']);
}
$check_stmt->close();

// Құпиясөзді шифрлау және растау кодын жасау
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$verification_code = md5(uniqid(rand(), true));

// Пайдаланушыны базаға қосу (email_verified = 0)
$insert_stmt = $conn->prepare("INSERT INTO users (username, phone, email, password, verification_code, email_verified, date_created) VALUES (?, ?, ?, ?, ?, 0, NOW())");
$insert_stmt->bind_param("sssss", $name, $phone, $email, $hashed_password, $verification_code);

if ($insert_stmt->execute()) {
    // Email жіберу
    $email_sent = RealMailer::sendVerificationEmail($email, $name, $verification_code);
    
    if ($email_sent) {
        sendJsonResponse([
            'success' => true, 
            'message' => 'Тіркелу сәтті! Email-ды растау үшін поштаңызды тексеріңіз.'
        ]);
    } else {
        sendJsonResponse([
            'success' => false, 
            'message' => 'Email жіберу қатесі. Кейінірек қайталап көріңіз.'
        ]);
    }
} else {
    sendJsonResponse(['success' => false, 'message' => 'Дерекқор қатесі: ' . $insert_stmt->error]);
}

$insert_stmt->close();
$conn->close();
?>