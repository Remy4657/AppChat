import { friendService } from "@/services/friendService";
import { notificationService } from "@/services/notificationService";
import type { FriendState } from "@/types/store";
import { create } from "zustand";

export const useFriendStore = create<FriendState>((set, get) => ({
  friends: [],
  loading: false,
  receivedList: [],
  sentList: [],
  listAllUsers: [],

  resetReceivedList: () => {
    set((state) => ({
      receivedList: state.receivedList.map((obj) => ({
        ...obj,
        is_read: true,
      })),
    }));
  },
  searchByUsername: async (username) => {
    try {
      set({ loading: true });

      const user = await friendService.searchByUsername(username);

      return user;
    } catch (error) {
      console.error("Lỗi xảy ra khi tìm user bằng username", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },
  addFriend: async (to, message) => {
    try {
      set({ loading: true });
      const { message: resultMessage, resultRequestTo } =
        await friendService.sendFriendRequest(to, message);
      set((state) => ({
        listAllUsers: state.listAllUsers.map((user) => {
          if (user._id === to) {
            return { ...user, isSentRequest: true };
          }
          return user;
        }),
        sentList: [resultRequestTo, ...state.sentList],
      }));
      return resultMessage;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message ||
          "Lỗi xảy ra khi gửi kết bạn. Hãy thử lại",
      );
    } finally {
      set({ loading: false });
    }
  },
  getAllFriendRequests: async () => {
    try {
      set({ loading: true });

      const [friendResult, notificationResult] = await Promise.all([
        friendService.getAllFriendRequest(),
        notificationService.getAllNotification(),
      ]);

      if (!friendResult) {
        set({ loading: false });
        return;
      }

      const { received, sent, allUsers } = friendResult;

      const acceptNotifications = notificationResult?.listAccept ?? [];

      // Gộp danh sách lời mời nhận được và thông báo chấp nhận
      const combinedList = [...received, ...acceptNotifications];

      // Sắp xếp theo createdAt mới nhất (hỗ trợ cả createdAt và created_at)
      const sortedCombined = combinedList.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime(); // mới hơn đứng trước
      });

      set({
        receivedList: sortedCombined,
        sentList: sent,
        listAllUsers: allUsers,
        loading: false,
      });
    } catch (error) {
      console.error("Lỗi xảy ra khi getAllFriendRequests", error);
    } finally {
      set({ loading: false });
    }
  },
  acceptRequest: async (requestId) => {
    try {
      set({ loading: true });
      await friendService.acceptRequest(requestId);

      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
      }));
    } catch (error) {
      console.error("Lỗi xảy ra khi acceptRequest", error);
    }
  },
  declineRequest: async (requestId) => {
    try {
      set({ loading: true });
      const { requestFrom } = await friendService.declineRequest(requestId);
      set((state) => ({
        receivedList: state.receivedList.filter((r) => r._id !== requestId),
        listAllUsers: [
          {
            ...requestFrom,
            isFriend: false,
            isReceivedRequest: false,
            isSentRequest: false,
          },
          ...state.listAllUsers,
        ],
      }));
    } catch (error) {
      console.error("Lỗi xảy ra khi declineRequest", error);
    } finally {
      set({ loading: false });
    }
  },
  getFriends: async () => {
    try {
      set({ loading: true });
      const friends = await friendService.getFriendList();
      set({ friends: friends });
    } catch (error) {
      console.error("Lỗi xảy ra khi load friends", error);
      set({ friends: [] });
    } finally {
      set({ loading: false });
    }
  },
}));
