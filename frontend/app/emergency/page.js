"use client";
import { useState } from "react";
import { fetchEmergencyPlan } from "@/lib/api";
import { AlertCircle, Phone, Loader2 } from "lucide-react";

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
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Emergency Hub</h1>
        <p className="text-stone-500">Immediate, calm action plans for crisis situations.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-8 space-y-4">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Where are you right now?</label>
          <input 
            type="text" 
            placeholder="e.g. Eiffel Tower, Paris" 
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-red-500/20 outline-none text-lg"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Landmarks / Surroundings (Optional)</label>
          <input 
            type="text" 
            placeholder="e.g. Next to a blue pharmacy and a large statue" 
            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-red-500/20 outline-none text-base"
            value={landmarks}
            onChange={e => setLandmarks(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-red-50 border border-red-100 text-red-800 rounded-xl font-medium text-center">
          {error}
        </div>
      )}

      {!plan && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <button 
            onClick={() => handleEmergency('lost_passport')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-white border-2 border-stone-200 hover:border-amber-400 rounded-2xl transition-all group disabled:opacity-50"
          >
            {loadingType === 'lost_passport' ? <Loader2 className="w-8 h-8 animate-spin text-stone-400 mb-3" /> : <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛂</div>}
            <span className="font-bold text-base text-stone-800">Lost Passport</span>
          </button>
          
          <button 
            onClick={() => handleEmergency('medical')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-red-50 border-2 border-red-100 hover:border-red-400 rounded-2xl transition-all group disabled:opacity-50"
          >
            {loadingType === 'medical' ? <Loader2 className="w-8 h-8 animate-spin text-red-400 mb-3" /> : <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏥</div>}
            <span className="font-bold text-base text-red-900">Medical Help</span>
          </button>

          <button 
            onClick={() => handleEmergency('theft')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-stone-900 border-2 border-stone-800 hover:border-amber-500 rounded-2xl transition-all group disabled:opacity-50"
          >
            {loadingType === 'theft' ? <Loader2 className="w-8 h-8 animate-spin text-stone-400 mb-3" /> : <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🚨</div>}
            <span className="font-bold text-base text-stone-100">Theft / Robbery</span>
          </button>

          <button 
            onClick={() => handleEmergency('harassment')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-indigo-50 border-2 border-indigo-100 hover:border-indigo-400 rounded-2xl transition-all group disabled:opacity-50"
          >
            {loadingType === 'harassment' ? <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" /> : <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🛡️</div>}
            <span className="font-bold text-base text-indigo-900">Harassment</span>
          </button>

          <button 
            onClick={() => handleEmergency('lost_directions')}
            disabled={loadingType !== null}
            className="flex flex-col items-center justify-center p-6 bg-emerald-50 border-2 border-emerald-100 hover:border-emerald-400 rounded-2xl transition-all group disabled:opacity-50 sm:col-span-2 md:col-span-1"
          >
            {loadingType === 'lost_directions' ? <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mb-3" /> : <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🗺️</div>}
            <span className="font-bold text-base text-emerald-900">I'm Lost (Directions)</span>
          </button>
        </div>
      )}

      {plan && (
        <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-red-600 text-white p-6">
            <h2 className="text-2xl font-bold">Action Plan</h2>
            <p className="opacity-90">Follow these steps calmly.</p>
          </div>
          
          <div className="p-6 md:p-8 space-y-8">
            <div className="space-y-4">
              {plan.steps?.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-stone-100 text-stone-600 font-bold flex items-center justify-center text-sm">{i + 1}</div>
                  <p className="text-lg font-medium text-stone-800 leading-snug pt-1">{step}</p>
                </div>
              ))}
            </div>

            {plan.key_contacts && (
              <div className="border-t border-stone-100 pt-8">
                <h3 className="font-bold text-stone-400 uppercase tracking-wider text-sm mb-4">Key Contacts</h3>
                <div className="space-y-4">
                  {Object.entries(plan.key_contacts).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 bg-stone-50 p-4 rounded-xl">
                      <Phone className="w-5 h-5 text-stone-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-stone-500 uppercase">{key.replace('_', ' ')}</div>
                        <div className="font-bold text-stone-900">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setPlan(null)} className="w-full py-4 text-center text-stone-500 font-semibold hover:bg-stone-50 rounded-xl transition-colors">
              Clear & Return
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
