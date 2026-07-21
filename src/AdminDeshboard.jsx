import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  increment, 
  where, 
  getDocs 
} from 'firebase/firestore';

import { db, auth } from './firebase'; // Agar aapki file ka naam chote 'f' se hai
import { signOut } from "firebase/auth";
export default function AdminDashboard({ onLogoutSuccess }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, contributions, requests

  // Real-time Database States
  const [users, setUsers] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [journeyRequests, setJourneyRequests] = useState([]);

  // Live Sync Ledger from Firebase
  useEffect(() => {
    // 1. Fetch Users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    });

    // 2. Fetch Contributions (Latest First)
    const qContributions = query(collection(db, 'contributions'), orderBy('createdAt', 'desc'));
    const unsubscribeContributions = onSnapshot(qContributions, (snapshot) => {
      const contribsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContributions(contribsList);
    });

    // 3. Fetch Journey Requests
    const unsubscribeRequests = onSnapshot(collection(db, 'journeyRequests'), (snapshot) => {
      const reqsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJourneyRequests(reqsList);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeContributions();
      unsubscribeRequests();
    };
  }, []);

  // --- Calculate Overview Metrics ---
  const totalUsers = users.length;
  const pendingContributionsCount = contributions.filter(c => c.status === 'Pending').length;
  const totalApprovedFunds = contributions
    .filter(c => c.status === 'Verified')
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const pendingRequestsCount = journeyRequests.filter(r => r.status === 'Pending').length;

  const handleUpdateContributionStatus = async (id, newStatus, userUid, referredByCode) => {
  try {
    // 1. Status badlo
    await updateDoc(doc(db, 'contributions', id), { status: newStatus });
   // alert(`Payment status successfully marked as: ${newStatus}`);

    if (newStatus === 'Verified') {
      // A. Naye user ko verify karo
      if (userUid) {
        await updateDoc(doc(db, "users", userUid), { isVerified: true });
      }

      // B. Referral count badhao
      if (referredByCode && referredByCode.trim() !== "") {
        // dynamic import line hata kar direct standard methods use karo
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("referralCode", "==", referredByCode));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const referrerDoc = querySnapshot.docs[0];
          const referrerRef = doc(db, "users", referrerDoc.id);

          await updateDoc(referrerRef, {
            referralCount: increment(1)
          });
          console.log("Count increased successfully!");
        } else {
          console.log("Referral code database mein nahi mila.");
        }
      }
    }
  } catch (error) {
    console.error("Error updating ledger or referral status: ", error);
  }
};

  const handleUpdateRequestStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'journeyRequests', id), { status: newStatus });
      alert(`Journey request status updated to: ${newStatus}`);
    } catch (error) {
      console.error("Error updating journey token: ", error);
    }
  };

  const handleToggleBlockUser = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
      await updateDoc(doc(db, 'users', id), { accountStatus: nextStatus });
    } catch (error) {
      console.error("User configuration hook failed: ", error);
    }
  };

  const handleDeleteUserNode = async (id) => {
    if (window.confirm("🚨 Are you absolutely sure you want to purge this user from core database?")) {
      try {
        await deleteDoc(doc(db, 'users', id));
      } catch (error) {
        console.error("Purge operations crashed: ", error);
      }
    }
  };

