"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Footer from "./partials/Footer";

interface PageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function PageLayout({ title, children }: PageLayoutProps) {
  return (
    <div className="page-bg">
      {/* Simple top bar — no full navbar */}
      <div
        className="page-header"
        style={{ position: 'sticky', top: 0, zIndex: 50 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--PRIMAry-color)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-color)' }}>{title}</span>
            <div className="w-28" />
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}
