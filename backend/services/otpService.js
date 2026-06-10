const axios = require('axios');
const db = require('../db/connection');

// Automatically delete OTP logs older than 5 minutes
async function cleanupOldOTPs() {
  try {
    await db.query("DELETE FROM otp_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
  } catch (error) {
    console.error("Failed to clean up old OTP logs:", error);
  }
}

async function generateOTP(phone) {
  // Clear old OTPs first
  await cleanupOldOTPs();

  let otp;
  let isUnique = false;

  while (!isUnique) {
    otp = Math.floor(100000 + Math.random() * 900000).toString();
    const [rows] = await db.query(
      "SELECT 1 FROM otp_logs WHERE otp = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)",
      [otp]
    );
    if (rows.length === 0) {
      isUnique = true;
    }
  }

  return otp;
}

async function sendWhatsAppOtp(phone, otp) {
  const url = process.env.WHATSAPP_API_URL || 'https://wbot.dhanyafamilysaloon.in/send-message';
  const message = `Your VConnect NFC Card verification code is ${otp}. It is valid for 5 minutes.`;

  // Format phone number to start with 91 (if it has 10 digits and doesn't start with 91)
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.length === 10 && !formattedPhone.startsWith('91')) {
    formattedPhone = '91' + formattedPhone;
  }

  const params = new URLSearchParams();
  params.append('phone', formattedPhone);
  params.append('message', message);

  try {
    const response = await axios.post(url, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    return response.data;
  } catch (error) {
    console.error("Failed to send WhatsApp OTP:", error.message);
    throw new Error("Failed to send OTP via WhatsApp. Please check the number and try again.");
  }
}

async function verifyOTP(phone, otp) {
  await cleanupOldOTPs();
  
  const [rows] = await db.query(
    "SELECT id FROM otp_logs WHERE phone = ? AND otp = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) LIMIT 1",
    [phone, otp]
  );

  if (rows.length > 0) {
    // Consume OTP by deleting it immediately
    await db.query("DELETE FROM otp_logs WHERE id = ?", [rows[0].id]);
    return true;
  }

  return false;
}

module.exports = {
  generateOTP,
  sendWhatsAppOtp,
  verifyOTP,
  cleanupOldOTPs
};
