"use client";
import Link from "next/link";
import Footer from "./partials/Footer";

interface LegalLayoutProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export default function LegalLayout({ title, subtitle, icon, children }: LegalLayoutProps) {
  const lastUpdated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="page-bg">
      {/* Simple top bar — no full navbar */}
      <div className="page-header" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--PRIMAry-color)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              ← Back to Home
            </Link>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{title}</span>
            <div className="w-28" />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-10 pb-16">
        <div className="text-center mb-14">
          <div className="icon-box w-16 h-16 mx-auto mb-6 rounded-2xl">{icon}</div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-color)' }}>{title}</h1>
          <p className="text-lg max-w-xl mx-auto mb-3" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Last updated: {lastUpdated}</p>
          <div className="accent-line" />
        </div>
        <div className="space-y-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

export function LegalSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="icon-box w-9 h-9 rounded-xl flex-shrink-0">{icon}</div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-color)' }}>{title}</h2>
      </div>
      <div className="premium-card p-8">{children}</div>
    </div>
  );
}
