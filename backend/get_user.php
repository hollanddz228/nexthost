<?php
header('Content-Type: application/json; charset=utf-8');
include 'config.php';

$user_id = $_GET['id'] ?? 0;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'ID пользователя не указан']);
    exit;
}

$conn = getDBConnection();
$stmt = $conn->prepare("SELECT phone, date_created FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'phone' => $user['phone'],
        'date_created' => $user['date_created']
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Пользователь не найден']);
}

$stmt->close();
$conn->close();
?>