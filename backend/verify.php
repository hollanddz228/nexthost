<?php
// backend/verify.php
require_once 'config.php';

$verification_code = $_GET['code'] ?? '';

if (empty($verification_code)) {
    die("Растау коды дұрыс емес");
}

$conn = getDBConnection();
if (!$conn) {
    die("Дерекқорға қосылу қатесі");
}

try {
    // Пайдаланушыны іздейміз
    $stmt = $conn->prepare("SELECT id, username, email FROM users WHERE verification_code = ? AND email_verified = 0");
    $stmt->bind_param("s", $verification_code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        die("Растау коды дұрыс емес немесе ескірген");
    }

    $user = $result->fetch_assoc();

    // Аккаунтты белсендіреміз
    $stmt = $conn->prepare("UPDATE users SET email_verified = 1, verification_code = NULL WHERE id = ?");
    $stmt->bind_param("i", $user['id']);

    if ($stmt->execute()) {
        echo "
        <!DOCTYPE html>
        <html lang='kk'>
        <head>
            <meta charset='UTF-8'>
            <title>Email расталды - NextHost</title>
            <link href='https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' rel='stylesheet'>
            <style>
                body { 
                    font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
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
                <div class='success'>✅ Email сәтті расталды!</div>
                <h2>NextHost-қа қош келдіңіз!</h2>
                <p>Сіздің аккаунтыңыз <strong>{$user['email']}</strong> белсендірілді.</p>
                <a href='../auth.html' class='button'>Аккаунтқа кіру</a>
            </div>
        </body>
        </html>
        ";
    } else {
        echo "Аккаунтты белсендіру қатесі";
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    echo "Қате: " . $e->getMessage();
} finally {
    $conn->close();
}
?>