import { BrevoClient } from '@getbrevo/brevo';
import dotenv from "dotenv"
dotenv.config()



//const resend = new Resend(process.env.RESEND_KEY);

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export const sendOTPEmail = async (to, otp, subject = 'Mã OTP xác thực tài khoản') => {

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
      <h2 style="color: #333;">Xác thực tài khoản</h2>
      <p>Chào bạn,</p>
      <p>Mã OTP của bạn là:</p>
      <h1 style="background: #f4f4f4; padding: 8px; text-align: center; letter-spacing: 4px; border-radius: 8px;">
        <strong>${otp}</strong>
      </h1>
      <p>Mã có hiệu lực trong <strong>1 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      <hr />
      <p style="color: #999; font-size: 12px;">Đây là email tự động, vui lòng không trả lời.</p>
    </div>
  `;

  // const { data } = resend.emails.send({
  //   from: 'trongdatga@gmail.com',
  //   to,
  //   subject,
  //   html: htmlContent
  // });
  // console.log("data email: ", data)
  // console.log(`Email ${data.id} with custom HTML content has been sent.`);

  const result = await brevo.transactionalEmails.sendTransacEmail({
    subject,
    textContent: htmlContent,
    sender: { name: "No-reply", email: "trongdatga@gmail.com" },
    to: [{ email: to }]
  });

  console.log('Email sent:', result);
};

