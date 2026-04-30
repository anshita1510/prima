"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { emailSchema, type EmailFormValues } from "./schemas";
import SsoButtons from "./SsoButtons";

type SsoProvider = "GOOGLE" | "MICROSOFT" | "MOBILE" | "USERNAME";

interface Props {
  onEmailSubmit: (email: string) => Promise<void>;
  onSsoSelect: (provider: SsoProvider) => void;
  loading: boolean;
  rateLimited: boolean;
}

export default function EmailStep({ onEmailSubmit, onSsoSelect, loading, rateLimited }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
  });

  const onSubmit = (data: EmailFormValues) => onEmailSubmit(data.email);

  return (
    <motion.div
      key="email-step"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-7"
    >
      <div className="text-center">
        <h2 className="text-[1.75rem] font-bold tracking-tight" style={{ color: "var(--text-color)" }}>
          Sign In
        </h2>
        <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
          Enter your email to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              disabled={loading || rateLimited}
              {...register("email")}
              className="w-full rounded-xl border px-4 py-3 pr-10 text-sm outline-none transition-all disabled:opacity-50"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: errors.email ? "#ef4444" : "var(--card-border)",
                color: "var(--text-color)",
              }}
              onFocus={e => { if (!errors.email) e.target.style.borderColor = "var(--primary-color)"; e.target.style.boxShadow = "0 0 0 3px var(--primary-subtle)"; }}
              onBlur={e => { e.target.style.borderColor = errors.email ? "#ef4444" : "var(--card-border)"; e.target.style.boxShadow = "none"; }}
            />
            <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          </div>
          {errors.email && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500">
              {errors.email.message}
            </motion.p>
          )}
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
            <><Loader2 className="h-4 w-4 animate-spin" /> Checking...</>
          ) : (
            <>Continue <ArrowRight className="h-4 w-4" /></>
          )}
        </motion.button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1" style={{ backgroundColor: "var(--card-border)" }} />
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>or continue with</span>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--card-border)" }} />
      </div>

      <SsoButtons onSelect={onSsoSelect} disabled={loading || rateLimited} />
    </motion.div>
  );
}
