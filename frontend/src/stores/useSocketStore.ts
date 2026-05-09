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
    // new message
    socket.on("new-message", ({ message, conversation, unreadCounts }) => {
      useChatStore.getState().addMessage(message);
      // Khi nhận được tin nhắn mới, cần cập nhật lại lastMessage và unreadCounts
      // của cuộc trò chuyện đó trong store để giao diện có thể hiển thị thông tin
      // mới nhất, vì khi có tin nhắn mới thì lastMessage sẽ thay đổi thành tin nhắn
      // mới nhất và unreadCounts sẽ tăng lên 1 cho người nhận
      const lastMessage = {
        _id: conversation.lastMessage._id,
        content: conversation.lastMessage.content,
        createdAt: conversation.lastMessage.createdAt,
        sender: {
          _id: conversation.lastMessage.senderId,
          displayName: "",
          avatarUrl: null,
        },
      };

      const updatedConversation = {
        ...conversation,
        lastMessage,
        unreadCounts,
      };
      // nếu có cuộc trò chuyện nào đang được mở và cuộc trò chuyện đó chính là cuộc trò chuyện nhận được tin nhắn mới thì sẽ gọi markAsSeen để đánh dấu tin nhắn đó đã được xem
      if (
        useChatStore.getState().activeConversationId === message.conversationId
      ) {
        useChatStore.getState().markAsSeen();
      }
      // cập nhật cuộc trò chuyện trong store với thông tin mới nhất về lastMessage và unreadCounts
      useChatStore.getState().updateConversation(updatedConversation);
    });
    // read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        lastMessage,
        lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };
      // Khi nhận được sự kiện read-message, có nghĩa là một tin nhắn đã được đánh dấu là đã xem, do đó cần cập nhật lại thông tin của cuộc trò chuyện đó trong store để giao diện có thể hiển thị trạng thái seen mới nhất, cụ thể là cập nhật lại lastMessage, lastMessageAt, unreadCounts và seenBy của cuộc trò chuyện đó
      useChatStore.getState().updateConversation(updated);
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
