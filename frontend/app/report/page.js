"use client";
import { useState } from "react";
import { submitHazardReport } from "@/lib/api";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";

export default function ReportPage() {
  const [formData, setFormData] = useState({
    location: "",
    description: "",
    category: "scam",
    severity: "3"
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => form.append(key, formData[key]));
      if (file) form.append("image", file);

      await submitHazardReport(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 animate-in fade-in slide-in-from-bottom-4">
        <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold font-display text-text-main mb-2">Report Submitted!</h2>
        <p className="text-text-main/70 mb-6 font-medium">Thank you for helping keep the community safe. Your report will be verified shortly.</p>
        <button onClick={() => { setSuccess(false); setFormData({...formData, description: ""}); setFile(null); }} className="px-6 py-2 bg-primary hover:bg-primary/90 transition-colors shadow-md text-white rounded-lg font-bold">Submit Another</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display text-text-main mb-2">Report a Hazard</h1>
        <p className="text-text-main/70">Warn others about scams, dangers, or infrastructure issues.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-6 md:p-8 space-y-6">
        
        {error && <div className="p-3 bg-alert/10 border border-alert/20 text-alert rounded-lg text-sm font-bold shadow-sm">{error}</div>}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main/90">Location</label>
          <input required type="text" className="w-full px-4 py-3 rounded-xl border border-white/50 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent bg-white/50 backdrop-blur-sm shadow-inner transition-all placeholder:text-text-main/40" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-main/90">Category</label>
            <select className="w-full px-4 py-3 rounded-xl border border-white/50 outline-none bg-white/50 backdrop-blur-sm shadow-inner transition-all focus:ring-2 focus:ring-accent/40 focus:border-accent text-text-main" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="scam">Scam</option>
              <option value="theft">Theft</option>
              <option value="harassment">Harassment</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-main/90">Severity (1-5)</label>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-text-main/50">1</span>
              <input type="range" min="1" max="5" className="w-full accent-accent cursor-pointer" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} />
              <span className="text-xs font-bold text-text-main/50">5</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main/90">Description</label>
          <textarea required rows="3" className="w-full px-4 py-3 rounded-xl border border-white/50 outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent bg-white/50 backdrop-blur-sm shadow-inner transition-all placeholder:text-text-main/40 resize-none" placeholder="What happened?" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-text-main/90">Photo Evidence (Optional)</label>
          <input type="file" accept="image/*" className="w-full text-sm text-text-main/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-white/60 file:text-text-main file:shadow-sm hover:file:bg-white/80 file:transition-all cursor-pointer" onChange={e => setFile(e.target.files?.[0])} />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-white shadow-md rounded-xl py-4 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle className="w-5 h-5" />}
          Submit Report
        </button>
      </form>
    </div>
  );
}
