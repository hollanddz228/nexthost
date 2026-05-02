<?php
// backend/mailer_real.php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require_once 'config.php';

class RealMailer {
    public static function sendVerificationEmail($email, $name, $verification_code) {
        $mail = new PHPMailer(true);
        
        try {
            // Сенің түпнұсқа SMTP баптауларың (тікелей осында қалдырамыз)
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'my.nexthost222@gmail.com';
            $mail->Password   = 'nlfx dkzl dbxt kxnj';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->CharSet    = 'UTF-8';
            $mail->Encoding   = 'base64';

            $mail->setFrom('my.nexthost222@gmail.com', 'NextHost');
            $mail->addAddress($email, $name);

            $mail->isHTML(true);
            $mail->Subject = '=?UTF-8?B?' . base64_encode('Тіркелуді растау - NextHost') . '?=';
            
            // СІЛТЕМЕНІ ҚҰРАСТЫРУ (ДҰРЫСТАЛҒАН НҰСҚА)
            $base_url = rtrim(Config::$site_url, '/');
            $verification_url = $base_url . "/backend/verify.php?code=" . $verification_code;
            
            $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <link href='https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' rel='stylesheet'>
                <style>
                    body { font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
                    .container { max-width: 600px; background: white; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
                    .header h1 { font-weight: 700; margin: 0 0 10px 0; }
                    .header p { margin: 0; font-weight: 500; }
                    .content { padding: 30px; }
                    .content h2 { font-weight: 500; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 500; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>NextHost</h1>
                        <p>Тіркелуді растау</p>
                    </div>
                    <div class='content'>
                        <h2>Сәлеметсіз бе, {$name}!</h2>
                        <p>Тіркелуді аяқтау үшін email-ды растаңыз:</p>
                        <div style='text-align: center;'>
                            <a href='{$verification_url}' class='button'>Email-ды растау</a>
                        </div>
                        <p>Егер түйме жұмыс істемесе, сілтемені браузерге көшіріңіз:</p>
                        <p style='color: #666; font-size: 14px; word-break: break-all;'>{$verification_url}</p>
                    </div>
                    <div class='footer'>
                        <p>Құрметпен,<br>NextHost командасы</p>
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
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'my.nexthost222@gmail.com';
            $mail->Password   = 'nlfx dkzl dbxt kxnj';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->CharSet    = 'UTF-8';
            $mail->Encoding   = 'base64';

            $mail->setFrom('my.nexthost222@gmail.com', 'NextHost');
            $mail->addAddress($email);

            $mail->isHTML(true);
            $mail->Subject = '=?UTF-8?B?' . base64_encode('Құпиясөзді қалпына келтіру - NextHost') . '?=';
            
            // СІЛТЕМЕНІ ҚҰРАСТЫРУ (ДҰРЫСТАЛҒАН НҰСҚА)
            $base_url = rtrim(Config::$site_url, '/');
            $reset_url = $base_url . "/reset-password.html?token=" . $reset_token;
            
            $mail->Body = "
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset='UTF-8'>
                <link href='https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap' rel='stylesheet'>
                <style>
                    body { font-family: 'Roboto', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
                    .container { max-width: 600px; background: white; margin: 0 auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; text-align: center; }
                    .header h1 { font-weight: 700; margin: 0 0 10px 0; }
                    .header p { margin: 0; font-weight: 500; }
                    .content { padding: 30px; }
                    .content h2 { font-weight: 500; }
                    .button { display: inline-block; background: linear-gradient(135deg, #667eea, #764ba2); color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: 500; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class='container'>
                    <div class='header'>
                        <h1>NextHost</h1>
                        <p>Құпиясөзді қалпына келтіру</p>
                    </div>
                    <div class='content'>
                        <h2>Қолжетімділікті қалпына келтіру</h2>
                        <p>Құпиясөзді қалпына келтіру үшін сілтемеге өтіңіз:</p>
                        <div style='text-align: center;'>
                            <a href='{$reset_url}' class='button'>Құпиясөзді қалпына келтіру</a>
                        </div>
                        <div class='warning'>
                            <strong>Сілтеме 1 сағат жарамды.</strong>
                        </div>
                    </div>
                    <div class='footer'>
                        <p>Құрметпен,<br>NextHost командасы</p>
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