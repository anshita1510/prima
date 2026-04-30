"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { passwordSchema, type PasswordFormValues } from "./schemas";

interface Props {
  email: string;
  onPasswordSubmit: (password: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  rateLimited: boolean;
}

export default function PasswordStep({ email, onPasswordSubmit, onBack, loading, rateLimited }: Props) {
  const router  = useRouter();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
  });

  const onSubmit = (data: PasswordFormValues) => onPasswordSubmit(data.password);

  return (
    <motion.div
      key="password-step"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-7"
    >
      <div className="text-center">
        <h2 className="text-[1.75rem] font-bold tracking-tight" style={{ color: "var(--text-color)" }}>
          Welcome back
        </h2>
        <p className="mt-1.5 truncate text-sm" style={{ color: "var(--text-muted)" }}>{email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={loading || rateLimited}
              {...register("password")}
              className="w-full rounded-xl border px-4 py-3 pr-20 text-sm outline-none transition-all disabled:opacity-50"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: errors.password ? "#ef4444" : "var(--card-border)",
                color: "var(--text-color)",
              }}
              onFocus={e => { if (!errors.password) e.target.style.borderColor = "var(--primary-color)"; e.target.style.boxShadow = "0 0 0 3px var(--primary-subtle)"; }}
              onBlur={e => { e.target.style.borderColor = errors.password ? "#ef4444" : "var(--card-border)"; e.target.style.boxShadow = "none"; }}
            />
            <Lock className="pointer-events-none absolute right-9 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500">
              {errors.password.message}
            </motion.p>
          )}
        </div>

        <div className="flex justify-between text-xs">
          <button
            type="button"
            onClick={onBack}
            className="transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, fontSize: "0.75rem" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-color)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => router.push("/Forget_pass")}
            className="transition-colors"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-color)", padding: 0, fontSize: "0.75rem" }}
          >
            Forgot password?
          </button>
        </div>

        <motion.button
          type="submit"
          disabled={loading || rateLimited || !isValid}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 8px 24px rgba(124,58,237,0.35)" }}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
          ) : (
            "Sign In"
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
