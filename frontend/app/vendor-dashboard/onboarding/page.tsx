'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  User, Tag, Image, CreditCard, FileCheck,
  CheckCircle, Circle, ChevronRight, ArrowLeft,
  AlertCircle, Clock, Lock
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = (path: string, opts: any = {}) => {
  const token = localStorage.getItem('vendor_token');
  return fetch(`${API_BASE}/api${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers },
  });
};

const STEPS = [
  { id: 1, key: 'basic_profile', label: 'Basic Profile', icon: User, desc: 'Business name, owner, contact, city' },
  { id: 2, key: 'service_categories', label: 'Service Categories', icon: Tag, desc: 'Which occasions you handle' },
  { id: 3, key: 'portfolio_photos', label: 'Portfolio Photos', icon: Image, desc: 'Min 8 real work photos (admin reviewed)' },
  { id: 4, key: 'bank_details', label: 'Bank Details', icon: CreditCard, desc: 'For automated payouts via Razorpay' },
  { id: 5, key: 'agreement', label: 'Digital Agreement', icon: FileCheck, desc: 'Platform rules and commission agreement' },
];

const OCCASIONS = [
  { value: 'birthday', label: '🎂 Birthday' },
  { value: 'anniversary', label: '💍 Anniversary' },
  { value: 'baby_shower', label: '🍼 Baby Shower' },
  { value: 'wedding', label: '💒 Wedding' },
  { value: 'corporate', label: '🏢 Corporate' },
  { value: 'other', label: '✨ Other' },
];

export default function OnboardingPage() {
  const [status, setStatus] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Step 1 form
  const [profile, setProfile] = useState({ owner_name: '', business_name: '', phone: '', whatsapp_number: '', city: '', description: '', vendor_type: '' });
  // Step 2
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  // Step 3
  const [photoUrl, setPhotoUrl] = useState('');
  const [photos, setPhotos] = useState<any[]>([]);
  // Step 4
  const [bank, setBank] = useState({ account_holder: '', account_number: '', ifsc_code: '', bank_name: '' });
  // Step 5
  const [agreed, setAgreed] = useState({ non_solicitation_clause: false, commission_rate_agreed: false, dispute_policy_agreed: false, platform_rules_agreed: false });

  const loadStatus = useCallback(async () => {
    const r = await api('/vendor/onboarding-status/');
    if (r.ok) {
      const d = await r.json();
      setStatus(d);
      setCurrentStep(d.step > 5 ? 5 : d.step);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  // Load existing photos
  useEffect(() => {
    api('/vendor/photos/').then(r => r.ok ? r.json() : null).then(d => { if (d) setPhotos(d.photos || []); });
  }, []);

  const stepDone = (key: string) => status?.steps_detail?.[`${STEPS.find(s => s.key === key)?.id}_${key}`] || false;

  const saveStep = async () => {
    setSaving(true); setMsg('');
    try {
      let r: Response;
      if (currentStep === 1) {
        r = await api('/vendor/profile/', { method: 'PUT', body: JSON.stringify(profile) });
      } else if (currentStep === 2) {
        r = await api('/vendor/categories/', { method: 'POST', body: JSON.stringify({ occasions: selectedOccasions }) });
      } else if (currentStep === 3) {
        if (!photoUrl) { setMsg('Enter a photo URL'); setSaving(false); return; }
        r = await api('/vendor/photos/upload/', { method: 'POST', body: JSON.stringify({ photo_url: photoUrl }) });
        if (r.ok) { setPhotoUrl(''); }
      } else if (currentStep === 4) {
        r = await api('/vendor/bank-details/', { method: 'POST', body: JSON.stringify(bank) });
      } else {
        if (!Object.values(agreed).every(Boolean)) { setMsg('Please agree to all clauses'); setSaving(false); return; }
        r = await api('/vendor/agreement/', { method: 'POST', body: JSON.stringify(agreed) });
      }
      if (r!.ok) {
        setMsg('Saved!');
        await loadStatus();
        if (currentStep < 5) setTimeout(() => setCurrentStep(s => s + 1), 600);
      } else {
        const e = await r!.json();
        setMsg(e.message || 'Error saving');
      }
    } catch {
      setMsg('Network error');
    }
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Vendor Onboarding</h1>
        <p className="text-sm text-[#8b949e]">Complete all 5 steps to go live and receive leads.</p>
      </div>

      {/* Step progress */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STEPS.map((step) => {
          const done = stepDone(step.key);
          const active = currentStep === step.id;
          const Icon = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                done ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                active ? 'bg-orange-500/15 border-orange-500/20 text-orange-400' :
                'bg-[#161b22] border-[#30363d] text-[#8b949e]'
              }`}
            >
              {done ? <CheckCircle className="w-4 h-4" /> : active ? <Icon className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              {step.id}. {step.label}
            </button>
          );
        })}
      </div>

      {/* Admin approval banner */}
      {status?.admin_approval_status === 'pending' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">Awaiting Admin Approval</p>
            <p className="text-xs text-[#8b949e]">All steps complete! Admin will review within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#30363d]">
          {(() => { const Icon = STEPS[currentStep - 1].icon; return <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center"><Icon className="w-5 h-5 text-orange-400" /></div>; })()}
          <div>
            <h2 className="font-bold text-white">Step {currentStep}: {STEPS[currentStep - 1].label}</h2>
            <p className="text-sm text-[#8b949e]">{STEPS[currentStep - 1].desc}</p>
          </div>
        </div>

        {/* ── STEP 1: Basic Profile ── */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'owner_name', label: "Owner's Full Name", ph: 'Ramesh Kumar' },
                { key: 'business_name', label: 'Business Name', ph: 'Ramesh Decoration Studio' },
                { key: 'phone', label: 'Phone Number', ph: '9876543210' },
                { key: 'whatsapp_number', label: 'WhatsApp Number', ph: 'Same as phone or different' },
                { key: 'city', label: 'City', ph: 'Indore' },
                { key: 'vendor_type', label: 'Vendor Type', ph: 'Decorator' },
              ].map(({ key, label, ph }) => (
                <div key={key}>
                  <label className="block text-xs text-[#8b949e] mb-1.5 font-medium uppercase tracking-wide">{label}</label>
                  <input
                    value={(profile as any)[key]}
                    onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={ph}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5 font-medium uppercase tracking-wide">Business Description</label>
              <textarea
                value={profile.description}
                onChange={e => setProfile(p => ({ ...p, description: e.target.value }))}
                placeholder="Describe your services, experience, specialties..."
                rows={3}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-orange-500 transition-colors resize-none"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Categories ── */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-[#8b949e]">Select all occasion types you handle. Each category opens that lead queue.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {OCCASIONS.map(({ value, label }) => {
                const sel = selectedOccasions.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => setSelectedOccasions(prev =>
                      sel ? prev.filter(o => o !== value) : [...prev, value]
                    )}
                    className={`p-4 rounded-xl border text-sm font-medium text-left transition-all ${
                      sel ? 'bg-orange-500/15 border-orange-500/30 text-orange-300' : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#444]'
                    }`}
                  >
                    <div className="text-lg mb-1">{label.split(' ')[0]}</div>
                    {label.split(' ').slice(1).join(' ')}
                    {sel && <div className="mt-2"><CheckCircle className="w-4 h-4 text-orange-400" /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Photos ── */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <p className="text-xs text-blue-300">Upload min 8 real work photos. Admin reviews quality. Photos auto-watermarked with EventDhara logo.</p>
            </div>
            <div className="flex gap-2">
              <input
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="Paste Cloudinary/direct photo URL..."
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-orange-500"
              />
              <button onClick={saveStep} disabled={saving} className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                {saving ? '...' : 'Add'}
              </button>
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p: any) => (
                  <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#0d1117] border border-[#30363d]">
                    <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                    <div className={`absolute bottom-0 left-0 right-0 px-2 py-1 text-[9px] font-bold text-center ${
                      p.is_approved === true ? 'bg-green-500/80 text-white' :
                      p.is_approved === false ? 'bg-red-500/80 text-white' :
                      'bg-yellow-500/80 text-white'
                    }`}>
                      {p.is_approved === true ? '✓ Approved' : p.is_approved === false ? '✗ Rejected' : '⏳ Pending'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-[#8b949e]">{photos.length}/8 photos uploaded (min 8 required)</p>
          </div>
        )}

        {/* ── STEP 4: Bank Details ── */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
              <Lock className="w-4 h-4 text-yellow-400 shrink-0" />
              <p className="text-xs text-yellow-300">Bank details required for automated 85% payouts. Verification takes 2–3 days via Razorpay.</p>
            </div>
            {[
              { key: 'account_holder', label: 'Account Holder Name', ph: 'Ramesh Kumar' },
              { key: 'account_number', label: 'Account Number', ph: '0000XXXXXXXXX' },
              { key: 'ifsc_code', label: 'IFSC Code', ph: 'HDFC0001234' },
              { key: 'bank_name', label: 'Bank Name', ph: 'HDFC Bank' },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className="block text-xs text-[#8b949e] mb-1.5 font-medium uppercase tracking-wide">{label}</label>
                <input
                  value={(bank as any)[key]}
                  onChange={e => setBank(b => ({ ...b, [key]: e.target.value }))}
                  placeholder={ph}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 5: Agreement ── */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-xs text-[#8b949e] leading-relaxed space-y-2">
              <p><strong className="text-white">Non-Solicitation Clause:</strong> You agree not to solicit EventDhara's clients outside the platform for 12 months after last interaction.</p>
              <p><strong className="text-white">Commission Agreement:</strong> You agree to the tiered commission: Starter 15%, Active 12%, Premium 10% of each completed order.</p>
              <p><strong className="text-white">Dispute Policy:</strong> Disputes are mediated by EventDhara. Payout may be held up to 48 hours during dispute resolution.</p>
              <p><strong className="text-white">Platform Rules:</strong> Sharing personal contact info, asking for direct UPI, or booking clients outside the platform will result in suspension/ban.</p>
            </div>
            {[
              { key: 'non_solicitation_clause', label: 'I agree to the Non-Solicitation Clause' },
              { key: 'commission_rate_agreed', label: 'I agree to the Commission Structure (15/12/10%)' },
              { key: 'dispute_policy_agreed', label: 'I agree to the Dispute Resolution Policy' },
              { key: 'platform_rules_agreed', label: 'I agree to all Platform Rules and Conduct Guidelines' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-all ${(agreed as any)[key] ? 'bg-orange-500 border-orange-500' : 'bg-[#0d1117] border-[#30363d] group-hover:border-orange-500/50'}`}
                  onClick={() => setAgreed(a => ({ ...a, [key]: !(a as any)[key] }))}>
                  {(agreed as any)[key] && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-[#8b949e] group-hover:text-white transition-colors">{label}</span>
              </label>
            ))}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-[#30363d]">
          <button
            onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 text-sm text-[#8b949e] hover:text-white transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {msg && <span className={`text-sm ${msg === 'Saved!' ? 'text-green-400' : 'text-red-400'}`}>{msg}</span>}

          {currentStep < 3 && (
            <button
              onClick={saveStep}
              disabled={saving}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save & Continue'} <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {currentStep === 5 && (
            <button
              onClick={saveStep}
              disabled={saving || !Object.values(agreed).every(Boolean)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              {saving ? 'Signing...' : 'Sign & Complete'} <FileCheck className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
