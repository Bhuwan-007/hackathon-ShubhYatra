"use client";
import { useState } from "react";
import { fetchEmergencyPlan } from "@/lib/api";
import { AlertCircle, Phone, Loader2, Book, Activity, AlertTriangle, Shield, Map } from "lucide-react";

export default function EmergencyPage() {
  const [location, setLocation] = useState("");
  const [landmarks, setLandmarks] = useState("");
  const [loadingType, setLoadingType] = useState(null);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleEmergency = async (type) => {
    if (!location.trim()) {
      setError("Please enter your current location first.");
      return;
    }
    setLoadingType(type);
    setError(null);
    setPlan(null);

    try {
      const data = await fetchEmergencyPlan(location, landmarks, type);
      setPlan(data);
    } catch (err) {
      setError(err.message || "Failed to load emergency plan.");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-alert/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-alert" />
        </div>
        <h1 className="text-3xl font-bold font-display text-text-main mb-2">Emergency Hub</h1>
        <p className="text-text-main/70">Immediate, calm action plans for crisis situations.</p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 mb-8 space-y-4">
        <div>
          <label className="block text-sm font-bold text-text-main/90 mb-2">Where are you right now?</label>
          <input 
            type="text" 
            placeholder="e.g. Eiffel Tower, Paris" 
            className="w-full px-4 py-3 rounded-xl border border-white/50 focus:ring-2 focus:ring-alert/20 focus:border-alert outline-none text-lg bg-white/50 backdrop-blur-sm shadow-inner placeholder:text-text-main/40 transition-all"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-text-main/90 mb-2">Landmarks / Surroundings (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Next to a blue pharmacy and a large statue" 
            className="w-full px-4 py-3 rounded-xl border border-white/50 focus:ring-2 focus:ring-alert/20 focus:border-alert outline-none text-base bg-white/50 backdrop-blur-sm shadow-inner placeholder:text-text-main/40 transition-all"
            value={landmarks}
            onChange={e => setLandmarks(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-alert/10 border border-alert/20 text-alert rounded-xl font-bold text-center shadow-sm">
          {error}
        </div>
      )}

      {!plan && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleEmergency('lost_passport')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-sm border-2 border-white/60 hover:border-alert rounded-2xl transition-all group disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loadingType === 'lost_passport' ? <Loader2 className="w-8 h-8 animate-spin text-text-main/40 mb-3" /> : <Book className="w-8 h-8 text-text-main/80 mb-3 group-hover:scale-110 transition-transform" />}
            <span className="font-bold text-base text-text-main/90">Lost Passport</span>
          </button>
          
          <button 
            onClick={() => handleEmergency('medical')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-alert/10 backdrop-blur-sm border-2 border-alert/30 hover:border-alert rounded-2xl transition-all group disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loadingType === 'medical' ? <Loader2 className="w-8 h-8 animate-spin text-alert/60 mb-3" /> : <Activity className="w-8 h-8 text-alert mb-3 group-hover:scale-110 transition-transform" />}
            <span className="font-bold text-base text-alert">Medical Help</span>
          </button>

          <button 
            onClick={() => handleEmergency('theft')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-alert border-2 border-alert hover:bg-alert/90 rounded-2xl transition-all group disabled:opacity-50 shadow-md cursor-pointer"
          >
            {loadingType === 'theft' ? <Loader2 className="w-8 h-8 animate-spin text-white/60 mb-3" /> : <AlertTriangle className="w-8 h-8 text-white mb-3 group-hover:scale-110 transition-transform" />}
            <span className="font-bold text-base text-white">Theft / Robbery</span>
          </button>

          <button 
            onClick={() => handleEmergency('harassment')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-sm border-2 border-white/60 hover:border-alert rounded-2xl transition-all group disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {loadingType === 'harassment' ? <Loader2 className="w-8 h-8 animate-spin text-text-main/40 mb-3" /> : <Shield className="w-8 h-8 text-text-main/80 mb-3 group-hover:scale-110 transition-transform" />}
            <span className="font-bold text-base text-text-main/90">Harassment</span>
          </button>

          <button 
            onClick={() => handleEmergency('lost_directions')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-white/40 backdrop-blur-sm border-2 border-white/60 hover:border-alert rounded-2xl transition-all group disabled:opacity-50 sm:col-span-2 md:col-span-1 shadow-sm cursor-pointer"
          >
            {loadingType === 'lost_directions' ? <Loader2 className="w-8 h-8 animate-spin text-text-main/40 mb-3" /> : <Map className="w-8 h-8 text-text-main/80 mb-3 group-hover:scale-110 transition-transform" />}
            <span className="font-bold text-base text-text-main/90">I'm Lost (Directions)</span>
          </button>
        </div>
      )}

      {plan && (
        <div className="bg-white/60 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-alert text-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold font-display">Action Plan</h2>
            <p className="opacity-90 font-medium">Follow these steps calmly.</p>
          </div>
          
          <div className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              {plan.steps?.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-white text-text-main font-bold flex items-center justify-center text-sm shadow-sm">{i + 1}</div>
                  <p className="text-lg font-medium text-text-main/90 leading-snug pt-1">{step}</p>
                </div>
              ))}
            </div>

            {plan.key_contacts && (
              <div className="border-t border-text-main/10 pt-8">
                <h3 className="font-bold text-text-main/50 uppercase tracking-wider text-sm mb-4">Key Contacts</h3>
                <div className="space-y-4">
                  {Object.entries(plan.key_contacts).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-white/60">
                      <Phone className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-text-main/60 uppercase tracking-wide">{key.replace('_', ' ')}</div>
                        <div className="font-bold text-text-main">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setPlan(null)} className="w-full py-4 text-center text-text-main/60 font-bold hover:bg-white/40 hover:text-text-main rounded-xl transition-all border border-transparent hover:border-text-main/10">
              Clear & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
