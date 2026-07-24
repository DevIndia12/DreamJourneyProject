import React, { useState, useEffect } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import HomePage from './HomePage';
import { auth, db } from './firebase';
import CommunityChat from './CommunityChat';
import JourneyRequestPage from './JourneyRequest';
import ContributionPage from './ContributionPage';
import UserProfile from './UserProfile';
import AdminDashboard from './AdminDeshboard';
import RaferralPage from './RaferralPage';
import DTCoin from './DTCoin'; // 🪙 Custom Coin Import
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification 
} from 'firebase/auth';

// 🪙 7 Days Total = Exactly 50 Coins Distribution
const STREAK_REWARDS = {
  1: 2,
  2: 3,
  3: 5,
  4: 8,
  5: 10,
  6: 10,
  7: 12
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [authMode, setAuthMode] = useState('login');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserData, setCurrentUserData] = useState(null);

  // Form Control States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // 🔄 Synchronize Firestore User & Daily Streak Coins System
  const syncUserToFirestore = async (user, additionalData = {}) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (!userSnap.exists()) {
        // Naye User ke liye: Day 1 Reward = 2 DT Coins
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || `${additionalData.firstName || ''} ${additionalData.lastName || ''}`.trim(),
          createdAt: new Date(),
          referralCount: 0,
          coins: 2, 
          streakCount: 1,
          lastLoginDate: todayStr
        });
        alert("🎉 Welcome! Day 1 Bonus: Aapko 2 DT Coins mile hain!");
      } else {
        const userData = userSnap.data();
        const lastLogin = userData.lastLoginDate;

        // Agar aaj pehle login nahi kiya hai
        if (lastLogin !== todayStr) {
          let currentStreak = userData.streakCount || 0;

          // Streak Continuation Logic
          if (lastLogin === yesterdayStr) {
            currentStreak = currentStreak >= 7 ? 1 : currentStreak + 1;
          } else {
            // Day Miss hone par Streak Reset -> Day 1
            currentStreak = 1;
          }

          const rewardCoins = STREAK_REWARDS[currentStreak] || 2;
          const totalCoins = (userData.coins || 0) + rewardCoins;

          await updateDoc(userRef, {
            coins: totalCoins,
            streakCount: currentStreak,
            lastLoginDate: todayStr
          });

          alert('🔥 Day ${currentStreak} Streak! Aapko +${rewardCoins} DT Coins mile hain!');
        }
      }
    } catch (err) {
      console.error("Firestore Streak Sync Error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserData(user);
        await syncUserToFirestore(user);
        
        // 🛡️ SECURITY LAYER: Admin Check
        if (user.email === "devkagra2809@gmail.com") { 
          setCurrentScreen('admin'); 
        } else {
          setCurrentScreen((prev) => (prev === 'login' ? 'home' : prev));
        }
      } else {
        setCurrentUserData(null);
        setCurrentScreen('login');
      }
      setIsLoading(false); 
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        await syncUserToFirestore(result.user);
        setCurrentUserData(result.user);
        setCurrentScreen('home');
      }
    } catch (error) {
      console.error("Google Error:", error.message);
      alert("Google login failed ya cancel hua: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (authMode === 'signup') {
      if (!email || !password || !confirmPassword || !firstName || !lastName) {
        alert("🚨 Kripya saari details dhayan se bharein!");
        return;
      }

      if (password !== confirmPassword) {
        alert("❌ Passwords match nahi ho rahe hain!");
        return;
      }

      if (password.length < 6) {
        alert("⚠️ Password minimum 6 characters ka hona chahiye!");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await syncUserToFirestore(user, { firstName, lastName });
        await sendEmailVerification(user);
        
        alert("📩 Account successfully ban gaya! Email par verification link bhej diya gaya hai.");
        
        setConfirmPassword('');
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setAuthMode('login'); 
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToFirestore(userCredential.user);
        alert("✅ Login Successful!");
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert("🚨 Yeh email address pehle se registered hai!");
      } else if (error.code === 'auth/invalid-credential') {
        alert("❌ Invalid Email or Password!");
      } else {
        alert('🚨 Error: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <div className="w-10 h-10 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-3 tracking-wide">Syncing Session Grid...</p>
      </div>
    );
  }

  return (
    <>
      {currentScreen === 'payment' && (
        <ContributionPage 
          onBackToHome={() => setCurrentScreen('home')} 
          currentUserData={currentUserData} 
        />
      )}

      {currentScreen === 'referral' && (
        <RaferralPage setCurrentScreen={setCurrentScreen} />
      )}

      {currentScreen === 'chat' && (
        <CommunityChat 
          onBackToHome={() => setCurrentScreen('home')} 
          currentUserData={currentUserData} 
        />
      )}

      {currentScreen === 'home' && (
        <HomePage 
          setCurrentScreen={setCurrentScreen}
          onNavigateToLogin={() => setCurrentScreen('login')}
          onNavigateToSignup={() => setCurrentScreen('signup')}
          onNavigateToProfile={() => setCurrentScreen('profile')} 
        />
      )}

      {currentScreen === 'contribution' && (
        <ContributionPage 
          currentUserData={currentUserData} 
          onNavigateToProfile={() => setCurrentScreen('profile')} 
          onBackToHome={() => setCurrentScreen('home')}
        />
      )} 

      {currentScreen === 'profile' && (
        <UserProfile 
          currentUserData={currentUserData} 
          onBack={() => setCurrentScreen('home')} 
          onBackToHome={() => setCurrentScreen('home')} 
        />
      )}

      {currentScreen === 'admin' && (
        <AdminDashboard onLogoutSuccess={() => setCurrentScreen('login')} />
      )}

      {currentScreen === 'journey-request' && (
        <JourneyRequestPage
          currentUser={currentUserData}
          onBackToHome={() => setCurrentScreen('home')}
          onGoToPayment={() => setCurrentScreen('payment')} 
        />
      )}

      {currentScreen === 'login' && (
        <div className="min-h-screen bg-white flex items-center justify-center font-sans antialiased">
          <style>{`
            @keyframes floatPlane {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
            }
            .live-floating-plane { animation: floatPlane 3s ease-in-out infinite !important; }
          `}</style>
          
          <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-12 overflow-x-hidden bg-white">
            {/* Left Header / Branding Panel */}
            <div className="md:col-span-6 bg-[#1c7df2] p-6 md:p-12 flex flex-col justify-between text-white relative">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white transform -rotate-45" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z" />
                </svg>
                <span className="text-lg md:text-xl font-extrabold tracking-wide">Dream Journey Project</span>
              </div>

              <div className="my-8 md:my-auto flex items-center justify-center relative py-8 md:py-16">
                <div className="absolute w-48 h-48 md:w-80 md:h-80 border border-white/10 rounded-full pointer-events-none"></div>
                <div className="w-24 h-24 md:w-36 md:h-36 select-none live-floating-plane filter drop-shadow-2xl">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-white" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z" />
                  </svg>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                <h1 className="text-2xl md:text-4xl font-black tracking-tight">Explore The Skies</h1>
                <p className="text-white/80 text-xs md:text-sm font-medium">Join our exclusive community to make dream journeys reality.</p>
              </div>
            </div>

            {/* Right Auth Form Panel */}
            <div className="md:col-span-6 px-6 py-8 md:px-20 flex flex-col justify-center bg-white">
              <div className="flex justify-end items-center gap-8 mb-6 max-w-sm mx-auto w-full border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`pb-1 text-sm font-bold tracking-wide transition border-b-2 ${
                    authMode === 'login'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`pb-1 text-sm font-bold tracking-wide transition border-b-2 ${
                    authMode === 'signup'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-400'
                  }`}
                >
                  Signup
                </button>
              </div>

              <div className="max-w-md mx-auto w-full space-y-5">
                <h2 className="text-2xl md:text-3xl font-black text-slate-800">
                  {authMode === 'signup' ? 'Create Account 👋' : 'Welcome Back 👋'}
                </h2>

                <form className="space-y-4" onSubmit={handleAuthSubmit}>
                  {authMode === 'signup' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">First Name</label>
                        <input 
                          type="text" 
                          value={firstName} 
                          onChange={(e) => setFirstName(e.target.value)} 
                          required 
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white text-slate-800" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400">Last Name</label>
                        <input 
                          type="text" 
                          value={lastName} 
                          onChange={(e) => setLastName(e.target.value)} 
                          required 
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 bg-white text-slate-800" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="email@example.com" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-white text-slate-800" 
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 bg-white text-slate-800" 
                    />
                  </div>

                  {authMode === 'signup' && (
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400">Confirm Password</label>
                        {confirmPassword && (
                          password === confirmPassword ? (
                            <span className="text-xs font-bold text-emerald-500">✅ Passwords Match!</span>
                          ) : (
                            <span className="text-xs font-bold text-rose-500">❌ Not Matching</span>
                          )
                        )}
                      </div>

                      <div className="relative flex items-center">
                        <input 
                          type="password" 
                          placeholder="••••••••" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          required 
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none bg-white text-slate-800 pr-10 transition-all duration-200 ${
                            confirmPassword 
                              ? (password === confirmPassword ? 'border-emerald-500 focus:border-emerald-600 ring-1 ring-emerald-100' : 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-100') 
                              : 'border-slate-200 focus:border-blue-500'
                          }`} 
                        />
                        <div className="absolute right-3 text-sm pointer-events-none select-none">
                          {confirmPassword && (password === confirmPassword ? "🟢" : "🔴")}
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full bg-[#0091ff] hover:bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-md transition active:scale-[0.98]"
                  >
                    {authMode === 'signup' ? 'REGISTER ACCOUNT' : 'VERIFY ACCOUNT'}
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink mx-3 text-slate-300 text-[10px] font-bold tracking-widest">OR</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGoogleSignIn} 
                    className="w-full flex items-center justify-center gap-2.5 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition shadow-sm bg-white active:scale-[0.98]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.72z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.15 0-5.81-2.13-6.76-5.01H1.33v3.15C3.31 22.18 7.39 24 12 24z" />
                      <path fill="#FBBC05" d="M5.24 14.19c-.25-.72-.39-1.49-.39-2.29s.14-1.57.39-2.29V6.46H1.33C.48 8.15 0 10.02 0 12s.48 3.85 1.33 5.54l3.91-3.35z" />
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.22 0 12 0 7.39 0 3.31 1.82 1.33 5.54l3.91 3.35c.95-2.88 3.61-5.14 6.76-5.14z" />
                    </svg>
                    Continue with Google
                  </button>
                </form>
              </div>
            </div>
            <SpeedInsights />
          </div>
        </div>
      )}
    </>
  );
}