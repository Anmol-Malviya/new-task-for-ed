'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Star, Award, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function PublicVendorProfile() {
  const params = useParams();
  const id = params.id as string;
  
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    
    fetch(`${API_BASE}/api/vendors/${id}/portfolio/`)
      .then(res => {
        if (!res.ok) throw new Error('Vendor not found or not available');
        return res.json();
      })
      .then(data => {
        setVendor(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = (e: any) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % vendor.portfolio.length);
  };

  const prevImage = (e: any) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + vendor.portfolio.length) % vendor.portfolio.length);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0d1117]"><div className="animate-spin w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117]"><h1 className="text-3xl font-bold text-white mb-4">Oops!</h1><p className="text-[#8b949e]">{error}</p></div>;
  if (!vendor) return null;

  return (
    <main className="min-h-screen bg-[#0d1117] text-white pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Vendor Header */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-8 mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          {/* Subtle gradient bg */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-[#30363d] shrink-0 bg-[#0d1117] relative z-10">
            {vendor.brand_logo ? (
              <img src={`${API_BASE}${vendor.brand_logo}`} alt={vendor.business_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-[#30363d] uppercase">
                {vendor.business_name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left z-10 flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">{vendor.business_name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium text-[#8b949e] mb-4">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-orange-500" /> {vendor.city}</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {vendor.avg_rating || '5.0'} / 5</span>
              <span className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20"><Award className="w-3 h-3" /> EventDhara Verified</span>
            </div>
            {vendor.bio && <p className="text-[#8b949e] max-w-2xl text-sm leading-relaxed">{vendor.bio}</p>}
          </div>
          
          <div className="z-10 shrink-0">
             <button className="bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
               Request Booking
             </button>
          </div>
        </div>

        {/* Portfolio Section */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <ImageIcon className="w-6 h-6 text-orange-500" /> Work Portfolio
            </h2>
            <span className="text-sm font-medium text-[#8b949e] bg-[#161b22] px-4 py-1.5 rounded-full border border-[#30363d]">
              {vendor.portfolio.length} Photos
            </span>
          </div>

          {vendor.portfolio.length === 0 ? (
            <div className="bg-[#161b22] border border-[#30363d] border-dashed rounded-3xl p-16 flex flex-col items-center justify-center">
              <ImageIcon className="w-12 h-12 text-[#30363d] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No photos yet</h3>
              <p className="text-[#8b949e]">This vendor hasn't uploaded their portfolio yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {vendor.portfolio.map((photo: any, index: number) => (
                <div 
                  key={photo.photo_id} 
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-[#30363d] bg-[#161b22]"
                  onClick={() => openLightbox(index)}
                >
                  <img src={`${API_BASE}${photo.photo_url}`} alt="Portfolio work" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-xs font-bold text-white bg-orange-500/90 px-3 py-1 rounded-lg backdrop-blur-sm">
                      {photo.occasion_tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>

      {/* Lightbox */}
      {lightboxOpen && vendor.portfolio.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur flex items-center justify-center p-4 md:p-8" onClick={closeLightbox}>
          <button className="absolute top-6 right-6 text-[#8b949e] hover:text-white transition-colors p-2 bg-[#161b22] rounded-full border border-[#30363d]">
            <X className="w-6 h-6" />
          </button>
          
          <button className="absolute left-6 text-[#8b949e] hover:text-white transition-colors p-3 bg-[#161b22]/50 hover:bg-[#161b22] rounded-full border border-[#30363d] backdrop-blur-md hidden md:block" onClick={prevImage}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex-1 w-full relative">
              <img 
                src={`${API_BASE}${vendor.portfolio[currentImageIndex].photo_url}`} 
                alt="Enlarged portfolio" 
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
            
            {/* Mobile Navigation & Details */}
            <div className="mt-6 flex items-center justify-between text-white">
               <button className="md:hidden p-2 bg-[#161b22] rounded-full" onClick={prevImage}><ChevronLeft className="w-5 h-5"/></button>
               <div className="text-center flex-1">
                  <span className="inline-block px-4 py-1.5 bg-orange-500 text-white text-sm font-bold rounded-xl mb-1 shadow-lg">
                    {vendor.portfolio[currentImageIndex].occasion_tag}
                  </span>
                  <p className="text-[#8b949e] text-xs">Photo {currentImageIndex + 1} of {vendor.portfolio.length}</p>
               </div>
               <button className="md:hidden p-2 bg-[#161b22] rounded-full" onClick={nextImage}><ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
          
          <button className="absolute right-6 text-[#8b949e] hover:text-white transition-colors p-3 bg-[#161b22]/50 hover:bg-[#161b22] rounded-full border border-[#30363d] backdrop-blur-md hidden md:block" onClick={nextImage}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </main>
  );
}
