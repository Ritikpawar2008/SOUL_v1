import React from 'react';

interface SoulSymbolProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const SoulSymbol: React.FC<SoulSymbolProps> = ({
  className = 'w-10 h-10',
  size = 40,
  glow = true,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="symGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="orbitG" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="70%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        {/* Outer subtle orbital ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="#ffffff"
          strokeOpacity="0.1"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* Kinetic Diamond (Time & Growth) */}
        <polygon
          points="50,14 84,50 50,86 16,50"
          stroke="url(#symGlow)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className={glow ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : ''}
        />

        {/* Inclined Balance Loop */}
        <ellipse
          cx="50"
          cy="50"
          rx="32"
          ry="15"
          stroke="url(#orbitG)"
          strokeWidth="2"
          transform="rotate(-35 50 50)"
          strokeLinecap="round"
        />

        {/* Center Nexus (SOUL AI Intelligence) */}
        <circle cx="50" cy="50" r="6" fill="#080C0D" stroke="#ffffff" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="3" fill="#22d3ee" />

        {/* Micro Balance Cardinal Accents */}
        <circle cx="50" cy="18" r="1.5" fill="#22d3ee" />
        <circle cx="82" cy="50" r="1.5" fill="#f97316" />
        <circle cx="50" cy="82" r="1.5" fill="#22d3ee" />
        <circle cx="18" cy="50" r="1.5" fill="#22d3ee" />
      </svg>
    </div>
  );
};
