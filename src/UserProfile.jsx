import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import DTCoin from './DTCoin'; // 🪙 Custom DT Coin Import

export default function UserProfile({ currentUserData, onBack, onBackToHome }) {
  // --- 1. Basic Identity States ---
  const [name, setName] = useState(currentUserData?.name || currentUserData?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUserData?.phone || '');
  
  // --- 3. Travel Aspirations States ---
  const [dreamDestination, setDreamDestination] = useState(currentUserData?.dreamDestination || '');
  const [bio, setBio] = useState(currentUserData?.bio || '');
  
  // --- System UI States ---
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // --- 2. Contribution History & Analytics States ---
  const [myTotalContributed, setMyTotalContributed] = useState(0);
  const [myHistory, setMyHistory] = useState([]);

  // 🛰️ Real-time Synchronization Ledger
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "contributions"), 
      where("userId", "==", auth.currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      const historyList = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        total += parseFloat(data.amount || 0);
        
        let formattedTime = 'Just now';
        if (data.createdAt) {
          const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt.seconds * 1000);
          formattedTime = dateObj.toLocaleDateString('en-IN') + ' - ' + dateObj.toLocaleTimeString('en-IN', {
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          });
        }

        historyList.push({
          id: doc.id,
          amount: data.amount,
          utr: data.utr,
          time: formattedTime,
          status: data.status || "Verified" 
        });
      });

      setMyTotalContributed(total);
      setMyHistory(historyList);
    }, (error) => {
      console.error("Failed to sync personal database node: ", error);
    });

    return () => unsubscribe();
  }, []);

  // 🏅 DYNAMIC TRAVEL BADGE MATRIX
  const getBadgeDetails = (total) => {
    if (total >= 100) return { title: "Dream Builder 🥇", styles: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]" };
    if (total >= 50) return { title: "Explorer 🥈", styles: "bg-slate-500/10 text-slate-400 border-slate-500/20" };
    if (total >= 20) return { title: "Supporter 🥉", styles: "bg-orange-500/10 text-orange-500 border-orange-500/20" };
    return { title: "New Wayfarer 👥", styles: "bg-sky-500/10 text-sky-400 border-sky-500/20" };
  };

  const currentBadge = getBadgeDetails(myTotalContributed);

  // 🔐 Commit profile data modifications
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("⚠️ Account Name context layer cannot be blank!");
    
    setIsSaving(true);
    setMessage('');

    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: name.trim()
        });

        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, {
          name: name.trim(),
          phone: phoneNumber.trim(),
          dreamDestination: dreamDestination.trim(),
          bio: bio.trim(),
          updatedAt: new Date()
        }).catch(() => {
          console.log("Realtime schema initialization complete directly on root auth node.");
        });

        setMessage('✅ System sync completed: Profile metrics operational.');
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Cloud Sync Failure: Connection timed out.');
    } finally {
      setIsSaving(false);
    }
  };

  // 🔒 SESSION SHUTDOWN OPERATION
  const handleSignOut = async () => {
    if (window.confirm("Are you sure you want to log out of this node?")) {
      await auth.signOut();
      if (onBackToHome) onBackToHome();
    }
  };

  return (
    <div className="min-h-screen bg-[#061325] text-slate-100 font-sans antialiased w-full pb-16">
      
      {/* 🌌 PREMIUM INTEGRATED HERO BANNER */}
      <div className="relative w-full h-[280px] bg-gradient-to-b from-[#0c2340] via-[#08182b] to-[#061325] flex flex-col justify-center items-center text-center px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_40%,#061325)]"></div>
        
        {/* TOP FLOATING HOME NAVIGATION BUTTON */}
        <button 
          type="button"
          onClick={onBackToHome}
          className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-[#071325]/60 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 shadow-md"
        >
          🏠 Home
        </button>
        
        <div className="relative z-10 max-w-4xl space-y-3">
          <span className="inline-flex items-center gap-2 bg-sky-500/10 text-sky-400 backdrop-blur-md border border-sky-500/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            🧭 USER IDENTITY PANEL
          </span>
          <h2 className="text-white text-3xl sm:text-5xl font-black tracking-tight leading-none">
            {name ? name.toUpperCase() : 'EXPLORER NODE'}
          </h2>
          <p className="text-xs text-sky-400/60 font-mono font-medium max-w-md mx-auto truncate">UID: {auth.currentUser?.uid || 'guest_session_token'}</p>
        </div>
      </div>

      {/* 🚀 MODERN GRID WORKSPACE HUB */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ================= LEFT GRID COLUMN: IDENTITY HUD & BADGES ================= */}
        <div className="space-y-6">
          
          {/* VISUAL AVATAR HUB */}
          <div className="bg-[#0b1e36] border border-white/5 rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col items-center text-center space-y-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="w-24 h-24 bg-gradient-to-tr from-[#0ea5e9] to-[#0284c7] text-white rounded-full flex items-center justify-center text-4xl font-black shadow-xl ring-4 ring-sky-500/20 transform group-hover:scale-105 transition-transform duration-300">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight">{name || "Dream Supporter"}</h3>
              <p className="text-xs text-slate-400 font-mono">{auth.currentUser?.email || 'authenticated_node@domain.com'}</p>
            </div>
            
            {/* LEVEL BADGE CONTAINER */}
            <div className={'w-full border py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ' + currentBadge.styles}>
              {currentBadge.title}
            </div>

            {/* LIVE TRAVEL BIO BOX */}
            <div className="w-full bg-[#071325] border border-white/5 px-4 py-3.5 rounded-2xl text-left">
              <span className="text-[9px] font-black text-sky-400 uppercase tracking-wider block mb-1">Travel Manifesto</span>
              <p className="text-xs italic text-slate-300 leading-relaxed font-medium">
                "{bio || "No custom traveling manifesto declared yet. Update parameters below."}"
              </p>
            </div>
          </div>

          {/* 🪙 REPLACED HUD: REAL-TIME DT COINS & STREAK MONITOR */}
          <div className="bg-[#0b1e36] border border-amber-500/20 rounded-3xl p-5 shadow-xl grid grid-cols-2 gap-4 relative overflow-hidden">
            <div className="bg-[#071325] border border-amber-500/10 p-4 rounded-2xl text-center flex flex-col items-center justify-center">
              <span className="text-[9px] text-amber-400/80 font-black uppercase tracking-wider block mb-1">DT Coins Balance</span>
              <div className="flex items-center gap-2 mt-1">
                <DTCoin className="w-6 h-6 animate-pulse" />
                <span className="text-2xl font-black text-amber-400 tracking-tight">
                  {currentUserData?.coins || 0}
                </span>
              </div>
            </div>

            <div className="bg-[#071325] border border-amber-500/10 p-4 rounded-2xl text-center flex flex-col items-center justify-center">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block mb-1">Daily Streak</span>
              <span className="text-lg font-black text-white mt-1 tracking-tight bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 text-amber-300">
                Day {currentUserData?.streakCount || 1} / 7
              </span>
            </div>
          </div>

          {/* DANGEROUS SYSTEM CONTROLS LAYER */}
          <button 
            type="button"
            onClick={handleSignOut}
            className="w-full bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
          >
            🛑 Terminal Session Logout
          </button>
        </div>

        {/* ================= RIGHT GRID COLUMN: RECONFIGURATION ENGINE & LOG DETAILS ================= */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PROFILE CONFIGURATION FORM */}
          <div className="bg-[#0b1e36] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2 text-sky-400">
              ⚙️ System Parameters Reconfiguration
            </h4>

            {message && (
              <div className={`p-4 rounded-2xl text-xs font-bold transition-all ${
                message.includes('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              
              {/* IDENTITY INPUT FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Public Display Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-[#071325] border border-white/10 px-4 py-3 rounded-xl text-xs font-bold w-full text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="Enter full identity name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Contact Smartphone Node</label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="bg-[#071325] border border-white/10 px-4 py-3 rounded-xl text-xs font-bold w-full text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="10-Digit Mobile Number" />
                </div>
              </div>

              {/* TRAVEL ASPIRATION INPUT FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Dream Travel Destination ✈️</label>
                  <input type="text" value={dreamDestination} onChange={(e) => setDreamDestination(e.target.value)} className="bg-[#071325] border border-white/10 px-4 py-3 rounded-xl text-xs font-bold w-full text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="e.g. Kedarnath / Iceland Solo" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Traveler Manifesto Status (Bio)</label>
                  <input type="text" value={bio} onChange={(e) => setBio(e.target.value)} className="bg-[#071325] border border-white/10 px-4 py-3 rounded-xl text-xs font-bold w-full text-white focus:outline-none focus:border-sky-500 transition-colors" placeholder="Born to walk across maps..." />
                </div>
              </div>

              <div className="space-y-2 max-w-sm">
                <label className="text-[10px] font-black text-slate-400/50 uppercase tracking-widest block">System Master Key Email (Immutable)</label>
                <input type="text" disabled value={auth.currentUser?.email || 'authenticated_node@domain.com'} className="bg-[#050e1b] border border-white/5 px-4 py-3 rounded-xl text-xs font-mono font-bold w-full text-slate-500 cursor-not-allowed select-none" />
              </div>

              {/* ACTION COMMAND CONTROLS */}
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <button type="submit" disabled={isSaving} className="flex-grow bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.99] disabled:opacity-50">
                  {isSaving ? 'Synchronizing Cloud Node...' : 'Save Component Parameters'}
                </button>
                
                <button type="button" onClick={onBack} className="bg-[#071325] hover:bg-slate-800 text-slate-400 hover:text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors border border-white/5">
                  ← Back to Wallet
                </button>

                <button 
                  type="button" 
                  onClick={onBackToHome} 
                  className="bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-emerald-500/20 flex items-center justify-center gap-2"
                >
                  🏠 Go to Home
                </button>
              </div>

            </form>
          </div>

          {/* VERIFICATION TRANSACTIONS HISTORY LOG */}
          <div className="bg-[#0b1e36] border border-white/5 rounded-3xl p-6 shadow-xl space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-3 flex items-center gap-2 text-sky-400">
              📜 Personal Ledger Audit History Logs
            </h4>

            <div className="overflow-x-auto w-full">
              {myHistory.length === 0 ? (
                <div className="text-slate-500 text-center py-8 text-xs font-medium font-mono">No previous transaction blocks located on this endpoint node.</div>
              ) : (
                <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-black uppercase text-[9px] tracking-widest">
                      <th className="pb-3">Timestamp Block</th>
                      <th className="pb-3">UPI UTR Identification</th>
                      <th className="pb-3">Value</th>
                      <th className="pb-3 text-right">Status State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myHistory.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 text-slate-300 font-semibold hover:bg-white/5 transition-colors">
                        <td className="py-3.5 text-[11px] text-slate-400 font-mono">{log.time}</td>
                        <td className="py-3.5 font-mono text-[11px] text-sky-400 select-all">{log.utr}</td>
                        <td className="py-3.5 font-black text-white">₹{log.amount}</td>
                        <td className="py-3.5 text-right">
                          <span className="bg-emerald-500/10 text-emerald-400 font-black text-[10px] uppercase px-2.5 py-1 rounded-md border border-emerald-500/20 tracking-wide">
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}