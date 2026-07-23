import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup 
} from "firebase/auth";
import { doc, setDoc, updateDoc, increment, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [isLoginTab, setIsLoginTab] = useState(true); // Toggle Login & Signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Referral code detect karna
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      localStorage.setItem("referredBy", refCode);
      console.log("Referral code saved:", refCode);
    }
  }, []);

  // Google Sign-In Handler
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore mein user document check/create
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          createdAt: new Date(),
          referralCount: 0,
        });

        // Referral logic
        const referrerId = localStorage.getItem("referredBy");
        if (referrerId) {
          try {
            await updateDoc(doc(db, "users", referrerId), {
              referralCount: increment(1),
            });
            localStorage.removeItem("referredBy");
          } catch (refErr) {
            console.error("Referral error:", refErr);
          }
        }
      }

      alert("🎉 Google Login Successful!");
    } catch (error) {
      console.error("Google Auth Error:", error);
      alert(`🚨 Google Sign-In Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Form Submit Handler (Login & Signup)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("🚨 Kripya email aur password dono bharein!");
      return;
    }

    if (!isLoginTab && password !== confirmPassword) {
      alert("❌ Passwords match nahi ho rahe hain!");
      return;
    }

    if (password.length < 6) {
      alert("⚠️ Password kam se kam 6 characters ka hona chahiye!");
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginTab) {
        // --- LOGIN LOGIC ---
        await signInWithEmailAndPassword(auth, email, password);
        alert("✅ Login Successful!");
      } else {
        // --- SIGNUP LOGIC ---
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: new Date(),
          referralCount: 0,
        });

        // Referral Count Increment
        const referrerId = localStorage.getItem("referredBy");
        if (referrerId) {
          try {
            await updateDoc(doc(db, "users", referrerId), {
              referralCount: increment(1),
            });
            localStorage.removeItem("referredBy");
          } catch (refError) {
            console.error("Referral Error:", refError);
          }
        }

        await sendEmailVerification(user);
        alert("📩 Account ban gaya! Email par verification link bhej diya gaya hai.");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      console.error("Auth Error:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("🚨 Yeh email pehle se registered hai!");
      } else if (error.code === "auth/invalid-credential") {
        alert("❌ Galat Email ya Password!");
      } else {
        alert(`🚨 Request Failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "20px auto", padding: "20px", fontFamily: "sans-serif" }}>
      {/* Tab Header (Login / Signup Switch) */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
        <button
          onClick={() => setIsLoginTab(true)}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            fontWeight: "bold",
            color: isLoginTab ? "#00a8e8" : "#888",
            borderBottom: isLoginTab ? "2px solid #00a8e8" : "none",
            cursor: "pointer",
            paddingBottom: "5px"
          }}
        >
          Login
        </button>
        <button
          onClick={() => setIsLoginTab(false)}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            fontWeight: "bold",
            color: !isLoginTab ? "#00a8e8" : "#888",
            borderBottom: !isLoginTab ? "2px solid #00a8e8" : "none",
            cursor: "pointer",
            paddingBottom: "5px"
          }}
        >
          Signup
        </button>
      </div>

      <h2>{isLoginTab ? "Welcome Back 👋" : "Create Account 👋"}</h2>

      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }}
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }}
          />
        </div>

        {/* Confirm Password Field (Only for Signup) */}
        {!isLoginTab && (
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ccc", boxSizing: "border-box" }}
            />
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "14px",
            backgroundColor: "#00a8e8",
            color: "#fff",
            border: "none",
            borderRadius: "25px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            marginBottom: "15px"
          }}
        >
          {isLoading ? "Processing..." : isLoginTab ? "LOGIN 🚀" : "VERIFY ACCOUNT 🚀"}
        </button>
      </form>

      {/* OR Divider */}
      <div style={{ textAlign: "center", color: "#888", margin: "15px 0" }}>OR</div>

      {/* Google Sign In Button */}
      <button
        onClick={handleGoogleAuth}
        disabled={isLoading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#fff",
          color: "#333",
          border: "1px solid #ccc",
          borderRadius: "25px",
          fontWeight: "bold",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px"
        }}
      >
        <span>G</span> Continue with Google
      </button>
    </div>
  );
}