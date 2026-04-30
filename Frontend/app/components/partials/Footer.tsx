"use client";
import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, X, Linkedin, Facebook, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--bg-color)',
      borderTop: '1px solid var(--card-border)',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.05) 0%, transparent 60%)',
    }}>
      <div className="mx-auto max-w-7xl px-6 md:px-16">

        <div className="py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 md:grid-cols-2">

            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <Image
                  src="/prima-logo.svg"
                  alt="PRIMA"
                  width={34}
                  height={34}
                  style={{ borderRadius: '9px' }}
                />
                <span
                  className="font-bold text-lg tracking-[0.18em] uppercase"
                  style={{ color: 'var(--text-color)' }}
                >
                  PRIMA
                </span>
              </div>
              <p className="leading-relaxed mb-4 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>
                Enterprise HR Management System designed to streamline HR operations,
                attendance tracking, leave management, and project workflows.
              </p>
              <div className="space-y-2">
                {[
                  { icon: Mail, text: 'support@PRIMA-hr.com' },
                  { icon: Phone, text: '+91 9592003120' },
                  { icon: MapPin, text: 'Seasia Infotech, Mohali, Punjab' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <Icon size={14} style={{ color: 'var(--PRIMAry-color)' }} />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 font-semibold" style={{ color: 'var(--text-color)' }}>Quick Links</h4>
              <ul className="space-y-2 text-sm">
                {['/', '/features', '/pricing', '/about', '/contact'].map((href, i) => (
                  <li key={href}>
                    <Link href={href} className="transition hover:translate-x-1 inline-block"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--PRIMAry-color)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                      {['Home', 'Features', 'Pricing', 'About Us', 'Contact'][i]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="mb-4 font-semibold" style={{ color: 'var(--text-color)' }}>Resources</h4>
              <ul className="space-y-2 text-sm">
                {['/blog', '/help', '/api-docs', '/downloads', '/status'].map((href, i) => (
                  <li key={href}>
                    <Link href={href} className="transition hover:translate-x-1 inline-block"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--PRIMAry-color)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                      {['Blog', 'Help Center', 'API Docs', 'Downloads', 'Status'][i]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--card-border)' }} />

        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-4 text-sm">
              {['/privacy', '/terms', '/cookies', '/security'].map((href, i) => (
                <Link key={href} href={href} className="transition"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--PRIMAry-color)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                  {['Privacy', 'Terms', 'Cookies', 'Security'][i]}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {[
                { href: 'https://twitter.com', icon: X },
                { href: 'https://linkedin.com', icon: Linkedin },
                { href: 'https://facebook.com', icon: Facebook },
                { href: 'https://github.com', icon: Github },
              ].map(({ href, icon: Icon }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                  style={{ backgroundColor: 'var(--card-border)', color: 'var(--text-muted)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--PRIMAry-color)';
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--card-border)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                  }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 text-center" style={{ borderTop: '1px solid var(--card-border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} PRIMA HR Management System. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
