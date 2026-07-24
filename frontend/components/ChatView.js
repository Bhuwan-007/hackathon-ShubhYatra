"use client";
import { useState, useEffect, useRef } from "react";
import { fetchBuddyMessages, sendBuddyMessage, shareBuddyLocation } from "@/lib/api";
import { MapPin, Send, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { cn } from "@/lib/utils";

export default function ChatView({ connection, currentUserId, token, onBack, onAuthError }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareTimeLeft, setShareTimeLeft] = useState(null);
  const toast = useToast();
  const chatEndRef = useRef(null);

  // Determine who the "other" person is
  const buddy = connection.requesterId._id === currentUserId ? connection.recipientId : connection.requesterId;

  // Poll for messages
  useEffect(() => {
    let intervalId;
    
    const loadMessages = async () => {
      try {
        const msgs = await fetchBuddyMessages(connection._id, token);
        setMessages(msgs);
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        if (onAuthError) onAuthError(err);
      }
    };

    loadMessages(); // Initial load
    intervalId = setInterval(loadMessages, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(intervalId); // CRITICAL: Clear on unmount
    };
  }, [connection._id]);

  // Handle Share Location timer
  useEffect(() => {
    if (!connection.sharedLocationUntil) return;
    
    const endDate = new Date(connection.sharedLocationUntil).getTime();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = endDate - now;
      
      if (distance < 0) {
        setShareTimeLeft(null);
        return;
      }
      
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setShareTimeLeft(`${hours}h ${minutes}m left`);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 60000); // update every minute
    
    return () => clearInterval(timerInterval);
  }, [connection.sharedLocationUntil]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    setSending(true);
    try {
      const newMsg = await sendBuddyMessage(connection._id, inputText, token);
      setMessages(prev => [...prev, newMsg]);
      setInputText("");
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      // To immediately reflect the change, we ideally refetch the connection,
      // but for this demo, polling will pick up the updated connection eventually, 
      // or we can just artificially set the timer text for instant feedback:
      setShareTimeLeft("4h 0m left");
      toast.success("Location shared!");
    } catch (err) {
      toast.error("Failed to share location");
      if (onAuthError) onAuthError(err);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
      
      {/* Header */}
      <div className="border-b border-stone-100 bg-stone-50/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-stone-500 hover:text-stone-800 font-medium text-sm">
              &larr; Back
            </button>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
              {buddy.displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-stone-900">{buddy.displayName}</h3>
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {buddy.currentLocation}
              </p>
            </div>
          </div>
          
          {!shareTimeLeft ? (
            <button 
              onClick={handleShareLocation}
              disabled={sharing}
              className="text-xs font-semibold px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {sharing ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
              Share Location (4h)
            </button>
          ) : (
            <button className="text-xs font-semibold px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
              Stop Sharing
            </button>
          )}
        </div>

        {/* Location Reveal Bar */}
        {shareTimeLeft && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center gap-2 text-sm text-emerald-800 animate-in fade-in">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="font-medium truncate">Sharing location: {buddy.currentLocation}</span>
            <span className="ml-auto text-xs font-bold text-emerald-600/60 whitespace-nowrap">{shareTimeLeft}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center">
          <span className="text-xs font-medium text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
            Connection secure. Remember to stay in public areas.
          </span>
        </div>
        
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={idx} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                isMe ? "bg-stone-900 text-white rounded-br-none" : "bg-stone-100 text-stone-800 rounded-bl-none"
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
          placeholder="Message..." 
          className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <button 
          type="submit" 
          aria-label="Send message"
          disabled={!inputText.trim() || sending}
          className="w-11 h-11 bg-stone-900 hover:bg-stone-800 text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
        </button>
      </form>

    </div>
  );
}
