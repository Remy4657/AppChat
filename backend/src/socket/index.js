import { Server } from "socket.io";
import http from "http";
import express from "express";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

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

io.on("connection", async (socket) => { // Khi có một client kết nối đến server qua Socket.IO, hàm callback này sẽ được gọi với đối số là socket đại diện cho kết nối của client đó.
    const user = socket.user;
    console.log(user.username, "connected with socket ID:", socket.id);

    onlineUsers.set(user._id, socket.id); // Lưu userId và socketId vào Map khi người dùng kết nối

    io.emit("online-users", Array.from(onlineUsers.keys())); // Gửi danh sách userId của những người đang online cho tất cả client

    // Khi người dùng kết nối, lấy danh sách conversation mà họ tham gia và  socket join vào các phòng tương ứng với conversationId để có thể nhận được tin nhắn mới khi có tin nhắn được gửi đến các conversation đó.
    const conversationIds = await getUserConversationsForSocketIO(user._id);
    conversationIds.forEach((id) => { //Cs
        console.log("socket joined conversation:", id)
        socket.join(id);
    });
    socket.on("join-conversation", (conversationId) => {
        console.log("conversationId:", conversationId);
        socket.join(conversationId);
    });
    socket.join(user._id.toString()); // mặc dù đã có bước {*) nhưng vẫn cần join vào phòng có tên là userId để có thể gửi tin nhắn trực tiếp đến người dùng đó khi cần thiết (ví dụ khi có tin nhắn mới trong một conversation mà người dùng đó tham gia, server có thể gửi thông báo đến phòng userId của người dùng đó để client biết và cập nhật giao diện)}

    socket.on("disconnect", () => {
        onlineUsers.delete(user._id);
        io.emit("online-users", Array.from(onlineUsers.keys()));
        console.log(`socket disconnected: ${socket.id}`);
    });
});

export { io, app, server };