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

$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;

$stmt = $conn->prepare("SELECT * FROM payments ORDER BY created_at DESC LIMIT ?");
$stmt->bind_param("i", $limit);
$stmt->execute();
$result = $stmt->get_result();

$payments = [];
while ($row = $result->fetch_assoc()) {
    $payments[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $payments
]);

$stmt->close();
$conn->close();
?>
