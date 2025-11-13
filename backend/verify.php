<?php
// backend/verify.php
require_once 'config.php';

$verification_code = $_GET['code'] ?? '';

if (empty($verification_code)) {
    die("Неверный код подтверждения");
}

$conn = getDBConnection();
if (!$conn) {
    die("Ошибка подключения к базе данных");
}

try {
    // Ищем пользователя
    $stmt = $conn->prepare("SELECT id, username, email FROM users WHERE verification_code = ? AND email_verified = 0");
    $stmt->bind_param("s", $verification_code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        die("Неверный или устаревший код подтверждения");
    }

    $user = $result->fetch_assoc();

    // Активируем аккаунт
    $stmt = $conn->prepare("UPDATE users SET email_verified = 1, verification_code = NULL WHERE id = ?");
    $stmt->bind_param("i", $user['id']);

    if ($stmt->execute()) {
        echo "
        <!DOCTYPE html>
        <html>
        <head>
            <title>Email подтвержден - NextHost</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                }
                .container { 
                    background: white; 
                    padding: 40px; 
                    border-radius: 15px;
                    text-align: center;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    max-width: 500px;
                }
                .success { 
                    color: #4CAF50; 
                    font-size: 2rem; 
                    margin-bottom: 20px;
                }
                .button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 30px;
                    text-decoration: none;
                    border-radius: 8px;
                    display: inline-block;
                    margin-top: 20px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='success'>✅ Email успешно подтвержден!</div>
                <h2>Добро пожаловать в NextHost!</h2>
                <p>Ваш аккаунт <strong>{$user['email']}</strong> активирован.</p>
                <a href='../auth.html' class='button'>Войти в аккаунт</a>
            </div>
        </body>
        </html>
        ";
    } else {
        echo "Ошибка при активации аккаунта";
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo "Ошибка: " . $e->getMessage();
} finally {
    $conn->close();
}
?>