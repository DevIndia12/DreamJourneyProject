import React, { useState, useEffect } from 'react';
import { auth, db } from "./firebase"; // 👈 Ensure 'db' is exported from your firebase config file
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🎯 Step 1: URL se ?ref=USER_UID nikal kar local storage mein store karna
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      localStorage.setItem('referredBy', refCode);
      console.log("Referral code detected and saved:", refCode);
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault(); // Page reload hone se rokne ke liye

    // Check 1: Saari fields bhari honi chahiye
    if (!email || !password || !confirmPassword) {
      alert("🚨 Kripya saari details dhayan se bharein!");
      return;
    }

    // Check 2: Dono passwords match hone chahiye
    if (password !== confirmPassword) {
      alert("❌ Passwords match nahi ho rahe hain! Dobara check karein.");
      return;
    }

    // Check 3: Firebase minimum 6 character ka password mangta hai
    if (password.length < 6) {
      alert("⚠️ Security ke liye password kam se kam 6 characters ka hona chahiye!");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Firebase Auth se User Create karo
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🎯 Step 2: Naye user ka data Firestore mein set karo
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        createdAt: new Date(),
        referralCount: 0 // Shuruat mein iska khud ka count 0 rahega
      });

      // 🎯 Step 3: Check karo ki kya yeh kisi ke referral link se aaya hai
      const referrerId = localStorage.getItem('referredBy');
      if (referrerId) {
        try {
          // Purane user (referrer) ke document mein referralCount ko +1 increment karo
          const referrerRef = doc(db, "users", referrerId);
          await updateDoc(referrerRef, {
            referralCount: increment(1)
          });
          
          console.log("Referral successfully counted for user:", referrerId);
          
          // Kaam khatam hone ke baad memory se code hata do
          localStorage.removeItem('referredBy');
        } catch (refError) {
          console.error("Referral update karne mein error:", refError);
        }
      }

      // 4. Real user check karne ke liye automatic verification email bhejo
      await sendEmailVerification(user);
      
      alert("📩 Account successfully ban gaya hai! Aapki email par ek verification link bheja gaya hai. Kripya use verify karke login karein.");
      
      // Form fields ko wapas khali kar do
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error("Auth Error:", error);
      // Agar email pehle se register ho toh uski warning
      if (error.code === 'auth/email-already-in-use') {
        alert("🚨 Yeh email address pehle se register hai!");
      } else {
        alert("🚨 'Registration failed: ${error.message}");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Create Account 👋</h2>
      <form onSubmit={handleRegister}>
        
        {/* Email Address Input */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email Address</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="email@example.com" 
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="**" 
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Confirm Password Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Confirm Password</label>
          <input 
            type="password" 
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            placeholder="**" 
            style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            width: "100%", 
            padding: "12px", 
            backgroundColor: "#00a8e8", 
            color: "#fff", 
            border: "none", 
            borderRadius: "25px", 
            fontWeight: "bold", 
            cursor: "pointer" 
          }}
        >
          {isLoading ? "Processing..." : "VERIFY & CREATE ACCOUNT 🚀"}
        </button>

      </form>
    </div>
  );
}