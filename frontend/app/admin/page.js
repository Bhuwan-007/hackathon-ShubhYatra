"use client";
import { useEffect, useState } from "react";
import { fetchHeatmap, fetchRawReports, verifyReport } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [heatmapData, setHeatmapData] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [heatMap, rawReports] = await Promise.all([
        fetchHeatmap(),
        fetchRawReports()
      ]);
      setHeatmapData(heatMap);
      setReports(rawReports);
    } catch (error) {
      console.error("Failed to load admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyReport(id);
      loadData(); // Refresh list to show updated status
    } catch (error) {
      console.error("Verification failed", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-text-main/50">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="border-b border-white/40 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-display text-text-main flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-accent" />
              ShubhYatra Authority Dashboard
            </h1>
            <p className="text-text-main/70 mt-1">Decision intelligence and hazard monitoring center.</p>
          </div>
        </header>

        {/* Heatmap Chart Section */}
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h2 className="text-lg font-bold font-display text-text-main mb-6">Location Hazard Heatmap</h2>
          {heatmapData.length === 0 ? (
            <div className="h-64 flex items-center justify-center font-bold text-text-main/60">No report data available yet.</div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                  <XAxis dataKey="location" stroke="#888" tick={{ fill: '#888' }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#888" tick={{ fill: '#888' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#E0A458" tick={{ fill: '#E0A458' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e5e5', color: '#3D1F2B', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    itemStyle={{ color: '#3D1F2B', fontWeight: 'bold' }}
                  />
                  <Bar yAxisId="left" dataKey="count" name="Report Count" fill="#E8735F" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avgSeverity" name="Avg Severity (1-5)" fill="#E0A458" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Raw Reports List */}
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="p-6 border-b border-white/40 flex items-center justify-between bg-white/30">
            <h2 className="text-lg font-bold font-display text-text-main">Pending Field Reports</h2>
            <span className="text-sm px-3 py-1 bg-white/60 text-text-main shadow-sm rounded-full font-bold">{reports.filter(r => r.status === 'pending').length} Pending</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/50 text-text-main/70">
                <tr>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold">Location</th>
                  <th className="px-6 py-4 font-bold">Category</th>
                  <th className="px-6 py-4 font-bold">Severity</th>
                  <th className="px-6 py-4 font-bold w-full max-w-xs">Description</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {reports.map(report => (
                  <tr key={report._id} className="hover:bg-white/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-text-main/70">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-text-main">{report.location}</td>
                    <td className="px-6 py-4 capitalize font-medium text-text-main/80">{report.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={cn("w-2 h-4 rounded-sm shadow-inner", i < report.severity ? (report.severity >= 4 ? "bg-alert" : "bg-accent") : "bg-white/60")} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-main/70 truncate max-w-xs font-medium">{report.description}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm",
                        report.status === 'verified' ? "bg-primary/10 text-primary border border-primary/20" : "bg-accent/20 text-accent border border-accent/30"
                      )}>
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status === 'pending' ? (
                        <button 
                          onClick={() => handleVerify(report._id)}
                          className="text-xs font-bold px-3 py-1.5 bg-primary hover:bg-primary/90 shadow-sm text-white rounded-lg transition-colors"
                        >
                          Verify
                        </button>
                      ) : (
                        <span className="text-xs text-text-main/50 font-bold px-3 py-1.5">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center font-bold text-text-main/50">
                      No reports found in the database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
