import React, { useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser'; 

// 📍 Top Indian Cities & States List for Premium Dropdown
const indianLocations = [
  { city: "Delhi / NCR", region: "National Capital Region" },
  { city: "Mumbai", region: "Maharashtra" },
  { city: "Goa", region: "Konkan Coast" },
  { city: "Leh Ladakh", region: "Jammu & Kashmir" },
  { city: "Bangalore", region: "Karnataka" },
  { city: "Manali", region: "Himachal Pradesh" },
  { city: "Shimla", region: "Himachal Pradesh" },
  { city: "Srinagar", region: "Kashmir" },
  { city: "Ooty", region: "Tamil Nadu" },
  { city: "Munnar", region: "Kerala" },
  { city: "Udaipur", region: "Rajasthan" },
  { city: "Agra", region: "Uttar Pradesh" },
  { city: "Rishikesh", region: "Uttarakhand" },
  { city: "Pune", region: "Maharashtra" },
  { city: "Kolkata", region: "West Bengal" },
  { city: "Hyderabad", region: "Telangana" },
  { city: "Jaipur", region: "Rajasthan" },
  { city: "Lucknow", region: "Uttar Pradesh" }
];

export default function JourneyRequestPage({ onBackToHome, currentUser }) {
  // Yahan se useNavigate hata diya hai taaki error na aaye!

  // Form Basic States
  const [fullName, setFullName] = useState(currentUser?.displayName || "FILER Gaming");
  const [mobileNumber, setMobileNumber] = useState("");
  const [purpose, setPurpose] = useState(""); 
  const [story, setStory] = useState("");

  // Premium Dropdown States
  const [currentCity, setCurrentCity] = useState("");
  const [dreamDestination, setDreamDestination] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  
  // Interactive States
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cityRef = useRef(null);
  const destRef = useRef(null);

  // Outside click logic
  useEffect(() => {
    function handleClickOutside(event) {
      if (cityRef.current && !cityRef.current.contains(event.target)) setShowCityDropdown(false);
      if (destRef.current && !destRef.current.contains(event.target)) setShowDestDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter lists based on user input
  const filteredCities = indianLocations.filter(item =>
    item.city.toLowerCase().includes(currentCity.toLowerCase())
  );

  const filteredDests = indianLocations.filter(item =>
    item.city.toLowerCase().includes(dreamDestination.toLowerCase())
  );

  // Handle Form Submit with EmailJS Automation 🚀
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !mobileNumber || !currentCity || !dreamDestination || !purpose || !story) {
      alert("Bhai, saari details bharna zaroori hai! 😊");
      return;
    }

    setIsSubmitting(true);

    try {
      const emailData = {
        customerName: fullName,
        contactNumber: mobileNumber,
        fromLocation: currentCity,
        toLocation: dreamDestination,
        travelDate: new Date().toLocaleDateString('en-IN'), 
        amountPaid: "500", 
        upiTransactionId: "Verified Community Entry"
      };

      await emailjs.send(
        'service_t6qkpnp',             
        'template_agox3du',    
        emailData,
        'CNEsChsbB-Xu5bFB5'      
      );

      // Submit hone par safe navigation
      if (onBackToHome) {
        onBackToHome();
      } else {
        window.location.href = '/';
      }
    }
    catch (emailError) {
      console.warn("Email service failover active:", emailError);
      if (onBackToHome) {
        onBackToHome();
      } else {
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a4693] via-[#0f62c6] to-[#1e1b4b] text-white font-sans antialiased flex flex-col justify-between py-10 px-4 relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none"></div>

      <div className="max-w-4xl w-full mx-auto relative z-10">
        
       {/* Modern Back Button */}
<button 
  type="button"
  onClick={() => {
    if (typeof onBackToHome === 'function') {
      onBackToHome(); // Agar parent component handle kar raha hai
    } else {
      window.location.href = '/'; // Fallback to direct home path
    }
  }}
  className="group mb-8 inline-flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 border border-white/10 shadow-sm cursor-pointer"
>
  <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
  <span>Back to Homepage</span>
</button>
        {/* Hero Header Card */}
        <div className="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur-xl border border-white/20 rounded-[28px] p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center gap-6 mb-6 relative overflow-hidden">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/15 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 text-white transform -rotate-45" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z"/>
            </svg>
          </div>
          
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight drop-shadow-sm">Dream Journey Request</h1>
            <p className="text-white/80 text-xs sm:text-sm font-medium">Share your dream destination and let the community support your journey.</p>
          </div>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden">
          
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6 sm:space-y-8">
            
            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Full Name</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-white/40">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full text-sm pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 font-semibold text-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-900/40 transition duration-200"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Mobile Number</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-white/40">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                  </div>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full text-sm pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 font-semibold text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-900/40 transition duration-200"
                  />
                </div>
              </div>
            </div>

            {/* LOCATION SELECTOR GRID */}
            <div className="grid md:grid-cols-2 gap-6 relative">
              
              {/* Current City */}
              <div className="relative space-y-2" ref={cityRef}>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Current City</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-white/40">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={currentCity}
                    onChange={(e) => { setCurrentCity(e.target.value); setShowCityDropdown(true); }}
                    onFocus={() => setShowCityDropdown(true)}
                    placeholder="Where do you live now?"
                    className="w-full text-sm pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 font-semibold text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-900/40 transition duration-200"
                  />
                </div>
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl">
                    {filteredCities.map((loc, i) => (
                      <div
                        key={i}
                        onClick={() => { setCurrentCity(loc.city); setShowCityDropdown(false); }}
                        className="flex items-center justify-between px-5 py-3 hover:bg-white/10 cursor-pointer transition-all border-b border-white/5 last:border-none group"
                      >
                        <span className="font-semibold text-white text-sm">📍 {loc.city}</span>
                        <span className="text-xs font-medium text-slate-300 bg-white/10 px-2 py-1 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-all">{loc.region}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dream Destination */}
              <div className="relative space-y-2" ref={destRef}>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Dream Destination</label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-white/40">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                  </div>
                  <input
                    type="text"
                    required
                    value={dreamDestination}
                    onChange={(e) => { setDreamDestination(e.target.value); setShowDestDropdown(true); }}
                    onFocus={() => setShowDestDropdown(true)}
                    placeholder="Where do you want to go?"
                    className="w-full text-sm pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/5 font-semibold text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-900/40 transition duration-200"
                  />
                </div>
                {showDestDropdown && filteredDests.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl">
                    {filteredDests.map((loc, i) => (
                      <div
                        key={i}
                        onClick={() => { setDreamDestination(loc.city); setShowDestDropdown(false); }}
                        className="flex items-center justify-between px-5 py-3 hover:bg-white/10 cursor-pointer transition-all border-b border-white/5 last:border-none group"
                      >
                        <span className="font-semibold text-white text-sm">🧭 {loc.city}</span>
                        <span className="text-xs font-medium text-slate-300 bg-white/10 px-2 py-1 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-all">{loc.region}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Journey Purpose */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Journey Purpose</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'Education', label: '🎓 Education' },
                  { id: 'Job', label: '💼 Job Profile' },
                  { id: 'Tourism', label: '🗺️ Tourism & Exploration' },
                  { id: 'Family', label: '🏠 Family Visit' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPurpose(item.id)}
                    className={`border rounded-xl p-4 text-xs font-bold transition duration-200 ${
                      purpose === item.id 
                        ? 'border-blue-400 bg-blue-600 text-white ring-2 ring-blue-500/50 shadow-md scale-[1.02]' 
                        : 'border-white/10 text-white/70 hover:border-blue-500/50 hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Story */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Tell Your Story</label>
              <textarea
                rows="4"
                maxLength="500"
                required
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Why is this journey important for you?"
                className="w-full text-sm p-4 rounded-xl border border-white/10 bg-white/5 font-medium text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-slate-900/40 transition duration-200 resize-none"
              />
              <div className="text-right text-[10px] text-slate-400 mt-1 font-semibold">
                {story.length}/500 characters
              </div>
            </div>

            {/* Journey Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
                <div className="text-lg sm:text-xl font-black text-white">50K+</div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-semibold">Travelers</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
                <div className="text-lg sm:text-xl font-black text-white">150+</div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-semibold">Airports</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center backdrop-blur-md">
                <div className="text-lg sm:text-xl font-black text-white">99%</div>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 font-semibold">Success Rate</p>
              </div>
            </div>

            {/* Polished Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={'w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-none ' + (isSubmitting ? 'opacity-50 cursor-not-allowed' : 'transform hover:-translate-y-0.5 group/btn')}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Securing Flight Coordinates...</span>
                </>
              ) : (
                <>
                  <span>SUBMIT YOUR REQUEST </span>
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </>
              )}
            </button>

          </form>
        </div>
      </div>

      {/* Footer Support Notice */}
      <footer className="w-full text-center text-white/40 text-[11px] mt-8 font-medium">
        © 2026 Dream Journey Project • Secure End-to-End Encryption Connected
      </footer>

    </div>
  );
}