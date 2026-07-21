import React, { useState, useEffect } from 'react';
import { auth, db } from "./firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';

export default function ContributionPage({ onBackToHome, currentUserData }) {
  // ⚙️ CENTRAL CONTROL CREDENTIALS
  const officialUPI = 'dreamjourneyproject@ptaxis'; // 👈 Apni real UPI ID yahan check kar lena bhai
  const targetThreshold = 7000;          // Dynamic upper goal limit

  // --- Core Protected States ---
  const [selectedAmount, setSelectedAmount] = useState(20);
  const [customAmount, setCustomAmount] = useState('');
  const [guestName, setGuestName] = useState(''); 
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- Verification Layer State ---
  const [showVerifyStep, setShowVerifyStep] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);
  // --- Live Firestore States (Completely Reset to Absolute 0) ---
  const [totalRaised, setTotalRaised] = useState(0);
  const [totalContributors, setTotalContributors] = useState(0);
  const [recentFeeds, setRecentFeeds] = useState([]);

  // Compute clean numeric values safely
  const currentFinalAmount = selectedAmount === 'custom' ? (parseFloat(customAmount) || 0) : parseFloat(selectedAmount);
  
  // Resolves the Display Name Bug
  const finalDonorName = currentUserData?.name || currentUserData?.displayName || guestName.trim();

  // 🛰️ Real-time Precise Live Synchronization Engine
  useEffect(() => {
    const q = query(collection(db, "contributions"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      const feeds = [];
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        total += parseFloat(data.amount || 0);
        
        if (feeds.length < 5) {
          // Dynamic Live Local Time Formatter
          let formattedTime = 'Just now';
          if (data.createdAt) {
            const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt.seconds * 1000);
            formattedTime = dateObj.toLocaleTimeString('en-IN', {
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true
            });
          }

          feeds.push({
            id: doc.id,
            name: data.userName || "Anonymous Supporter",
            amount: data.amount,
            time: formattedTime
          });
        }
      });

      setTotalRaised(total);
      setTotalContributors(snapshot.size);
      setRecentFeeds(feeds);
    }, (error) => {
      console.error("Firestore synchronizer error channel: ", error);
    });

    return () => unsubscribe();
  }, []);

 const getUPIDeepLink = () => {
  const payeeName = encodeURIComponent("DreamJourney");
  const transactionNote = encodeURIComponent(`Contribution from ${finalDonorName || 'Member'}`);
  
  // 🟢 Single quote (') ki jagah Backtick (`) use kiya hai dynamic values ke liye
  return `upi://pay?pa=${officialUPI}&pn=${payeeName}&am=${currentFinalAmount}&cu=INR&tn=${transactionNote}`;
};

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(officialUPI);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
const handlePaymentSubmit = async (e) => {
  if (e) e.preventDefault();
  
  // 12-digit check validation
 if (utrNumber.trim().length !== 12 || isNaN(utrNumber)) {
  alert("Please enter a valid 12-digit UTR/Reference number!");
  return;
}

  setLoading(true);
  try {
    // 1. Firestore mein data add karna (Yeh tumhara original code hai line 100-108)
    await addDoc(collection(db, "payments"), {
      userId: currentUserData?.uid || "unknown_user",
      userEmail: currentUserData?.email || "no_email",
      amount: currentFinalAmount || 99,
      utrNumber: utrNumber.trim(),
      status: "pending",
      timestamp: serverTimestamp()
    });

    // 🎯 HAHAN SE NAYA CODE ADD KARNA HAI 👇

    // 2. Laptop user ko error se bachane ke liye Device Check
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) {
      // Agar laptop hai toh alert dikhao aur aage mat jaane do
      alert("💻 Desktop/Laptop detected! UTR saved. Please verify via QR code or complete on a mobile device to launch the app directly.");
    } else {
      // Agar mobile hai, toh deep link open karke payment app par bhej do
      const upiUrl = getUPIDeepLink();
      window.location.href = upiUrl;
    }

    // 3. Success state updates (Yeh tumhara original code hai line 109-110)
    setSuccessAlert(true);
    setUtrNumber(""); // Input box clear karne ke liye
    
    setTimeout(() => {
      setSuccessAlert(false);
    }, 4000); // 4 second baad green alert apne aap gayab
  } catch (error) {
    console.error("Error saving payment:", error);
    alert("Database mein save nahi ho paya, dobara koshish karein!");
  } finally {
    setLoading(false);
  }
};
  const handleInitiatePaymentClick = () => {
    if (currentFinalAmount <= 0) {
      alert("⚠️ Please select or enter a valid amount!");
      return;
    }
    if (!currentUserData && !guestName.trim()) {
      alert("⚠️ Please enter your screen name first to broadcast your support!");
      return;
    }
    setShowVerifyStep(true);
  };

  // Safe Production Form Submission
  const handleFinalDatabaseSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      alert("⚠️ Verification payload required: Please provide your 12-digit UTR Number.");
      return;
    }

    setIsProcessing(true);

    try {
      await addDoc(collection(db, "contributions"), {
        userId: currentUserData?.uid || 'guest_account',
        userName: finalDonorName || "Anonymous Supporter",
        amount: currentFinalAmount,
        utr: utrNumber,
        createdAt: serverTimestamp()
      });

      setCustomAmount('');
      setUtrNumber('');
      setGuestName('');
      setShowVerifyStep(false);
      if (onBackToHome) onBackToHome();
    } catch (err) {
      console.error("Critical core ledger write execution failed: ", err);
      alert("❌ System Sync Error: Failed to push data parameters.");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculatedPercentage = Math.min(Math.round((totalRaised / targetThreshold) * 100), 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased w-full pb-12">
      
      {/* BANNER HEADER AREA */}
      <div className="relative w-full h-[280px] bg-gradient-to-br from-[#0c2340] via-[#1a365d] to-[#2a4365] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* 🏠 TOP NAVIGATION BAR FOR HOME ACTION */}
        <div className="absolute top-6 left-6 z-30">
          <button 
            type="button" 
            onClick={onBackToHome} 
            className="flex items-center gap-2 bg-white/10 hover:bg-white/25 active:scale-95 border border-white/20 px-4 py-2 rounded-full text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            🏠 Go to Home
          </button>
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="inline-flex items-center gap-2 bg-white/10 text-white backdrop-blur-sm border border-white/10 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            🛡️ SECURED COMMUNITY WALLET LAYER
          </span>
        <div className="pt-4 pb-2 space-y-2 group select-none">
  {/* Animated Glowing Title */}
  <h1 className="text-4xl sm:text-5xl font-black tracking-[0.3em] font-sans text-center uppercase relative block transition-all duration-500 ease-out cursor-default hover:tracking-[0.35em]">
    {/* Inner Text Gradient and Soft Blur Background Pulse */}
    <span className="bg-gradient-to-r from-white via-cyan-200 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse">
      TRAVELVERSE
    </span>
    {/* Underline Tech Border Trace with Infinite Shimmer Animation */}
    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] animate-infinite"></span>
  </h1>
  
  {/* Cyber Matrix Subtitle with Subtle Pulsing Dot */}
  <div className="flex items-center justify-center gap-2 pt-2">
    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping duration-1000"></span>
    <p className="text-[10px] sm:text-xs font-black text-slate-400/90 tracking-[0.2em] uppercase font-mono transition-colors duration-300 group-hover:text-cyan-300">
      COMMUNITY SUPPORT WALLET
    </p>
  </div>
</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dynamic Progress Engine */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>🎯 Monthly Contribution Goal</span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
              <span className="text-sky-600">₹{totalRaised.toLocaleString('en-IN')}</span>
              <span className="text-xs text-slate-400 font-medium">raised of ₹{targetThreshold.toLocaleString('en-IN')} goal</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full rounded-full transition-all duration-1000" style={{ width: `${calculatedPercentage}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-400 font-semibold flex justify-between items-center">
              <span>👥 SUPPORTED BY {totalContributors} USERS</span>
              <span className="text-sky-600 uppercase tracking-wide">{calculatedPercentage}% Complete</span>
            </div>
          </div>

          {/* Configuration Matrix Panel */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Display Name Input Validation Layer */}
            {!currentUserData && (
              <div className="space-y-1.5 max-w-sm border-b border-slate-50 pb-4">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Your Screen Display Name</label>
                <input 
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold w-full focus:outline-none"
                  placeholder="Enter your name to flash on screen" 
                />
              </div>
            )}

           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl mx-auto pt-4">
  {[
    { id: 49, amt: '₹49', label: 'Supporter', desc: 'Small step, big impact' },
    { id: 99, amt: '₹99', label: 'Explorer', desc: 'Empower a dream' },
    { id: 199, amt: '₹199', label: 'Dream Builder', desc: 'You make dreams fly' },
    { id: 'custom', amt: 'Custom', label: 'Your Choice', desc: 'Choose your own amount' }
  ].map((tier) => (
    <div
      key={tier.id}
      onClick={() => setSelectedAmount(tier.id)}
      className={`flex flex-col items-center justify-between border-2 rounded-3xl p-5 min-h-[190px] text-center cursor-pointer transition-all duration-200 ${
        selectedAmount === tier.id 
          ? 'border-sky-500 bg-sky-50/40 shadow-md shadow-sky-100/50' 
          : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm shadow-slate-100'
      }`}
    >
      {/* Top Left Selection Radio Node */}
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center self-start ${
        selectedAmount === tier.id ? 'border-sky-500' : 'border-slate-300'
      }`}>
        {selectedAmount === tier.id && (
          <div className="w-2.5 h-2.5 rounded-full bg-sky-500"></div>
        )}
      </div>

      {/* Numerical Amount Meta Tier */}
      <div className="my-auto py-1">
        <h3 className={`text-2xl font-black tracking-tight ${
          selectedAmount === tier.id ? 'text-sky-600' : 'text-slate-800'
        }`}>
          {tier.amt}
        </h3>
        
        {/* Dynamic Badge Capsule */}
        <span className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full mt-2 uppercase tracking-wider ${
          selectedAmount === tier.id 
            ? 'bg-sky-500 text-white' 
            : 'bg-sky-100 text-sky-600'
        }`}>
          {tier.label}
        </span>
      </div>

      {/* Explicit Description Layer - No Hidden Visibility */}
      <p className={`text-[11px] font-semibold mt-2 leading-tight px-1 ${
        selectedAmount === tier.id ? 'text-slate-600' : 'text-slate-400'
      }`}>
        {tier.desc}
      </p>
    </div>
  ))}
