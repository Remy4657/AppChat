import { create } from "zustand";
import { toast } from "sonner";
import type { AuthState } from "@/types/store";
import { authService } from "@/services/authService";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  clearState: () => set({ accessToken: null, user: null, loading: false }),

  signUp: async (firstname, lastname, username, email, password) => {
    set({ loading: true });
    try {
      await authService.signUp(firstname, lastname, username, email, password);
      toast.success("Đăng ký thành công!");
    } catch (error) {
      //toast.error("Đăng ký thất bại. Vui lòng thử lại.");
      throw error; // để component biết đăng ký thất bại, không throw new vì đã có interceptor của axios handle rồi
    } finally {
      set({ loading: false });
    }
  },
  signIn: async (username, password) => {
    set({ loading: true });
    try {
      const { accessToken } = await authService.signIn(username, password);
      set({ accessToken });
      toast.success("Đăng nhập thành công!");
    } catch (error) {
      throw error; // để component biết đăng nhập thất bại, không throw new vì đã có interceptor của axios handle rồi
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true });
      get().clearState(); // xóa state ngay lập tức để tránh trường hợp token cũ vẫn còn trong state khi signOut thất bại, tuy nhiên nếu signOut thất bại thì token cũng sẽ bị backend invalidate nên cũng không ảnh hưởng gì
      await authService.signOut();
    } catch (error) {
      throw error; // để component biết đăng nhập thất bại, không throw new vì đã có interceptor của axios handle rồi
    } finally {
      set({ loading: false });
    }
  },
}));
