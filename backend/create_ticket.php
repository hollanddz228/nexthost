<?php
header('Content-Type: application/json; charset=utf-8');

// === 1. Подключение к базе данных ===
$servername = "localhost";
$username = "root"; // стандартно в XAMPP
$password = "";     // пароль по умолчанию пустой
$dbname = "nexthost";

$conn = new mysqli($servername, $username, $password, $dbname);

// Қосылуды тексеру
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Дерекқорға қосылу қатесі: ' . $conn->connect_error]);
    exit;
}

// === 2. Әдісті тексеру ===
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Сұраныс әдісі дұрыс емес (POST қажет)']);
    exit;
}

// === 3. Деректерді алу ===
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

// Толтыруды тексеру
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Барлық өрістерді толтырыңыз']);
    exit;
}

// === 4. Проверка и загрузка скриншота (если есть) ===
$screenshotPath = null;

if (!empty($_FILES['screenshot']['name'])) {
  $uploadDir = __DIR__ . '/../uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    $filename = time() . '_' . basename($_FILES['screenshot']['name']);
    $targetPath = $uploadDir . $filename;

    if (move_uploaded_file($_FILES['screenshot']['tmp_name'], $targetPath)) {
        $screenshotPath = 'uploads/' . $filename;
    } else {
        echo json_encode(['success' => false, 'message' => 'Файлды жүктеу қатесі']);
        exit;
    }
}

// === 5. Запись тикета в базу ===
if ($screenshotPath) {
    $stmt = $conn->prepare("INSERT INTO tickets (name, email, message, screenshot_path) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $message, $screenshotPath);
} else {
    $stmt = $conn->prepare("INSERT INTO tickets (name, email, message) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $message);
}

if ($stmt && $stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Тикет сәтті жасалды', 'id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Тикетті сақтау қатесі: ' . $conn->error]);
}

// === 6. Закрытие соединения ===
$stmt->close();
$conn->close();
?>
