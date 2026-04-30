"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Props {
  email: string;
  onOtpSubmit: (otp: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

export default function OtpStep({ email, onOtpSubmit, onBack, loading }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error,  setError]  = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const update = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError("");
    if (cleaned && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKey = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = Array(6).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async () => {
    const otp = digits.join("");
    if (otp.length < 6) { setError("Please enter the complete 6-digit code."); return; }
    if (!/^\d{6}$/.test(otp)) { setError("The code must contain digits only."); return; }
    await onOtpSubmit(otp);
  };

  const filled = digits.every((d) => d !== "");

  return (
    <motion.div
      key="otp-step"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-7"
    >
      <div className="text-center">
        <h2 className="text-[1.75rem] font-bold tracking-tight" style={{ color: "var(--text-color)" }}>
          Check your email
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
          We sent a 6-digit code to{" "}
          <span style={{ color: "var(--text-color)", fontWeight: 500 }}>{email}</span>
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => update(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            onPaste={handlePaste}
            disabled={loading}
            className="h-12 w-10 rounded-xl border text-center text-lg font-bold outline-none transition-all disabled:opacity-50"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: "var(--card-border)",
              color: "var(--text-color)",
            }}
            onFocus={e => { e.target.style.borderColor = "var(--primary-color)"; e.target.style.boxShadow = "0 0 0 3px var(--primary-subtle)"; }}
            onBlur={e => { e.target.style.borderColor = "var(--card-border)"; e.target.style.boxShadow = "none"; }}
          />
        ))}
      </div>

      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-center text-xs text-red-500">
          {error}
        </motion.p>
      )}

      <motion.button
        type="button"
        onClick={handleSubmit}
        disabled={loading || !filled}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</> : "Verify Code"}
      </motion.button>

      <button
        type="button"
        onClick={onBack}
        className="text-center text-xs transition-colors"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0 }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-color)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
      >
        ← Back to email
      </button>
    </motion.div>
  );
}
