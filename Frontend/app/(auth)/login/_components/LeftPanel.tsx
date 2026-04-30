"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle, Eye, EyeOff, Loader2,
  CheckCircle, Sun, Moon, ArrowRight,
} from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";

/* ── Types ─────────────────────────────────────────────────── */
type AuthProvider = "LOCAL" | "GOOGLE" | "MICROSOFT" | "GITHUB" | "MOBILE" | "NEW_USER";
type Toast = { id: number; type: "success" | "error"; message: string };

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 2 * 60 * 1000;

/* ── Floating label input ───────────────────────────────────── */
function FloatingInput({
  id, label, type = "text", value, onChange, autoFocus, autoComplete, disabled, error,
  suffix,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; autoFocus?: boolean; autoComplete?: string;
  disabled?: boolean; error?: string; suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        {/* Floating label */}
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 transition-all duration-200 select-none"
          style={{
            top: lifted ? "6px" : "50%",
            transform: lifted ? "translateY(0) scale(0.78)" : "translateY(-50%) scale(1)",
            transformOrigin: "left",
            color: focused ? "var(--primary-color)" : "var(--text-muted)",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          {label}
        </label>

        <input
          id={id}
          type={type}
          value={value}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="w-full rounded-xl pb-2 pt-6 pl-4 text-sm outline-none transition-all disabled:opacity-50"
          style={{
            paddingRight: suffix ? "48px" : "16px",
            backgroundColor: "var(--input-bg)",
            border: `1.5px solid ${error ? "#ef4444" : focused ? "var(--primary-color)" : "var(--card-border)"}`,
            color: "var(--text-color)",
            boxShadow: focused ? "0 0 0 3px var(--primary-subtle)" : "none",
          }}
        />

        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1 text-xs text-red-500"
          >
            <AlertCircle className="h-3 w-3" /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Social button ──────────────────────────────────────────── */
function SocialButton({
  onClick, disabled, icon, label,
}: { onClick: () => void; disabled?: boolean; icon: React.ReactNode; label: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
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
      aria-label={`Sign in with ${label}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}

/* ── Toast system ───────────────────────────────────────────── */
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-6 right-13 z-50 flex flex-col gap-2" role="status" aria-live="polite">      <AnimatePresence>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.9 }}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg"
          style={{
            backgroundColor: "var(--card-bg)",
            border: `1px solid ${t.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: t.type === "success" ? "#22c55e" : "#ef4444",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {t.type === "success"
            ? <CheckCircle className="h-4 w-4 shrink-0" />
            : <AlertCircle className="h-4 w-4 shrink-0" />}
          {t.message}
          <button onClick={() => onDismiss(t.id)} className="ml-2 opacity-60 hover:opacity-100"
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}>✕</button>
        </motion.div>
      ))}
    </AnimatePresence>
    </div>
  );
}

/* ── Main LeftPanel ─────────────────────────────────────────── */
export default function LeftPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [shake, setShake] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const attemptsRef = useRef(0);

  /* Restore remembered email */
  useEffect(() => {
    const saved = localStorage.getItem("prima_remembered_email");
    if (saved) { setEmail(saved); setRememberMe(true); }
    if (searchParams.get("logout") === "true") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [searchParams]);

  /* Lockout countdown */
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const rem = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (rem <= 0) { setLockedUntil(null); attemptsRef.current = 0; setCountdown(0); }
      else setCountdown(rem);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  const isLocked = !!lockedUntil;

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const recordFailure = useCallback(() => {
    attemptsRef.current += 1;
    if (attemptsRef.current >= MAX_ATTEMPTS) {
      setLockedUntil(Date.now() + LOCKOUT_MS);
    }
  }, []);

  /* Validation */
  const validate = () => {
    let valid = true;
    if (!email.trim()) { setEmailErr("Email is required."); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailErr("Please enter a valid email address."); valid = false; }
    else setEmailErr("");
    if (!password) { setPasswordErr("Password is required."); valid = false; }
    else if (password.length < 8) { setPasswordErr("Password must be at least 8 characters."); valid = false; }
    else setPasswordErr("");
    return valid;
  };

  /* Submit */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isLocked) return;
    if (!validate()) { setShake(true); setTimeout(() => setShake(false), 600); return; }

    setLoading(true);
    try {
      /* Step 1: check provider */
      const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/check-user`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok) throw new Error(checkData.error || "Failed to check user.");

      const provider = checkData.provider as "GOOGLE" | "MICROSOFT" | "GITHUB" | "LOCAL" | "NEW_USER";

      if (provider === "GOOGLE" || provider === "MICROSOFT" || provider === "GITHUB") {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004";
        window.location.href = `${base}/api/auth/${provider.toLowerCase()}`;
        return;
      }

      if (provider === "NEW_USER") {
        addToast("error", "No account found. Contact your administrator.");
        setLoading(false);
        return;
      }

      /* Step 2: login */
      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || loginData.message || "Login failed.");

      const { token, user } = loginData;
      if (!token || !user) throw new Error("Invalid response from server.");

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      document.cookie = `auth_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

      if (rememberMe) localStorage.setItem("prima_remembered_email", email.toLowerCase().trim());
      else localStorage.removeItem("prima_remembered_email");

      addToast("success", `Welcome back! Redirecting…`);

      const routes: Record<string, string> = {
        SUPER_ADMIN: "/superAdmin", ADMIN: "/admin", MANAGER: "/manager", EMPLOYEE: "/user",
      };
      setTimeout(() => { window.location.href = routes[user.role] || "/dashboard"; }, 800);

    } catch (err) {
      recordFailure();
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      addToast("error", msg);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  const redirectOAuth = (provider: "google" | "microsoft" | "github") => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004";
    window.location.href = `${base}/api/auth/${provider}`;
  };

  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="flex w-full flex-col justify-center px-8 py-10 sm:px-12 lg:max-w-[500px]">

        {/* Header row */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image
              src="/prima-logo.svg"
              alt="PRIMA"
              width={32}
              height={32}
              style={{ borderRadius: '8px' }}
            />
            <span
              className="text-2xl font-black tracking-[0.14em]"
              style={{
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PRIMA
            </span>
          </div>

        </div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-color)" }}>
            Welcome back
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Sign in to your PRIMA HRMS account
          </p>
        </motion.div>

        {/* Rate-limit banner */}
        <AnimatePresence>
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              role="alert"
              className="mb-5 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm"
              style={{ backgroundColor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#d97706" }}
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              Too many attempts. Try again in <strong className="ml-1">{countdown}s</strong>.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4"
          noValidate
        >
          <FloatingInput
            id="email" label="Work email" type="email" value={email}
            onChange={v => { setEmail(v); setEmailErr(""); }}
            autoFocus autoComplete="email" disabled={loading || isLocked} error={emailErr}
          />

          <FloatingInput
            id="password" label="Password" type={showPw ? "text" : "password"} value={password}
            onChange={v => { setPassword(v); setPasswordErr(""); }}
            autoComplete="current-password" disabled={loading || isLocked} error={passwordErr}
            suffix={
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm select-none" style={{ color: "var(--text-muted)" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded accent-[#7c3aed]"
                aria-label="Remember me"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => router.push("/Forget_pass")}
              className="text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary-color)", padding: 0 }}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading || isLocked}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
            }}
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
              : <>Sign In <ArrowRight className="h-4 w-4" /></>}
          </motion.button>
        </motion.form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: "var(--card-border)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>or continue with</span>
          <div className="h-px flex-1" style={{ backgroundColor: "var(--card-border)" }} />
        </div>

        {/* Social login */}
        <div className="flex gap-3">
          <SocialButton
            onClick={() => redirectOAuth("google")}
            disabled={loading || isLocked}
            label="Google"
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            }
          />
          <SocialButton
            onClick={() => redirectOAuth("microsoft")}
            disabled={loading || isLocked}
            label="Microsoft"
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#f25022" d="M1 1h10v10H1z" />
                <path fill="#00a4ef" d="M13 1h10v10H13z" />
                <path fill="#7fba00" d="M1 13h10v10H1z" />
                <path fill="#ffb900" d="M13 13h10v10H13z" />
              </svg>
            }
          />
          <SocialButton
            onClick={() => redirectOAuth("github")}
            disabled={loading || isLocked}
            label="GitHub"
            icon={
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ color: "var(--text-color)" }}>
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            }
          />
        </div>

        {/* Footer */}
        <div className="mt-8 space-y-3 text-center">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            By signing in, you agree to our{" "}
            <a href="/terms" className="underline hover:opacity-80" style={{ color: "var(--primary-color)" }}>Terms</a>
            {" "}and{" "}
            <a href="/privacy" className="underline hover:opacity-80" style={{ color: "var(--primary-color)" }}>Privacy Policy</a>
          </p>
          <p className="flex items-center justify-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your data is secure and encrypted
          </p>
        </div>
      </div>
    </>
  );
}
