"use client";
import Link from "next/link";
import { BarChart3, Zap, DollarSign, Target, TrendingUp } from "lucide-react";

const logos = [
  { name: "Google",     src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Microsoft",  src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
  { name: "Amazon",     src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Netflix",    src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "Spotify",    src: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" },
  { name: "Salesforce", src: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" },
  { name: "Uber",       src: "https://cdn.iconscout.com/icon/free/png-512/free-uber-logo-icon-svg-download-png-2284862.png?f=webp&w=512" },
];

const cardBase: React.CSSProperties = {
  backgroundColor: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: '24px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
};

export default function HeroSection() {
  return (
    <section
      style={{
        backgroundColor: 'var(--bg-color)',
        backgroundImage: 'radial-gradient(ellipse at 60% 40%, rgba(96,165,250,0.07) 0%, transparent 65%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '72px',
      }}
    >
      {/* Main content — flex-1 so it fills space above slider */}
      <div className="flex-1 flex items-center relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-16 w-full py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

            {/* LEFT */}
            <div>
              <h1 className="font-bold leading-[1.1] tracking-tight"
                style={{ color: 'var(--text-color)', fontSize: 'clamp(2.6rem, 5vw, 4rem)' }}>
                Everything you need to
                <br />
                <span style={{ color: 'var(--PRIMAry-color)' }}>build a great company</span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed max-w-lg" style={{ color: 'var(--text-muted)' }}>
                PRIMA is your people enabler. From automation of people processes to creating
                an engaged and driven culture, PRIMA is all you need to build a good to great company.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/login">
                  <button className="text-white px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-300 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
                    Log In
                  </button>
                </Link>
                <button className="group px-8 py-3.5 rounded-full font-semibold text-base transition-all duration-300 flex items-center gap-2"
                  style={{ border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)' }}>
                  Take a tour
                  <span className="group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                </button>
              </div>

              <div className="mt-10 flex gap-4 flex-wrap">
                {[{ score: '4.5', platform: 'G2' }, { score: '4.4', platform: 'Capterra' }].map(r => (
                  <div key={r.platform} className="rounded-2xl px-5 py-3"
                    style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-color)' }}>⭐ {r.score}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>rating on {r.platform}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — 5 floating cards in a staggered 2-col grid */}
            <div className="relative w-full" style={{ minHeight: '460px' }}>

              {/* Row 1: Automation + Analytics */}
              <div className="flex gap-4 justify-center mb-4">

                {/* Automation */}
                <div className="animate-bounce [animation-duration:6s]">
                  <div style={{ ...cardBase, padding: '22px', width: '170px', boxShadow: '0 20px 50px rgba(59,130,246,0.28), 0 4px 16px rgba(0,0,0,0.35)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <Zap className="w-8 h-8 text-blue-500" />
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Automation</p>
                    <div className="h-14 rounded-xl mb-3 flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                      <BarChart3 className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-2xl font-bold text-blue-500">234</p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="animate-bounce [animation-duration:8s] [animation-delay:0.8s] mt-6">
                  <div style={{ ...cardBase, padding: '22px', width: '170px', boxShadow: '0 20px 50px rgba(168,85,247,0.25), 0 4px 16px rgba(0,0,0,0.35)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-8 h-8 text-purple-500" />
                      <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Analytics</p>
                    <div className="h-14 rounded-xl mb-3 flex items-center justify-center gap-1"
                      style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                      <div className="w-2 h-5 bg-purple-500 rounded-full" />
                      <div className="w-2 h-8 bg-purple-500 rounded-full" />
                      <div className="w-2 h-4 bg-purple-500 rounded-full" />
                      <div className="w-2 h-6 bg-purple-500 rounded-full" />
                    </div>
                    <p className="text-2xl font-bold text-purple-500">1.2k</p>
                  </div>
                </div>

              </div>

              {/* Row 2: Payroll (wide, center) */}
              <div className="flex justify-center mb-4">
                <div className="animate-bounce [animation-duration:10s] [animation-delay:1.5s]">
                  <div style={{ ...cardBase, padding: '24px', width: '220px', boxShadow: '0 24px 60px rgba(34,197,94,0.25), 0 4px 20px rgba(0,0,0,0.35)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="w-9 h-9 text-emerald-500" />
                      <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Payroll</p>
                    <div className="h-16 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                      <div className="text-center">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mb-1 mx-auto"
                          style={{ boxShadow: '0 0 18px rgba(34,197,94,0.55)' }}>
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-emerald-400 font-semibold">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Objectives + Expense */}
              <div className="flex gap-4 justify-center">

                {/* Objectives */}
                <div className="animate-bounce [animation-duration:7s] [animation-delay:0.4s]">
                  <div style={{ ...cardBase, padding: '22px', width: '170px', boxShadow: '0 20px 50px rgba(249,115,22,0.25), 0 4px 16px rgba(0,0,0,0.35)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <Target className="w-8 h-8 text-orange-500" />
                      <div className="w-2.5 h-2.5 bg-orange-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Objectives</p>
                    <p className="text-2xl font-bold text-orange-500">$20M</p>
                  </div>
                </div>

                {/* Expense */}
                <div className="animate-bounce [animation-duration:9s] [animation-delay:1.2s] mt-6">
                  <div style={{ ...cardBase, padding: '22px', width: '170px', boxShadow: '0 20px 50px rgba(236,72,153,0.25), 0 4px 16px rgba(0,0,0,0.35)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="w-8 h-8 text-pink-500" />
                      <div className="w-2.5 h-2.5 bg-pink-400 rounded-full animate-pulse" />
                    </div>
                    <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-muted)' }}>Expense</p>
                    <p className="text-2xl font-bold text-pink-500">234</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slider — pinned at bottom of hero viewport */}
      <div className="relative z-10 w-full overflow-hidden py-5"
        style={{ borderTop: '1px solid var(--card-border)' }}>
        <div className="flex w-max gap-10 px-6"
          style={{ animation: 'heroSlide 22s linear infinite' }}>
          {[...logos, ...logos].map((logo, i) => (
            <img key={i} src={logo.src} alt={logo.name}
              className="h-6 md:h-7 w-auto object-contain"
              style={{ opacity: 0.5 }} />
          ))}
        </div>
        <style>{`
          @keyframes heroSlide {
            0%   { transform: translateX(-50%); }
            100% { transform: translateX(0%); }
          }
        `}</style>
      </div>

    </section>
  );
}
