import crypto from "crypto";
import User from "../models/User.js";
import { redisClient } from "../libs/connectRedisDb.js";
import * as authService from "../services/authService.js";
import { sendOTPEmail } from "../services/emailService.js";
import { BadRequestError, ConflictRequestError, UnauthorizedError } from "../core/error.response.js";
import SuccessResponse from "../core/success.response.js";

const OTP_TTL = 60 // seconds

export const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export const sendOtp = async (req, res) => {
    const { username, password, email, firstname, lastname } = req.body;

    if (!username || !password || !email) {
        throw new BadRequestError("Thiếu thông tin bắt buộc: username, password hoặc email");
    }
    await authService.checkEmailExist(email)
    const expiresAtExisting = await redisClient.get(`otp_expiry:${email}`);

    if (expiresAtExisting) {
        SuccessResponse.ok(res, null, 'Mã OTP trước đó vẫn còn hiệu lực. Vui lòng kiểm tra email.', { expiresAt: expiresAtExisting });
    }
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_TTL * 1000

    console.log(`OTP cho ${email}: ${otp}`);

    await redisClient.setEx(`otp:${email}`, OTP_TTL, otp);
    await redisClient.setEx(`otp_expiry:${email}`, OTP_TTL, expiresAt.toString());
    // send email
    await sendOTPEmail(email, otp);

    SuccessResponse.created(res, null, 'OTP đã được tạo', { expiresAt });

}
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        throw new BadRequestError('Email và OTP là bắt buộc');
    }
    const storedOTP = await redisClient.get(`otp:${email}`);
    if (!storedOTP) {
        throw new BadRequestError('OTP không tồn tại hoặc đã hết hạn.');
    }
    if (storedOTP !== otp) {
        throw new UnauthorizedError('Mã OTP không chính xác.');
    }
    await redisClient.del(`otp:${email}`);

    SuccessResponse.ok(res, null, 'Xác thực email thành công!');

}