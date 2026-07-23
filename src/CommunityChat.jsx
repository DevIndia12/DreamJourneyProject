import React from 'react';

export default function CommunityChat({ onBackToHome }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      
      {/* Background Glow */}
      <div className="absolute w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Content Box */}
      <div className="relative z-10 max-w-sm w-full bg-slate-900/80 border border-slate-800 backdrop-blur-md p-8 rounded-3xl shadow-2xl flex flex-col items-center">
        
        {/* Animated Icon */}
        <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner animate-bounce">
          💬
        </div>

        {/* Title & Badge */}
        <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-3">
          Under Construction
        </span>
        
        <h2 className="text-2xl font-black text-white mb-2">
          Global Community Chat
        </h2>
        
        <p className="text-slate-400 text-sm leading-relaxed mb-8">
          Ye feature abhi dev mode mein hai! Hum ek badhiya chat experience ready kar rahe hain, bohot jald live hoga.
        </p>

        {/* Action Button */}
        <button
          onClick={onBackToHome}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg active:scale-95"
        >
          ⬅️ Back to Home
        </button>

      </div>
    </div>
  );
}