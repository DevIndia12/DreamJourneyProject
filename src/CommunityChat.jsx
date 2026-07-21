import React, { useState } from 'react';

export default function CommunityChat({ onBackToHome }) {
  const [messageText, setMessageText] = useState('');

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between pb-6 pt-6">
      {/* Header */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4 px-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBackToHome}
            className="bg-white/10 hover:bg-white/20 text-xs font-bold px-3 py-1.5 rounded-lg transition"
          >
            ← Back
          </button>
          <h2 className="text-lg font-bold tracking-tight">Global Community Chat</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          Live Room
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto my-4 bg-slate-800/40 rounded-2xl border border-white/5 p-4 overflow-y-auto min-h-[400px] flex flex-col justify-center items-center text-slate-500 text-xs italic">
        No messages yet. Be the first to start the conversation!
      </div>

      {/* Input Form */}
      <div className="max-w-4xl w-full mx-auto px-4">
        <div className="bg-slate-800 rounded-xl border border-white/10 p-2 flex gap-2">
          <input 
            type="text" 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white focus:outline-none placeholder:text-slate-500"
          />
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-lg transition">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}