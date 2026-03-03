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

$result = $conn->query("SELECT id, username as name, email, phone, date_created FROM users ORDER BY date_created DESC");

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $users
]);

$conn->close();
?>
