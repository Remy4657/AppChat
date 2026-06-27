import { redisClient } from "../libs/connectRedisDb.js";
import * as authService from "../services/authService.js";
import { generateOTP } from "./otpController.js";

const ACCESS_TOKEN_TTL = 24 * 60 * 60 * 1000; // 1 giờ
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày


export const register = async (req, res) => {
    try {
        const { username, password, email, firstname, lastname, otp } = req.body;
        if (!otp) {
            return res.status(400).json({
                message: "OTP is a required fields",
            });
        }

        const storedOTP = await redisClient.get(`otp:${email}`);
        if (!storedOTP) {
            return res.status(400).json({ success: false, message: 'OTP không tồn tại hoặc đã hết hạn.' });
        }
        if (storedOTP !== otp) {
            return res.status(400).json({ success: false, message: 'Mã OTP không chính xác.' });
        }
        const user = await authService.registerUser({
            username,
            password,
            email,
            firstname,
            lastname,
        });
        await redisClient.del(`otp:${email}`);

        return res.status(201).json({
            message: "Register successful",
            data: user,
        });

    } catch (error) {
        console.log(error)
        return res.status(400).json({
            message: error.message,
        });
    }
};
export const login = async (req, res) => {
    try {
        const { accessToken, refreshToken } = await authService.loginUser(req.body)
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: ACCESS_TOKEN_TTL,
        });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: REFRESH_TOKEN_TTL, // 7 ngày
        });
        res.status(200).json({
            message: "Login successful",
            accessToken,
        });
    } catch (error) {
        return res.status(400).json({
            message: `Lỗi khi đăng nhập: ${error.message}`,
        });
    }
}
export const loginGoogle = async (req, res) => {
    try {

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }
        const googleIdToken = authHeader.split(' ')[1];
        if (!googleIdToken) {
            return res.status(401).json({ error: 'Missing id_token' });
        }
        const { accessToken, refreshToken } = await authService.loginGoogleUser(googleIdToken);
        res.status(200).json({
            message: "Login google successful",
            accessToken,
            refreshToken
        });

    } catch (error) {
        console.log("Error in loginGoogle:", error);
        return res.status(500).json(error);
    }
}
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        await authService.logoutUser(refreshToken);

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        return res.status(200).json({
            message: "Logout successful",
        });
    } catch (error) {
        return res.status(400).json({
            message: `Lỗi khi đăng xuất: ${error.message}`,
        });
    }
}
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        const { newAccessToken } = await authService.refreshToken(refreshToken);

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: ACCESS_TOKEN_TTL,
        });

        return res.status(200).json(
            { newAccessToken: newAccessToken }
        );
    } catch (error) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });
        return res.status(400).json({
            message: `Lỗi khi refresh token: ${error.message}`,
        });
    }
}