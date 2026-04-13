import { create } from "zustand";
import { toast } from "sonner";
import type { AuthState } from "@/types/store";
import { authService } from "@/services/authService";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  signUp: async (firstname, lastname, username, email, password) => {
    set({ loading: true });
    try {
      await authService.signUp(firstname, lastname, username, email, password);
      toast.success("Đăng ký thành công!");
    } catch (error) {
      toast.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      set({ loading: false });
    }
  },
}));
