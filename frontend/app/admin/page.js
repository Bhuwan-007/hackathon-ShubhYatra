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
      <div className="flex h-[80vh] items-center justify-center text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="border-b border-stone-800 pb-6 mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              ShubhYatra Authority Dashboard
            </h1>
            <p className="text-stone-400 mt-1">Decision intelligence and hazard monitoring center.</p>
          </div>
        </header>

        {/* Heatmap Chart Section */}
        <div className="bg-stone-800 rounded-2xl border border-stone-700 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-6">Location Hazard Heatmap</h2>
          {heatmapData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-stone-500">No report data available yet.</div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                  <XAxis dataKey="location" stroke="#888" tick={{ fill: '#888' }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#888" tick={{ fill: '#888' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#eab308" tick={{ fill: '#eab308' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1c1917', borderColor: '#444', color: '#fff' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar yAxisId="left" dataKey="count" name="Report Count" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avgSeverity" name="Avg Severity (1-5)" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Raw Reports List */}
        <div className="bg-stone-800 rounded-2xl border border-stone-700 overflow-hidden shadow-xl">
          <div className="p-6 border-b border-stone-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Pending Field Reports</h2>
            <span className="text-sm px-3 py-1 bg-stone-700 rounded-full font-medium">{reports.filter(r => r.status === 'pending').length} Pending</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-stone-900/50 text-stone-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Location</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Severity</th>
                  <th className="px-6 py-4 font-semibold w-full max-w-xs">Description</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-700">
                {reports.map(report => (
                  <tr key={report._id} className="hover:bg-stone-700/30 transition-colors">
                    <td className="px-6 py-4 text-stone-400">{new Date(report.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-stone-200">{report.location}</td>
                    <td className="px-6 py-4 capitalize text-stone-300">{report.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={cn("w-2 h-4 rounded-sm", i < report.severity ? (report.severity >= 4 ? "bg-red-500" : "bg-amber-500") : "bg-stone-700")} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-400 truncate max-w-xs">{report.description}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide",
                        report.status === 'verified' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      )}>
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status === 'pending' ? (
                        <button 
                          onClick={() => handleVerify(report._id)}
                          className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                        >
                          Verify
                        </button>
                      ) : (
                        <span className="text-xs text-stone-500 font-medium px-3 py-1.5">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-stone-500">
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
