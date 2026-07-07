import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

// Tạo transporter (dùng Gmail)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


export const sendOTPEmail = async (to, otp, subject = 'Mã OTP xác thực tài khoản') => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #333;">Xác thực tài khoản</h2>
      <p>Chào bạn,</p>
      <p>Mã OTP của bạn là:</p>
      <h1 style="background: #f4f4f4; padding: 16px; text-align: center; letter-spacing: 4px; border-radius: 8px;">
        <strong>${otp}</strong>
      </h1>
      <p>Mã có hiệu lực trong <strong>1 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      <hr />
      <p style="color: #999; font-size: 12px;">Đây là email tự động, vui lòng không trả lời.</p>
    </div>
  `;

  await transporter.sendMail({
    from: "no-reply@gmail.com",
    to,
    subject,
    html: htmlContent,
  },
    (err, info) => {
      if (err) {
        console.error("error: ", err);
        return;
      }
      console.log(info.envelope);
      console.log(info.messageId);
    }
  );
};

