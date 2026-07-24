import React from 'react';

export default function DTCoin({ className = "w-6 h-6" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="16" cy="16" r="15" className="fill-amber-500/20" />
      <circle cx="16" cy="16" r="14" fill="url(#coinGradient)" className="stroke-amber-300" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10" className="stroke-amber-300/40" strokeWidth="1" strokeDasharray="2 1" fill="none" />
      <text 
        x="16" 
        y="20.5" 
        textAnchor="middle" 
        fill="#0f172a" 
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: '900',
          fontSize: '12px',
          letterSpacing: '-0.5px'
        }}
      >
        DT
      </text>
      <path 
        d="M 8 10 A 10 10 0 0 1 24 10 A 11 11 0 0 0 8 10 Z" 
        fill="white" 
        fillOpacity="0.25" 
      />
      <defs>
        <linearGradient id="coinGradient" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
    </svg>
  );
}