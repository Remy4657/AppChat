import api from "@/lib/axios";

export const notificationService = {
  markReadNotification: async () => {
    const res = await api.put("/notifications/read-all");
    return res;
  },
  getAllNotification: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },
};
