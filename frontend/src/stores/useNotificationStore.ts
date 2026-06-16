import { notificationService } from "@/services/notificationService";
import { NotificationState } from "@/types/store";
import { create } from "zustand";
import { useFriendStore } from "./useFriendStore";

export const useNotificationStore = create<NotificationState>((set, get) => ({
  markReadNotification: async () => {
    try {
      await notificationService.markReadNotification();
      useFriendStore.getState().resetReceivedList();
    } catch (error) {
      console.error("Lỗi xảy ra: ", error);
    }
  },
}));
