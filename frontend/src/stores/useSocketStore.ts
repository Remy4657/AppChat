import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: () => {
    const accessToken = useAuthStore.getState().accessToken;
    const existingSocket = get().socket;

    if (existingSocket) return; // tránh tạo nhiều socket

    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      // kết nối đến socket server
      auth: { token: accessToken }, // gửi token trong phần auth của socket.io client để backend có thể xác thực người dùng khi kết nối socket, nếu không gửi token thì backend sẽ không biết người dùng nào đang kết nối và sẽ không thể xử lý các sự kiện như join-conversation, send-message,... vì những sự kiện này đều cần biết người dùng nào đang thực hiện hành động đó
      transports: ["websocket"],
    });

    set({ socket }); // lưu socket vào state để có thể dùng ở những nơi khác như component chat để emit join-conversation, emit send-message,...

    socket.on("connect", () => {
      console.log("Đã kết nối với socket");
    });

    // online users
    socket.on("online-users", (userIds) => {
      console.log("Danh sách userId đang online:", userIds);
      set({ onlineUsers: userIds });
    });
  },
  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
