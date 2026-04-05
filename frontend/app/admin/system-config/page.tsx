"use client";

import { useEffect, useState } from "react";
import { fetchSystemConfig, updateSystemConfig } from "@/lib/adminApi";
import { Settings, RefreshCw, Save, AlertCircle, Sliders, DollarSign, BrainCircuit } from "lucide-react";

export default function SystemConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadConfig = async () => {
    setLoading(true);
    setSuccessMsg("");
    try {
      const data = await fetchSystemConfig();
      setConfig(data);
      setFormData(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load system configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      // Clean and parse numbers
      const payload = {
        base_commission_rate: parseFloat(formData.base_commission_rate) || 0,
        premium_vendor_fee: parseFloat(formData.premium_vendor_fee) || 0,
        algo_weight_rating: parseFloat(formData.algo_weight_rating) || 0,
        algo_weight_speed: parseFloat(formData.algo_weight_speed) || 0,
        algo_weight_conversion: parseFloat(formData.algo_weight_conversion) || 0,
      };
      
      const updated = await updateSystemConfig(payload);
      setConfig(updated);
      setFormData(updated);
      setSuccessMsg("System configuration updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <Settings className="h-6 w-6 text-slate-400" /> Global System Config
          </h2>
          <p className="text-slate-400 mt-1 text-sm">Critical override values for algorithms and platform revenue cuts.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" /> {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" /> {successMsg}
        </div>
      )}

      {/* Main Form container */}
      <div className="bg-[#1e2336] border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-800/30">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-400" /> Parameter Tuner
          </h3>
        </div>

        <div className="p-6 md:p-8 space-y-10">
          {/* Section 1: Financials */}
          <section>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <DollarSign className="h-4 w-4" /> Revenue Settings
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Base Commission Rate (%)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={formData.base_commission_rate}
                  onChange={(e) => handleChange('base_commission_rate', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <p className="text-xs text-slate-500 mt-2">Standard cut taken from every successful vendor deal.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Premium Vendor Fee (₹)</label>
                <input 
                  type="number"
                  step="1"
                  value={formData.premium_vendor_fee}
                  onChange={(e) => handleChange('premium_vendor_fee', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <p className="text-xs text-slate-500 mt-2">Monthly subscription cost for premium placement.</p>
              </div>
            </div>
          </section>

          <hr className="border-slate-800" />

          {/* Section 2: Algorithm Weights */}
          <section>
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4" /> Ranking Algorithm Weights
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Rating Weight</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.algo_weight_rating}
                  onChange={(e) => handleChange('algo_weight_rating', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Speed Weight</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.algo_weight_speed}
                  onChange={(e) => handleChange('algo_weight_speed', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Conversion Weight</label>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.algo_weight_conversion}
                  onChange={(e) => handleChange('algo_weight_conversion', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 bg-slate-900 border border-slate-800 p-3 rounded-lg">
              <strong>Info:</strong> These parameters dictate the AI sorting algorithm on the Vendor Scorecard. They do not need to add up to 1.0. A higher value means the algorithm prioritizes that metric heavily when ranking vendors for incoming leads.
            </p>
          </section>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-500/20 text-white px-6 py-2.5 rounded-xl font-medium transition-all"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving to Database...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper icon component since it was omitted in import
function CheckCircle2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
    </svg>
  )
}
