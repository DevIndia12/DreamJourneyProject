import React, { useEffect, useState } from 'react';
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

// 👤 onNavigateToProfile ko props mein add kiya hai bhai
export default function HomePage({ currentScreen, setCurrentScreen, onNavigateToLogin, onNavigateToSignup, onNavigateToProfile }) {
  const [currentUser, setCurrentUser] = useState(null);
  console.log("Abhi login banda yeh hai:", auth?.currentUser)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleLogout = async (e) => {
    e.stopPropagation(); // Profile navigation trigger hone se rokne ke liye
    try {
      await signOut(auth);
      if (onNavigateToLogin) onNavigateToLogin();
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div id="home" className="min-h-screen bg-gradient-to-b from-[#0a4693] via-[#0f62c6] to-[#ffffff] font-sans antialiased relative overflow-x-hidden">
      
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes orbitSlow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes floatPlane { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-15px) rotate(1.5deg); } }
        .animate-orbit-line { animation: orbitSlow 42s linear infinite; }
        .animate-3d-plane { animation: floatPlane 5.5s ease-in-out infinite; }
      `}</style>

      {/* Navbar */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between relative z-30 w-full">
        
        {/* Left Side Logo */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
            <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 text-white transform -rotate-45" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z"/>
            </svg>
          </div>
          <span className="text-sm sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">Dream Journey Project</span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 md:gap-9 mt-1 md:mt-0" > 
           <a 
              href="#home"
              onClick={(e) => { e.preventDefault(); setCurrentScreen('home'); }}
              className="hidden md:inline-block text-white/90 hover:text-white text-sm font-semibold transition-colors relative pb-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white"
            >
              Home
            </a> 

            <button
              onClick={() => setCurrentScreen('chat')}
              className="text-white/80 hover:text-white text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap cursor-pointer"
            >
              Community
            </button>

            <button 
              onClick={() => setCurrentScreen('referral')}
              className="text-white/80 hover:text-white text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap cursor-pointer"
            >
              Referral
            </button>

            <a 
              href="#flights" 
              className="text-white/80 hover:text-white text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap"
            >
              Flights
            </a>
          </nav>

        {/* Right Side Action Corner */}
        <div className="flex items-center justify-end">
          {currentUser ? (
            <div 
              onClick={onNavigateToProfile}
              className="flex items-center gap-2 sm:gap-3 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/25 hover:border-cyan-400/50 pl-3 pr-2 py-1.5 rounded-full shadow-lg cursor-pointer transition-all duration-200 group relative"
              title="Click to open your Profile Settings"
            >
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-[10px] font-black text-cyan-200 uppercase tracking-widest group-hover:text-white animate-pulse">
                  👤 View Profile
                </span>
                <span className="text-xs font-bold text-white max-w-[100px] truncate leading-tight mt-0.5">
                  {currentUser.displayName || currentUser.email.split('@')[0]}
                </span>
              </div>

              {/* Gol Avatar Box */}
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 border border-white/40 text-white flex items-center justify-center font-black text-xs shadow-md select-none group-hover:scale-110 group-hover:shadow-cyan-500/20 transition-all duration-200">
                {(currentUser.displayName || currentUser.email)[0].toUpperCase()}
              </div>

              <button 
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-bold transition duration-200 cursor-pointer border-none shadow-sm relative z-40"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={onNavigateToLogin} className="text-white text-xs sm:text-sm font-semibold px-3 py-2 hover:bg-white/10 rounded-xl transition cursor-pointer border-none bg-transparent">
                Login
              </button>
              <button onClick={onNavigateToSignup} className="bg-white text-[#0f62c6] text-xs sm:text-sm font-bold px-4 py-2 sm:py-2.5 rounded-xl shadow-md hover:bg-slate-100 transition cursor-pointer border-none">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-6 sm:pt-10 pb-20 sm:pb-28 grid lg:grid-cols-12 gap-12 items-center relative z-20">
        <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-white text-center lg:text-left flex flex-col items-center lg:items-start">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-4 py-2 rounded-full backdrop-blur-md shadow-sm w-fit">
            <span className="text-xs font-semibold tracking-wider">Next-Gen India Travel Network</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
            Make Your <br />
            <span className="text-white drop-shadow-sm">Dream Journey</span> <br />
            Become Reality
          </h1>

          <p className="text-white/80 text-sm sm:text-base max-w-lg leading-relaxed font-medium">
            Join a trusted community of Indian travelers and explore beautiful destinations across the country with confidence and support.
          </p>

          <div className="pt-2">
            <button 
              onClick={() => setCurrentScreen('journey-request')} 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-xl shadow-md transition-colors duration-200 cursor-pointer border-none"
            >
              <span>Get Started</span>
              <span className="text-lg font-bold">→</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 w-full max-w-xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-2xl text-center">
              <div className="text-lg sm:text-xl font-black">50K+</div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-white/70 mt-1">Happy Travelers</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-2xl text-center">
              <div className="text-lg sm:text-xl font-black">150+</div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-white/70 mt-1">Airports Connected</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-2xl text-center">
              <div className="text-lg sm:text-xl font-black">99%</div>
              <div className="text-[10px] sm:text-[11px] font-semibold text-white/70 mt-1">Safe Journeys</div>
            </div>
          </div>
        </div>

        {/* Right Side Plane Graphic */}
        <div className="lg:col-span-6 flex items-center justify-center relative min-h-[350px] sm:min-h-[480px]">
          <div className="absolute w-[280px] h-[280px] sm:w-[480px] sm:h-[480px] rounded-full border-4 border-white/15 border-t-white/60 animate-orbit-line shadow-2xl"></div>
          <div className="absolute w-[230px] h-[230px] sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-tr from-blue-600/40 to-cyan-400/20 backdrop-blur-md border border-white/20 shadow-inner"></div>
          
          <div className="w-56 h-56 sm:w-[420px] sm:h-[420px] relative z-10 animate-3d-plane drop-shadow-[0_35px_60px_rgba(0,0,0,0.45)]">
            <svg viewBox="0 0 24 24" className="w-full h-full text-white transform rotate-[35deg]" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z"/>
            </svg>
          </div>
        </div>
      </main>

      {/* Why Choose Us */}
      <section id="flights" className="bg-white text-slate-900 pt-16 sm:pt-20 pb-16 relative z-20 shadow-[0_-40px_60px_rgba(0,0,0,0.06)] rounded-t-[40px] sm:rounded-t-[60px]">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800">Why Choose Dream Journey?</h2>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto font-medium">We provide the best tools and community support to make your domestic travel experience smooth and memorable.</p>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 pt-10 sm:pt-12">
            <div className="bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] text-left space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Desi Travel Community</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Connect with thousands of travelers across India to share real-time route tips, local food options, and hidden hacks.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] text-left space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Secure & Verified</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Your safety and privacy are our top priority with quick verification processes tailored for local tourism.</p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] text-left space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor"><path d="M2 12h2v5H2v-5zm18-5h2v10h-2V7zm-9-4h2v18h-2V3zm-5 8h2v9H6v-9zm10-3h2v12h-2V8z"/></svg>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">Fast & Native UI</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Plan, connect, and lock your travel updates with a super smooth dashboard optimized for low-network regions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Support Area */}
      <footer className="bg-slate-900 text-white py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/10 pb-8 mb-6">
          <div className="text-center md:text-left">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Contact Support Desk</h4>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1">Have questions? Reach out to our official desk anytime.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 text-xs font-bold w-full sm:w-auto">
            <a href="mailto:dreamjourneyproject@gmail.com" className="w-full sm:w-auto text-center bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition shadow-sm">
              ✉️ dreamjourneyproject@gmail.com
            </a>
            <div className="w-full sm:w-auto text-center bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-slate-300 shadow-sm">
              📞 +91 87082 22530
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center text-[11px] sm:text-xs text-slate-500 font-medium">
          <p>© 2026 Dream Journey Project. All domestic meshes fully functional.</p>
        </div>
      </footer>

      {/* iOS Style Premium Glassmorphic Dock */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '92%',
        maxWidth: '420px',
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        padding: '6px 12px'
      }} className="md:hidden">
        
        <div style={{ display: 'flex', alignItems: 'center', justifymathrm: 'space-between', height: '64px' }}>
          {/* 🏠 Home Button */}
          <button 
            onClick={() => setCurrentScreen('home')}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <svg style={{ width: '22px', height: '22px', transition: 'all 0.2s', filter: currentScreen === 'home' ? 'drop-shadow(0 0 8px #22d3ee)' : 'none' }} fill={currentScreen === 'home' ? '#22d3ee' : '#94a3b8'} viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span style={{ fontSize: '10px', marginTop: '5px', fontWeight: '600', letterSpacing: '0.05em', color: currentScreen === 'home' ? '#ffffff' : '#94a3b8' }}>Home</span>
          </button>

          <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)' }}></div>

          {/* ✈️ Flights Button */}
          <a 
            href="#flights"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            <svg style={{ width: '22px', height: '22px' }} fill="#94a3b8" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5l7 2.5z"/>
            </svg>
            <span style={{ fontSize: '10px', marginTop: '5px', fontWeight: '500', letterSpacing: '0.05em', color: '#94a3b8' }}>Flights</span>
          </a>

          <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)' }}></div>

          {/* 💬 Community Button */}
          <button 
            onClick={() => setCurrentScreen('chat')}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <svg style={{ width: '22px', height: '22px', transition: 'all 0.2s', filter: currentScreen === 'chat' ? 'drop-shadow(0 0 8px #38bdf8)' : 'none' }} fill={currentScreen === 'chat' ? '#38bdf8' : '#94a3b8'} viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
            <span style={{ fontSize: '10px', marginTop: '5px', fontWeight: '600', letterSpacing: '0.05em', color: currentScreen === 'chat' ? '#ffffff' : '#94a3b8' }}>Community</span>
          </button>

          <div style={{ width: '1px', height: '24px', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.15), transparent)' }}></div>

          {/* 🎁 Referral Button */}
          <button 
            onClick={() => setCurrentScreen('referral')}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <svg style={{ width: '22px', height: '22px', transition: 'all 0.2s', filter: currentScreen === 'referral' ? 'drop-shadow(0 0 8px #a855f7)' : 'none' }} fill={currentScreen === 'referral' ? '#c084fc' : '#94a3b8'} viewBox="0 0 24 24">
              <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 4.5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h16v6z"/>
            </svg>
            <span style={{ fontSize: '10px', marginTop: '5px', fontWeight: '600', letterSpacing: '0.05em', color: currentScreen === 'referral' ? '#ffffff' : '#94a3b8' }}>Referral</span>
          </button>
        </div>
      </div>
    </div>
  );
}