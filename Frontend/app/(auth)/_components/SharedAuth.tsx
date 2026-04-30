"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle } from "lucide-react";

export type Toast = { id: number; type: "success" | "error"; message: string };

export function FloatingInput({
    id, label, type = "text", value, onChange, autoFocus, autoComplete, disabled, error,
    suffix, minLength, maxLength, readOnly,
}: {
    id: string; label: string; type?: string; value: string;
    onChange?: (v: string) => void; autoFocus?: boolean; autoComplete?: string;
    disabled?: boolean; error?: string; suffix?: React.ReactNode;
    minLength?: number; maxLength?: number; readOnly?: boolean;
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
                    readOnly={readOnly}
                    minLength={minLength}
                    maxLength={maxLength}
                    onChange={e => onChange && onChange(e.target.value)}
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

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" role="status" aria-live="polite">
            <AnimatePresence>
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
