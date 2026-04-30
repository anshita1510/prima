"use client";

import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme/ThemeContext";
import Image from "next/image";

import PageWrapper from "../login/_components/PageWrapper";
import RightPanel from "../login/_components/RightPanel";
import { FloatingInput } from "../_components/SharedAuth";

export default function CreateUserPage() {
  const router = useRouter();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [designation, setDesignation] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // mock submit logic here
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
                Create your user
              </h1>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                Welcome back! Please enter your details
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <FloatingInput
                    id="firstName" label="First Name" type="text" value={firstName}
                    onChange={v => setFirstName(v)}
                  />
                </div>
                <div className="flex-1">
                  <FloatingInput
                    id="lastName" label="Last Name" type="text" value={lastName}
                    onChange={v => setLastName(v)}
                  />
                </div>
              </div>

              <FloatingInput
                id="email" label="Email Address" type="email" value={email}
                onChange={v => setEmail(v)}
              />

              <FloatingInput
                id="role" label="Role (admin/user)" type="text" value={role}
                onChange={v => setRole(v)}
              />

              <FloatingInput
                id="designation" label="Designation (Developer)" type="text" value={designation}
                onChange={v => setDesignation(v)}
              />

              <div className="mt-4 flex flex-col gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold text-white transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
                  }}
                >
                  Create
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => router.push("/dashboard-admin")}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-semibold transition-opacity"
                  style={{
                    backgroundColor: "transparent",
                    border: "1px solid var(--card-border)",
                    color: "var(--text-color)",
                  }}
                >
                  Dashboard
                </motion.button>
              </div>
            </form>

            <div className="mt-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              Have a good day
            </div>

          </div>

          <div className="hidden lg:flex lg:w-[45%]">
            <RightPanel />
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}