const handleAdminSignOut = async () => {
    try {
        await signOut(auth);
        if (onLogoutSuccess) onLogoutSuccess();
    } catch (error) {
        console.error("Signout failed: ", error);
    }
};

  return (
    <div className="min-h-screen bg-[#061325] text-slate-100 font-sans flex flex-col md:flex-row antialiased w-full">
      
      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="w-full md:w-64 bg-[#0b1e36] border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs">A</div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-white uppercase">Control Center</h1>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Root Authority
              </span>
            </div>
          </div>

          <nav className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0">
            <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-[#0ea5e9] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>📊 Terminal Matrix</button>
            <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-[#0ea5e9] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>👥 Core Users ({totalUsers})</button>
            <button onClick={() => setActiveTab('contributions')} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${activeTab === 'contributions' ? 'bg-[#0ea5e9] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>💰 Ledgers ({pendingContributionsCount})</button>
            <button onClick={() => setActiveTab('requests')} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all whitespace-nowrap ${activeTab === 'requests' ? 'bg-[#0ea5e9] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>✈️ Requests ({pendingRequestsCount})</button>
          </nav>
        </div>

        <button 
  onClick={handleAdminSignOut} 
  className="hidden md:flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full mt-auto"
>
  Shutdown Console
</button>
      </aside>

      {/* ================= RIGHT WORKSPACE HUB ================= */}
      <main className="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="border-b border-white/5 pb-4">
              <h2 className="text-2xl font-black text-white tracking-tight">System Infrastructure Live Telemetry</h2>
              <p className="text-xs text-slate-400 mt-1">Real-time parameters monitoring terminal logs.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#0b1e36] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Total Registered Users</span>
                <span className="text-3xl font-black text-white mt-2 block">{totalUsers}</span>
              </div>
              <div className="bg-[#0b1e36] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Approved Pool Capital</span>
                <span className="text-3xl font-black text-emerald-400 mt-2 block">₹{totalApprovedFunds}</span>
              </div>
              <div className="bg-[#0b1e36] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Pending UTR Verification</span>
                <span className="text-3xl font-black text-amber-500 mt-2 block">{pendingContributionsCount}</span>
              </div>
              <div className="bg-[#0b1e36] border border-white/5 p-5 rounded-2xl relative overflow-hidden">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Active Journey Tickets</span>
                <span className="text-3xl font-black text-sky-400 mt-2 block">{pendingRequestsCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-white tracking-tight border-b border-white/5 pb-3">User Core Node Management</h2>
            <div className="bg-[#0b1e36] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-black uppercase text-[9px] tracking-widest bg-[#071325]/50">
                      <th className="p-4">Identity Name</th>
                      <th className="p-4">Email Coordinates</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Operational Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5 font-semibold transition-colors">
                        <td className="p-4 font-bold text-white">{u.name || 'Unnamed Guest'}</td>
                        <td className="p-4 font-mono text-slate-400">{u.email || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wide rounded-md border ${u.accountStatus === 'Blocked' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                            {u.accountStatus || 'Active'}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2 justify-center">
                          <button onClick={() => handleToggleBlockUser(u.id, u.accountStatus)} className="bg-amber-500/10 hover:bg-amber-600 text-amber-400 hover:text-white border border-amber-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">
                            {u.accountStatus === 'Blocked' ? 'Unblock' : 'Block'}
                          </button>
                          <button onClick={() => handleDeleteUserNode(u.id)} className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">Purge</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTRIBUTIONS TAB (UTR VERIFICATION) */}
        {activeTab === 'contributions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-white tracking-tight border-b border-white/5 pb-3">Capital Contribution Ledger Logs</h2>
            <div className="bg-[#0b1e36] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-black uppercase text-[9px] tracking-widest bg-[#071325]/50">
                      <th className="p-4">User</th>
                      <th className="p-4">Bank UTR Token</th>
                      <th className="p-4">Value Core</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">State Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map(c => (
                      <tr key={c.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5 font-semibold transition-colors">
                        <td className="p-4 font-bold text-white">{c.userName || 'Unknown'}</td>
                        <td className="p-4 font-mono text-sky-400 select-all text-sm font-bold tracking-wide">{c.utr}</td>
                        <td className="p-4 font-black text-emerald-400 text-sm">₹{c.amount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wide rounded-md border ${c.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : c.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{c.status || 'Pending'}</span>
                        </td>
                        <td className="p-4 flex gap-2 justify-center">
                          {/* Line 262: Verify Button */}
{c.status !== 'Verified' && <button onClick={() => handleUpdateContributionStatus(c.id, 'Verified', c.userId || c.uid, c.referredByCode || "")} className="font-black uppercase tracking-wider transition-all">Verify</button>}

{/* Line 263: Reject Button (Isko normal rehne do bas variables align rahein) */}
{c.status !== 'Rejected' && <button onClick={() => handleUpdateContributionStatus(c.id, 'Rejected')} className="font-black uppercase tracking-wider transition-all">Reject</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-xl font-black text-white tracking-tight border-b border-white/5 pb-3">Dream Journey Request Pipeline</h2>
            <div className="bg-[#0b1e36] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-black uppercase text-[9px] tracking-widest bg-[#071325]/50">
                      <th className="p-4">Explorer</th>
                      <th className="p-4">Target Destination</th>
                      <th className="p-4">Manifesto Text</th>
                      <th className="p-4">Pipeline Status</th>
                      <th className="p-4 text-center">Pipeline Handlers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {journeyRequests.map(r => (
                      <tr key={r.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5 font-semibold transition-colors">
                        <td className="p-4 font-bold text-white">{r.userName || 'Explorer'}</td>
                        <td className="p-4 text-sky-400 font-bold">📍 {r.destination}</td>
                        <td className="p-4 truncate max-w-[200px] text-slate-400 italic">"{r.reason || 'No text declared.'}"</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wide rounded-md border ${r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : r.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{r.status || 'Pending'}</span>
                        </td>
                        <td className="p-4 flex gap-2 justify-center">
                          {r.status !== 'Approved' && <button onClick={() => handleUpdateRequestStatus(r.id, 'Approved')} className="bg-emerald-500/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">Approve</button>}
                          {r.status !== 'Rejected' && <button onClick={() => handleUpdateRequestStatus(r.id, 'Rejected')} className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">Deny</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}