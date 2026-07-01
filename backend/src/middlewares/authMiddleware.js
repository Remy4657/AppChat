import jwt, { decode } from "jsonwebtoken";
import User from "../models/User.js";
import { ForbiddenError, UnauthorizedError } from "../core/error.response.js";

export const protectedRoute = (req, res, next) => {
    //const accessToken = req.headers.authorization?.split(" ")[1];
    const accessToken = req.cookies.accessToken;
    // if (!accessToken) {
    //     return res.status(401).json({ message: "Không tìm thấy access token" });
    // }

    jwt.verify(accessToken, process.env.JWT_SECRET, async (err, decodedUser) => {
        if (err) {
            throw new ForbiddenError("Token hết hạn hoặc không đúng");
        }
        const user = await User.findById(decodedUser.userId).select("-password");
        if (!user) {
            throw new UnauthorizedError("Người dùng không tồn tại");
        }
        req.user = user; // Lưu thông tin người dùng vào req.user
        next();
    });
}
export const asyncHandler = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next)
    }
}