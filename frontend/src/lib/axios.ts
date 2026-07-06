import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore";
import { authService } from "@/services/authService";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (config.url?.includes("/auth/signin-google")) {
      return config; // Không thêm gì, giữ nguyên header do bạn set
    }
    const accessToken =
      localStorage.getItem("accessToken") || session?.accessToken;
    const refreshToken =
      localStorage.getItem("refreshToken") || session?.refreshToken;

    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    // Gửi refreshToken trong header tùy chỉnh (ví dụ: x-refresh-token)
    if (refreshToken) {
      config.headers["x-refresh-token"] = refreshToken;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
// tự động gọi refresh api khi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // những api không cần check token như signin, signup, refresh thì không cần gọi refresh token nữa vì nếu gọi refresh token mà refresh token cũng hết hạn thì sẽ bị lỗi vòng lặp vô hạn nên cần check trước khi gọi refresh token
    if (
      originalRequest.url.includes("/auth/signin") ||
      originalRequest.url.includes("/auth/signup") ||
      originalRequest.url.includes("/auth/refresh") ||
      originalRequest.url.includes("/auth/signin-google")
    ) {
      return Promise.reject(error);
    }
    const status = error.response?.status;
    // const message = error.response?.data?.message || "Có lỗi xảy ra";
    switch (status) {
      case 403:
        originalRequest._retryCount = originalRequest._retryCount || 0; // retry của url /refresh
        if (originalRequest._retryCount < 4) {
          originalRequest._retryCount += 1;

          try {
            const { newAccessToken } = await authService.refreshToken();
            localStorage.setItem("accessToken", newAccessToken);
            return api(originalRequest); // retry lại request cũ với access token mới
          } catch (error) {
            useAuthStore.getState().signOut();
            return Promise.reject(error);
          }
        }
        break;
    }
    return Promise.reject(error);
  },
);
export default api;