</div>

            {selectedAmount === 'custom' && (
              <div className="space-y-1.5 max-w-xs">
                <input 
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold w-full focus:outline-none"
                  placeholder="Enter custom amount" 
                />
              </div>
            )}
{/* 📱 Mobile Users ke liye Universal UPI App Opener */}
<button 
  type="button"
 onClick={() => {
  // 📝 Dhyan se Backticks ( ` ) ka use karna, single quotes ( ' ) ka nahi!
  const upiUrl = `upi://pay?pa=${officialUPI}&pn=DreamJourney&am=${currentFinalAmount}&cu=INR`;
  
  // Mobile par direct Paytm/GPay/PhonePe kholne ke liye
  window.location.href = upiUrl;
}}
  className="w-full flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-600 text-white py-3.5 rounded-xl font-bold transition-all px-4 cursor-pointer"
>
  {/* ⚡ UPI Logo */}
  <img 
    src="https://upipayments.co.in/wp-content/uploads/2016/10/cropped-upi-logo.png" 
    alt="UPI" 
    className="h-5 w-auto object-contain brightness-0 invert" 
    style={{ minWidth: '40px' }}
  />
  
  <span className="whitespace-nowrap text-sm sm:text-base">PAY WITH UPI APP (MOBILE)</span>
</button>
            </div>

            {/* Laptop/Desktop QR Code Structural Interface */}
            <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-5 hidden md:block">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="w-28 h-28 bg-white border p-2 rounded-xl flex items-center justify-center shadow-inner overflow-hidden">
                 <img 
  src={'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + encodeURIComponent(`upi://pay?pa=${officialUPI}&pn=DreamJourney&am=${currentFinalAmount}`)}
  alt="Live Framework Scanner Engine" 
  className="w-full h-full object-contain"
/>
                </div>
                <div className="flex-grow space-y-2.5 w-full text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UPI ID Destination</span>
                    <div className="flex rounded-xl overflow-hidden border bg-white max-w-xs mt-1 shadow-sm">
                      <div className="px-3 py-2 font-mono text-slate-600 flex-grow select-all text-xs">{officialUPI}</div>
                      <button type="button" onClick={handleCopyUPI} className="bg-slate-50 text-sky-500 font-bold px-3 border-l text-[10px]">
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Scan using GPay, PhonePe, or Paytm. After confirming payment, submit data verification below.</p>
                </div>
              </div>
            </div>

          {/* 🟢 Screen par custom Green Success Alert box */}
{successAlert && (
  <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 mb-4 transition-all">
    <div className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shrink-0">
      ✓
    </div>
    <div className="text-sm font-medium">
      🎉 <strong className="font-bold">UTR successfully submitted!</strong> Admin will verify it shortly.
    </div>
  </div>
)}
              
            <form onSubmit={handlePaymentSubmit} className="bg-amber-50/40 border border-amber-200 p-4 rounded-xl space-y-4">
  <div>
    <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider">
      ✍️ Enter 12-Digit UPI Ref No / UTR Number
    </label>
    <input
      type="text"
      required
      value={utrNumber}
      onChange={(e) => setUtrNumber(e.target.value)}
      maxLength={12}
      className="w-full bg-white border border-amber-200 mt-1.5 px-3 py-2.5 rounded-xl text-black focus:outline-amber-500"
      placeholder="Enter UTR from payment transaction log"
    />
  </div>
  
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white font-bold py-3.5 rounded-full uppercase tracking-wider transition-all cursor-pointer"
  >
    {loading ? "Verifying Ledger..." : "Confirm Ledger Authentication"}
  </button>
</form>
            

            {/* MAIN SYSTEM CALL TO ACTION BUTTON */}
            {!showVerifyStep && (
              <div className="space-y-2 pt-2">
                <button 
                  type="button"
                  onClick={handleInitiatePaymentClick}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md"
                >
                  ❤️ I HAVE SCANNED & PAID ₹{currentFinalAmount} →
                </button>
              </div>
            )}

          </div>
        </div>

        {/* METRICS SIDEBAR LIST PANEL */}
        <div className="space-y-6 text-xs font-medium">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl space-y-4">
            {/* Why Contribute Section */}
<div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-100/50 mb-6 relative overflow-hidden text-left">
  <div className="flex items-start gap-4">
    {/* Heart Icon Badge */}
    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
      <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </div>

    {/* Text Content */}
    <div className="space-y-1">
      <h3 className="text-lg font-bold text-slate-800">Why Contribute?</h3>
      <p className="text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
        Every contribution goes directly towards sponsoring real people and their dream journeys.
      </p>
    </div>
  </div>

  {/* Checkpoint Lists */}
  <div className="mt-5 space-y-3 pl-1">
    {[
      'Transparent Process',
      'Verified Journey Requests',
      'Real Impact, Real People'
    ].map((text, idx) => (
      <div key={idx} className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
          <svg className="w-3 h-3 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-slate-700">{text}</span>
      </div>
    ))}
  </div>
</div>
            <div className="flex justify-between items-center border-b border-slate-50 pb-2 text-[11px]">
              <h4 className="font-black text-slate-900 uppercase tracking-wider">💙 Recent Contributors</h4>
            </div>
            
            <div className="space-y-3.5">
              {recentFeeds.length === 0 ? (
                <div className="text-slate-400 text-center py-2 font-medium">Waiting for incoming session data...</div>
              ) : (
                recentFeeds.map((feed) => (
                  <div key={feed.id} className="flex justify-between items-center animate-fadeIn">
                    <div>
                      {/* Displays Exact Dynamic Name From Live State Inputs */}
                      <span className="text-slate-800 font-bold block">{feed.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold bg-slate-100/70 px-1.5 py-0.5 rounded mt-0.5 inline-block">{feed.time}</span>
                    </div>
                    <span className="text-sky-600 font-black bg-sky-50/80 px-2.5 py-1 rounded-md text-xs">
                      +₹{feed.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
  );
}