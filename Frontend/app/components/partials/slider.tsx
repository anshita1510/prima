import React from "react";

const logos = [
  { name: "Google",     src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
  { name: "Microsoft",  src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
  { name: "Amazon",     src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
  { name: "Netflix",    src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  { name: "Spotify",    src: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg" },
  { name: "Salesforce", src: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg" },
  { name: "Uber",       src: "https://cdn.iconscout.com/icon/free/png-512/free-uber-logo-icon-svg-download-png-2284862.png?f=webp&w=512" },
];

export default function CompanyNameSlider() {
  return (
    <section className="w-full overflow-hidden py-5" style={{ backgroundColor: 'var(--bg-color)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
      <div className="relative overflow-hidden">
        <div className="flex w-max gap-10 px-6"
          style={{ animation: "slideLTR 20s linear infinite" }}>
          {[...logos, ...logos].map((logo, i) => (
            <img key={i} src={logo.src} alt={logo.name}
              className="h-6 md:h-7 w-auto object-contain transition"
              style={{ opacity: 0.55 }} />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes slideLTR {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </section>
  );
}
