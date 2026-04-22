import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "sonner";
import type { AuthState } from "@/types/store";
import { authService } from "@/services/authService";
import { useChatStore } from "./useChatStore";
export const useAuthStore = create<AuthState, [["zustand/devtools", never]]>(
  devtools((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    clearState: () => set({ accessToken: null, user: null, loading: false }),
    setAccessToken: (token) => set({ accessToken: token }),

    signUp: async (firstname, lastname, username, email, password) => {
      set({ loading: true });
      try {
        await authService.signUp(
          firstname,
          lastname,
          username,
          email,
          password
        );
        toast.success("Đăng ký thành công!");
      } catch (error) {
        // toast.error("Đăng ký thất bại. Vui lòng thử lại."); // đã thông báo ở axuios interceptor nên không cần thông báo ở đây nữa để tránh bị trùng lặp thông báo lỗi
        throw error; // để component biết đăng ký thất bại, không throw new vì đã có interceptor của axios handle rồi
      } finally {
        set({ loading: false });
      }
    },
    signIn: async (username, password) => {
      set({ loading: true });
      try {
        const { accessToken } = await authService.signIn(username, password);
        get().setAccessToken(accessToken);
        await get().fetchMe();
        useChatStore.getState().fetchConversations();
        toast.success("Đăng nhập thành công!");
      } catch (error) {
        throw error; // để component biết đăng nhập thất bại, không throw new vì đã có interceptor của axios handle rồi
      } finally {
        set({ loading: false });
      }
    },
    signOut: async () => {
      try {
        get().clearState(); // xóa state ngay lập tức để tránh trường hợp token cũ vẫn còn trong state khi signOut thất bại, tuy nhiên nếu signOut thất bại thì token cũng sẽ bị backend invalidate nên cũng không ảnh hưởng gì
        await authService.signOut();
      } catch (error) {
        throw error; // để component biết đăng nhập thất bại, không throw new vì đã có interceptor của axios handle rồi
      }
    },
    fetchMe: async () => {
      try {
        const user = await authService.fetchMe();
        set({ user });
        // toast.success("API test thành công!");
      } catch (error) {
        set({ user: null, accessToken: null, loading: false });
        toast.error(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          "API test thất bại: "
        );
        throw error; // để component biết fetch me thất bại, không throw new vì đã có interceptor của axios handle rồi
      } finally {
        set({ loading: false });
      }
    },
    refreshToken: async () => {
      try {
        const { fetchMe, setAccessToken } = get();

        set({ loading: true });
        const newAccessToken = await authService.refreshToken();
        setAccessToken(newAccessToken);
        // luôn fetch me sau khi refresh token để cập nhật thông tin user mới nhất vì khi refresh trang thì data lưu trong zudtand sẽ bị mất
        await fetchMe();
      } catch (error) {
        get().clearState();
        toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại: ");
        throw error; // để component biết refresh token thất bại
      } finally {
        set({ loading: false });
      }
    },
  }))
);
