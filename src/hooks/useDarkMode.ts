import { useState, useEffect } from "react";

export const useDarkMode = () => {
  // Force dark mode always
  const [isDark] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const toggleDarkMode = () => {
    // No-op to prevent toggling if called elsewhere
  };

  return { isDark, toggleDarkMode };
};
