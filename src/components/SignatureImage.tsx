import React from 'react';

interface SignatureImageProps {
  className?: string;
  color?: string;
  glow?: boolean;
  animated?: boolean;
}

export const SignatureImage: React.FC<SignatureImageProps> = ({
  className = 'w-48 h-auto',
  color = 'currentColor',
  glow = false,
  animated = false,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 420 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${glow ? 'drop-shadow-[0_0_12px_rgba(34,211,238,0.45)]' : ''}`}
        style={{ stroke: color }}
      >
        <g
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={animated ? 'animate-pulse' : ''}
        >
          {/* Enclosing Angular Polygon Framing */}
          <path
            d="M 64 162 L 232 16 L 366 112"
            strokeWidth="2.8"
            strokeOpacity="0.9"
          />
          <path
            d="M 232 16 L 98 178 L 198 140"
            strokeWidth="2.4"
            strokeOpacity="0.85"
          />

          {/* Sharp Baseline Stroke with Terminal Circular Endpoints */}
          <path d="M 148 168 L 366 114" strokeWidth="2.6" />
          <circle cx="148" cy="168" r="3.4" fill={color} stroke="none" />
          <circle cx="366" cy="114" r="3.4" fill={color} stroke="none" />

          {/* Handwritten 'Ritik' Script */}
          {/* 'R' flourish loop */}
          <path
            d="M 122 144 C 114 112, 134 76, 156 68 C 174 60, 186 74, 180 94 C 174 112, 150 118, 140 120"
            strokeWidth="3.2"
          />
          <path d="M 148 116 L 168 152" strokeWidth="3.4" />

          {/* 'i' */}
          <path d="M 172 136 C 176 126, 184 124, 188 138" strokeWidth="2.8" />
          <circle cx="184" cy="114" r="2.2" fill={color} stroke="none" />

          {/* 't' */}
          <path d="M 194 140 L 202 108 L 206 142" strokeWidth="3.0" />
          <path d="M 190 120 L 216 118" strokeWidth="2.8" />

          {/* 'i' */}
          <path d="M 212 138 C 216 128, 222 126, 226 136" strokeWidth="2.8" />
          <circle cx="220" cy="112" r="2.2" fill={color} stroke="none" />

          {/* 'k' with high ascender */}
          <path
            d="M 230 142 L 236 96 C 238 90, 246 94, 244 108 L 238 126 L 254 136"
            strokeWidth="3.0"
          />

          {/* Handwritten 'Pawar' script */}
          {/* 'P' */}
          <path
            d="M 258 138 L 264 92 C 266 84, 280 84, 282 100 C 284 114, 270 122, 262 122"
            strokeWidth="3.2"
          />

          {/* 'a' */}
          <path
            d="M 284 118 C 280 110, 290 108, 294 118 C 296 124, 294 130, 290 132 L 296 132"
            strokeWidth="2.6"
          />
          {/* 'w' */}
          <path
            d="M 298 122 L 302 132 L 308 120 L 312 132 L 318 122"
            strokeWidth="2.6"
          />
          {/* 'a' */}
          <path
            d="M 320 122 C 322 116, 328 116, 330 122 C 332 126, 330 130, 326 130 L 332 130"
            strokeWidth="2.6"
          />
          {/* 'r' */}
          <path
            d="M 334 126 L 336 120 C 338 118, 344 118, 346 122 L 348 128"
            strokeWidth="2.6"
          />

          {/* Underline Flourish */}
          <path d="M 188 152 L 246 138" strokeWidth="2.6" />
          <path d="M 194 158 L 244 144" strokeWidth="2.2" />
        </g>
      </svg>
    </div>
  );
};
