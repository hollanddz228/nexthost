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

$result = $conn->query("SELECT * FROM tariffs ORDER BY id ASC");

$tariffs = [];
while ($row = $result->fetch_assoc()) {
    $tariffs[] = $row;
}

echo json_encode([
    "success" => true,
    "data" => $tariffs
]);

$conn->close();
?>
