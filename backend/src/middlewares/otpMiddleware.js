
import rateLimit from 'express-rate-limit'

// Giới hạn số lần gửi yêu cầu OTP (3 lần/giờ) – bảo vệ chống spam
export const otpRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 giờ
    max: 10,
    message: 'Bạn đã yêu cầu quá nhiều lần, vui lòng thử lại sau 1 giờ.',
    keyGenerator: (req) => req.body.email || req.ip,
});