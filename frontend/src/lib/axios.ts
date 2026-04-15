import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/services/authService";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5001/api"
      : "/api",
  withCredentials: true,
});
// Response interceptor
// tự động gọi refresh api khi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // những api không cần check
    if (
      originalRequest.url.includes("/auth/signin") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }
    const status = error.response?.status;
    const message = error.response?.data?.message || "Có lỗi xảy ra";

    switch (status) {
      case 400:
        toast.error(message);
        break;
      case 403:
        originalRequest._retryCount = originalRequest._retryCount || 0;

        if (originalRequest._retryCount < 4) {
          originalRequest._retryCount += 1;

          try {
            const newAccessToken = await authService.refreshToken();
            useAuthStore.getState().setAccessToken(newAccessToken);
            return api(originalRequest); // retry lại request cũ với access token mới
          } catch (error) {
            useAuthStore.getState().clearState();
            return Promise.reject(error);
          }
        }
        break;
    }
    return Promise.reject(error);
  }
);
export default api;
