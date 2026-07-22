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
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";

export default function ConnectPage() {
  const { token, user, isReady, login, logout, updateUserLocationState } = useAuth();
  const toast = useToast();
  const { language, t } = useLanguage();
  
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

  const displayFontClass = language === 'hi' ? 'font-sans' : 'font-display';

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
      toast.error("Failed to update visibility");
    }
  };

  const handleSendRequest = async (recipientId) => {
    try {
      await sendBuddyRequest(recipientId, token);
      setNearby(prev => prev.filter(u => u._id !== recipientId));
      toast.success("Buddy request sent!");
    } catch (err) { 
      handleAuthError(err); 
      toast.error("Failed to send request.");
    }
  };

  const handleRespond = async (connectionId, action) => {
    try {
      await respondToBuddyRequest(connectionId, action, token);
      const connData = await fetchMyConnections(token);
      setConnections(connData);
      toast.success(action === 'accept' ? "Request accepted!" : "Request declined.");
    } catch (err) { 
      handleAuthError(err); 
      toast.error("Failed to respond to request.");
    }
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
          toast.success("Location detected automatically!");
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
      toast.success("Location updated successfully!");
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
          <h1 className={cn("text-2xl font-bold text-text-main mb-2", displayFontClass)}>{t('connect.auth.title')}</h1>
          <p className="text-text-main/70 text-sm mb-8">{t('connect.auth.subtitle')}</p>
          
          {authError && <div className="p-3 bg-alert/10 text-alert border border-alert/20 text-sm font-bold rounded-lg mb-4">{authError}</div>}
          
          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold text-text-main/60 uppercase tracking-wider mb-1">{t('connect.auth.name')}</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-4 py-2 bg-white/50 border border-white/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-inner transition-all" required />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-text-main/60 uppercase tracking-wider mb-1">{t('connect.auth.email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 bg-white/50 border border-white/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-inner transition-all" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-main/60 uppercase tracking-wider mb-1">{t('connect.auth.password')}</label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-main/40 hover:text-text-main/70 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <button type="submit" disabled={isAuthenticating} className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors flex justify-center items-center gap-2 shadow-md cursor-pointer">
              {isAuthenticating && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoginMode ? t('connect.auth.signin') : t('connect.auth.signup')}
            </button>
          </form>
          
          <div className="mt-4">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
              {isLoginMode ? "Need an account? Register" : "Already have an account? Sign In"}
            </button>
          </div>

          <div className="my-6 flex items-center gap-4 before:flex-1 before:border-t before:border-white/40 after:flex-1 after:border-t after:border-white/40">
            <span className="text-xs font-bold text-text-main/40 uppercase">or</span>
          </div>

          <button onClick={handleDemoLogin} disabled={isAuthenticating} className="w-full py-3 bg-white/50 hover:bg-white/80 text-text-main font-bold rounded-lg transition-colors border border-white/60 shadow-sm cursor-pointer">
            {t('connect.auth.demo')}
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
          <h1 className={cn("text-2xl font-bold text-text-main mb-2", displayFontClass)}>{t('connect.loc.title')}</h1>
          <p className="text-text-main/70 text-sm mb-6 leading-relaxed">
            {t('connect.loc.subtitle')}
          </p>
          
          {locationError && <div className="p-3 bg-alert/10 text-alert border border-alert/20 text-sm font-bold rounded-lg mb-4">{locationError}</div>}

          <div className="space-y-3">
            <button 
              onClick={requestLocation} 
              disabled={isRequestingLocation}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white shadow-md font-bold rounded-lg transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              {isRequestingLocation && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('connect.loc.grant')}
            </button>

            <form onSubmit={handleManualLocationSubmit} className="pt-4 border-t border-white/40 flex gap-2">
              <input 
                type="text" 
                placeholder={t('connect.loc.manual')}
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                className="flex-1 px-4 py-2 bg-white/50 border border-white/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-inner placeholder:text-text-main/40 transition-all"
              />
              <button 
                type="submit" 
                disabled={isRequestingLocation || !manualLocation.trim()}
                className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors cursor-pointer"
              >
                {t('connect.loc.save')}
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
          <h1 className={cn("text-2xl font-bold text-text-main flex items-center gap-2 mb-1", displayFontClass)}>
            <Users className="w-6 h-6 text-accent" />
            {t('connect.main.title')}
          </h1>
          <p className="text-sm text-text-main/70 max-w-md leading-relaxed mb-3">
            {t('connect.main.desc')}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-text-main/50" />
            <span className="font-bold text-text-main/90">{user.currentLocation}</span>
            <button 
              onClick={() => updateUserLocationState("")} // Clears location to re-trigger flow
              className="text-primary hover:text-primary/80 font-bold ml-2 underline decoration-primary/30 underline-offset-2 transition-colors cursor-pointer"
            >
              {t('connect.main.update_loc')}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3 shrink-0">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={visibility} onChange={handleToggleVisibility} />
            <div className="w-14 h-7 bg-white/50 border border-white/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white/50 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-inner"></div>
            <span className="ml-3 text-sm font-bold text-text-main">{visibility ? t('connect.main.visible') : t('connect.main.hidden')}</span>
          </label>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-white/30 backdrop-blur-sm border border-white/40 rounded-xl mb-8">
        {[
          { id: 'discover', label: t('connect.tabs.discover'), icon: <MapPin className="w-4 h-4" /> },
          { id: 'requests', label: `${t('connect.tabs.requests')} ${pendingIncoming.length > 0 ? `(${pendingIncoming.length})` : ''}`, icon: <UserCheck className="w-4 h-4" /> },
          { id: 'chats', label: t('connect.tabs.chats'), icon: <MessageCircle className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer",
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
                    <h3 className={cn("font-bold text-text-main mb-1", displayFontClass)}>{t('connect.discover.empty')}</h3>
                    <p className="text-sm text-text-main/60">{t('connect.discover.empty_desc')}</p>
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
                          className="w-full py-2.5 bg-primary hover:bg-primary/90 shadow-md text-white rounded-xl text-sm font-bold transition-colors mt-auto cursor-pointer"
                        >
                          {t('connect.discover.send_req')}
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
                  <h3 className="text-xs font-bold text-text-main/50 uppercase tracking-wider mb-4">{t('connect.requests.incoming')}</h3>
                  {pendingIncoming.length === 0 ? (
                    <div className="text-sm font-medium text-text-main/60 bg-white/30 p-4 rounded-xl border border-white/40">{t('connect.requests.empty')}</div>
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
                              <div className="text-xs font-medium text-text-main/60">{t('connect.requests.wants')} {conn.requesterId?.currentLocation}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleRespond(conn._id, 'decline')} className="px-4 py-2 bg-white/60 hover:bg-white/80 text-text-main/70 text-sm font-bold rounded-lg transition-colors cursor-pointer">{t('connect.requests.decline')}</button>
                            <button onClick={() => handleRespond(conn._id, 'accept')} className="px-4 py-2 bg-primary hover:bg-primary/90 text-white shadow-sm text-sm font-bold rounded-lg transition-colors cursor-pointer">{t('connect.requests.accept')}</button>
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
                    <h3 className={cn("font-bold text-text-main mb-1", displayFontClass)}>{t('connect.chats.empty')}</h3>
                    <p className="text-sm text-text-main/60">{t('connect.chats.empty_desc')}</p>
                  </div>
                ) : (
                  activeConnections.map(conn => {
                    const buddy = conn.requesterId._id === user.id ? conn.recipientId : conn.requesterId;
                    return (
                      <button 
                        key={conn._id} 
                        onClick={() => setActiveChat(conn)}
                        className="w-full bg-white/50 backdrop-blur-md p-4 rounded-xl border border-white/60 flex items-center gap-4 hover:border-primary transition-colors text-left shadow-sm cursor-pointer"
                      >
                        <div className="w-12 h-12 bg-accent/20 text-accent rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                          {buddy?.displayName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-text-main flex items-center gap-1.5">
                            {buddy?.displayName}
                            {buddy?.isVerified && <ShieldCheck className="w-4 h-4 text-accent" />}
                          </div>
                          <div className="text-sm font-medium text-text-main/60">{t('connect.chats.tap')}</div>
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
