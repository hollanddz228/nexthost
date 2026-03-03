<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include "../config.php";
include "check_auth.php";

if (!checkAdminAuth()) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Авторизация қажет"]);
    exit;
}

$conn = getDBConnection();

// Пайдаланушылар саны
$usersResult = $conn->query("SELECT COUNT(*) as count FROM users");
$usersCount = $usersResult->fetch_assoc()['count'] ?? 0;

// Төлемдер саны
$paymentsResult = $conn->query("SELECT COUNT(*) as count FROM payments");
$paymentsCount = $paymentsResult->fetch_assoc()['count'] ?? 0;

// Тикеттер саны
$ticketsResult = $conn->query("SELECT COUNT(*) as count FROM tickets");
$ticketsCount = $ticketsResult->fetch_assoc()['count'] ?? 0;

// Жалпы кіріс
$revenueResult = $conn->query("SELECT SUM(amount) as total FROM payments WHERE status = 'completed'");
$revenue = $revenueResult->fetch_assoc()['total'] ?? 0;

echo json_encode([
    "success" => true,
    "users" => (int)$usersCount,
    "payments" => (int)$paymentsCount,
    "tickets" => (int)$ticketsCount,
    "revenue" => (float)$revenue
]);

$conn->close();
?>
