"use client";
import { useState, useRef } from "react";
import { scanScamImage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { UploadCloud, Loader2, ShieldAlert, CheckCircle, AlertTriangle, Search } from "lucide-react";

export default function ScanPage() {
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image to scan.");
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

      const data = await scanScamImage(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to scan image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold font-display text-text-main mb-3">Scam Scanner</h1>
        <p className="text-text-main/70">Upload a photo of a taxi meter, menu, or badge to check if it's legitimate.</p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 md:p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main/90">Location Context</label>
              <input type="text" placeholder="e.g. Paris" className="w-full px-4 py-3 rounded-xl border border-white/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white/50 backdrop-blur-sm shadow-inner placeholder:text-text-main/40 transition-all" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main/90">Additional Notes</label>
              <input type="text" placeholder="e.g. He drove me for 5 mins" className="w-full px-4 py-3 rounded-xl border border-white/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white/50 backdrop-blur-sm shadow-inner placeholder:text-text-main/40 transition-all" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <div 
            className="border-2 border-dashed border-text-main/20 rounded-2xl p-10 text-center hover:bg-white/40 hover:border-text-main/40 transition-all cursor-pointer bg-white/20 backdrop-blur-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0])} />
            <UploadCloud className="w-10 h-10 text-text-main/40 mx-auto mb-4" />
            {file ? (
              <p className="text-primary font-bold">{file.name}</p>
            ) : (
              <p className="text-text-main/60 font-medium">Click to upload or take a photo</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white shadow-md rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? "Analyzing..." : "Scan Image"}
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
              <h2 className={cn("text-2xl font-bold font-display", result.is_suspicious ? "text-alert" : "text-emerald-800")}>
                {result.is_suspicious ? "Suspicious Activity Detected" : "Looks Legitimate"}
              </h2>
              <p className={cn("text-sm font-bold mt-1", result.is_suspicious ? "text-alert/80" : "text-emerald-700")}>
                AI Confidence: {result.confidence}%
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/60 p-4 rounded-xl shadow-sm border border-white/50">
              <h4 className="text-xs font-bold text-text-main/60 uppercase tracking-wider mb-2">Analysis</h4>
              <p className="text-text-main/90 leading-relaxed font-medium">{result.explanation}</p>
            </div>
            <div className="bg-white/80 p-4 rounded-xl shadow-sm border border-white/60">
              <h4 className="text-xs font-bold text-text-main/60 uppercase tracking-wider mb-2">Recommended Action</h4>
              <p className="font-bold text-text-main">{result.recommended_action}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
