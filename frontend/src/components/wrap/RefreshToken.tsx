"use client";
import { useEffect, useState, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocketStore } from "@/stores/useSocketStore";
export default function RefreshTokenProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { accessToken } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();

  const [starting, setStarting] = useState(true);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const hasInit = useRef(false); // dùng useRef để lưu trạng thái đã gọi refresh token hay chưa, nếu đã gọi rồi thì không gọi lại nữa để tránh bị lỗi vòng lặp vô hạn khi refresh token thất bại và bị chuyển hướng về trang đăng nhập liên tục

  useEffect(() => {
    // chỉ gọi refresh token khi vào những trang cần auth như trang chủ, trang chat,... còn những trang như signin, signup thì không cần gọi refresh token vì khi vào những trang này thì chắc chắn là chưa có access token nên gọi refresh token sẽ bị lỗi vòng lặp vô hạn
    if (pathname === "/signin" || pathname === "/signup") {
      return;
    }
    if (hasInit.current) return;

    hasInit.current = true;

    const init = async () => {
      try {
        await fetchMe();
      } catch (error) {
        router.push("/signin"); // chuyển hướng về trang đăng nhập nếu refresh token thất bại
      } finally {
        setStarting(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (accessToken) {
      connectSocket();
    }
    return () => disconnectSocket();
  }, [accessToken]);

  // if (starting) {
  //   return <div>Loading...</div>;
  // }
  return children;
}
