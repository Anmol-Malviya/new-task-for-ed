'use client';
import { useEffect, useState, useCallback } from 'react';
import { Image as ImageIcon, Trash2, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const api = (path: string, opts: any = {}) => {
  const token = localStorage.getItem('vendor_token');
  return fetch(`${API_BASE}/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...opts.headers } });
};

export default function PortfolioPage() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [occasionTag, setOccasionTag] = useState('');
  const [msg, setMsg] = useState('');

  const loadPhotos = useCallback(async () => {
    const r = await api('/vendor/photos/');
    if (r.ok) {
      const d = await r.json();
      setPhotos(d.photos || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleUpload = async () => {
    if (!urlInput) return;
    setUploading(true); setMsg('');
    const r = await api('/vendor/photos/upload/', { 
      method: 'POST', 
      body: JSON.stringify({ photo_url: urlInput, occasion_tag: occasionTag || null }) 
    });
    
    if (r.ok) {
      setUrlInput('');
      setOccasionTag('');
      setMsg('Uploaded successfully! Pending approval.');
      await loadPhotos();
    } else {
      const e = await r.json();
      setMsg(e.message || 'Upload failed');
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remove this photo from your portfolio?')) return;
    const r = await api(`/vendor/photos/${id}/delete/`, { method: 'DELETE' });
    if (r.ok || r.status === 204) {
      await loadPhotos();
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" /></div>;

  const approved = photos.filter(p => p.is_approved === true);
  const pending = photos.filter(p => p.is_approved === null);
  const rejected = photos.filter(p => p.is_approved === false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white">Portfolio Photos</h1>
        <p className="text-sm text-[#8b949e] mt-1 flex items-center gap-2">
          {approved.length} approved photos <span className="w-1 h-1 bg-[#8b949e] rounded-full" /> Minimum 8 required for profile activation.
        </p>
      </div>

      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-4">Add New Photos</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input 
            type="url" 
            value={urlInput} 
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste direct image URL (Cloudinary, etc.)"
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-orange-500"
          />
          <select 
            value={occasionTag}
            onChange={(e) => setOccasionTag(e.target.value)}
            className="md:w-48 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-orange-500"
          >
            <option value="">No Tag (General)</option>
            <option value="birthday">Birthday</option>
            <option value="wedding">Wedding</option>
            <option value="anniversary">Anniversary</option>
            <option value="corporate">Corporate</option>
          </select>
          <button 
            onClick={handleUpload}
            disabled={uploading || !urlInput}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-[0_0_15px_-5px_#f97316] disabled:opacity-50"
          >
            {uploading ? 'Adding...' : 'Add to Portfolio'}
          </button>
        </div>
        
        {msg && (
          <p className={`text-sm ${msg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>
        )}

        <div className="mt-4 flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-300">
           <AlertCircle className="w-4 h-4 shrink-0" />
           <p>Don't add phone numbers or watermarks to your photos. EventDhara automatically adds a watermark. Heavily edited or low-quality photos will be rejected.</p>
        </div>
      </div>

      <div className="space-y-6">
         {/* Approved */}
         {approved.length > 0 && (
           <div>
             <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
               <CheckCircle className="w-5 h-5 text-green-400" /> Live on Profile ({approved.length})
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {approved.map(p => (
                  <div key={p.id} className="group relative aspect-square bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#444]">
                    <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    {p.occasion_tag && (
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-md border border-white/10 uppercase">
                        {p.occasion_tag}
                      </div>
                    )}
                  </div>
                ))}
             </div>
           </div>
         )}

         {/* Pending */}
         {pending.length > 0 && (
           <div>
             <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
               <Clock className="w-5 h-5 text-yellow-400" /> Pending Admin Review ({pending.length})
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 opacity-70">
                {pending.map(p => (
                  <div key={p.id} className="group relative aspect-square bg-[#0d1117] border border-yellow-500/30 rounded-xl overflow-hidden">
                    <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                       <span className="bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-wider">Reviewing</span>
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-[#8b949e] hover:text-red-400 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>
           </div>
         )}

         {/* Rejected */}
         {rejected.length > 0 && (
           <div>
             <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
               <AlertCircle className="w-5 h-5 text-red-400" /> Rejected Photos ({rejected.length})
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                {rejected.map(p => (
                  <div key={p.id} className="relative aspect-square bg-[#0d1117] border border-red-500/30 rounded-xl overflow-hidden">
                    <img src={p.photo_url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-red-500/90 text-white text-[10px] font-medium p-1.5 text-center">
                       {p.rejection_reason || 'Rejected'}
                    </div>
                    <button onClick={() => handleDelete(p.id)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-[#8b949e] hover:text-red-400 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
             </div>
           </div>
         )}
         
         {photos.length === 0 && (
           <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center text-[#8b949e]">
             <ImageIcon className="w-12 h-12 mx-auto mb-4 text-[#30363d]" />
             <p className="text-sm">Your portfolio is empty.</p>
             <p className="text-xs mt-1">Upload at least 8 high-quality photos of your past work.</p>
           </div>
         )}
      </div>
    </div>
  );
}
