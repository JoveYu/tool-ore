import { useState, useEffect, useCallback } from "react";

export type ThemeMode = "system" | "light" | "dark";

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme_mode");
      if (stored === "light" || stored === "dark" || stored === "system") {
        return stored;
      }
    }
    return "system";
  });

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // 监听操作系统/浏览器深浅色模式偏好变化
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };

    setSystemDark(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // 计算当前实际生效的是否为深色
  const isDark = themeMode === "system" ? systemDark : themeMode === "dark";

  // 同步更新 documentElement 的 class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // 切换模式方法：跟随系统 -> 浅色 -> 深色 -> 跟随系统
  const cycleThemeMode = useCallback(() => {
    setThemeMode((prev) => {
      let next: ThemeMode;
      if (prev === "system") next = "light";
      else if (prev === "light") next = "dark";
      else next = "system";

      localStorage.setItem("theme_mode", next);
      return next;
    });
  }, []);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem("theme_mode", mode);
  }, []);

  return {
    themeMode,
    isDark,
    cycleThemeMode,
    setTheme,
  };
}
