"use client";

import { useTheme } from "@/lib/theme/ThemeContext";
import { Sun, Moon } from "lucide-react";

export default function FloatingThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: 'fixed',
        top: '12px',
        right: '16px',
        zIndex: 9999,
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '1px solid var(--card-border)',
        backgroundColor: 'var(--card-bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        outline: 'none',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'scale(1.1)';
        el.style.borderColor = 'var(--PRIMAry-color)';
        el.style.boxShadow = '0 4px 16px rgba(124,58,237,0.3)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.transform = 'scale(1)';
        el.style.borderColor = 'var(--card-border)';
        el.style.boxShadow = '0 2px 12px rgba(0,0,0,0.15)';
      }}
    >
      {isDark
        ? <Sun size={17} strokeWidth={2} style={{ color: '#f59e0b' }} />
        : <Moon size={17} strokeWidth={2} style={{ color: '#7c3aed' }} />
      }
    </button>
  );
}
