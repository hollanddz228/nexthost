<?php
header('Content-Type: application/json; charset=utf-8');
include 'config.php';

$user_id = $_GET['id'] ?? 0;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'ID пользователя не указан']);
    exit;
}

// Временные данные для демонстрации
$conn = getDBConnection();
$stmt = $conn->prepare("SELECT date_created FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$days_registered = 1;
if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $reg_date = new DateTime($user['date_created']);
    $current_date = new DateTime();
    $interval = $reg_date->diff($current_date);
    $days_registered = $interval->days;
}

echo json_encode([
    'success' => true,
    'active_services' => 0,
    'total_spent' => 0,
    'days_registered' => $days_registered
]);

$stmt->close();
$conn->close();
?>