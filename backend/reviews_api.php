<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

include "config.php";

$conn = getDBConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET — получить все отзывы
if ($method === 'GET') {
    $result = $conn->query("SELECT id, user_name as name, rating, comment as text, date as created_at FROM reviews ORDER BY date DESC");
    
    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        $reviews[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "data" => $reviews
    ]);
    exit;
}

// POST — добавить отзыв
if ($method === 'POST') {
    // Получаем данные из формы или JSON
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents("php://input"), true);
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        $rating = (int)($input['rating'] ?? 5);
        $message = $input['message'] ?? '';
    } else {
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $rating = (int)($_POST['rating'] ?? 5);
        $message = $_POST['message'] ?? '';
    }
    
    // Валидация
    if (empty($name) || empty($message)) {
        echo json_encode([
            "success" => false,
            "message" => "Атыңыз бен пікіріңізді енгізіңіз"
        ]);
        exit;
    }
    
    if ($rating < 1 || $rating > 5) {
        $rating = 5;
    }
    
    // Сохраняем в БД
    $stmt = $conn->prepare("INSERT INTO reviews (user_name, rating, comment, date) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("sis", $name, $rating, $message);
    
    if ($stmt->execute()) {
        $newId = $stmt->insert_id;
        
        echo json_encode([
            "success" => true,
            "message" => "Пікір сәтті қосылды!",
            "review" => [
                "id" => $newId,
                "name" => $name,
                "rating" => $rating,
                "text" => $message,
                "created_at" => date("Y-m-d H:i:s")
            ]
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Қате: " . $conn->error
        ]);
    }
    
    $stmt->close();
    exit;
}

$conn->close();
?>
