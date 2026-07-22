"use client";
import { useState, useRef, useEffect } from "react";
import { scanScamImage } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { UploadCloud, Loader2, ShieldAlert, CheckCircle, AlertTriangle, Search } from "lucide-react";

export default function ScanPage() {
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const toast = useToast();
  const { language, t } = useLanguage();
  const fileInputRef = useRef(null);

  // Auto-refetch when language changes if we already have a result
  useEffect(() => {
    if (result && file && !loading) {
      const e = { preventDefault: () => {} };
      handleSubmit(e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image to scan.");
      toast.error("Please select an image to scan.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      if (location) formData.append("location", location);
      if (notes) formData.append("user_notes", notes);
      // api.js adds language to formData

      const data = await scanScamImage(formData, language);
      setResult(data);
      toast.success("Image scanned successfully!");
    } catch (err) {
      setError(err.message || "Failed to scan image.");
      toast.error(err.message || "Failed to scan image.");
    } finally {
      setLoading(false);
    }
  };

  const displayFontClass = language === 'hi' ? 'font-sans' : 'font-display';

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className={cn("text-3xl font-bold text-text-main mb-3", displayFontClass)}>{t('scan.hero.title')}</h1>
        <p className="text-text-main/70">{t('scan.hero.subtitle')}</p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 md:p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main/90">{t('scan.form.location')}</label>
              <input type="text" placeholder={t('scan.form.location_ph')} className="w-full px-4 py-3 rounded-xl border border-white/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white/50 backdrop-blur-sm shadow-inner placeholder:text-text-main/40 transition-all" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main/90">{t('scan.form.notes')}</label>
              <input type="text" placeholder={t('scan.form.notes_ph')} className="w-full px-4 py-3 rounded-xl border border-white/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white/50 backdrop-blur-sm shadow-inner placeholder:text-text-main/40 transition-all" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <div 
            className="border-2 border-dashed border-text-main/20 rounded-2xl p-10 text-center hover:bg-white/40 hover:border-text-main/40 transition-all cursor-pointer bg-white/20 backdrop-blur-sm"
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if(e.key === 'Enter') fileInputRef.current?.click(); }}
            aria-label={t('scan.form.upload')}
          >
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0])} />
            <UploadCloud className="w-10 h-10 text-text-main/40 mx-auto mb-4" />
            {file ? (
              <p className="text-primary font-bold">{file.name}</p>
            ) : (
              <p className="text-text-main/60 font-medium">{t('scan.form.upload')} ({t('scan.form.upload_hint')})</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white shadow-md rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? "..." : t('scan.form.submit')}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-alert/10 border border-alert/20 rounded-xl flex gap-3 text-alert animate-in fade-in slide-in-from-bottom-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className={cn(
          "rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-sm backdrop-blur-xl border",
          result.is_suspicious 
            ? "bg-alert/10 border-alert/30" 
            : "bg-emerald-50/80 border-emerald-200"
        )}>
          <div className="flex items-start gap-4 mb-6">
            {result.is_suspicious ? <ShieldAlert className="w-10 h-10 text-alert shrink-0" /> : <CheckCircle className="w-10 h-10 text-emerald-600 shrink-0" />}
            <div>
              <h2 className={cn("text-2xl font-bold", displayFontClass, result.is_suspicious ? "text-alert" : "text-emerald-800")}>
                {result.is_suspicious ? t('scan.result.suspicious') : t('scan.result.legit')}
              </h2>
              <p className={cn("text-sm font-bold mt-1", result.is_suspicious ? "text-alert/80" : "text-emerald-700")}>
                {t('scan.result.confidence')}: {result.confidence}%
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/60 p-4 rounded-xl shadow-sm border border-white/50">
              <h4 className="text-xs font-bold text-text-main/60 uppercase tracking-wider mb-2">{t('scan.result.analysis')}</h4>
              <p className="text-text-main/90 leading-relaxed font-medium">{result.explanation}</p>
            </div>
            <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-white/60">
              <h4 className="text-xs font-bold text-text-main/60 uppercase tracking-wider mb-2">{t('scan.result.recommended')}</h4>
              <p className="font-bold text-text-main">{result.recommended_action}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
