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

$result = $conn->query("SELECT * FROM tickets ORDER BY id DESC");

$tickets = [];
while ($row = $result->fetch_assoc()) {
    // Добавляем subject из message если его нет
    if (!isset($row['subject'])) {
        $row['subject'] = mb_substr($row['message'] ?? '', 0, 50) . '...';
    }
    $tickets[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $tickets
]);

$conn->close();
?>
