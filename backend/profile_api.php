<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT");
header("Access-Control-Allow-Headers: Content-Type");

include "config.php";

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET — получить данные профиля
if ($method === 'GET') {
    $userId = $_GET['id'] ?? 0;
    
    if (!$userId) {
        echo json_encode(["success" => false, "message" => "ID пайдаланушы көрсетілмеген"]);
        exit;
    }
    
    // Данные пользователя
    $stmt = $conn->prepare("SELECT id, username, email, phone, balance, date_created FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $userResult = $stmt->get_result();
    
    if ($userResult->num_rows === 0) {
        echo json_encode(["success" => false, "message" => "Пайдаланушы табылмады"]);
        exit;
    }
    
    $user = $userResult->fetch_assoc();
    
    // Статистика платежей
    $stmt2 = $conn->prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE email = ?");
    $stmt2->bind_param("s", $user['email']);
    $stmt2->execute();
    $paymentsResult = $stmt2->get_result()->fetch_assoc();
    
    // Количество тикетов
    $stmt3 = $conn->prepare("SELECT COUNT(*) as count FROM tickets WHERE email = ?");
    $stmt3->bind_param("s", $user['email']);
    $stmt3->execute();
    $ticketsResult = $stmt3->get_result()->fetch_assoc();
    
    // Активные услуги (платежи за последние 30 дней)
    $stmt4 = $conn->prepare("SELECT COUNT(*) as count FROM payments WHERE email = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    $stmt4->bind_param("s", $user['email']);
    $stmt4->execute();
    $activeResult = $stmt4->get_result()->fetch_assoc();
    
    // История платежей
    $stmt5 = $conn->prepare("SELECT id, tariff_name, amount, status, created_at FROM payments WHERE email = ? ORDER BY created_at DESC LIMIT 10");
    $stmt5->bind_param("s", $user['email']);
    $stmt5->execute();
    $historyResult = $stmt5->get_result();
    
    $paymentHistory = [];
    while ($row = $historyResult->fetch_assoc()) {
        $paymentHistory[] = $row;
    }
    
    // Дней с регистрации
    $regDate = new DateTime($user['date_created']);
    $now = new DateTime();
    $daysRegistered = $regDate->diff($now)->days;
    
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $user['id'],
            "name" => $user['username'],
            "email" => $user['email'],
            "phone" => $user['phone'] ?? '',
            "balance" => (float)$user['balance'],
            "date_created" => $user['date_created']
        ],
        "stats" => [
            "total_payments" => (int)$paymentsResult['count'],
            "total_spent" => (float)$paymentsResult['total'],
            "open_tickets" => (int)$ticketsResult['count'],
            "active_services" => (int)$activeResult['count'],
            "days_registered" => $daysRegistered
        ],
        "payment_history" => $paymentHistory
    ]);
    exit;
}

// PUT — обновить профиль
if ($method === 'PUT') {
    $input = json_decode(file_get_contents("php://input"), true);
    
    $userId = $input['id'] ?? 0;
    $phone = $input['phone'] ?? '';
    $name = $input['name'] ?? '';
    
    if (!$userId) {
        echo json_encode(["success" => false, "message" => "ID пайдаланушы көрсетілмеген"]);
        exit;
    }
    
    $stmt = $conn->prepare("UPDATE users SET phone = ?, username = ? WHERE id = ?");
    $stmt->bind_param("ssi", $phone, $name, $userId);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Профиль сәтті жаңартылды"]);
    } else {
        echo json_encode(["success" => false, "message" => "Қате: " . $conn->error]);
    }
    exit;
}

$conn->close();
?>
