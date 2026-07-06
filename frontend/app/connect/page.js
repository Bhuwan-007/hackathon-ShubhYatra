"use client";
import { useState, useEffect } from "react";
import { 
  fetchNearbyBuddies, fetchMyConnections, updateUserVisibility, 
  sendBuddyRequest, respondToBuddyRequest, loginUser, registerUser, demoLoginUser 
} from "@/lib/api";
import { ShieldCheck, MapPin, Loader2, UserCheck, Users, MessageCircle, LogOut, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatView from "@/components/ChatView";

const MOCK_LOCATION = "Delhi";

export default function ConnectPage() {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState("discover"); 
  
  // Data state
  const [visibility, setVisibility] = useState(false);
  const [nearby, setNearby] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeChat, setActiveChat] = useState(null);

  // Login UI State
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Initialize Session
  useEffect(() => {
    const initSession = () => {
      const storedToken = localStorage.getItem("yatri_jwt");
      if (storedToken) {
        setToken(storedToken);
        // Decode JWT manually (naive split for demo purposes)
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          setUserId(payload.id);
        } catch (e) {
          localStorage.removeItem("yatri_jwt");
          setToken(null);
        }
      }
      setIsReady(true);
    };
    initSession();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("yatri_jwt");
    setToken(null);
    setUserId(null);
    setNearby([]);
    setConnections([]);
    setActiveChat(null);
  };

  const handleAuthError = (err) => {
    if (err.message === 'AUTH_EXPIRED') {
      handleLogout();
    } else {
      console.error(err);
    }
  };

  // Fetch Data
  useEffect(() => {
    if (!isReady || !token || !userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [nearbyData, connData] = await Promise.all([
          fetchNearbyBuddies(MOCK_LOCATION, token),
          fetchMyConnections(token)
        ]);
        setNearby(nearbyData);
        setConnections(connData);
        
        // Infer visibility state from myself (if I'm in my own nearby list... actually I'm excluded)
        // For a full app, we'd fetch the user's profile to get their current visibility.
        // We assume false initially unless toggled.
      } catch (err) {
        handleAuthError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isReady, token, userId, visibility]);

  const handleToggleVisibility = async () => {
    const newVal = !visibility;
    setVisibility(newVal);
    try {
      await updateUserVisibility(newVal, token);
    } catch (err) {
      setVisibility(!newVal); // revert
      handleAuthError(err);
    }
  };

  const handleSendRequest = async (recipientId) => {
    try {
      await sendBuddyRequest(recipientId, token);
      setNearby(prev => prev.filter(u => u._id !== recipientId));
    } catch (err) { handleAuthError(err); }
  };

  const handleRespond = async (connectionId, action) => {
    try {
      await respondToBuddyRequest(connectionId, action, token);
      const connData = await fetchMyConnections(token);
      setConnections(connData);
    } catch (err) { handleAuthError(err); }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthenticating(true);
    try {
      let data;
      if (isLoginMode) {
        data = await loginUser(email, password);
      } else {
        if (!displayName) throw new Error("Display Name required");
        data = await registerUser(email, password, displayName);
      }
      localStorage.setItem("yatri_jwt", data.token);
      setToken(data.token);
      setUserId(data.user.id);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDemoLogin = async () => {
    setAuthError("");
    setIsAuthenticating(true);
    try {
      const data = await demoLoginUser();
      localStorage.setItem("yatri_jwt", data.token);
      setToken(data.token);
      setUserId(data.user.id);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!isReady) return <div className="p-12 text-center text-stone-500">Initializing secure session...</div>;

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Secure Connection</h1>
          <p className="text-stone-500 text-sm mb-8">Sign in to connect with other verified travelers securely.</p>
          
          {authError && <div className="p-3 bg-red-50 text-red-600 text-sm font-semibold rounded-lg mb-4">{authError}</div>}
          
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" required />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" required />
            </div>
            
            <button type="submit" disabled={isAuthenticating} className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg transition-colors flex justify-center items-center gap-2">
              {isAuthenticating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-4">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
              {isLoginMode ? "Need an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>

          <div className="my-6 flex items-center gap-4 before:flex-1 before:border-t before:border-stone-200 after:flex-1 after:border-t after:border-stone-200">
            <span className="text-xs font-medium text-stone-400 uppercase">or</span>
          </div>

          <button onClick={handleDemoLogin} disabled={isAuthenticating} className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition-colors border border-emerald-200 shadow-sm">
            Continue as Demo User
          </button>
        </div>
      </div>
    );
  }

  if (activeChat) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <ChatView 
          connection={activeChat} 
          currentUserId={userId} 
          token={token}
          onBack={() => setActiveChat(null)} 
          onAuthError={handleAuthError}
        />
      </div>
    );
  }

  const pendingIncoming = connections.filter(c => c.recipientId && c.recipientId._id === userId && c.status === 'pending');
  const pendingOutgoing = connections.filter(c => c.requesterId && c.requesterId._id === userId && c.status === 'pending');
  const activeConnections = connections.filter(c => c.status === 'accepted');

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      
      {/* Header & Privacy Toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-emerald-600" />
            Safety Buddy
          </h1>
          <p className="text-sm text-stone-500 max-w-md leading-relaxed">
            Turning on visibility lets other verified travelers near you send connection requests. Your exact location is never shared until you actively accept and share it in chat.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3 shrink-0">
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-red-600 transition-colors bg-stone-100 hover:bg-red-50 px-3 py-1.5 rounded-md">
            <LogOut className="w-3 h-3" /> Log Out
          </button>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={visibility} onChange={handleToggleVisibility} />
            <div className="w-14 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            <span className="ml-3 text-sm font-bold text-stone-900">{visibility ? 'Visible' : 'Hidden'}</span>
          </label>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-stone-100 rounded-xl mb-8">
        {[
          { id: 'discover', label: 'Discover', icon: <MapPin className="w-4 h-4" /> },
          { id: 'requests', label: `Requests ${pendingIncoming.length > 0 ? `(${pendingIncoming.length})` : ''}`, icon: <UserCheck className="w-4 h-4" /> },
          { id: 'chats', label: 'Chats', icon: <MessageCircle className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all",
              activeTab === tab.id ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-700 hover:bg-stone-200/50"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-stone-300" /></div>
        ) : (
          <>
            {/* DISCOVER TAB */}
            {activeTab === 'discover' && (
              <div className="space-y-4">
                {nearby.length === 0 ? (
                  <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-100">
                    <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="font-bold text-stone-900 mb-1">No travelers nearby</h3>
                    <p className="text-sm text-stone-500">Make sure your visibility is turned on to see others.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {nearby.map(user => (
                      <div key={user._id} className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-stone-900 flex items-center gap-1.5">
                              {user.displayName}
                              {user.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                            </h3>
                            <div className="flex gap-2 mt-2">
                              {user.travelerType?.map(t => (
                                <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-1 rounded-md">{t}</span>
                              ))}
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center font-bold text-lg">
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleSendRequest(user._id)}
                          className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition-colors mt-auto"
                        >
                          Send Request
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* REQUESTS TAB */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">Incoming Requests</h3>
                  {pendingIncoming.length === 0 ? (
                    <div className="text-sm text-stone-500 bg-stone-50 p-4 rounded-xl border border-stone-100">You have no pending requests.</div>
                  ) : (
                    <div className="space-y-3">
                      {pendingIncoming.map(conn => (
                        <div key={conn._id} className="bg-white p-4 rounded-xl border border-stone-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                              {conn.requesterId?.displayName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900">{conn.requesterId?.displayName}</div>
                              <div className="text-xs text-stone-500">Wants to connect in {conn.requesterId?.currentLocation}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleRespond(conn._id, 'decline')} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-semibold rounded-lg transition-colors">Decline</button>
                            <button onClick={() => handleRespond(conn._id, 'accept')} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors">Accept</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CHATS TAB */}
            {activeTab === 'chats' && (
              <div className="space-y-3">
                {activeConnections.length === 0 ? (
                  <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-100">
                    <MessageCircle className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="font-bold text-stone-900 mb-1">No active connections yet</h3>
                    <p className="text-sm text-stone-500">Head to Discover to find nearby travelers.</p>
                  </div>
                ) : (
                  activeConnections.map(conn => {
                    const buddy = conn.requesterId._id === userId ? conn.recipientId : conn.requesterId;
                    return (
                      <button 
                        key={conn._id} 
                        onClick={() => setActiveChat(conn)}
                        className="w-full bg-white p-4 rounded-xl border border-stone-200 flex items-center gap-4 hover:border-emerald-400 transition-colors text-left"
                      >
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                          {buddy?.displayName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            {buddy?.displayName}
                            {buddy?.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                          </div>
                          <div className="text-sm text-stone-500">Tap to view chat and location tools</div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
