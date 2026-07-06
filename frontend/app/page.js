"use client";

import { useState } from "react";
import { fetchBriefing } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  ShieldAlert, ShieldCheck, MapPin, 
  Search, Loader2, AlertTriangle, User,
  Phone, Activity, Info
} from "lucide-react";

const TRAVELER_TYPES = [
  { id: "solo", label: "Solo" },
  { id: "elderly", label: "Elderly" },
  { id: "disabled", label: "Disabled" },
  { id: "non-native-speaker", label: "Non-Native Speaker" },
  { id: "family", label: "Family" },
];

export default function Home() {
  const [location, setLocation] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [briefing, setBriefing] = useState(null);

  const handleToggleType = (id) => {
    setSelectedTypes(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setError(null);
    setBriefing(null);

    try {
      const data = await fetchBriefing(location, selectedTypes);
      setBriefing(data);
    } catch (err) {
      setError(err.message || "Failed to retrieve safety briefing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-stone-900 font-sans selection:bg-emerald-100 pb-20">
      
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-stone-900">
            Travel <span className="text-emerald-600">Safely</span>, Anywhere.
          </h1>
          <p className="text-lg text-stone-500 max-w-2xl mx-auto">
            Get instant, AI-curated safety briefings tailored to your specific needs and destination. We analyze local reports so you can explore with confidence.
          </p>
        </div>

        {/* Search Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 mb-12">
          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Destination Input */}
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-400" />
                Where are you going?
              </label>
              <div className="relative">
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Paharganj, Delhi or Montmartre, Paris"
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-base bg-stone-50/50"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Traveler Tags */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                <User className="w-4 h-4 text-stone-400" />
                Customize your briefing (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {TRAVELER_TYPES.map(type => {
                  const isSelected = selectedTypes.includes(type.id);
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleToggleType(type.id)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200",
                        isSelected 
                          ? "bg-emerald-100 border-emerald-200 text-emerald-800 shadow-sm" 
                          : "bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                      )}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 mb-8 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800 animate-in fade-in slide-in-from-bottom-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-24 bg-stone-200/60 rounded-2xl w-full"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-48 bg-stone-200/60 rounded-2xl w-full"></div>
              <div className="h-48 bg-stone-200/60 rounded-2xl w-full"></div>
            </div>
            <div className="h-32 bg-stone-200/60 rounded-2xl w-full"></div>
          </div>
        )}

        {/* Results */}
        {briefing && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Risk Score Widget */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between text-center sm:text-left">
              <div>
                <h2 className="text-lg font-semibold text-stone-900 flex items-center justify-center sm:justify-start gap-2">
                  <Activity className="w-5 h-5 text-stone-400" />
                  Overall Risk Score
                </h2>
                <p className="text-sm text-stone-500 mt-1">Based on recent verified reports</p>
              </div>
              <div className={cn(
                "flex items-center justify-center w-16 h-16 shrink-0 rounded-full text-2xl font-bold border-4",
                briefing.overall_risk_score < 30 ? "text-emerald-600 border-emerald-100 bg-emerald-50" :
                briefing.overall_risk_score < 60 ? "text-amber-600 border-amber-100 bg-amber-50" :
                "text-red-600 border-red-100 bg-red-50"
              )}>
                {briefing.overall_risk_score}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Scams */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                  Active Scams to Watch
                </h3>
                {briefing.active_scams?.length > 0 ? (
                  <ul className="space-y-3">
                    {briefing.active_scams.map((scam, i) => (
                      <li key={i} className="flex gap-3 text-sm text-stone-600 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{scam}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-stone-500 italic">No active scams reported.</p>
                )}
              </div>

              {/* Safe Zones */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Known Safe Zones
                </h3>
                {briefing.safe_zones?.length > 0 ? (
                  <ul className="space-y-3">
                    {briefing.safe_zones.map((zone, i) => (
                      <li key={i} className="flex gap-3 text-sm text-stone-600 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">{zone}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-stone-500 italic">No safe zones explicitly reported.</p>
                )}
              </div>
            </div>

            {/* Accessibility Notes (Highlighted) */}
            {briefing.accessibility_notes?.length > 0 && (
              <div className="bg-indigo-50/80 rounded-2xl border border-indigo-100 p-6">
                <h3 className="text-base font-semibold text-indigo-900 flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-indigo-600" />
                  Tailored Travel Advice
                </h3>
                <ul className="space-y-3">
                  {briefing.accessibility_notes.map((note, i) => (
                    <li key={i} className="flex gap-3 text-sm text-indigo-800 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergency Contacts */}
            <div className="bg-stone-900 rounded-2xl shadow-sm p-6 text-white overflow-hidden relative">
              <h3 className="text-base font-semibold flex items-center gap-2 mb-6 text-stone-100 relative z-10">
                <Phone className="w-5 h-5 text-stone-400" />
                Emergency Contacts
              </h3>
              <div className="grid sm:grid-cols-3 gap-6 relative z-10">
                <div>
                  <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">Police</div>
                  <div className="text-lg font-semibold">{briefing.emergency_contacts?.police || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">Ambulance</div>
                  <div className="text-lg font-semibold">{briefing.emergency_contacts?.ambulance || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">Nearest Embassy</div>
                  <div className="text-sm font-medium text-stone-300 leading-snug">{briefing.emergency_contacts?.nearest_embassy || "N/A"}</div>
                </div>
              </div>
              
              {/* Background Decoration */}
              <ShieldAlert className="absolute -right-8 -bottom-8 w-40 h-40 text-white opacity-5 pointer-events-none" />
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
