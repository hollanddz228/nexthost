<?php
header("Content-Type: application/json; charset=utf-8");
include "db_connect.php";

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$subject = $_POST['subject'] ?? '';
$message = $_POST['message'] ?? '';

if (!$name || !$email || !$subject || !$message) {
    echo json_encode(["success" => false, "error" => "Все поля обязательны"]);
    exit;
}

$stmt = $conn->prepare("INSERT INTO tickets (name, email, subject, message) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $name, $email, $subject, $message);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Тикет успешно создан"]);
} else {
    echo json_encode(["success" => false, "error" => $conn->error]);
}

$stmt->close();
$conn->close();
?>
