"use client";

import { motion } from "framer-motion";
import { Users, Clock, Zap, ShieldCheck } from "lucide-react";

const features = [
  { icon: Users, text: "Manage employees effortlessly" },
  { icon: Clock, text: "Track attendance in real-time" },
  { icon: Zap, text: "Seamless integrations" },
];

const stats = [
  { value: "10k+", label: "Companies" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.8★", label: "Rating" },
];

const chartBars = [40, 65, 45, 80, 55, 90, 70];
const avatarColors = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#dc2626"];

export default function RightPanel() {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12"
      style={{
        background: "linear-gradient(160deg, var(--bg-subtle) 0%, var(--bg-elevated) 100%)",
        borderLeft: "1px solid var(--card-border)",
      }}
    >
      {/* Ambient blobs — same palette as hero section */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 animate-pulse rounded-full blur-3xl opacity-20"
        style={{ background: "radial-gradient(circle, rgba(96,165,250,0.6), transparent)" }} />
      <div className="pointer-events-none absolute bottom-10 -left-10 h-64 w-64 animate-pulse rounded-full blur-3xl opacity-15 [animation-delay:1.5s]"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.6), transparent)" }} />

      {/* Brand + headline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <div className="mb-8 flex items-center gap-3">
          {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}>
            <ShieldCheck className="h-5 w-5 text-white" />
          </div> */}
          {/* <span className="text-xl font-black tracking-[0.14em]"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            PRIMA HRMS
          </span> */}
        </div>

        <h2 className="mb-4 text-3xl font-bold leading-tight" style={{ color: "var(--text-color)" }}>
          Smart workforce
          <br />
          <span style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            management
          </span>
        </h2>

        <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Everything you need to build a great company — from automation of people processes
          to creating an engaged and driven culture.
        </p>

        <div className="flex flex-col gap-4">
          {features.map(({ icon: Icon, text }, i) => (
            <motion.div key={text} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: "var(--primary-subtle)" }}>
                <Icon className="h-4 w-4" style={{ color: "var(--primary-color)" }} />
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--text-color)" }}>{text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Mini dashboard card */}
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }} className="my-8">
        <div className="rounded-2xl p-5"
          style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "var(--shadow-md)" }}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Team Overview</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: "var(--primary-subtle)", color: "var(--primary-color)" }}>Live</span>
          </div>
          <div className="mb-4 flex items-center">
            {avatarColors.map((color, i) => (
              <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: color, marginLeft: i > 0 ? "-8px" : 0, border: "2px solid var(--card-bg)" }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
            <span className="ml-3 text-xs" style={{ color: "var(--text-muted)" }}>+24 online</span>
          </div>
          <div className="flex h-12 items-end gap-1.5">
            {chartBars.map((h, i) => (
              <div key={i} className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: i === 5 ? "linear-gradient(135deg, #2563eb, #7c3aed)" : "var(--bg-subtle)",
                  border: "1px solid var(--card-border)",
                }} />
            ))}
          </div>
          <p className="mt-2 text-[10px]" style={{ color: "var(--text-muted)" }}>Attendance this week</p>
        </div>
      </motion.div>

      {/* Stats + trust badge */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
        <div className="mb-5 flex gap-8">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-lg font-bold" style={{ color: "var(--text-color)" }}>{value}</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" style={{ color: "var(--primary-color)" }} />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>Your data is secure and encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
