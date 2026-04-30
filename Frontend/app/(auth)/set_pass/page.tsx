"use client";

import { useState, FormEvent, JSX, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { resetPasswordAPI } from "../../../lib/api";
import { Loader2, ArrowLeft, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme/ThemeContext";
import Image from "next/image";

import PageWrapper from "../login/_components/PageWrapper";
import RightPanel from "../login/_components/RightPanel";
import { FloatingInput, ToastContainer, Toast } from "../_components/SharedAuth";

export default function SetPasswordPage(): JSX.Element {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [showPw, setShowPw] = useState<boolean>(false);
  const [showConfirmPw, setShowConfirmPw] = useState<boolean>(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shake, setShake] = useState<boolean>(false);

  useEffect(() => {
    // Check if user came from OTP verification
    const resetEmail = localStorage.getItem("resetEmail");
    if (!resetEmail) {
      // If no email found, redirect to forgot password
      router.push("/Forget_pass");
    } else {
      setEmail(resetEmail);
    }
  }, [router]);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Client-side validation
    if (newPassword !== confirmPassword) {
      addToast("error", "Passwords do not match");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    if (newPassword.length < 8) {
      addToast("error", "Password must be at least 8 characters long");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      return;
    }

    setLoading(true);

    try {
      await resetPasswordAPI(email, newPassword, confirmPassword);
      addToast("success", "Password reset successfully!");

      // Clear stored email
      localStorage.removeItem("resetEmail");

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      addToast("error", err instanceof Error ? err.message : "Something went wrong");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8 sm:px-6"
      style={{
        backgroundColor: "var(--bg-color)",
        backgroundImage: [
          "radial-gradient(ellipse at 20% 20%, rgba(37,99,235,0.07) 0%, transparent 55%)",
          "radial-gradient(ellipse at 80% 80%, rgba(124,58,237,0.07) 0%, transparent 55%)",
        ].join(", "),
      }}
    >
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[8%] top-[10%] h-64 w-64 animate-pulse rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgba(96,165,250,0.5), transparent)" }} />
        <div className="absolute right-[10%] top-[30%] h-48 w-48 animate-pulse rounded-full blur-3xl opacity-15 [animation-delay:1s]"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent)" }} />
        <div className="absolute bottom-[15%] left-1/3 h-56 w-56 animate-pulse rounded-full blur-3xl opacity-10 [animation-delay:2s]"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.5), transparent)" }} />
      </div>

      <PageWrapper>
        <div
          className="flex items-center justify-center gap-3 px-6 py-4 sm:hidden"
          style={{
            backgroundColor: "var(--card-bg)",
            borderBottom: "1px solid var(--card-border)",
            borderRadius: "24px 24px 0 0",
          }}
        >
          <Image
            src="/prima-logo.svg"
            alt="PRIMA"
            width={28}
            height={28}
            style={{ borderRadius: '6px' }}
          />
          <span
            className="text-xl font-black tracking-[0.14em]"
            style={{
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            PRIMA
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Smart workforce management
          </span>
        </div>

        <div
          className="mx-auto flex w-full max-w-[1024px] overflow-hidden sm:min-h-[600px]"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "24px",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex w-full flex-col justify-center px-8 py-10 sm:px-12 lg:w-[55%]">

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
                Set New Password
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Create a new password for your account.
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleResetPassword}
              animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-4"
              noValidate
            >
              <FloatingInput
                id="newPassword" label="New Password" type={showPw ? "text" : "password"} value={newPassword}
                onChange={v => setNewPassword(v)}
                autoFocus autoComplete="new-password" disabled={loading}
                minLength={8}
                error={newPassword.length > 0 && newPassword.length < 8 ? "Password must be at least 8 characters." : ""}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <FloatingInput
                id="confirmPassword" label="Confirm Password" type={showConfirmPw ? "text" : "password"} value={confirmPassword}
                onChange={v => setConfirmPassword(v)}
                autoComplete="new-password" disabled={loading}
                minLength={8}
                error={confirmPassword.length > 0 && confirmPassword !== newPassword ? "Passwords do not match." : ""}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(v => !v)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0, display: "flex" }}
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />

              <motion.button
                type="submit"
                disabled={loading || newPassword.length < 8 || confirmPassword.length < 8}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
                }}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Resetting...</>
                  : "Reset Password"}
              </motion.button>

            </motion.form>

          </div>

          <div className="hidden lg:flex lg:w-[45%]">
            <RightPanel />
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}