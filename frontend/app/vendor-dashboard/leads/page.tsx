'use client';
import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCircle, XCircle, Clock, MapPin, Calendar, IndianRupee, AlertTriangle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = (path: string, opts: any = {}) => {
  const token = localStorage.getItem('vendor_token');
  return fetch(`${API_BASE}/api${path}`, {
    ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
};

function CountdownTimer({ seconds: initSecs }: { seconds: number }) {
  const [secs, setSecs] = useState(initSecs);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(s => s - 1), 1000);
    return () => clearInterval(t);
  }, []);
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  const pct = (secs / 1200) * 100;
  const urgent = secs < 120;
  return (
    <div className={`flex flex-col items-center ${urgent ? 'text-red-400' : 'text-orange-400'}`}>
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#30363d" strokeWidth="4" />
          <circle cx="32" cy="32" r="26" fill="none" stroke={urgent ? '#ef4444' : '#f97316'} strokeWidth="4"
            strokeLinecap="round" strokeDasharray={`${pct * 1.634} ${163.4 - pct * 1.634}`} className="transition-all" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-sm font-bold leading-none">{mins}:{s.toString().padStart(2, '0')}</span>
        </div>
      </div>
      {urgent && <span className="text-[10px] font-bold mt-1 animate-pulse">URGENT!</span>}
    </div>
  );
}

function LeadCard({ lead, onAccept, onDecline, loading }: any) {
  return (
    <div className={`bg-[#161b22] border rounded-2xl overflow-hidden transition-all ${
      lead.status === 'pending' ? 'border-orange-500/30 shadow-lg shadow-orange-500/5' : 'border-[#30363d] opacity-60'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#1c2333]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-orange-500/15 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/20">
              {lead.occasion?.toUpperCase() || 'EVENT'}
            </span>
            {lead.is_urgent && (
              <span className="text-xs font-bold bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse">
                URGENT
              </span>
            )}
            <span className="text-xs text-[#8b949e]">Lead #{lead.query_id}</span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1">Position #{lead.vendor_position} in queue</p>
        </div>
        {lead.status === 'pending' && <CountdownTimer seconds={lead.seconds_remaining || 0} />}
        {lead.status === 'accepted' && <div className="flex items-center gap-1.5 text-green-400"><CheckCircle className="w-5 h-5" /><span className="text-sm font-bold">Accepted</span></div>}
        {lead.status === 'declined' && <div className="flex items-center gap-1.5 text-red-400"><XCircle className="w-5 h-5" /><span className="text-sm font-bold">Declined</span></div>}
        {lead.status === 'expired' && <div className="flex items-center gap-1.5 text-[#8b949e]"><Clock className="w-5 h-5" /><span className="text-sm font-bold">Expired</span></div>}
      </div>

      {/* Lead partial info */}
      <div className="p-5 grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-[#8b949e] uppercase tracking-wide mb-1">Area</p>
          <div className="flex items-center gap-1.5 text-sm text-white">
            <MapPin className="w-3.5 h-3.5 text-orange-400" />
            {lead.city_area || 'City Area'}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[#8b949e] uppercase tracking-wide mb-1">Event Date</p>
          <div className="flex items-center gap-1.5 text-sm text-white">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            {lead.event_date || '—'}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[#8b949e] uppercase tracking-wide mb-1">Budget Range</p>
          <div className="flex items-center gap-1.5 text-sm text-white">
            <IndianRupee className="w-3.5 h-3.5 text-green-400" />
            ₹{(lead.budget_range_min || 0).toLocaleString('en-IN')} – ₹{(lead.budget_range_max || 0).toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[#8b949e] uppercase tracking-wide mb-1">Distance</p>
          <p className="text-sm text-white">{lead.distance_km ? `~${lead.distance_km} km` : 'Nearby'}</p>
        </div>
        {lead.theme_note && (
          <div className="col-span-2">
            <p className="text-[10px] text-[#8b949e] uppercase tracking-wide mb-1">Theme Note</p>
            <p className="text-sm text-white">{lead.theme_note}</p>
          </div>
        )}
      </div>

      {/* Hidden info note */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-xs text-[#8b949e]">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
          Client name, phone & full address hidden until payment confirmed
        </div>
      </div>

      {/* Actions */}
      {lead.status === 'pending' && (
        <div className="flex gap-3 p-5 pt-0">
          <button
            onClick={() => onDecline(lead.query_vendor_id)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-bold transition-all disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" /> Decline
          </button>
          <button
            onClick={() => onAccept(lead.query_vendor_id)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-green-500/20"
          >
            <CheckCircle className="w-4 h-4" /> Accept Lead
          </button>
        </div>
      )}
    </div>
  );
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');

  const loadLeads = useCallback(async () => {
    const r = await api('/vendor/leads/');
    if (r.ok) { const d = await r.json(); setLeads(d); }
    setLoading(false);
  }, []);

  useEffect(() => { loadLeads(); const i = setInterval(loadLeads, 15000); return () => clearInterval(i); }, [loadLeads]);

  const handleAccept = async (leadId: number) => {
    setActionLoading(true);
    const r = await api(`/vendor/leads/${leadId}/accept/`, { method: 'POST' });
    const d = await r.json();
    setMsg(d.message || (r.ok ? 'Lead accepted!' : 'Error'));
    if (r.ok) await loadLeads();
    setActionLoading(false);
  };

  const handleDecline = async (leadId: number) => {
    if (!confirm('Decline this lead? This will affect your response rate.')) return;
    setActionLoading(true);
    const r = await api(`/vendor/leads/${leadId}/decline/`, { method: 'POST' });
    const d = await r.json();
    setMsg(d.message || (r.ok ? 'Lead declined.' : 'Error'));
    if (r.ok) await loadLeads();
    setActionLoading(false);
  };

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const pendingCount = leads.filter(l => l.status === 'pending').length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            New Leads
            {pendingCount > 0 && <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">{pendingCount}</span>}
          </h1>
          <p className="text-sm text-[#8b949e] mt-1">Accept within 20 minutes or the lead goes to the next vendor.</p>
        </div>
        <button onClick={loadLeads} className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1">
          <Bell className="w-4 h-4" /> Refresh
        </button>
      </div>

      {msg && <div className={`p-3 rounded-xl text-sm ${msg.includes('accepted') || msg.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>{msg}</div>}

      {/* Score impact note */}
      <div className="bg-[#1c2333] border border-[#30363d] rounded-xl p-4 text-xs text-[#8b949e] space-y-1">
        <p><span className="text-green-400 font-bold">Accept + deliver 5★</span> → Score increases</p>
        <p><span className="text-yellow-400 font-bold">Decline</span> → Response rate drops</p>
        <p><span className="text-red-400 font-bold">No response (20 min)</span> → Auto-declined, -10 pts for 7 days</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'accepted', 'declined', 'expired'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter === f ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'text-[#8b949e] hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center">
          <Bell className="w-10 h-10 text-[#30363d] mx-auto mb-3" />
          <p className="text-[#8b949e] text-sm">{filter === 'pending' ? 'No pending leads right now — we\'ll notify you on WhatsApp!' : 'No leads found.'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(l => (
            <LeadCard key={l.query_vendor_id} lead={l} onAccept={handleAccept} onDecline={handleDecline} loading={actionLoading} />
          ))}
        </div>
      )}
    </div>
  );
}
