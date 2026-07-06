"use client";
import { useState, useEffect } from "react";
import { 
  fetchNearbyBuddies, fetchMyConnections, updateUserVisibility, 
  sendBuddyRequest, respondToBuddyRequest 
} from "@/lib/api";
import { ShieldCheck, MapPin, Loader2, UserCheck, Users, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ChatView from "@/components/ChatView";

// Hardcoded for testing since we don't have auth yet
const MOCK_LOCATION = "Delhi";

export default function ConnectPage() {
  const [activeTab, setActiveTab] = useState("discover"); // discover, requests, chats
  const [userId, setUserId] = useState(null);
  const [isReady, setIsReady] = useState(false);
  
  // Data state
  const [visibility, setVisibility] = useState(false);
  const [nearby, setNearby] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeChat, setActiveChat] = useState(null);

  // Initialize Mock User
  useEffect(() => {
    const initUser = async () => {
      let storedId = localStorage.getItem("yatri_mock_user_id");
      if (!storedId) {
        try {
          // Auto-create a mock user for this session
          const response = await fetch("http://localhost:5001/api/buddies/test-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              displayName: "Tourist_" + Math.floor(Math.random()*1000),
              currentLocation: MOCK_LOCATION,
              travelerType: ["solo"],
              visibility: false,
              isVerified: true
            })
          });
          const user = await response.json();
          storedId = user._id;
          localStorage.setItem("yatri_mock_user_id", storedId);
        } catch (err) { console.error("Failed to mock user", err); }
      }
      setUserId(storedId);
      setIsReady(true);
    };
    initUser();
  }, []);

  // Fetch Data
  useEffect(() => {
    if (!isReady || !userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [nearbyData, connData] = await Promise.all([
          fetchNearbyBuddies(MOCK_LOCATION, userId),
          fetchMyConnections(userId)
        ]);
        setNearby(nearbyData);
        setConnections(connData);
      } catch (err) {
        console.error("Failed to load buddy data", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isReady, userId, visibility]); // Re-fetch if visibility toggled

  const handleToggleVisibility = async () => {
    const newVal = !visibility;
    setVisibility(newVal);
    try {
      await updateUserVisibility(userId, newVal);
    } catch (err) {
      console.error(err);
      setVisibility(!newVal); // revert on error
    }
  };

  const handleSendRequest = async (recipientId) => {
    try {
      await sendBuddyRequest(userId, recipientId);
      // Optimistically remove them from nearby to prevent double-sends
      setNearby(prev => prev.filter(u => u._id !== recipientId));
    } catch (err) { console.error(err); }
  };

  const handleRespond = async (connectionId, action) => {
    try {
      await respondToBuddyRequest(connectionId, action);
      // Refresh connections
      const connData = await fetchMyConnections(userId);
      setConnections(connData);
    } catch (err) { console.error(err); }
  };

  if (!isReady) return <div className="p-12 text-center text-stone-500">Initializing secure session...</div>;

  if (activeChat) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <ChatView 
          connection={activeChat} 
          currentUserId={userId} 
          onBack={() => setActiveChat(null)} 
        />
      </div>
    );
  }

  const pendingIncoming = connections.filter(c => c.recipientId._id === userId && c.status === 'pending');
  const pendingOutgoing = connections.filter(c => c.requesterId._id === userId && c.status === 'pending');
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
        
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input type="checkbox" className="sr-only peer" checked={visibility} onChange={handleToggleVisibility} />
          <div className="w-14 h-7 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
          <span className="ml-3 text-sm font-bold text-stone-900">{visibility ? 'Visible' : 'Hidden'}</span>
        </label>
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
                              {conn.requesterId.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-stone-900">{conn.requesterId.displayName}</div>
                              <div className="text-xs text-stone-500">Wants to connect in {conn.requesterId.currentLocation}</div>
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
                          {buddy.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            {buddy.displayName}
                            {buddy.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
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
