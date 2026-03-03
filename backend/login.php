<?php
// backend/login.php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(['success' => false, 'message' => 'Әдіс қолдау көрсетілмейді']);
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    sendJsonResponse(['success' => false, 'message' => 'Email және құпиясөз міндетті']);
}

$conn = getDBConnection();

// Пайдаланушыны іздейміз
$stmt = $conn->prepare("SELECT id, username, email, password, balance, email_verified FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendJsonResponse(['success' => false, 'message' => 'Пайдаланушы табылмады']);
}

$user = $result->fetch_assoc();

// 🔒 EMAIL РАСТАУЫН ТЕКСЕРЕМІЗ
if (!$user['email_verified']) {
    sendJsonResponse([
        'success' => false, 
        'message' => 'Кірер алдында email-ды растаңыз. Поштаңызды тексеріңіз.'
    ]);
}

// Құпиясөзді тексереміз
if (password_verify($password, $user['password'])) {
    sendJsonResponse([
        'success' => true,
        'message' => 'Кіру сәтті',
        'user' => [
            'id' => $user['id'],
            'name' => $user['username'],
            'email' => $user['email'],
            'balance' => $user['balance']
        ]
    ]);
} else {
    sendJsonResponse(['success' => false, 'message' => 'Құпиясөз дұрыс емес']);
}

$stmt->close();
$conn->close();
?>