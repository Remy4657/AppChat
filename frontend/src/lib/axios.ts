import axios from "axios";
import { toast } from "sonner";

const api = axios.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5001/api"
      : "/api",
  withCredentials: true,
});
// Response interceptor
api.interceptors.response.use(
  (response) => response, // 2xx — cho qua bình thường

  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      switch (status) {
        case 400:
          toast.error(message ?? "Dữ liệu không hợp lệ.");
          break;
      }
    }

    return Promise.reject(error); // vẫn throw để catch trong store biết
  }
);
export default api;
