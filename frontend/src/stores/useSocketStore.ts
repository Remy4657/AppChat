import { create } from "zustand";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatStore";
import { useFriendStore } from "./useFriendStore";
import { getSession } from "next-auth/react";

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  onlineUsers: [],

  connectSocket: async () => {
    const session = await getSession();

    const existingSocket = get().socket;

    if (existingSocket) return; // tránh tạo nhiều socket

    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      // kết nối đến socket server
      auth: {
        token: localStorage.getItem("accessToken") ?? session?.accessToken, // gửi token trong phần auth của socket.io client để backend có thể xác thực người dùng khi kết nối socket, nếu không gửi token thì backend sẽ không biết người dùng nào đang kết nối
      },
      transports: ["websocket"], // sử dụng websocket và polling để kết nối socket, nếu không có websocket thì sẽ fallback sang polling
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
      // cập nhật tin nhắn mới vào store để giao diện có thể hiển thị tin nhắn mới nhất
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
          displayname: "",
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
        // update trường seenBy và unreadCounts trong database và store, đồng thời kích hoạt sự kiện read-message để thông báo tôi đã xem
        useChatStore.getState().markAsSeen();
      }
      // cập nhật cuộc trò chuyện trong store với thông tin mới nhất về lastMessage và unreadCounts
      useChatStore.getState().updateConversation(updatedConversation);
    });
    // retrieve-message
    socket.on(
      "retrieve-message",
      ({ message, lastMessage, isRevokeLastMessage }) => {
        const messageId = message._id.toString() ?? null;
        const convoId = message.conversationId.toString() ?? null;
        const deleted_at = message.deleted_at;
        const deleted_by = message.deleted_by.toString();

        useChatStore
          .getState()
          .retrieveMessage(messageId, convoId, deleted_at, deleted_by);

        if (isRevokeLastMessage) {
          const updatedConversation = {
            _id: convoId,
            lastMessage,
          };
          useChatStore.getState().updateConversation(updatedConversation);
        }
      },
    );
    // read message
    socket.on("read-message", ({ conversation, lastMessage }) => {
      const updated = {
        _id: conversation._id,
        // lastMessage,
        // lastMessageAt: conversation.lastMessageAt,
        unreadCounts: conversation.unreadCounts,
        seenBy: conversation.seenBy,
      };
      // Khi nhận được sự kiện read-message, có nghĩa là một tin nhắn đã được đánh dấu là đã xem, do đó cần cập nhật lại thông tin của cuộc trò chuyện đó trong store để giao diện có thể hiển thị trạng thái seen mới nhất, cụ thể là cập nhật lại lastMessage, lastMessageAt, unreadCounts và seenBy của cuộc trò chuyện đó
      useChatStore.getState().updateConversation(updated);
    });
    // new group chat
    socket.on("new-group", (conversation) => {
      useChatStore.getState().addConvo(conversation); // cập nhật danh sách conversation trong store
      socket.emit("join-conversation", conversation._id); // sự kiện "join-conversation" với conversationId của cuộc trò chuyện nhóm đó để tự động tham gia vào phòng chat của cuộc trò chuyện nhóm mới mà không cần phải chờ người dùng click vào cuộc trò chuyện đó trong giao diện, việc này giúp đảm bảo rằng người dùng sẽ nhận được tin nhắn từ cuộc trò chuyện nhóm mới ngay cả khi họ chưa kịp mở cuộc trò chuyện đó lên
    });
    socket.on("send-request-friend", (resultRequestFrom) => {
      useFriendStore.setState((state) => ({
        receivedList: [resultRequestFrom, ...state.receivedList],
        listAllUsers: state.listAllUsers.filter(
          (item) => item._id !== resultRequestFrom.from._id,
        ),
      }));
    });
    socket.on("decline-request-friend", (idUserReceivedRequest) => {
      useFriendStore.setState((state) => ({
        sentList: state.sentList.filter(
          (item) => item.to?._id !== idUserReceivedRequest,
        ),
        listAllUsers: state.listAllUsers.map((item) =>
          item._id === idUserReceivedRequest && item.isSentRequest === true
            ? { ...item, isSentRequest: false }
            : item,
        ),
      }));
    });
    socket.on(
      "accept-request-friend",
      (idUserReceivedRequest, acceptFriend) => {
        useFriendStore.setState((state) => ({
          receivedList: [acceptFriend, ...state.receivedList],
          sentList: state.sentList.filter(
            (item) => item.to?._id !== idUserReceivedRequest,
          ),

          listAllUsers: state.listAllUsers.map((item) =>
            item._id === idUserReceivedRequest && item.isSentRequest === true
              ? { ...item, isSentRequest: false, isFriend: true }
              : item,
          ),
        }));
      },
    );
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));
