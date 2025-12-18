
import React, { useState, useEffect, useMemo } from 'react';
import { LifestyleData, UserProfile, MatchResult, Gender, RoommateRequest, RequestStatus } from './types';
import { INITIAL_LIFESTYLE } from './constants';
import { findMatches } from './services/matchingService';
import { 
  saveUserProfile, 
  fetchAllOtherUsers, 
  auth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  getUserProfile,
  initializeUserRecord,
  sendRoommateRequest,
  updateRequestStatus
} from './services/firebaseService';
import LifestyleSlider from './components/LifestyleSlider';
import MatchCard from './components/MatchCard';

const App: React.FC = () => {
  const [step, setStep] = useState<'auth' | 'welcome' | 'questionnaire' | 'dashboard'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbUsers, setDbUsers] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [appError, setAppError] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserProfile>({
    id: '',
    email: '',
    name: '',
    avatar: '',
    bio: '',
    occupation: '',
    age: 22,
    gender: 'male',
    allowOppositeGender: false,
    lifestyle: { ...INITIAL_LIFESTYLE },
    sentRequests: [],
    acceptedRequests: [],
    rejectedRequests: []
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAppError(null);
      if (user) {
        setCurrentUser(user);
        setLoading(true);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile && profile.name) {
            setUserData(profile);
            setStep('dashboard');
          } else {
            setUserData(prev => ({
              ...prev,
              id: user.uid,
              email: user.email || '',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
            }));
            setStep('welcome');
          }
        } catch (error: any) {
          setAppError("Connecting to sync service...");
        }
        setLoading(false);
      } else {
        setCurrentUser(null);
        setStep('auth');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (step === 'dashboard' && currentUser) {
      loadDashboardData();
    }
  }, [step, currentUser]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profile, others] = await Promise.all([
        getUserProfile(currentUser.uid),
        fetchAllOtherUsers(currentUser.uid)
      ]);

      if (profile) setUserData(profile);
      setDbUsers(others || []);
    } catch (error: any) {
      setAppError("Error loading community data.");
    }
    setLoading(false);
  };

  /**
   * Derive incoming requests:
   * Users who have me in their 'sentRequests' AND I haven't accepted or rejected them yet.
   */
  const incomingRequests = useMemo(() => {
    return dbUsers
      .filter(other => 
        other.sentRequests?.includes(userData.id) && 
        !userData.acceptedRequests?.includes(other.id) &&
        !userData.rejectedRequests?.includes(other.id)
      )
      .map(other => ({
        id: `${other.id}_${userData.id}`,
        fromId: other.id,
        toId: userData.id,
        fromName: other.name,
        fromAvatar: other.avatar,
        status: RequestStatus.PENDING,
        timestamp: new Date().toISOString()
      }));
  }, [dbUsers, userData]);

  /**
   * Derive sent requests:
   * Users I have in my 'sentRequests' who haven't accepted me yet.
   */
  const sentRequests = useMemo(() => {
    return dbUsers
      .filter(other => 
        userData.sentRequests?.includes(other.id) &&
        !other.acceptedRequests?.includes(userData.id) &&
        !userData.acceptedRequests?.includes(other.id)
      )
      .map(other => ({
        id: other.id,
        name: other.name,
        avatar: other.avatar
      }));
  }, [dbUsers, userData]);

  const handleRequestAction = async (senderId: string, status: RequestStatus) => {
    if (!currentUser) return;
    try {
      await updateRequestStatus(userData.id, senderId, status);
      await loadDashboardData();
    } catch (e) {
      setAppError("Failed to update response.");
    }
  };

  const matches = useMemo(() => {
    if (step !== 'dashboard') return [];
    return findMatches(userData, dbUsers);
  }, [dbUsers, userData, step]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAppError(null);
    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await initializeUserRecord(userCredential.user.uid, email);
        }
      }
    } catch (error: any) {
      setAppError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'signup' : 'login');
    setEmail('');
    setPassword('');
    setAppError(null);
  };

  const handleComplete = async () => {
    if (!userData.name || !userData.occupation || !userData.age) {
      setAppError("Please fill in all details.");
      return;
    }
    setLoading(true);
    try {
      await saveUserProfile(userData);
      setStep('dashboard');
    } catch (error: any) {
      setAppError("Could not save profile.");
    } finally {
      setLoading(false);
    }
  };

  const updateLifestyle = (key: keyof LifestyleData, value: any) => {
    setUserData(prev => ({
      ...prev,
      lifestyle: { ...prev.lifestyle, [key]: value }
    }));
  };

  const getRequestStatusForUser = (targetUserId: string) => {
    const hasAcceptedMe = dbUsers.find(u => u.id === targetUserId)?.acceptedRequests?.includes(userData.id);
    const iHaveAcceptedThem = userData.acceptedRequests?.includes(targetUserId);

    if (hasAcceptedMe || iHaveAcceptedThem) {
      return RequestStatus.ACCEPTED;
    }
    
    if (userData.sentRequests?.includes(targetUserId)) {
      return RequestStatus.PENDING;
    }
    
    return undefined;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f2f5]">
      {step !== 'auth' && (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold">R</div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                RoomieSync
              </span>
            </div>
            {currentUser && (
              <button onClick={() => signOut(auth)} className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest">Logout</button>
            )}
          </div>
        </header>
      )}

      {appError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-rose-50 border border-rose-100 px-6 py-3 rounded-2xl text-rose-800 text-sm font-medium shadow-xl animate-in fade-in slide-in-from-top-4">
          {appError}
          <button onClick={() => setAppError(null)} className="ml-4 font-bold underline">Dismiss</button>
        </div>
      )}

      <main className="flex-1 flex flex-col">
        {step === 'auth' && (
          <div className="flex-1 flex items-center justify-center p-6 bg-[#f0f2f5]">
            <div className="max-w-[480px] w-full bg-white rounded-[60px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] p-12 md:p-16 border border-slate-50">
              <h2 className="text-[32px] font-bold text-slate-900 mb-12 tracking-tight">
                {authMode === 'login' ? 'Login' : 'Create Account'}
              </h2>
              <form onSubmit={handleAuth} className="space-y-8" autoComplete="off">
                <div className="space-y-6">
                  <input type="email" placeholder="Enter Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-6 bg-[#f8fafc] border border-[#f1f5f9] rounded-[28px] outline-none focus:bg-white focus:border-[#5246f2] transition-all" required />
                  <input type="password" placeholder="Enter Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-6 bg-[#f8fafc] border border-[#f1f5f9] rounded-[28px] outline-none focus:bg-white focus:border-[#5246f2] transition-all" required />
                </div>
                <button type="submit" disabled={loading} className="w-full py-6 bg-[#5246f2] text-white rounded-[32px] font-bold text-xl shadow-[0_20px_40px_-10px_rgba(82,70,242,0.4)] hover:scale-[1.02] transition-all disabled:opacity-50">
                  {loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>
              <button onClick={toggleAuthMode} className="w-full mt-12 text-base font-semibold text-[#5246f2] hover:text-[#4338ca] transition-colors">
                {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </button>
            </div>
          </div>
        )}

        {step === 'welcome' && (
          <div className="flex-1 flex items-center justify-center p-6 text-center space-y-10 animate-in fade-in zoom-in-95">
            <div>
              <div className="bg-indigo-50 w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl mx-auto mb-8">🏠</div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Welcome home.</h1>
              <p className="text-slate-500 text-lg mt-4">Let's build your lifestyle profile to find your perfect match.</p>
              <button onClick={() => setStep('questionnaire')} className="mt-10 px-12 py-5 bg-[#5246f2] text-white rounded-[24px] font-bold text-lg shadow-xl hover:-translate-y-1 transition-all">Start Setup</button>
            </div>
          </div>
        )}

        {step === 'questionnaire' && (
          <div className="max-w-3xl mx-auto w-full px-4 py-12">
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-8 md:p-14 space-y-14">
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-slate-900">Tell us about you</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} className="w-full p-5 bg-slate-50 rounded-[24px] outline-none focus:bg-white border border-transparent focus:border-indigo-600 transition-all" placeholder="Your Name" />
                  <input type="number" value={userData.age} onChange={e => setUserData({...userData, age: parseInt(e.target.value) || 18})} className="w-full p-5 bg-slate-50 rounded-[24px] outline-none focus:bg-white border border-transparent focus:border-indigo-600 transition-all" placeholder="Age" />
                  <input type="text" className="md:col-span-2 w-full p-5 bg-slate-50 rounded-[24px] outline-none focus:bg-white border border-transparent focus:border-indigo-600 transition-all" value={userData.occupation} onChange={e => setUserData({...userData, occupation: e.target.value})} placeholder="Occupation" />
                </div>
                <textarea value={userData.bio} onChange={e => setUserData({...userData, bio: e.target.value})} className="w-full p-6 bg-slate-50 rounded-[32px] h-32 outline-none focus:bg-white border border-transparent focus:border-indigo-600 transition-all text-lg resize-none" placeholder="Tell us a little about yourself..." />
              </div>

              <div className="space-y-10">
                <h2 className="text-2xl font-bold text-slate-900">Lifestyle Tuning</h2>
                <div className="space-y-8">
                   <LifestyleSlider label="Sleep" leftLabel="Late Night" rightLabel="Early Bird" value={userData.lifestyle.sleep} onChange={v => updateLifestyle('sleep', v)} />
                   <LifestyleSlider label="Vibe" leftLabel="Social/Loud" rightLabel="Quiet/Private" value={userData.lifestyle.noise} onChange={v => updateLifestyle('noise', v)} />
                   <LifestyleSlider label="Cleanliness" leftLabel="Relaxed" rightLabel="Obsessive" value={userData.lifestyle.cleanliness} onChange={v => updateLifestyle('cleanliness', v)} />
                   
                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <button onClick={() => updateLifestyle('smoking', !userData.lifestyle.smoking)} className={`py-5 rounded-[24px] font-bold text-sm border flex items-center justify-center gap-2 transition-all ${userData.lifestyle.smoking ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-500'}`}>
                        {userData.lifestyle.smoking ? '💨 Smoker' : '🚭 Non-Smoker'}
                      </button>
                      <button onClick={() => updateLifestyle('pets', !userData.lifestyle.pets)} className={`py-5 rounded-[24px] font-bold text-sm border flex items-center justify-center gap-2 transition-all ${userData.lifestyle.pets ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500'}`}>
                        {userData.lifestyle.pets ? '🐾 Has Pets' : '🚫 No Pets'}
                      </button>
                   </div>
                </div>
              </div>

              <button onClick={handleComplete} disabled={loading} className="w-full py-6 bg-[#5246f2] text-white rounded-[32px] font-bold text-xl shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50">
                {loading ? 'Saving Profile...' : 'Complete Profile'}
              </button>
            </div>
          </div>
        )}

        {step === 'dashboard' && (
          <div className="max-w-6xl mx-auto w-full px-4 py-12">
            <div className="flex flex-col md:flex-row gap-12">
              <div className="w-full md:w-1/4 space-y-8">
                <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm sticky top-28 text-center animate-in fade-in slide-in-from-left-8">
                  <img src={userData.avatar} className="w-24 h-24 rounded-full mx-auto border-4 border-slate-50 mb-6" alt="Me" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">{userData.name}, {userData.age}</h3>
                  <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-8">{userData.gender}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-8">
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Received</p>
                      <p className="text-lg font-black text-indigo-600">{incomingRequests.length}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Sent</p>
                      <p className="text-lg font-black text-slate-600">{sentRequests.length}</p>
                    </div>
                  </div>

                  <button onClick={() => setStep('questionnaire')} className="w-full py-3 text-xs font-bold text-slate-400 hover:text-indigo-600 border border-slate-100 rounded-xl transition-all">Edit Preferences</button>
                </div>

                {sentRequests.length > 0 && (
                  <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-left-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Pending Outgoing</h4>
                    <div className="space-y-3">
                      {sentRequests.map(req => (
                        <div key={req.id} className="flex items-center gap-3">
                          <img src={req.avatar} className="w-8 h-8 rounded-full border border-slate-50" />
                          <span className="text-xs font-bold text-slate-700">{req.name}</span>
                          <span className="ml-auto w-2 h-2 bg-amber-400 rounded-full"></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-12 animate-in fade-in slide-in-from-right-8">
                {incomingRequests.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Incoming Roommate Invites</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {incomingRequests.map(req => (
                        <div key={req.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between animate-in slide-in-from-top-2">
                          <div className="flex items-center gap-4">
                            <img src={req.fromAvatar} className="w-12 h-12 rounded-full border-2 border-slate-50" />
                            <div>
                              <p className="font-bold text-slate-900">{req.fromName}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sent you a request</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleRequestAction(req.fromId, RequestStatus.ACCEPTED)} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors">✓</button>
                            <button onClick={() => handleRequestAction(req.fromId, RequestStatus.REJECTED)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-8">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Compatible Community</h2>
                  {loading ? (
                    <div className="py-32 text-center text-slate-400 font-bold animate-pulse">Scanning neighbors...</div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {matches.map(m => (
                        <MatchCard key={m.id} match={m} currentUser={userData} requestStatus={getRequestStatusForUser(m.id)} />
                      ))}
                      {matches.length === 0 && (
                        <div className="col-span-full py-32 bg-white rounded-[40px] border border-dashed border-slate-200 text-center text-slate-400 font-bold">
                          No compatible roommates found yet.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-12 text-center opacity-30 text-[10px] font-bold uppercase tracking-[0.2em]">
        RoomieSync - Building Brighter Shares.
      </footer>
    </div>
  );
};

export default App;
