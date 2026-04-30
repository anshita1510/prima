"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

interface MenuItemProps {
  label: string;
  items: { label: string; href: string }[];
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    localStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = "/login?logout=true&t=" + Date.now();
  };

  const MenuItem = ({ label, items }: MenuItemProps) => (
    <div
      className="relative"
      onMouseEnter={() => setDropdown(label)}
      onMouseLeave={() => setDropdown(null)}
    >
      <button
        className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
        style={{ color: dropdown === label ? 'var(--text-color)' : 'var(--text-muted)' }}
      >
        {label}
        <ChevronDown
          size={14}
          style={{
            transform: dropdown === label ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            opacity: 0.7,
          }}
        />
      </button>

      {dropdown === label && (
        <div className="absolute left-0 top-full w-52 pt-5">
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--PRIMAry-subtle)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--PRIMAry-color)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <nav
      className="fixed z-50 w-full transition-all duration-300"
      style={{
        backgroundColor: scrolled ? 'var(--nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--nav-border)' : '1px solid transparent',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/prima-logo.svg"
                alt="PRIMA"
                width={36}
                height={36}
                className="w-full h-full"
                style={{ borderRadius: '10px' }}
              />
            </div>
            <span
              className="font-bold text-[15px] tracking-[0.18em] uppercase"
              style={{ color: 'var(--text-color)', letterSpacing: '0.18em' }}
            >
              PRIMA
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-7 md:flex">
            <MenuItem
              label="Products"
              items={[
                { label: "HRMS", href: "/products/hrms" },
                { label: "Payroll", href: "/products/payroll" },
                { label: "Analytics", href: "/products/analytics" },
              ]}
            />
            <MenuItem
              label="Customers"
              items={[
                { label: "Startups", href: "/customers/startups" },
                { label: "SMEs", href: "/customers/smes" },
                { label: "Enterprises", href: "/customers/enterprises" },
              ]}
            />
            {[
              { label: "Pricing", href: "/pricing" },
              { label: "About", href: "/about" },
              { label: "Resources", href: "/resources" },
              { label: "Careers", href: "/careers" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-color)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden items-center gap-4 md:flex">
            <a
              href="/login?logout=true"
              onClick={handleLoginClick}
              className="text-sm font-medium transition-colors duration-200 cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-color)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              Login
            </a>
            <a
              href="https://www.PRIMA.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-PRIMAry-gradient text-sm"
              style={{ padding: '8px 20px', borderRadius: '999px', textDecoration: 'none', display: 'inline-block' }}
            >
              Get free trial
            </a>
          </div>

          {/* Mobile Button */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)', backgroundColor: 'var(--PRIMAry-subtle)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          className="absolute left-0 top-16 w-full space-y-1 px-4 py-4 md:hidden"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderBottom: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {[
            {
              label: "Products", children: [
                { label: "HRMS", href: "/products/hrms" },
                { label: "Payroll", href: "/products/payroll" },
                { label: "Analytics", href: "/products/analytics" },
              ]
            },
            {
              label: "Customers", children: [
                { label: "Startups", href: "/customers/startups" },
                { label: "SMEs", href: "/customers/smes" },
                { label: "Enterprises", href: "/customers/enterprises" },
              ]
            },
          ].map((group) => (
            <details key={group.label} className="rounded-xl overflow-hidden">
              <summary
                className="cursor-pointer px-4 py-3 text-sm font-medium rounded-xl"
                style={{ color: 'var(--text-color)', backgroundColor: 'var(--bg-subtle)' }}
              >
                {group.label}
              </summary>
              <div className="ml-4 mt-1 space-y-1">
                {group.children.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block px-4 py-2 text-sm rounded-lg"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </details>
          ))}
          {[
            { label: "Pricing", href: "/pricing" },
            { label: "About", href: "/about" },
            { label: "Resources", href: "/resources" },
            { label: "Careers", href: "/careers" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 text-sm font-medium rounded-xl"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)' }}
            >
              {link.label}
            </Link>
          ))}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--card-border)' }}>
            <a
              href="/login?logout=true"
              onClick={handleLoginClick}
              className="block px-4 py-3 text-sm font-medium rounded-xl cursor-pointer"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)' }}
            >
              Login
            </a>
            <a
              href="https://www.PRIMA.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-PRIMAry-gradient block text-center text-sm"
              style={{ borderRadius: '12px', padding: '12px', textDecoration: 'none' }}
            >
              Get free trial
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
