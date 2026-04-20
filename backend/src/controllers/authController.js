import * as authService from "../services/authService.js";


const ACCESS_TOKEN_TTL = 30 * 60 * 1000; // thuờng là dưới 15m
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

export const register = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName } = req.body;

        // validate basic
        if (!username || !password || !email) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        const user = await authService.registerUser({
            username,
            password,
            email,
            firstName,
            lastName,
        });

        return res.status(201).json({
            message: "Register successful",
            data: user,
        });

    } catch (error) {
        return res.status(400).json({
            message: `Lỗi khi đăng ký: ${error.message}`,
        });
    }
};
export const login = async (req, res) => {
    try {
        const { user, accessToken, refreshToken } = await authService.loginUser(req.body)
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
            data: { user, accessToken },
        });
    } catch (error) {
        return res.status(400).json({
            message: `Lỗi khi đăng nhập: ${error.message}`,
        });
    }
}
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({
                message: "Missing refresh token",
            });
        }

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
            newAccessToken
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