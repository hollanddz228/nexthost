<?php
header('Content-Type: application/json; charset=utf-8');

// === 1. Подключение к базе данных ===
$servername = "localhost";
$username = "root"; // стандартно в XAMPP
$password = "";     // пароль по умолчанию пустой
$dbname = "nexthost";

$conn = new mysqli($servername, $username, $password, $dbname);

// Проверка подключения
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Ошибка соединения с базой: ' . $conn->connect_error]);
    exit;
}

// === 2. Проверка метода ===
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Некорректный метод запроса (требуется POST)']);
    exit;
}

// === 3. Получение данных ===
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$message = $_POST['message'] ?? '';

// Проверка заполнения
if (empty($name) || empty($email) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'Заполните все поля']);
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
        echo json_encode(['success' => false, 'message' => 'Ошибка загрузки файла']);
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
    echo json_encode(['success' => true, 'message' => 'Тикет успешно создан', 'id' => $stmt->insert_id]);
} else {
    echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении тикета: ' . $conn->error]);
}

// === 6. Закрытие соединения ===
$stmt->close();
$conn->close();
?>
