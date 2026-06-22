import jwt, { decode } from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = (req, res, next) => {
    try {
        //const accessToken = req.headers.authorization?.split(" ")[1];
        const accessToken = req.cookies.accessToken;
        // if (!accessToken) {
        //     return res.status(401).json({ message: "Không tìm thấy access token" });
        // }

        jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decodedUser) => {
            if (err) {
                return res.status(403).json({ message: "Token hết hạn hoặc không đúng" });
            }
            const user = await User.findById(decodedUser.userId).select("-password");
            if (!user) {
                return res.status(404).json({ message: "Người dùng không tồn tại" });
            }
            req.user = user; // Lưu thông tin người dùng vào req.user
            next();
        });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi hệ thống" });

    }

}