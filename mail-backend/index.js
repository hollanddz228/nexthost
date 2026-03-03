// mail-backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import path from "path";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---------- ПОДКЛЮЧЕНИЕ К MySQL ----------
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "nexthost",
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4"
});

// ---------- ФУНКЦИЯ СОХРАНЕНИЯ ПЛАТЕЖА В БД ----------
async function savePaymentToDB({ tariffId, tariffName, email, phone, amount, payCode, orderId, status = "completed" }) {
  try {
    const [result] = await pool.execute(
      `INSERT INTO payments (tariff_id, tariff_name, email, phone, amount, pay_code, status, order_id, created_at, confirmed_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [tariffId || 0, tariffName || "", email || "", phone || "", amount || 0, payCode || "", status, orderId || ""]
    );
    console.log("💾 Payment saved to DB, ID:", result.insertId);
    return result.insertId;
  } catch (err) {
    console.error("DB Error:", err);
    throw err;
  }
}

// ---------- ФУНКЦИЯ СОЗДАНИЯ PDF ----------
function createInvoiceBuffer({ tariffName, tariffPrice, email }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    const chunks = [];
    doc.on("data", chunk => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Шрифты
    const fontPath = path.resolve("fonts/Roboto-Regular.ttf");
    const boldFont = path.resolve("fonts/Roboto-Bold.ttf");

    // Генерация номера чека
    const receiptNumber = `NH-${Date.now().toString().slice(-8)}`;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("kk-KZ", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    });
    const formattedTime = currentDate.toLocaleTimeString("kk-KZ", {
      hour: "2-digit",
      minute: "2-digit"
    });

    // ===== ШАПКА С ЛОГОТИПОМ =====
    doc.font(boldFont).fontSize(28).fillColor("#2563eb").text("NEXTHOST", 50, 50);
    doc.font(fontPath).fontSize(10).fillColor("#666666").text("Хостинг қызметтері", 50, 82);
    
    // Контакты компании справа
    doc.font(fontPath).fontSize(9).fillColor("#666666");
    doc.text("www.nexthost.kz", 400, 50, { align: "right" });
    doc.text("info@nexthost.kz", 400, 62, { align: "right" });
    doc.text("+7 (777) 814-50-56", 400, 74, { align: "right" });

    // Разделительная линия
    doc.moveTo(50, 105).lineTo(545, 105).strokeColor("#2563eb").lineWidth(2).stroke();

    // ===== ЗАГОЛОВОК ДОКУМЕНТА =====
    doc.font(boldFont).fontSize(20).fillColor("#1f2937").text("ТӨЛЕМ ТҮБІРТЕГІ", 50, 130, { align: "center" });
    doc.font(fontPath).fontSize(10).fillColor("#666666").text("Электронды квитанция / Электронная квитанция", 50, 155, { align: "center" });

    // ===== ИНФОРМАЦИЯ О ЧЕКЕ =====
    const infoBoxY = 185;
    doc.roundedRect(50, infoBoxY, 240, 70, 5).fillColor("#f3f4f6").fill();
    doc.roundedRect(305, infoBoxY, 240, 70, 5).fillColor("#f3f4f6").fill();

    // Левый блок - номер и дата
    doc.font(fontPath).fontSize(9).fillColor("#666666").text("Түбіртек нөмірі:", 60, infoBoxY + 12);
    doc.font(boldFont).fontSize(11).fillColor("#1f2937").text(receiptNumber, 60, infoBoxY + 26);
    doc.font(fontPath).fontSize(9).fillColor("#666666").text("Күні / Уақыты:", 60, infoBoxY + 44);
    doc.font(boldFont).fontSize(11).fillColor("#1f2937").text(`${formattedDate}, ${formattedTime}`, 60, infoBoxY + 58);

    // Правый блок - клиент
    doc.font(fontPath).fontSize(9).fillColor("#666666").text("Клиент:", 315, infoBoxY + 12);
    doc.font(boldFont).fontSize(11).fillColor("#1f2937").text(email, 315, infoBoxY + 26, { width: 220 });
    doc.font(fontPath).fontSize(9).fillColor("#666666").text("Төлем әдісі:", 315, infoBoxY + 44);
    doc.font(boldFont).fontSize(11).fillColor("#1f2937").text("Онлайн төлем", 315, infoBoxY + 58);

    // ===== ТАБЛИЦА УСЛУГ =====
    const tableY = 280;
    
    // Заголовок таблицы
    doc.roundedRect(50, tableY, 495, 30, 3).fillColor("#2563eb").fill();
    doc.font(boldFont).fontSize(10).fillColor("#ffffff");
    doc.text("Қызмет атауы", 60, tableY + 10);
    doc.text("Кезең", 300, tableY + 10);
    doc.text("Сома", 450, tableY + 10, { align: "right", width: 85 });

    // Строка с тарифом
    doc.roundedRect(50, tableY + 32, 495, 40, 0).fillColor("#ffffff").fill();
    doc.rect(50, tableY + 32, 495, 40).strokeColor("#e5e7eb").lineWidth(1).stroke();
    
    doc.font(boldFont).fontSize(11).fillColor("#1f2937").text(tariffName, 60, tableY + 45);
    doc.font(fontPath).fontSize(10).fillColor("#666666").text("Хостинг тарифі", 60, tableY + 58);
    doc.font(fontPath).fontSize(10).fillColor("#1f2937").text("1 ай", 300, tableY + 50);
    doc.font(boldFont).fontSize(12).fillColor("#1f2937").text(tariffPrice, 450, tableY + 50, { align: "right", width: 85 });

    // ===== ИТОГО =====
    const totalY = tableY + 90;
    doc.moveTo(300, totalY).lineTo(545, totalY).strokeColor("#e5e7eb").lineWidth(1).stroke();
    
    doc.font(fontPath).fontSize(10).fillColor("#666666").text("Аралық сома:", 300, totalY + 10);
    doc.font(fontPath).fontSize(10).fillColor("#1f2937").text(tariffPrice, 450, totalY + 10, { align: "right", width: 85 });
    
    doc.font(fontPath).fontSize(10).fillColor("#666666").text("ҚҚС (12%):", 300, totalY + 28);
    doc.font(fontPath).fontSize(10).fillColor("#1f2937").text("Бағаға кіреді", 450, totalY + 28, { align: "right", width: 85 });

    doc.moveTo(300, totalY + 45).lineTo(545, totalY + 45).strokeColor("#2563eb").lineWidth(2).stroke();
    
    doc.font(boldFont).fontSize(12).fillColor("#1f2937").text("БАРЛЫҒЫ:", 300, totalY + 55);
    doc.font(boldFont).fontSize(14).fillColor("#2563eb").text(tariffPrice, 450, totalY + 53, { align: "right", width: 85 });

    // ===== СТАТУС ОПЛАТЫ =====
    const statusY = totalY + 90;
    doc.roundedRect(50, statusY, 495, 50, 5).fillColor("#dcfce7").fill();
    doc.font(boldFont).fontSize(12).fillColor("#166534").text("✓ ТӨЛЕМ СӘТТІ ӨТТІ", 50, statusY + 18, { align: "center", width: 495 });
    doc.font(fontPath).fontSize(9).fillColor("#166534").text("Транзакция расталды / Транзакция подтверждена", 50, statusY + 34, { align: "center", width: 495 });

    // ===== РЕКВИЗИТЫ КОМПАНИИ =====
    const companyY = statusY + 70;
    doc.font(boldFont).fontSize(10).fillColor("#1f2937").text("Компания деректемелері:", 50, companyY);
    doc.font(fontPath).fontSize(9).fillColor("#666666");
    doc.text("ЖШС «Nexthost Kazakhstan»", 50, companyY + 15);
    doc.text("БСН: 123456789012", 50, companyY + 27);
    doc.text("Мекенжай: Алматы қ., Абай даңғылы, 52", 50, companyY + 39);
    doc.text("Банк: Kaspi Bank АҚ", 50, companyY + 51);
    doc.text("ЖСК: KZ12345678901234567890", 50, companyY + 63);

    // ===== ФУТЕР =====
    const footerY = 720;
    doc.moveTo(50, footerY).lineTo(545, footerY).strokeColor("#e5e7eb").lineWidth(1).stroke();
    
    doc.font(fontPath).fontSize(8).fillColor("#9ca3af");
    doc.text("Бұл құжат электронды түрде жасалған және заңды күші бар.", 50, footerY + 10, { align: "center", width: 495 });
    doc.text("Этот документ сформирован электронно и имеет юридическую силу.", 50, footerY + 22, { align: "center", width: 495 });
    doc.text(`© ${currentDate.getFullYear()} Nexthost Kazakhstan. Барлық құқықтар қорғалған.`, 50, footerY + 40, { align: "center", width: 495 });

    doc.end();
  });
}

// ---------- ОТПРАВКА EMAIL ----------
async function sendInvoiceEmail({ email, tariffName, tariffPrice }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const pdfBuffer = await createInvoiceBuffer({
    tariffName,
    tariffPrice,
    email
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: email,
    subject: "Nexthost төлем түбіртегі",
    text: "Төлем түбіртегі PDF форматында тіркелген.",
    attachments: [
      {
        filename: "nexthost-receipt.pdf",
        content: pdfBuffer
      }
    ]
  });

  console.log("📧 Invoice sent:", info.messageId);
  return info;
}

// ---------- API ----------
app.post("/api/send-receipt", async (req, res) => {
  try {
    console.log("📥 Received data:", req.body);
    
    const { email, tariffName, tariffPrice, tariffId, phone, payCode, orderId } = req.body || {};

    console.log("📋 Parsed:", { email, tariffName, tariffPrice, tariffId, phone, payCode, orderId });

    if (!email || !tariffName || !tariffPrice) {
      return res.json({
        success: false,
        message: "Деректер толық емес"
      });
    }

    // Извлекаем числовую сумму из строки цены (например "2990 ₸" -> 2990)
    const amount = parseFloat(tariffPrice.replace(/[^\d.]/g, "")) || 0;

    // Сохраняем платёж в БД
    const paymentId = await savePaymentToDB({
      tariffId,
      tariffName,
      email,
      phone,
      amount,
      payCode,
      orderId,
      status: "completed"
    });

    // Отправляем чек на email
    await sendInvoiceEmail({ email, tariffName, tariffPrice });

    return res.json({
      success: true,
      message: "Квитанция email-ге жіберілді",
      paymentId
    });
  } catch (err) {
    console.error("send-receipt error:", err);
    return res.json({
      success: false,
      message: "Квитанция жіберу кезінде қате кетті"
    });
  }
});

// ---------- API: Получить все платежи ----------
app.get("/api/payments", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM payments ORDER BY created_at DESC");
    return res.json({ success: true, payments: rows });
  } catch (err) {
    console.error("get payments error:", err);
    return res.json({ success: false, message: "Қате кетті" });
  }
});

// ---------- API: Получить платёж по ID ----------
app.get("/api/payments/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM payments WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "Төлем табылмады" });
    }
    return res.json({ success: true, payment: rows[0] });
  } catch (err) {
    console.error("get payment error:", err);
    return res.json({ success: false, message: "Қате кетті" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Mail backend тыңдап тұр: http://localhost:${PORT}`);
});

export { createInvoiceBuffer };
