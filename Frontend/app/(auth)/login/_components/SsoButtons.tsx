"use client";

import { motion } from "framer-motion";
import { Smartphone, User } from "lucide-react";

type SsoProvider = "GOOGLE" | "MICROSOFT" | "MOBILE" | "USERNAME";

interface Props {
  onSelect: (provider: SsoProvider) => void;
  disabled?: boolean;
}

const providers: { id: SsoProvider; label: string; icon: React.ReactNode }[] = [
  {
    id: "GOOGLE",
    label: "Continue with Google",
    icon: (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ea4335] text-[11px] font-bold text-white">
        G
      </span>
    ),
  },
  {
    id: "MICROSOFT",
    label: "Continue with Microsoft",
    icon: (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0078d4] text-[11px] font-bold text-white">
        M
      </span>
    ),
  },
  {
    id: "MOBILE",
    label: "Continue with Mobile",
    icon: <Smartphone className="h-[18px] w-[18px] shrink-0" style={{ color: "var(--text-muted)" }} />,
  },
  {
    id: "USERNAME",
    label: "Continue with Username",
    icon: <User className="h-[18px] w-[18px] shrink-0" style={{ color: "var(--text-muted)" }} />,
  },
];

export default function SsoButtons({ onSelect, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      {providers.map((p, i) => (
        <motion.button
          key={p.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(p.id)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.25 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center gap-3 rounded-xl border px-4 py-[11px] text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: "var(--input-bg)",
            borderColor: "var(--card-border)",
            color: "var(--text-color)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--card-border-hover)";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-subtle)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--card-border)";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--input-bg)";
          }}
        >
          {p.icon}
          {p.label}
        </motion.button>
      ))}
    </div>
  );
}
