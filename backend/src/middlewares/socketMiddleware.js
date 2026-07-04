import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { UnauthorizedError } from "../core/error.response.js";

export const socketAuthMiddleware = async (socket, next) => {

    const token = socket.handshake.auth?.token;
    if (!token) {
        throw new UnauthorizedError("Vui lòng đăng nhập");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
        throw new UnauthorizedError("Token không hợp lệ hoặc đã hết hạn");
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
        throw new UnauthorizedError("Người dùng không tồn tại");
    }
    // Gắn thông tin user vào socket để có thể sử dụng trong các sự kiện sau này
    socket.user = user;

    next();

};