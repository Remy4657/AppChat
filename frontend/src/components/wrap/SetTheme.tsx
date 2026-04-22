"use client";
import { useEffect, ReactNode } from "react";
import { useThemeStore } from "@/stores/useThemeStore";

const SetTheme = ({ children }: { children: ReactNode }) => {
  const { isDark, setTheme } = useThemeStore();

  useEffect(() => {
    setTheme(isDark);
  }, [isDark]);

  return children;
};

export default SetTheme;
