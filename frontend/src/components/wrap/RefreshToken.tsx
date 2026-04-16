"use client";
import { useEffect, useState, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function RefreshTokenProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [starting, setStarting] = useState(true);
  const { accessToken, loading, refreshToken } = useAuthStore();
  const hasInit = useRef(false);

  useEffect(() => {
    if (pathname === "/signin" || pathname === "/signup") {
      setStarting(false);
      return;
    }
    if (hasInit.current) return;
    hasInit.current = true;

    const init = async () => {
      try {
        await refreshToken();
      } catch (error) {
        // console.error("Refresh token failed:", error);
        router.push("/signin"); // chuyển hướng về trang đăng nhập nếu refresh token thất bại
      } finally {
        setStarting(false);
      }
    };
    init();
  }, []);

  if (starting || loading) {
    return <div>Loading...</div>;
  }
  return children;
}
