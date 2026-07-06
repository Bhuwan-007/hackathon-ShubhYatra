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
        <h1 className="text-3xl font-bold text-stone-900 mb-3">Scam Scanner</h1>
        <p className="text-stone-500">Upload a photo of a taxi meter, menu, or badge to check if it's legitimate.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 md:p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Location Context</label>
              <input type="text" placeholder="e.g. Paris" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-stone-700">Additional Notes</label>
              <input type="text" placeholder="e.g. He drove me for 5 mins" className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500/20 outline-none" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          <div 
            className="border-2 border-dashed border-stone-300 rounded-2xl p-10 text-center hover:bg-stone-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0])} />
            <UploadCloud className="w-10 h-10 text-stone-400 mx-auto mb-4" />
            {file ? (
              <p className="text-emerald-600 font-medium">{file.name}</p>
            ) : (
              <p className="text-stone-500">Click to upload or take a photo</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-4 font-semibold transition-colors flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? "Analyzing..." : "Scan Image"}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {result && !loading && (
        <div className={cn(
          "rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 border",
          result.is_suspicious 
            ? "bg-red-50 border-red-200" 
            : "bg-emerald-50 border-emerald-200"
        )}>
          <div className="flex items-start gap-4 mb-6">
            {result.is_suspicious ? <ShieldAlert className="w-10 h-10 text-red-600 shrink-0" /> : <CheckCircle className="w-10 h-10 text-emerald-600 shrink-0" />}
            <div>
              <h2 className={cn("text-2xl font-bold", result.is_suspicious ? "text-red-900" : "text-emerald-900")}>
                {result.is_suspicious ? "Suspicious Activity Detected" : "Looks Legitimate"}
              </h2>
              <p className={cn("text-sm font-semibold mt-1", result.is_suspicious ? "text-red-700" : "text-emerald-700")}>
                AI Confidence: {result.confidence}%
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/60 p-4 rounded-xl">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Analysis</h4>
              <p className="text-stone-800 leading-relaxed">{result.explanation}</p>
            </div>
            <div className="bg-white/80 p-4 rounded-xl border border-white/50">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Recommended Action</h4>
              <p className="font-medium text-stone-900">{result.recommended_action}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
