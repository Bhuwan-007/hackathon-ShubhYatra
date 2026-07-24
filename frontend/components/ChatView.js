"use client";
import { useState, useEffect, useRef } from "react";
import { fetchBuddyMessages, sendBuddyMessage, shareBuddyLocation } from "@/lib/api";
import { MapPin, Send, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export default function ChatView({ connection, currentUserId, token, onBack, onAuthError, onRefreshConnection }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [myShareTimeLeft, setMyShareTimeLeft] = useState(null);
  const [buddyShareTimeLeft, setBuddyShareTimeLeft] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const toast = useToast();
  const { t } = useLanguage();
  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Determine who the "other" person is
  const isRequester = (connection.requesterId?._id || connection.requesterId) === currentUserId;
  const buddy = isRequester ? connection.recipientId : connection.requesterId;
  const mySharedUntil = isRequester ? connection.requesterSharedUntil : connection.recipientSharedUntil;
  const buddySharedUntil = isRequester ? connection.recipientSharedUntil : connection.requesterSharedUntil;

  // Poll for messages
  useEffect(() => {
    let intervalId;
    
    const loadMessages = async (isInitial = false) => {
      try {
        const msgs = await fetchBuddyMessages(connection._id, token);
        
        setMessages(prevMsgs => {
          // If the length changed, check scroll
          if (isInitial) {
             setTimeout(() => {
               chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
             }, 100);
          } else if (msgs.length > prevMsgs.length && chatContainerRef.current) {
             const container = chatContainerRef.current;
             // Only auto-scroll if user is already near the bottom (within 100px)
             const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
             if (isNearBottom) {
               setTimeout(() => {
                 chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
               }, 100);
             }
          }
          return msgs;
        });
      } catch (err) {
        if (onAuthError) onAuthError(err);
      }
    };

    loadMessages(true); // Initial load
    intervalId = setInterval(() => {
      loadMessages(false);
      if (onRefreshConnection) onRefreshConnection();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [connection._id, refreshTrigger]);

  // Handle Share Location timer for ME
  useEffect(() => {
    if (!mySharedUntil) {
      setMyShareTimeLeft(null);
      return;
    }
    const endDate = new Date(mySharedUntil).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endDate - now;
      if (distance < 0) {
        setMyShareTimeLeft(null);
        return;
      }
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setMyShareTimeLeft(`${hours}h ${minutes}m left`);
    };
    updateTimer();
    const timerInterval = setInterval(updateTimer, 60000);
    return () => clearInterval(timerInterval);
  }, [mySharedUntil]);

  // Handle Share Location timer for BUDDY
  useEffect(() => {
    if (!buddySharedUntil) {
      setBuddyShareTimeLeft(null);
      return;
    }
    const endDate = new Date(buddySharedUntil).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endDate - now;
      if (distance < 0) {
        setBuddyShareTimeLeft(null);
        return;
      }
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setBuddyShareTimeLeft(`${hours}h ${minutes}m left`);
    };
    updateTimer();
    const timerInterval = setInterval(updateTimer, 60000);
    return () => clearInterval(timerInterval);
  }, [buddySharedUntil]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setSending(true);
    try {
      const newMsg = await sendBuddyMessage(connection._id, inputText, token);
      setMessages(prev => [...prev, newMsg]);
      setInputText("");
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (err) {
      toast.error("Failed to send message");
      if (onAuthError) onAuthError(err);
    } finally {
      setSending(false);
    }
  };

  const handleShareLocation = async () => {
    setSharing(true);
    try {
      await shareBuddyLocation(connection._id, 4, token); // 4 hours
      setMyShareTimeLeft("4h 0m left");
      toast.success("Location shared!");
    } catch (err) {
      toast.error("Failed to share location");
      if (onAuthError) onAuthError(err);
    } finally {
      setSharing(false);
    }
  };

  const handleStopSharing = async () => {
    setSharing(true);
    try {
      await shareBuddyLocation(connection._id, 0, token); // 0 hours stops it
      setMyShareTimeLeft(null);
      toast.success("Stopped sharing location.");
    } catch (err) {
      toast.error("Failed to stop sharing");
      if (onAuthError) onAuthError(err);
    } finally {
      setSharing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    if (onRefreshConnection) onRefreshConnection();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="border-b border-stone-100 bg-stone-50/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-stone-500 hover:text-stone-800 font-medium text-sm">
              &larr; {t('chat.back')}
            </button>
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
              {buddy.displayName?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-stone-900 truncate">{buddy.displayName}</h3>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{buddy.currentLocation}</span>
              </p>
            </div>
          </div>
          
          <div className="flex-shrink-0 flex items-center gap-2">
            <button 
              onClick={handleRefresh}
              aria-label="Refresh Chat"
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {!myShareTimeLeft ? (
              <button 
                onClick={handleShareLocation}
                disabled={sharing}
                className="text-xs font-bold px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {sharing ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                {t('chat.shareLocation')}
              </button>
            ) : (
              <button 
                onClick={handleStopSharing}
                disabled={sharing}
                className="text-xs font-bold px-4 py-2 bg-transparent border border-alert text-alert hover:bg-alert/10 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
              >
                {sharing ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {t('chat.stopSharing')}
              </button>
            )}
          </div>
        </div>

        {/* Location Reveal Bar (If Buddy is sharing with you) */}
        {buddyShareTimeLeft && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center gap-2 text-sm text-emerald-800 animate-in fade-in mt-2 overflow-hidden">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="font-medium truncate flex-1 min-w-0">{buddy.displayName} {t('chat.sharingLocation')} {buddy.currentLocation}</span>
            <span className="shrink-0 ml-auto text-xs font-bold text-emerald-600/60 whitespace-nowrap">{buddyShareTimeLeft}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <span className="text-xs font-medium text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
            {t('chat.connectionSecure')}
          </span>
        </div>
        
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl text-sm break-words",
                isMe ? "bg-primary text-white rounded-br-none" : "bg-stone-100 text-stone-800 rounded-bl-none"
              )}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-stone-100 flex gap-2">
        <input 
          type="text" 
          placeholder={t('chat.placeholder')}
          className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <button 
          type="submit" 
          aria-label="Send message"
          disabled={!inputText.trim() || sending}
          className="w-11 h-11 bg-primary hover:bg-primary/90 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
        </button>
      </form>

    </div>
  );
}
