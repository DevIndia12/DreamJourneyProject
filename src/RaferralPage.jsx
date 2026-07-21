import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function RaferralPage({ setCurrentScreen }) {
  const [userData, setUserData] = useState({
    myReferralCode: 'LOADING...',
    referralCount: 0,
    points: 0,
    isPaid: false // 👈 State mein isPaid add kiya
  });
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [claimMessage, setClaimMessage] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  const milestones = [
    { name: "🍕 Food item", target: 5 },
    { name: "👕 Exclusive DJP T-Shirt", target: 10 },
    { name: "🎁 ₹200 Cashback Reward", target: 20 },
    { name: "🎧 Wireless Headphones", target: 50 },
    { name: "👑 Legend Sneakers + Badge", target: 100 }
  ];

  const handleClaimReward = (targetRequired) => {
    if (userData.referralCount >= targetRequired) {
      setClaimMessage("Please wait for 1-2 minutes. Our team will contact you shortly to deliver your reward!");
      setTimeout(() => {
        setClaimMessage("");
      }, 5000);
    } else {
      setClaimMessage("");
    }
  };

  const handleShareLink = async () => {
    const inviteLink = `${window.location.origin}?ref=${userData.myReferralCode}`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (navigator.share && isMobile) {
      try {
        await navigator.share({
          title: 'Join DJP & Win Rewards!',
          text: 'Use my referral code to claim your reward: ${userData.myReferralCode}',
          url: inviteLink,
        });
      } catch (error) {
        console.log('Sharing dismissed:', error);
        copyToClipboardFallback(inviteLink);
      }
    } else {
      copyToClipboardFallback(inviteLink);
    }
  };

  const copyToClipboardFallback = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setShareStatus("Link copied! Paste it on Insta or Snap.");
      setTimeout(() => {
        setShareStatus("");
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const generateUniqueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
    let randomStr = '';
    for (let i = 0; i < 6; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return "DJP-" + randomStr;
  };

  useEffect(() => {
    const fetchReferralData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const dbData = docSnap.data();
            const existingCode = dbData.myReferralCode || dbData.referralCode;

            if (!existingCode || existingCode.includes("${")) {
              const newCode = generateUniqueCode();
              await setDoc(docRef, { myReferralCode: newCode }, { merge: true });
              setUserData({
                myReferralCode: newCode,
                referralCount: Number(dbData.referralCount) || 0,
                points: Number(dbData.points) || 0,
                isPaid: dbData.isPaid || false // 👈 Firestore se value fetch ki
              });
            } else {
              setUserData({
                myReferralCode: existingCode,
                referralCount: Number(dbData.referralCount) || 0,
                points: Number(dbData.points) || 0,
                isPaid: dbData.isPaid || false // 👈 Firestore se value fetch ki
              });
            }
          } else {
            const newCode = generateUniqueCode();
            await setDoc(docRef, {
              myReferralCode: newCode,
              referralCount: 0,
              points: 0,
              uid: user.uid,
              isPaid: false // 👈 Naye user ke liye default false
            });
            setUserData({
              myReferralCode: newCode,
              referralCount: 0,
              points: 0,
              isPaid: false
            });
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchReferralData();
  }, []);

  const totalRefs = userData.referralCount || 0;
  const nextMilestone = milestones.find(m => totalRefs < m.target) || milestones[milestones.length - 1];
  const remainingTarget = nextMilestone.target - totalRefs > 0 ? nextMilestone.target - totalRefs : 0;

  const handleCopyCode = () => {
    if (userData.myReferralCode && userData.myReferralCode !== 'LOADING...') {
      navigator.clipboard.writeText(userData.myReferralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const inviteLink = `${window.location.origin}?ref=${userData.myReferralCode}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-bold">
        🔄 Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white p-4 sm:p-6 font-sans relative overflow-hidden">
      
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[130px] animate-pulse"></div>

      <button 
        onClick={() => setCurrentScreen('home')}
        className="mb-6 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-all flex items-center gap-2 group backdrop-blur-md bg-slate-900/30 px-3 py-1.5 rounded-full border border-slate-800 w-fit"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back to Home
      </button>

      {/* 🎯 Main Dynamic Verification Check */}
      {!userData.isPaid ? (
        /* 🔴 LOCK SCREEN: Agar payment nahi hui hai toh yeh dikhega */
        <div className="w-full max-w-md mx-auto space-y-6 relative z-10 text-center py-12">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-red-500/30 rounded-3xl p-8 space-y-6 shadow-2xl shadow-black/80">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full flex items-center justify-center text-3xl mx-auto animate-bounce">
              🔒
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-gradient-to-r from-white to-slate-400 bg-clip-text">
                Referral System Locked
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Referral code aur milestone rewards unlock karne ke liye pehle activation fee pay karein.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3 text-left">
  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">👇 How to Unlock 👇</p>
  <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside pl-1">
    <li>Please complete your payment on the Contribution page first.</li>
    <li>Once your payment is successfully verified, your dashboard will become active automatically.</li>
  </ol>
</div>

            <button 
              onClick={() => setCurrentScreen('contribution')}
              className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:from-blue-500 hover:to-teal-400 transition-all active:scale-[0.98] text-xs sm:text-sm"
            >
              Go to Payment Section 🚀
            </button>
          </div>
        </div>
      ) : (
        /* 🟢 UNLOCK SCREEN: Payment hone ke baad poora original dashboard */
        <div className="w-full max-w-md mx-auto space-y-6 sm:space-y-8 relative z-10">
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
              Refer & Earn
            </h1>
            <p className="text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text font-black tracking-[0.2em] text-[10px] sm:text-xs uppercase animate-pulse">
              ✨ Unlimited Rewards ✨
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl shadow-black/50 hover:border-slate-700/80 transition-all duration-300">
            <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span> 1. Share Credentials
            </h2>
            
            <div className="space-y-2">
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest block text-center">Your Unique Code</label>
              <button 
                onClick={handleCopyCode}
                className={`w-full bg-gradient-to-r from-slate-950 to-slate-900 border border-dashed rounded-xl sm:rounded-2xl py-3.5 px-4 font-black tracking-widest text-xl sm:text-2xl transition-all duration-300 text-center block relative group overflow-hidden ${
                  copiedCode ? 'border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'border-slate-700 hover:border-blue-500 text-blue-400 hover:shadow-lg hover:shadow-blue-500/5'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">{userData.myReferralCode}</span>
                <span className="block text-[9px] sm:text-[10px] font-medium text-slate-500 mt-1.5 normal-case tracking-normal group-hover:text-slate-400 transition-colors">
                  {copiedCode ? "🎉 Copied to Clipboard!" : "Tap to copy code"}
                </span>
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Unique Invite Link</label>
              <div className="flex gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800/80 items-center justify-between overflow-hidden focus-within:border-blue-500/50 transition-all">
                <span className="text-[11px] sm:text-xs text-slate-400 truncate pl-1 select-all font-mono">
                  {window.location.origin}?ref={userData.myReferralCode}
                </span>
                <button 
                  onClick={handleCopyLink}
                  className={`text-[10px] sm:text-xs font-bold px-3.5 sm:px-4 py-2 rounded-lg transition-all duration-300 shrink-0 transform active:scale-95 ${
                    copiedLink ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
                  }`}
                >
                  {copiedLink ? "Copied!" : "COPY"}
                </button>
              </div>
            </div>

            <div className="w-full flex flex-col items-center">
              <button 
                onClick={handleShareLink}
                className="w-full bg-gradient-to-r from-white via-slate-100 to-slate-200 text-slate-900 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:from-slate-100 hover:to-slate-300 transition-all duration-200 active:scale-[0.98] text-xs sm:text-sm shadow-md cursor-pointer"
              >
                🚀 Share via Insta, Snap, etc.
              </button>

              {shareStatus && (
                <div className="mt-2.5 p-2 bg-slate-900 border border-emerald-500/40 text-emerald-400 text-[11px] font-medium rounded-lg text-center animate-pulse w-full">
                  ✨ {shareStatus}
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl shadow-black/50">
            <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> 2. Milestones & Status
            </h2>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl text-center flex flex-col justify-center items-center min-h-[90px]">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Completed</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-400">{totalRefs}</p>
                <p className="text-[9px] text-slate-600 font-medium mt-0.5">Successful</p>
              </div>
              
              <div className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl text-center flex flex-col justify-center items-center min-h-[105px] relative overflow-hidden">
                <div className="mb-1">
                  <span className="text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase inline-block animate-pulse">
                    🔥 Target {milestones.findIndex(m => totalRefs < m.target) !== -1 ? milestones.findIndex(m => totalRefs < m.target) + 1 : milestones.length}
                  </span>
                </div>
                
                <div className="flex items-baseline justify-center gap-1.5 w-full whitespace-nowrap px-1">
                  <span className="text-2xl sm:text-3xl font-black text-blue-400">{remainingTarget}</span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-300 tracking-wide">Referral</span>
                </div>
                
                <p className="text-[9px] text-slate-400 font-semibold truncate max-w-full mt-0.5">
                  For {nextMilestone.name}
                </p>
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <div className="flex justify-between items-center px-1">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span> Rewards Timeline
                </p>
                <span className="text-[9px] text-slate-400 font-medium bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">Live Status</span>
              </div>

              <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {milestones.map((milestone, idx) => {
                  const isClaimed = totalRefs >= milestone.target;
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => handleClaimReward(milestone.target)}
                      className={`group flex flex-col p-3.5 rounded-xl transition-all duration-300 relative ${
                        isClaimed 
                          ? 'bg-gradient-to-r from-emerald-950/20 via-emerald-900/10 to-transparent border border-emerald-500/30 cursor-pointer' 
                          : 'bg-gradient-to-b from-slate-900/40 to-slate-950/80 border border-slate-800 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-between text-sm transition-all duration-300 ${
                          isClaimed ? 'bg-emerald-500/10 scale-110 shadow-inner' : 'bg-slate-950 border border-slate-800 group-hover:border-slate-700'
                        }`}>
                          <span className="m-auto transform group-hover:rotate-12 transition-transform duration-300">
                            {isClaimed ? "👑" : "🔒"}
                          </span>
                        </div>
                        <span className={`font-semibold tracking-wide text-xs sm:text-sm transition-all duration-300 ${
                          isClaimed ? 'text-emerald-200' : 'text-slate-300 group-hover:text-white'
                        }`}>
                          {milestone.name}
                        </span>
                      </div>

                      <div className="relative z-10 shrink-0 mt-2">
                        <span className={`font-mono text-[10px] font-bold px-3 py-1 rounded-full border transition-all duration-300 ${
                          isClaimed 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-900/90 border-slate-800 text-slate-500 group-hover:text-slate-400 group-hover:border-slate-700'
                        }`}>
                          Target: {milestone.target}
                        </span>
                      </div>

                      {isClaimed && claimMessage && (
                        <div className="mt-3.5 p-3 bg-slate-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] sm:text-xs rounded-lg text-center font-medium shadow-md shadow-emerald-950/60 animate-pulse transition-all duration-300 z-20 w-full">
                          ⏳ {claimMessage}
                        </div>
                      )}
                    </div> 
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}