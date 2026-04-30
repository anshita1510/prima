"use client";

import { useTheme } from "@/lib/theme/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="theme-toggle"
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {/* Track */}
      <span className="theme-toggle__track" aria-hidden="true">
        {/* Thumb */}
        <span className="theme-toggle__thumb">
          {isDark
            ? <Moon size={11} strokeWidth={2.5} />
            : <Sun  size={11} strokeWidth={2.5} />
          }
        </span>
      </span>
    </button>
  );
}
