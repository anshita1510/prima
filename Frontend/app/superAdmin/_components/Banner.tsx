"use client";
import { useState } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function DashboardBanner({ onRefresh, isRefreshing, user }: { onRefresh?: () => void, isRefreshing?: boolean, user?: any }) {
  const [hovered, setHovered] = useState(false);

  // Parse name logically (fallback to split string if firstName and lastName aren't specifically available)
  let displayName = "Super Admin";
  if (user) {
    if (user.firstName) {
      displayName = `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;
    } else if (user.name) {
      // e.g "Anshita Bharwal" -> "Anshita Bharwal"
      displayName = user.name;
    }
  }

  return (
    <div className="relative overflow-hidden flex items-end"
      style={{
        backgroundColor: 'var(--card-bg)',
        minHeight: '170px',
        borderBottom: '1px solid var(--card-border)',
      }}>
      {/* Dot Grid overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.04] dark:opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(var(--text-color) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

      {/* Dynamic Ambient Glows */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none blur-[80px] opacity-60"
        style={{ background: 'radial-gradient(circle, var(--primary-subtle) 0%, transparent 70%)' }} />
      <div className="absolute -bottom-32 -left-10 w-80 h-80 rounded-full pointer-events-none blur-[80px] opacity-60"
        style={{ background: 'radial-gradient(circle, var(--accent-subtle) 0%, transparent 70%)' }} />

      <div className="relative z-10 px-6 py-6 md:px-8 w-full flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2 text-[color:var(--text-color)]">
            Welcome {displayName} <span className="inline-block hover:animate-pulse cursor-default">👋</span>
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Manage your entire organization from here.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'var(--badge-bg)', color: 'var(--badge-text)', border: '1px solid var(--primary-subtle)' }}>
              Super Admin
            </span>
            <span style={{ color: 'var(--text-muted)' }}>›</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider"
              style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-color)', border: '1px solid var(--card-border)' }}>
              Director
            </span>
            <Link href="/superAdmin/analytics"
              className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-150"
              style={{
                border: '1px solid var(--primary-subtle)',
                color: 'var(--primary-color)',
                backgroundColor: hovered ? 'var(--primary-subtle)' : 'transparent',
              }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              View Analytics →
            </Link>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isRefreshing ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            if (!isRefreshing) {
              (e.currentTarget as HTMLElement).style.color = 'var(--primary-color)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary-color)';
            }
          }}
          onMouseLeave={e => {
            if (!isRefreshing) {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
            }
          }}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
}
