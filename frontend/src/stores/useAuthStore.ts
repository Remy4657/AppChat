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
    setUser: (user) => {
      set({ user });
    },
    signUp: async (firstname, lastname, username, email, password) => {
      set({ loading: true });
      try {
        await authService.signUp(
          firstname,
          lastname,
          username,
          email,
          password,
        );
        toast.success("Đăng ký thành công!");
      } catch (error: any) {
        // toast.error("Đăng ký thất bại. Vui lòng thử lại."); // đã thông báo ở axuios interceptor nên không cần thông báo ở đây nữa để tránh bị trùng lặp thông báo lỗi
        throw new Error(
          error?.response?.data?.message ||
            "Lỗi xảy ra khi đăng ký. Hãy thử lại",
        ); // để component biết đăng ký thất bại, không throw new vì đã có interceptor của axios handle rồi
      } finally {
        set({ loading: false });
      }
    },
    signIn: async (username, password) => {
      set({ loading: true });
      try {
        await authService.signIn(username, password);
        // get().setAccessToken(accessToken);
        await get().fetchMe();
        useChatStore.getState().fetchConversations();
      } catch (error) {
        throw error; // để component biết đăng nhập thất bại, không throw new vì cần lấy lỗi từ response của server để hiển thị thông báo lỗi chính xác
      } finally {
        set({ loading: false });
      }
    },
    signInGoogle: async (googleIdToken) => {
      set({ loading: true });
      try {
        await authService.signInGoogle(googleIdToken);
        await get().fetchMe();
        useChatStore.getState().fetchConversations();
      } catch (error) {
        throw error; // để component biết đăng nhập thất bại, không throw new vì cần lấy lỗi từ response của server để hiển thị thông báo lỗi chính xác
      } finally {
        set({ loading: false });
      }
    },
    signOut: async () => {
      try {
        get().clearState(); // xóa state ngay lập tức để tránh trường hợp token cũ vẫn còn trong state khi signOut thất bại, tuy nhiên nếu signOut thất bại thì token cũng sẽ bị backend invalidate nên cũng không ảnh hưởng gì
        // useChatStore.getState().reset();
        await authService.signOut();
      } catch (error) {
        throw error; // để component biết đăng nhập thất bại, không throw new vì đã có interceptor của axios handle rồi
      }
    },
    fetchMe: async () => {
      try {
        const { user, accessToken } = await authService.fetchMe();
        set({ user, accessToken }); // cập nhật cả user và accessToken để đảm bảo khi refresh trang thì vẫn có token trong state để kết nối socket, vì khi refresh trang thì data lưu trong zudtand sẽ bị mất nên cần cập nhật lại token sau khi fetch me để tránh bị lỗi socket disconnect do không có token, tuy nhiên nếu fetch me thất bại thì token cũng sẽ bị backend invalidate nên cũng không ảnh hưởng gì
      } catch (error) {
        set({ user: null, accessToken: null, loading: false });
        throw error; // để component biết fetch me thất bại, không throw new vì đã có interceptor của axios handle rồi
      } finally {
        set({ loading: false });
      }
    },
    refreshToken: async () => {
      try {
        const { fetchMe } = get();

        set({ loading: true });
        // luôn fetch me sau khi refresh token để cập nhật thông tin user mới nhất vì khi refresh trang thì data lưu trong zudtand sẽ bị mất
        await fetchMe();
      } catch (error) {
        get().signOut(); // xóa state và gọi api sign out để invalidate token ở backend nếu refresh token thất bại, tuy nhiên nếu refresh token thất bại thì token cũng sẽ bị backend invalidate nên cũng không ảnh hưởng gì
        toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại: ");
        throw error; // để component biết refresh token thất bại
      } finally {
        set({ loading: false });
      }
    },
  })),
);
