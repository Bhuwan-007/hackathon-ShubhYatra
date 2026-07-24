"use client";

import { useState, useEffect } from "react";
import { fetchBriefing, fetchRecentReports, fetchStats } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { 
  ShieldAlert, ShieldCheck, MapPin, 
  Search, Loader2, AlertTriangle, User,
  Phone, Activity, Info, ChevronDown, ChevronUp,
  Globe2, ShieldAlert as ShieldAlertIcon, FileCheck
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
  const [recentReports, setRecentReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [showReasoning, setShowReasoning] = useState(false);
  const [stats, setStats] = useState(null);
  
  const toast = useToast();
  const { language, t } = useLanguage();

  useEffect(() => {
    const loadRecent = async () => {
      try {
        const data = await fetchRecentReports();
        setRecentReports(data);
      } catch (err) {
        console.error("Failed to fetch recent reports", err);
      } finally {
        setLoadingReports(false);
      }
    };
    
    const loadStats = async () => {
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };

    loadRecent();
    loadStats();
  }, []);

  // Auto-refetch when language changes if we already have a briefing
  useEffect(() => {
    if (briefing && location && !loading) {
      handleSearch(null, location);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleToggleType = (id) => {
    setSelectedTypes(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSearch = async (e, overrideLocation = null) => {
    if (e && e.preventDefault) e.preventDefault();
    const searchLoc = overrideLocation || location;
    if (!searchLoc.trim()) return;

    setLoading(true);
    setError(null);
    setBriefing(null);

    try {
      const data = await fetchBriefing(searchLoc, selectedTypes, language);
      setBriefing(data);
      setShowReasoning(false);
    } catch (err) {
      setError(t('home.error.fetch'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (quickLocation) => {
    setLocation(quickLocation);
    setTimeout(() => {
      handleSearch(null, quickLocation);
    }, 0);
  };

  const displayFontClass = language === 'hi' ? 'font-sans' : 'font-display';

  return (
    <div className="font-sans selection:bg-secondary/50">
      
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className={cn("text-4xl md:text-5xl font-bold tracking-tighter text-text-main", displayFontClass)}>
            {t('home.hero.title1')}
            <span className="text-primary">{t('home.hero.title2')}</span>
            {t('home.hero.title3')}
          </h1>
          <p className="text-lg text-text-main/70 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
        </div>

        {/* Search Form Card */}
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 md:p-8 mb-12">
          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Destination Input */}
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-semibold text-text-main flex items-center gap-2">
                <MapPin className="w-4 h-4 text-text-main/50" />
                {t('home.search.label')}
              </label>
              <div className="relative">
                <input
                  id="location"
                  type="text"
                  placeholder={t('home.search.placeholder')}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base bg-white/50 backdrop-blur-sm shadow-inner placeholder:text-text-main/40"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Quick Destinations */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs text-text-main/50 font-medium mr-1">{t('home.search.trending')}</span>
                {["Paharganj, Delhi", "Montmartre, Paris", "Khao San Road, Bangkok"].map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => handleQuickSearch(dest)}
                    className="text-xs bg-black/5 hover:bg-primary hover:text-white text-text-main/70 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Traveler Tags */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-text-main flex items-center gap-2">
                <User className="w-4 h-4 text-text-main/50" />
                {t('home.search.customize')}
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
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 backdrop-blur-sm cursor-pointer",
                        isSelected 
                          ? "bg-primary border-primary text-white shadow-md" 
                          : "bg-white/50 border-white/60 text-text-main/70 hover:border-white/80 hover:bg-white/80"
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

        {/* Stats Strip */}
        {stats && !briefing && !loading && (
          <div className="grid grid-cols-3 gap-4 mb-12 animate-in fade-in duration-700">
            <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 border border-white/60 shadow-sm flex flex-col items-center text-center">
              <Globe2 className="w-5 h-5 text-primary mb-2 opacity-80" />
              <span className="text-2xl font-bold font-display text-text-main leading-none">{stats.destinations_covered}</span>
              <span className="text-[10px] uppercase font-bold text-text-main/60 tracking-wider mt-1">Destinations</span>
            </div>
            <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 border border-white/60 shadow-sm flex flex-col items-center text-center">
              <ShieldAlertIcon className="w-5 h-5 text-accent mb-2 opacity-80" />
              <span className="text-2xl font-bold font-display text-text-main leading-none">{stats.scam_categories}</span>
              <span className="text-[10px] uppercase font-bold text-text-main/60 tracking-wider mt-1">Scams Detected</span>
            </div>
            <div className="bg-white/40 backdrop-blur-md rounded-xl p-4 border border-white/60 shadow-sm flex flex-col items-center text-center">
              <FileCheck className="w-5 h-5 text-emerald-500 mb-2 opacity-80" />
              <span className="text-2xl font-bold font-display text-text-main leading-none">{stats.verified_reports}</span>
              <span className="text-[10px] uppercase font-bold text-text-main/60 tracking-wider mt-1">Community Reports</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 mb-8 bg-alert/10 border border-alert/20 rounded-xl flex gap-3 text-alert animate-in fade-in slide-in-from-bottom-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-24 bg-black/5 rounded-2xl w-full"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-48 bg-black/5 rounded-2xl w-full"></div>
              <div className="h-48 bg-black/5 rounded-2xl w-full"></div>
            </div>
            <div className="h-32 bg-black/5 rounded-2xl w-full"></div>
          </div>
        )}

        {/* Live Safety Pulse */}
        {!briefing && !loading && (
          <div className="mt-12 animate-in fade-in duration-500">
            <h2 className={cn("text-xl font-bold text-text-main mb-6 flex items-center gap-2", displayFontClass)}>
              <Activity className="w-5 h-5 text-accent" />
              {t('home.pulse.title')}
            </h2>
            
            {loadingReports ? (
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[280px] h-32 bg-white/40 rounded-2xl animate-pulse flex-shrink-0" />
                ))}
              </div>
            ) : recentReports.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
                {recentReports.map(report => (
                  <div key={report._id} className="min-w-[280px] w-[280px] bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/60 shadow-sm snap-start flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-md">
                        {report.category}
                      </span>
                      {report.severity >= 4 && (
                        <AlertTriangle className="w-4 h-4 text-alert" />
                      )}
                    </div>
                    <p className="text-sm text-text-main font-medium mb-3 line-clamp-2 flex-grow">
                      "{report.description}"
                    </p>
                    <div className="flex items-center text-xs text-text-main/60 font-medium">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{report.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-main/50">{t('home.pulse.empty')}</p>
            )}
          </div>
        )}

        {/* Briefing Results */}
        {briefing && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Risk Score Widget */}
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 overflow-hidden">
              <div className="p-6 flex flex-col sm:flex-row gap-4 items-center justify-between text-center sm:text-left">
                <div>
                  <h2 className={cn("text-xl font-bold text-text-main flex items-center justify-center sm:justify-start gap-2", displayFontClass)}>
                    <Activity className="w-5 h-5 text-primary" />
                    {t('briefing.score.title')}
                  </h2>
                  <p className="text-sm text-text-main/60 mt-1">{t('briefing.score.subtitle')}</p>
                </div>
                <div className={cn(
                  "flex items-center justify-center w-16 h-16 shrink-0 rounded-full text-2xl font-bold border-4 shadow-sm",
                  briefing.overall_risk_score < 30 ? "text-emerald-600 border-emerald-200 bg-emerald-50/80" :
                  briefing.overall_risk_score < 60 ? "text-accent border-accent/30 bg-accent/10" :
                  "text-alert border-alert/30 bg-alert/10"
                )}>
                  {briefing.overall_risk_score}
                </div>
              </div>
              
              {/* Reasoning Accordion */}
              {briefing.reasoning && briefing.reasoning.length > 0 && (
                <div className="border-t border-white/40 bg-white/20">
                  <button 
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="w-full px-6 py-3 flex items-center justify-center sm:justify-between text-xs font-bold text-text-main/60 hover:text-text-main/80 hover:bg-white/30 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      {t('briefing.reasoning.button')}
                    </span>
                    {showReasoning ? <ChevronUp className="w-4 h-4 hidden sm:block" /> : <ChevronDown className="w-4 h-4 hidden sm:block" />}
                  </button>
                  
                  {showReasoning && (
                    <div className="px-6 pb-5 pt-1 animate-in slide-in-from-top-2 fade-in duration-200">
                      <ul className="space-y-2">
                        {briefing.reasoning.map((reason, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-text-main/80 items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-text-main/30 mt-1.5 shrink-0" />
                            <span className="leading-relaxed font-medium">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Scams */}
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 p-6">
                <h3 className={cn("text-lg font-bold text-text-main flex items-center gap-2 mb-4", displayFontClass)}>
                  <ShieldAlert className="w-5 h-5 text-accent" />
                  {t('briefing.scams.title')}
                </h3>
                {briefing.active_scams?.length > 0 ? (
                  <ul className="space-y-3">
                    {briefing.active_scams.map((scam, i) => (
                      <li key={i} className="flex gap-3 text-sm text-text-main/80 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0 shadow-sm" />
                        <span className="leading-relaxed font-medium">{scam}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-main/50 italic">{t('briefing.scams.empty')}</p>
                )}
              </div>

              {/* Safe Zones */}
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white/60 p-6">
                <h3 className={cn("text-lg font-bold text-text-main flex items-center gap-2 mb-4", displayFontClass)}>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  {t('briefing.safezones.title')}
                </h3>
                {briefing.safe_zones?.length > 0 ? (
                  <ul className="space-y-3">
                    {briefing.safe_zones.map((zone, i) => (
                      <li key={i} className="flex gap-3 text-sm text-text-main/80 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-sm" />
                        <span className="leading-relaxed font-medium">{zone}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-main/50 italic">{t('briefing.safezones.empty')}</p>
                )}
              </div>
            </div>

            {/* Accessibility Notes (Highlighted) */}
            {briefing.accessibility_notes?.length > 0 && (
              <div className="bg-secondary/30 backdrop-blur-xl rounded-2xl border border-secondary/50 p-6 shadow-sm">
                <h3 className={cn("text-lg font-bold text-text-main flex items-center gap-2 mb-4", displayFontClass)}>
                  <Info className="w-5 h-5 text-primary" />
                  {t('briefing.advice.title')}
                </h3>
                <ul className="space-y-3">
                  {briefing.accessibility_notes.map((note, i) => (
                    <li key={i} className="flex gap-3 text-sm text-text-main/80 items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-sm" />
                      <span className="leading-relaxed font-medium">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergency Contacts */}
            <div className="bg-background-dark rounded-2xl shadow-xl p-6 text-background-light overflow-hidden relative">
              <h3 className={cn("text-lg font-bold flex items-center gap-2 mb-6 text-background-light relative z-10", displayFontClass)}>
                <Phone className="w-5 h-5 text-primary" />
                {t('briefing.emergency.title')}
              </h3>
              <div className="grid sm:grid-cols-3 gap-6 relative z-10">
                <div>
                  <div className="text-xs text-background-light/60 font-semibold uppercase tracking-wider mb-1">{t('briefing.emergency.police')}</div>
                  <div className="text-xl font-bold tracking-tight">{briefing.emergency_contacts?.police || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-background-light/60 font-semibold uppercase tracking-wider mb-1">{t('briefing.emergency.ambulance')}</div>
                  <div className="text-xl font-bold tracking-tight">{briefing.emergency_contacts?.ambulance || "N/A"}</div>
                </div>
                <div>
                  <div className="text-xs text-background-light/60 font-semibold uppercase tracking-wider mb-1">{t('briefing.emergency.embassy')}</div>
                  <div className="text-sm font-semibold text-background-light/90 leading-snug">{briefing.emergency_contacts?.nearest_embassy || "N/A"}</div>
                </div>
              </div>
              
              {/* Background Decoration */}
              <ShieldAlert className="absolute -right-8 -bottom-8 w-40 h-40 text-background-light opacity-5 pointer-events-none" />
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
