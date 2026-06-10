import * as authService from "../services/authService.js";

const ACCESS_TOKEN_TTL = 24 * 60 * 60 * 1000; // 1 giờ
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

export const register = async (req, res) => {
    try {
        const { username, password, email, firstname, lastname } = req.body;
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
            firstname,
            lastname,
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