import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
//import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

const app = express();

const server = http.createServer(app); // Tạo server HTTP từ ứng dụng Express để Socket.IO có thể sử dụng chung cổng với Express.

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
    },
});

io.use(socketAuthMiddleware);

const onlineUsers = new Map(); // {userId: socketId}

io.on("connection", async (socket) => {
    const user = socket.user;
    console.log(user.username, "connected with socket ID:", socket.id);

    onlineUsers.set(user._id, socket.id); // Lưu userId và socketId vào Map khi người dùng kết nối

    io.emit("online-users", Array.from(onlineUsers.keys())); // Gửi danh sách userId của những người đang online cho tất cả client

    // const conversationIds = await getUserConversationsForSocketIO(user._id);
    // conversationIds.forEach((id) => {
    //     socket.join(id);
    // });

    // socket.on("join-conversation", (conversationId) => {
    //     socket.join(conversationId);
    // });

    // socket.join(user._id.toString());

    socket.on("disconnect", () => {
        onlineUsers.delete(user._id);
        io.emit("online-users", Array.from(onlineUsers.keys()));
        console.log(`socket disconnected: ${socket.id}`);
    });
});

export { io, app, server };