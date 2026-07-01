import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {

    const token = socket.handshake.auth?.token;
    if (!token) {
        return next(new Error("Unauthorized - Token không tồn tại"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        return next(new Error("Unauthorized - Token không hợp lệ hoặc đã hết hạn"));
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
        return next(new Error("User không tồn tại"));
    }
    // Gắn thông tin user vào socket để có thể sử dụng trong các sự kiện sau này
    socket.user = user;

    next();

};