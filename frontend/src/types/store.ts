import type { Socket } from "socket.io-client";
import type { Conversation, Message } from "./chat";
import type { Friend, FriendRequest, User } from "./user";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  clearState: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  signUp: (
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (dark: boolean) => void;
}
export interface ChatState {
  conversations: Conversation[];
  messages: Record<
    string,
    {
      items: Message[];
      hasMore: boolean; // infinite-scroll
      nextCursor?: string | null; // phân trang, lưu giá trị là createdAt của tin nhắn cuối cùng đã load, khi fetch thêm tin nhắn thì sẽ gửi nextCursor này lên server để server biết nên trả về những tin nhắn nào có createdAt nhỏ hơn nextCursor, nếu nextCursor là null hoặc không có thì sẽ trả về những tin nhắn mới nhất, data trả về có dạng: { items: Message[], hasMore: boolean, nextCursor?: string | null
    }
  >;
  //data trả ra có dạng:
  /*
  {
    conversationId: 
      { 
        items: Message[], 
        hasMore: boolean, 
        nextCursor?: string 
      } 
  }
  */

  activeConversationId: string | null;
  convoLoading: boolean;
  messageLoading: boolean;
  loading: boolean;
  reset: () => void;

  setActiveConversation: (id: string | null) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId?: string) => Promise<void>;
  sendDirectMessage: (
    recipientId: string,
    content: string,
    imgUrl?: string,
  ) => Promise<void>;
  sendGroupMessage: (
    conversationId: string,
    content: string,
    imgUrl?: string,
  ) => Promise<void>;
  // add message
  addMessage: (message: Message) => Promise<void>;
  // update convo
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateConversation: (conversation: any) => void;
  markAsSeen: () => Promise<void>;
  addConvo: (convo: Conversation) => void;
  createConversation: (
    type: "group" | "direct",
    name: string,
    memberIds: string[],
  ) => Promise<void>;
  retrieveMessage: (
    messageId: string,
    convoId: string,
    deleted_at: string,
    deleted_by: string,
  ) => void;
}

export interface FriendState {
  friends: Friend[];
  loading: boolean;
  receivedList: FriendRequest[];
  sentList: FriendRequest[];
  searchByUsername: (username: string) => Promise<User | null>;
  addFriend: (to: string, message?: string) => Promise<string>;
  getAllFriendRequests: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  getFriends: () => Promise<void>;
}
export interface SocketState {
  socket: Socket | null;
  onlineUsers: string[];
  connectSocket: () => void;
  disconnectSocket: () => void;
}
export interface UserState {
  updateAvatarUrl: (formData: FormData) => Promise<void>;
}
