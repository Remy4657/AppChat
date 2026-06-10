import api from "@/lib/axios";

export const friendService = {
  async searchByUsername(username: string) {
    const res = await api.get(`/users/search?username=${username}`);
    return res.data.user;
  },

  async sendFriendRequest(to: string, message?: string) {
    const res = await api.post("/friends/requests", { to, message });
    return res.data;
  },
  async getAllFriendRequest() {
    try {
      const res = await api.get("/friends/requests");
      const { sent, received, allUsers } = res.data;
      return { sent, received, allUsers };
    } catch (error) {
      console.error("Lỗi khi gửi getAllFriendRequest", error);
    }
  },

  async acceptRequest(requestId: string) {
    try {
      const res = await api.post(`/friends/requests/${requestId}/accept`);
      return res.data.requestAcceptedBy;
    } catch (error) {
      console.error("Lỗi khi gửi acceptRequest", error);
    }
  },

  async declineRequest(requestId: string) {
    try {
      const res = await api.post(`/friends/requests/${requestId}/decline`);
      return res.data;
    } catch (error) {
      console.error("Lỗi khi gửi declineRequest", error);
    }
  },
  async getFriendList() {
    const res = await api.get("/friends");
    return res.data.friends;
  },
};
