import { BadRequestError, ConflictRequestError, UnauthorizedError } from "../core/error.response.js";
import SuccessResponse from "../core/success.response.js";
import { redisClient } from "../libs/connectRedisDb.js";
import * as authService from "../services/authService.js";
import { generateOTP } from "./otpController.js";

const ACCESS_TOKEN_TTL = 24 * 60 * 60 * 1000; // 1 giờ
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày


export const register = async (req, res) => {
    const { username, password, email, firstname, lastname, otp } = req.body;
    if (!otp) {
        throw new BadRequestError("OTP là trường bắt buộc")
    }
    const storedOTP = await redisClient.get(`otp:${email}`);
    if (!storedOTP) {
        throw new BadRequestError("OTP không tồn tại hoặc đã hết hạn.")
    }
    if (storedOTP !== otp) {
        throw new BadRequestError('Mã OTP không chính xác.')
    }
    const user = await authService.registerUser({
        username,
        password,
        email,
        firstname,
        lastname,
    });
    await redisClient.del(`otp:${email}`);
    SuccessResponse.created(res, user, 'Đăng ký thành công');
};
export const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        throw new BadRequestError('Thiếu username hoặc password')
    }
    const { accessToken, refreshToken } = await authService.loginUser(req.body)

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: ACCESS_TOKEN_TTL,
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: REFRESH_TOKEN_TTL, // 7 ngày
    });
    SuccessResponse.ok(res, null, 'Đăng nhập thành công', { accessToken });
}
export const loginGoogle = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid Authorization header');
    }
    const googleIdToken = authHeader.split(' ')[1];
    if (!googleIdToken) {
        throw new UnauthorizedError('Missing id_token');
    }
    const { accessToken, refreshToken } = await authService.loginGoogleUser(googleIdToken);
    SuccessResponse.ok(res, null, 'Đăng nhập thành công', { accessToken, refreshToken });
}
export const logout = async (req, res) => {

    const refreshToken = req.cookies?.refreshToken;

    await authService.logoutUser(refreshToken);

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

    });
    SuccessResponse.ok(res, null, 'Đăng xuất thành công');
}
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        const { newAccessToken } = await authService.refreshToken(refreshToken);

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: ACCESS_TOKEN_TTL,
        });
        SuccessResponse.ok(res, null, 'Lấy access token mới thành công', { newAccessToken });
    } catch (error) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        return res.status(500).json({
            message: `Lỗi khi refresh token: ${error.message}`,
        });
    }
}