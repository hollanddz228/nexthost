<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

class RealMailer {
    public static function sendVerificationEmail($email, $name, $verification_code) {
        $mail = new PHPMailer(true);
        
        try {
            // Настройки SMTP
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'my.nexthost222@gmail.com';
            $mail->Password = 'nlfx dkzl dbxt kxnj';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            // Отправитель и получатель
            $mail->setFrom('my.nexthost222@gmail.com', 'NextHost');
            $mail->addAddress($email, $name);

            // Письмо
            $mail->isHTML(true);
            $mail->Subject = 'Подтверждение регистрации - NextHost';
            
            $verification_url = "http://localhost/nexthost/backend/verify.php?code=" . $verification_code;
            
            $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
                    .container { max-width: 600px; background: white; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>NextHost</h1>
                        <p>Подтверждение регистрации</p>
                    </div>
                    <div class='content'>
                        <h2>Здравствуйте, {$name}!</h2>
                        <p>Для завершения регистрации подтвердите ваш email:</p>
                        <div style='text-align: center;'>
                            <a href='{$verification_url}' class='button'>Подтвердить Email</a>
                        </div>
                        <p>Если кнопка не работает, скопируйте ссылку в браузер:</p>
                        <p style='color: #666; font-size: 14px;'>{$verification_url}</p>
                    </div>
                    <div class='footer'>
                        <p>С уважением,<br>Команда NextHost</p>
                    </div>
                </div>
            </body>
            </html>
            ";

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Email error: " . $mail->ErrorInfo);
            return false;
        }
    }
    
    public static function sendPasswordResetEmail($email, $reset_token) {
        $mail = new PHPMailer(true);
        
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'my.nexthost222@gmail.com';
            $mail->Password = 'nlfx dkzl dbxt kxnj';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            $mail->setFrom('my.nexthost222@gmail.com', 'NextHost');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = 'Восстановление пароля - NextHost';
            
            $reset_url = "http://localhost/nexthost/reset-password.html?token=" . $reset_token;
            
            $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
                    .container { max-width: 600px; background: white; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
                    .content { padding: 30px; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>NextHost</h1>
                        <p>Восстановление пароля</p>
                    </div>
                    <div class='content'>
                        <h2>Восстановление доступа</h2>
                        <p>Для восстановления пароля перейдите по ссылке:</p>
                        <div style='text-align: center;'>
                            <a href='{$reset_url}' class='button'>Восстановить пароль</a>
                        </div>
                        <div class='warning'>
                            <strong>Ссылка действительна 1 час.</strong>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            ";

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Password reset email error: " . $mail->ErrorInfo);
            return false;
        }
    }
}
?>