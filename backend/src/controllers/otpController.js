import crypto from "crypto";
import User from "../models/User.js";
import { redisClient } from "../libs/connectRedisDb.js";
import * as authService from "../services/authService.js";
import { sendOTPEmail } from "../services/emailService.js";

const OTP_TTL = 60 // seconds

export const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export const sendOtp = async (req, res) => {
    try {
        const { username, password, email, firstname, lastname } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }
        await authService.checkEmailExist(email)
        const expiresAtExisting = await redisClient.get(`otp_expiry:${email}`);

        if (expiresAtExisting) {
            return res.status(200).json({
                expiresAt: expiresAtExisting,
                message: 'Mã OTP trước đó vẫn còn hiệu lực. Vui lòng kiểm tra email.'
            });
        }
        const otp = generateOTP();
        const expiresAt = Date.now() + OTP_TTL * 1000

        console.log(`OTP cho ${email}: ${otp}`);

        await redisClient.setEx(`otp:${email}`, OTP_TTL, otp);
        await redisClient.setEx(`otp_expiry:${email}`, OTP_TTL, expiresAt.toString());
        // send email
        await sendOTPEmail(email, otp);

        return res.status(200).json({
            expiresAt,
            message: 'OTP đã được tạo'
        });
    } catch (err) {
        console.error('Lỗi :', err);
        res.status(500).json({ message: err.message || 'Lỗi server' });
    }
}
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email và OTP là bắt buộc' });
    }
    try {
        const storedOTP = await redisClient.get(`otp:${email}`);
        if (!storedOTP) {
            return res.status(400).json({ success: false, message: 'OTP không tồn tại hoặc đã hết hạn.' });
        }
        if (storedOTP !== otp) {
            return res.status(400).json({ success: false, message: 'Mã OTP không chính xác.' });
        }
        await redisClient.del(`otp:${email}`);

        res.json({ success: true, message: 'Xác thực email thành công!' });
    } catch (err) {
        console.error('Lỗi verify:', err);
        res.status(500).json({ error: 'Lỗi server' });
    }
}