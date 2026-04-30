"use client";

import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import Image from "next/image";

export default function LoginCard() {
  return (
    <>
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
        <div className="flex w-full lg:w-[55%]">
          <LeftPanel />
        </div>
        <div className="hidden lg:flex lg:w-[45%]">
          <RightPanel />
        </div>
      </div>
    </>
  );
}
