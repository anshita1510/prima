export default function DecorationPanel() {
  return (
    <div className="pointer-events-none fixed right-0 top-0 z-[1] h-screen w-80 overflow-hidden">
      {/* Soft orb glows */}
      <div
        className="absolute rounded-full"
        style={{
          width: 280,
          height: 280,
          right: -60,
          top: 60,
          background: 'radial-gradient(circle, rgba(109,40,217,0.18), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          right: 20,
          top: 340,
          background: 'radial-gradient(circle, rgba(37,99,235,0.14), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          right: -40,
          top: 580,
          background: 'radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Geometric SVG */}
      <svg
        className="absolute right-0 top-0 h-full w-80"
        viewBox="0 0 320 820"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        aria-hidden
      >
        {/* Spinning outer ring */}
        <g style={{ animation: 'spinSlow 18s linear infinite', transformOrigin: '240px 260px' }}>
          <circle
            cx="240"
            cy="260"
            r="72"
            stroke="rgba(109,40,217,0.18)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
          />
          <circle cx="240" cy="260" r="55" stroke="rgba(109,40,217,0.10)" strokeWidth="1" />
        </g>

        {/* Diamond top */}
        <g style={{ animation: 'floatA 5s ease-in-out infinite', transformOrigin: 'center' }}>
          <path
            d="M255 80 L285 110 L255 140 L225 110 Z"
            stroke="rgba(109,40,217,0.25)"
            strokeWidth="1.5"
            fill="rgba(109,40,217,0.05)"
          />
        </g>

        {/* Small circle cluster top */}
        <g style={{ animation: 'floatB 6.5s ease-in-out infinite', transformOrigin: 'center' }}>
          <circle cx="290" cy="50" r="8" fill="rgba(109,40,217,0.15)" />
          <circle cx="275" cy="68" r="5" fill="rgba(167,139,250,0.2)" />
          <circle cx="300" cy="72" r="4" fill="rgba(37,99,235,0.15)" />
        </g>

        {/* Triangle mid */}
        <g style={{ animation: 'floatC 4.8s ease-in-out infinite', transformOrigin: 'center' }}>
          <path
            d="M280 320 L310 370 L250 370 Z"
            stroke="rgba(37,99,235,0.2)"
            strokeWidth="1.5"
            fill="rgba(37,99,235,0.04)"
          />
        </g>

        {/* Rotated square */}
        <g style={{ animation: 'floatA 7s ease-in-out infinite 1s', transformOrigin: 'center' }}>
          <rect
            x="222"
            y="432"
            width="18"
            height="18"
            rx="3"
            stroke="rgba(109,40,217,0.2)"
            strokeWidth="1.5"
            fill="rgba(109,40,217,0.06)"
            transform="rotate(15 231 441)"
          />
          <rect
            x="244"
            y="446"
            width="10"
            height="10"
            rx="2"
            fill="rgba(167,139,250,0.2)"
            transform="rotate(15 249 451)"
          />
        </g>

        {/* Hexagon */}
        <g style={{ animation: 'floatB 5.5s ease-in-out infinite 0.5s', transformOrigin: 'center' }}>
          <path
            d="M268 490 L290 502 L290 526 L268 538 L246 526 L246 502 Z"
            stroke="rgba(109,40,217,0.18)"
            strokeWidth="1.5"
            fill="rgba(167,139,250,0.05)"
          />
        </g>

        {/* Spinning bottom ring */}
        <g style={{ animation: 'spinSlow 25s linear infinite reverse', transformOrigin: '180px 620px' }}>
          <circle cx="180" cy="620" r="50" stroke="rgba(37,99,235,0.14)" strokeWidth="1" strokeDasharray="5 8" />
          <circle cx="180" cy="620" r="36" stroke="rgba(109,40,217,0.1)" strokeWidth="1" strokeDasharray="3 5" />
        </g>

        {/* Pulse dots */}
        <g style={{ animation: 'pulse 4s ease-in-out infinite', transformOrigin: 'center' }}>
          <circle cx="200" cy="160" r="6" fill="rgba(109,40,217,0.15)" />
          <circle cx="215" cy="175" r="4" fill="rgba(167,139,250,0.2)" />
        </g>

        <g style={{ animation: 'floatC 6s ease-in-out infinite 1.2s', transformOrigin: 'center' }}>
          <circle cx="300" cy="570" r="7" fill="rgba(37,99,235,0.15)" />
          <circle cx="285" cy="585" r="4" fill="rgba(109,40,217,0.18)" />
          <circle cx="310" cy="590" r="3" fill="rgba(167,139,250,0.2)" />
        </g>

        {/* Bottom diamond */}
        <g style={{ animation: 'floatA 5.2s ease-in-out infinite 0.8s', transformOrigin: 'center' }}>
          <path
            d="M230 700 L255 725 L230 750 L205 725 Z"
            stroke="rgba(109,40,217,0.2)"
            strokeWidth="1.5"
            fill="rgba(109,40,217,0.04)"
          />
        </g>

        {/* Dot grid */}
        <g opacity="0.3">
          {[250, 265, 280, 295].flatMap((x) =>
            [20, 33, 46].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="#6d28d9" />
            ))
          )}
        </g>

        {/* Wavy lines bottom */}
        <path
          d="M200 780 Q220 765 240 780 Q260 795 280 780 Q300 765 315 778"
          stroke="rgba(109,40,217,0.2)"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M205 793 Q225 778 245 793 Q265 808 285 793 Q305 778 318 791"
          stroke="rgba(109,40,217,0.12)"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
        />

        {/* Arc lines edge */}
        <path d="M320 380 Q280 420 320 460" stroke="rgba(109,40,217,0.15)" strokeWidth="1.5" fill="none" />
        <path d="M320 390 Q272 430 320 470" stroke="rgba(109,40,217,0.08)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}
