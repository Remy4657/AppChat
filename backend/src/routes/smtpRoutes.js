import express from "express";
const router = express.Router();
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

router.get('/test-smtp', async (req, res) => {

    const testTransporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    await testTransporter.verify(); // kiểm tra kết nối
    res.send('SMTP connection successful!');

});

export default router
