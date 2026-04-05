'use client';
import { useEffect, useState, useCallback } from 'react';
import { Calendar, Plus, Trash2, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = (path: string, opts: any = {}) => {
  const token = localStorage.getItem('vendor_token');
  return fetch(`${API_BASE}/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers } });
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [blockDate, setBlockDate] = useState('');
  const [reason, setReason] = useState('');
  const [blockType, setBlockType] = useState('manual');
  const [recurringDay, setRecurringDay] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const load = useCallback(async () => {
    const r = await api('/vendor/availability/');
    if (r.ok) { const d = await r.json(); setAvailability(d); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addBlock = async () => {
    if (!blockDate && blockType !== 'recurring') { setMsg('Select a date'); return; }
    setSaving(true); setMsg('');
    const body: any = { block_type: blockType, reason };
    if (blockType === 'recurring') body.recurring_day = recurringDay;
    else body.blocked_date = blockDate;
    const r = await api('/vendor/availability/block/', { method: 'POST', body: JSON.stringify(body) });
    const d = await r.json();
    setMsg(r.ok ? 'Date blocked!' : d.message || 'Error');
    if (r.ok) { await load(); setBlockDate(''); setReason(''); }
    setSaving(false);
  };

  const removeBlock = async (date: string) => {
    const r = await api(`/vendor/availability/${date}/unblock/`, { method: 'DELETE' });
    if (r.ok || r.status === 204) { await load(); setMsg('Date unblocked'); }
  };

  // Build calendar grid for current month
  const buildCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay + 6) % 7; // Monday start
    const cells: (number | null)[] = [...Array(offset).fill(null)];
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const blockedDates = (availability?.blocked_dates || []).map((b: any) => b.blocked_date).filter(Boolean);
    const bookedDates = (availability?.booked_dates || []);

    return { cells, year, month, blockedDates, bookedDates };
  };

  const { cells, year, month, blockedDates, bookedDates } = buildCalendar();

  const dateStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Availability Calendar</h1>
        <p className="text-sm text-[#8b949e] mt-1">Block dates when you're unavailable. Blocked dates are skipped during lead assignment.</p>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500/50" /><span className="text-[#8b949e]">Blocked</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-500/40 border border-blue-500/50" /><span className="text-[#8b949e]">Booked (cannot block)</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#1c2333] border border-[#30363d]" /><span className="text-[#8b949e]">Available</span></div>
      </div>

      {/* Calendar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
          <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
            className="text-[#8b949e] hover:text-white px-2 py-1 rounded-lg hover:bg-white/5">&lt;</button>
          <span className="font-semibold text-white">{MONTHS[month]} {year}</span>
          <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
            className="text-[#8b949e] hover:text-white px-2 py-1 rounded-lg hover:bg-white/5">&gt;</button>
        </div>

        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-[#8b949e] py-1">{d}</div>)}
          </div>
          {/* Date cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const ds = dateStr(day);
              const isBlocked = blockedDates.includes(ds);
              const isBooked = bookedDates.includes(ds);
              const isToday = ds === new Date().toISOString().slice(0, 10);
              return (
                <button
                  key={ds}
                  onClick={() => !isBooked && (isBlocked ? removeBlock(ds) : setBlockDate(ds))}
                  className={`aspect-square rounded-xl text-xs font-medium flex items-center justify-center transition-all ${
                    isBooked ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 cursor-not-allowed' :
                    isBlocked ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30' :
                    isToday ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30' :
                    'bg-[#0d1117] border border-[#30363d] text-[#8b949e] hover:bg-white/5 hover:text-white hover:border-[#444]'
                  }`}
                  title={isBooked ? 'Active booking — cannot block' : isBlocked ? 'Click to unblock' : 'Click to block'}
                >
                  {day}
                  {isBooked && <Lock className="w-2 h-2 absolute" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add block form */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4">Block Date</h2>

        <div className="flex gap-2 mb-4">
          {[['manual', 'Single Date'], ['recurring', 'Recurring (Weekly)']].map(([v, l]) => (
            <button key={v} onClick={() => setBlockType(v)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${blockType === v ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' : 'bg-[#0d1117] text-[#8b949e] border border-[#30363d]'}`}>
              {l}
            </button>
          ))}
        </div>

        {blockType === 'manual' ? (
          <div className="mb-4">
            <label className="block text-xs text-[#8b949e] mb-1.5 uppercase tracking-wide font-medium">Date</label>
            <input type="date" value={blockDate} onChange={e => setBlockDate(e.target.value)} min={new Date().toISOString().slice(0, 10)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500" />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-xs text-[#8b949e] mb-1.5 uppercase tracking-wide font-medium">Day of Week</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS.map((d, i) => (
                <button key={d} onClick={() => setRecurringDay(i)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${recurringDay === i ? 'bg-orange-500 text-white' : 'bg-[#0d1117] border border-[#30363d] text-[#8b949e] hover:text-white'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs text-[#8b949e] mb-1.5 uppercase tracking-wide font-medium">Reason (optional)</label>
          <input value={reason} onChange={e => setReason(e.target.value)} placeholder="Personal holiday, travel, etc."
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-orange-500" />
        </div>

        {msg && <p className={`text-xs mb-3 ${msg === 'Date blocked!' || msg === 'Date unblocked' ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}

        <button onClick={addBlock} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50">
          <Plus className="w-4 h-4" /> {saving ? 'Blocking...' : 'Block Date'}
        </button>
      </div>

      {/* Blocked dates list */}
      {availability?.blocked_dates?.length > 0 && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#30363d]">
            <h2 className="font-semibold text-white">Blocked Dates ({availability.blocked_dates.length})</h2>
          </div>
          <div className="divide-y divide-[#30363d]">
            {availability.blocked_dates.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-white">{b.blocked_date || `Every ${DAYS[b.recurring_day]}`}</p>
                  {b.reason && <p className="text-xs text-[#8b949e]">{b.reason}</p>}
                  <span className="text-[10px] text-[#8b949e] bg-[#30363d] px-1.5 py-0.5 rounded">{b.block_type}</span>
                </div>
                {b.blocked_date && (
                  <button onClick={() => removeBlock(b.blocked_date)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Max orders setting */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-1">Max Orders Per Day</h2>
        <p className="text-xs text-[#8b949e] mb-3">Auto-blocks dates when this limit is reached.</p>
        <div className="flex gap-2">
          {[1, 2, 3].map(n => (
            <button key={n}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                (availability?.max_orders_per_day || 2) === n
                  ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                  : 'bg-[#0d1117] text-[#8b949e] border border-[#30363d] hover:border-[#444]'
              }`}>
              {n} order{n > 1 ? 's' : ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
