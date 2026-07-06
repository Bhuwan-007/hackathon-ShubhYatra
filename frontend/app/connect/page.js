"use client";
import { useState, useEffect } from "react";
import { 
  fetchNearbyBuddies, fetchMyConnections, updateUserVisibility, 
  sendBuddyRequest, respondToBuddyRequest, loginUser, registerUser, demoLoginUser, updateUserLocation 
} from "@/lib/api";
import { ShieldCheck, MapPin, Loader2, UserCheck, Users, MessageCircle, LogOut, Key, Map, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatView from "@/components/ChatView";
import { useAuth } from "@/context/AuthContext";

export default function ConnectPage() {
  const { token, user, isReady, login, logout, updateUserLocationState } = useAuth();
  
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
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Location Permission State
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [locationError, setLocationError] = useState("");

  const handleAuthError = (err) => {
    if (err.message === 'AUTH_EXPIRED') {
      logout();
    } else {
      console.error(err);
    }
  };

  // Fetch Data
  useEffect(() => {
    if (!isReady || !token || !user || !user.currentLocation) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [nearbyData, connData] = await Promise.all([
          fetchNearbyBuddies(user.currentLocation, token),
          fetchMyConnections(token)
        ]);
        setNearby(nearbyData);
        setConnections(connData);
      } catch (err) {
        handleAuthError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isReady, token, user, visibility]);

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
      login(data.token, data.user);
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
      login(data.token, data.user);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const requestLocation = () => {
    setIsRequestingLocation(true);
    setLocationError("");
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsRequestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`, {
            headers: { 'User-Agent': 'ShubhYatraApp/1.0' }
          });
          const data = await res.json();
          const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state || 'Unknown Location';
          
          await updateUserLocation(city, token);
          updateUserLocationState(city);
        } catch (err) {
          setLocationError("Failed to auto-detect location. Please enter it manually.");
        } finally {
          setIsRequestingLocation(false);
        }
      },
      (error) => {
        setLocationError("Location permission denied. Please enter it manually.");
        setIsRequestingLocation(false);
      }
    );
  };

  const handleManualLocationSubmit = async (e) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    setIsRequestingLocation(true);
    try {
      await updateUserLocation(manualLocation.trim(), token);
      updateUserLocationState(manualLocation.trim());
    } catch (err) {
      setLocationError("Failed to save location.");
    } finally {
      setIsRequestingLocation(false);
    }
  };

  if (!isReady) return <div className="p-12 text-center text-stone-500">Initializing secure session...</div>;

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
          <div className="w-16 h-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-display text-text-main mb-2">Secure Connection</h1>
          <p className="text-text-main/70 text-sm mb-8">Sign in to connect with other verified travelers securely.</p>
          
          {authError && <div className="p-3 bg-alert/10 text-alert border border-alert/20 text-sm font-bold rounded-lg mb-4">{authError}</div>}
          
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold text-text-main/60 uppercase tracking-wider mb-1">Display Name</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-2 bg-white/50 border border-white/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-inner transition-all" required />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-text-main/60 uppercase tracking-wider mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 bg-white/50 border border-white/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-inner transition-all" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-main/60 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full px-4 py-2 pr-10 bg-white/50 border border-white/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-inner transition-all" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-main/40 hover:text-text-main/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button type="submit" disabled={isAuthenticating} className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 shadow-md">
              {isAuthenticating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-4">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              {isLoginMode ? "Need an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>

          <div className="my-6 flex items-center gap-4 before:flex-1 before:border-t before:border-white/40 after:flex-1 after:border-t after:border-white/40">
            <span className="text-xs font-bold text-text-main/40 uppercase">or</span>
          </div>

          <button onClick={handleDemoLogin} disabled={isAuthenticating} className="w-full py-3 bg-white/50 hover:bg-white/80 text-text-main font-bold rounded-lg transition-colors border border-white/60 shadow-sm">
            Continue as Demo User
          </button>
        </div>
      </div>
    );
  }

  // LOCATION PERMISSION FLOW
  if (!user.currentLocation || user.currentLocation.trim() === "") {
    return (
      <div className="max-w-md mx-auto px-6 py-20">
        <div className="bg-white/40 backdrop-blur-xl p-8 rounded-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center">
          <div className="w-16 h-16 bg-accent/20 text-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold font-display text-text-main mb-2">Set Your Location</h1>
          <p className="text-text-main/70 text-sm mb-6 leading-relaxed">
            To find nearby travelers, AegisCircle needs your current location. This is only used to match you with others who opt in — it's never shown to anyone unless you choose to share it.
          </p>
          
          {locationError && <div className="p-3 bg-alert/10 text-alert border border-alert/20 text-sm font-bold rounded-lg mb-4">{locationError}</div>}

          <div className="space-y-3">
            <button 
              onClick={requestLocation} 
              disabled={isRequestingLocation}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white shadow-md font-bold rounded-lg transition-colors flex justify-center items-center gap-2"
            >
              {isRequestingLocation && <Loader2 className="w-4 h-4 animate-spin" />}
              Grant Permission
            </button>

            <form onSubmit={handleManualLocationSubmit} className="pt-4 border-t border-white/40 flex gap-2">
              <input 
                type="text" 
                placeholder="Or enter city manually (e.g. Delhi)"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/50 border border-white/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-inner placeholder:text-text-main/40 transition-all"
              />
              <button 
                type="submit" 
                disabled={isRequestingLocation || !manualLocation.trim()}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (activeChat) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <ChatView 
          connection={activeChat} 
          currentUserId={user.id} 
          token={token}
          onBack={() => setActiveChat(null)} 
          onAuthError={handleAuthError}
        />
      </div>
    );
  }

  const pendingIncoming = connections.filter(c => c.recipientId && c.recipientId._id === user.id && c.status === 'pending');
  const pendingOutgoing = connections.filter(c => c.requesterId && c.requesterId._id === user.id && c.status === 'pending');
  const activeConnections = connections.filter(c => c.status === 'accepted');

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      
      {/* Header & Privacy Toggle */}
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-6 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-main flex items-center gap-2 mb-1">
            <Users className="w-6 h-6 text-accent" />
            Yatri Connect
          </h1>
          <p className="text-sm text-text-main/70 max-w-md leading-relaxed mb-3">
            Turning on visibility lets other verified travelers near you send connection requests. Your exact location is never shared until you actively accept and share it in chat.
          </p>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-text-main/50" />
            <span className="font-bold text-text-main/90">{user.currentLocation}</span>
            <button 
              onClick={() => updateUserLocationState("")} // Clears location to re-trigger flow
              className="text-primary hover:text-primary/80 font-bold ml-2 underline decoration-primary/30 underline-offset-2 transition-colors"
            >
              Update location
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 shrink-0">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={visibility} onChange={handleToggleVisibility} />
            <div className="w-14 h-7 bg-white/50 border border-white/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/50 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            <span className="ml-3 text-sm font-bold text-text-main">{visibility ? 'Visible' : 'Hidden'}</span>
          </label>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl mb-8">
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
              activeTab === tab.id ? "bg-white text-text-main shadow-sm" : "text-text-main/60 hover:text-text-main/90 hover:bg-white/50"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-text-main/30" /></div>
        ) : (
          <>
            {/* DISCOVER TAB */}
            {activeTab === 'discover' && (
              <div className="space-y-4">
                {nearby.length === 0 ? (
                  <div className="text-center py-20 bg-white/30 rounded-2xl border border-white/40">
                    <MapPin className="w-12 h-12 text-text-main/30 mx-auto mb-3" />
                    <h3 className="font-bold font-display text-text-main mb-1">No travelers nearby</h3>
                    <p className="text-sm text-text-main/60">Make sure your visibility is turned on to see others.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {nearby.map(user => (
                      <div key={user._id} className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-text-main flex items-center gap-1.5">
                              {user.displayName}
                              {user.isVerified && <ShieldCheck className="w-4 h-4 text-accent" />}
                            </h3>
                            <div className="flex gap-2 mt-2">
                              {user.travelerType?.map(t => (
                                <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-white/60 text-text-main/70 px-2 py-1 rounded-md">{t}</span>
                              ))}
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-white/80 shadow-sm text-text-main/50 rounded-full flex items-center justify-center font-bold text-lg">
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleSendRequest(user._id)}
                          className="w-full py-2.5 bg-primary hover:bg-primary/90 shadow-md text-white rounded-xl text-sm font-bold transition-colors mt-auto"
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
                  <h3 className="text-xs font-bold text-text-main/50 uppercase tracking-wider mb-4">Incoming Requests</h3>
                  {pendingIncoming.length === 0 ? (
                    <div className="text-sm font-medium text-text-main/60 bg-white/30 p-4 rounded-xl border border-white/40">You have no pending requests.</div>
                  ) : (
                    <div className="space-y-3">
                      {pendingIncoming.map(conn => (
                        <div key={conn._id} className="bg-white/50 backdrop-blur-md p-4 rounded-xl border border-white/60 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent/20 text-accent rounded-full flex items-center justify-center font-bold">
                              {conn.requesterId?.displayName?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-text-main">{conn.requesterId?.displayName}</div>
                              <div className="text-xs font-medium text-text-main/60">Wants to connect in {conn.requesterId?.currentLocation}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleRespond(conn._id, 'decline')} className="px-4 py-2 bg-white/60 hover:bg-white/80 text-text-main/70 text-sm font-bold rounded-lg transition-colors">Decline</button>
                            <button onClick={() => handleRespond(conn._id, 'accept')} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white shadow-sm text-sm font-bold rounded-lg transition-colors">Accept</button>
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
                  <div className="text-center py-20 bg-white/30 rounded-2xl border border-white/40">
                    <MessageCircle className="w-12 h-12 text-text-main/30 mx-auto mb-3" />
                    <h3 className="font-bold font-display text-text-main mb-1">No active connections yet</h3>
                    <p className="text-sm text-text-main/60">Head to Discover to find nearby travelers.</p>
                  </div>
                ) : (
                  activeConnections.map(conn => {
                    const buddy = conn.requesterId._id === user.id ? conn.recipientId : conn.requesterId;
                    return (
                      <button 
                        key={conn._id} 
                        onClick={() => setActiveChat(conn)}
                        className="w-full bg-white/50 backdrop-blur-md p-4 rounded-xl border border-white/60 flex items-center gap-4 hover:border-primary transition-colors text-left shadow-sm"
                      >
                        <div className="w-12 h-12 bg-accent/20 text-accent rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                          {buddy?.displayName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-text-main flex items-center gap-1.5">
                            {buddy?.displayName}
                            {buddy?.isVerified && <ShieldCheck className="w-4 h-4 text-accent" />}
                          </div>
                          <div className="text-sm font-medium text-text-main/60">Tap to view chat and location tools</div>
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
