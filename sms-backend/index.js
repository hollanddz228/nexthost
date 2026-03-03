// sms-backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ✔ Генерация 4-значного кода
function generateCode() {
  return Math.floor(1000 + Math.random() * 9000);
}

app.post("/api/send-code", async (req, res) => {
  try {
    const { phone } = req.body || {};

    if (!phone) {
      return res.json({
        success: false,
        message: "Телефон нөмірі көрсетілмеген"
      });
    }

    const code = generateCode();

    // Чистим номер от +, пробелов, скобок
    const cleanPhone = phone.replace(/\D+/g, "");

    // ❗ ВАЖНО: Sender НЕ используем — он заблокирован у тебя
    const params = new URLSearchParams({
      login: process.env.SMSC_LOGIN,
      psw: process.env.SMSC_PASSWORD,
      phones: cleanPhone,
      mes: `Nexthost растау коды: ${code}`,
      fmt: "3" // JSON-формат ответа
    });

    const url = "https://smsc.kz/sys/send.php";

    const response = await axios.post(url, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });

    const data = response.data;
    console.log("SMSC:", data);

    // Если ошибка от SMSC
    if (data.error) {
      return res.json({
        success: false,
        message: `SMSC қатесі: ${data.error}`
      });
    }

    console.log("📩 SMS жіберілді:", cleanPhone, "| код:", code);

    // Возвращаем код — для учебного проекта норм
    return res.json({
      success: true,
      code
    });

  } catch (err) {
    console.error("send-code error:", err);
    return res.json({
      success: false,
      message: "Сервер қатесі (sms-backend)"
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 SMS backend тыңдап тұр: http://localhost:${PORT}`);
});
