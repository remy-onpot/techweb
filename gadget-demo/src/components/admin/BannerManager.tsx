"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HeroSlide } from '@/lib/types';
import { Trash2, Upload, Plus, ToggleLeft, ToggleRight, Loader2, Image as ImageIcon, Eye } from 'lucide-react';

export const BannerManager = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [newSlide, setNewSlide] = useState({
    title: '', 
    subtitle: '', 
    badge: 'New Arrival', 
    price: '', 
    theme: 'dark' as const
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Load Slides on Mount
  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        setSlides(data as any || []);
    } catch (e) {
        console.error("Error loading slides", e);
    } finally {
        setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    // LOGIC: Limit to 5 active slides
    if (!currentState) {
      const activeCount = slides.filter(s => s.is_active).length;
      if (activeCount >= 5) {
        alert("Maximum 5 active slides allowed. Please deactivate one first.");
        return;
      }
    }

    // 1. Optimistic Update (Instant UI change)
    const updatedSlides = slides.map(s => 
        s.id === id ? { ...s, is_active: !currentState } : s
    );
    setSlides(updatedSlides);

    // 2. Database Update
    const { error } = await supabase
        .from('hero_slides')
        .update({ is_active: !currentState })
        .eq('id', id);

    if (error) {
        alert("Failed to update status");
        fetchSlides(); // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner? This cannot be undone.')) return;
    
    // 1. Optimistic Delete
    setSlides(slides.filter(s => s.id !== id));

    // 2. Database Delete
    await supabase.from('hero_slides').delete().eq('id', id);
  };

  const handleAddSlide = async () => {
    if (!imageFile || !newSlide.title) return alert("Please add an Image and a Title.");
    
    setUploading(true);
    
    try {
        // 1. Upload Image to 'banners' bucket
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('banners')
            .upload(fileName, imageFile);
            
        if (uploadError) throw uploadError;

        // 2. Get the URL
        const { data: { publicUrl } } = supabase.storage
            .from('banners')
            .getPublicUrl(fileName);

        // 3. Save to DB
        const { data, error } = await supabase.from('hero_slides').insert({
            title: newSlide.title,
            subtitle: newSlide.subtitle,
            badge: newSlide.badge,
            price: newSlide.price,
            theme: newSlide.theme,
            image_url: publicUrl,
            is_active: true // Auto-activate new slides
        }).select().single();

        if (error) throw error;

        // 4. Update UI
        if (data) setSlides([data as any, ...slides]);
        
        // Reset Form
        setImageFile(null);
        setNewSlide({ title: '', subtitle: '', badge: 'New Arrival', price: '', theme: 'dark' });

    } catch (error) {
        console.error("Error adding slide:", error);
        alert("Failed to create banner.");
    } finally {
        setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading banners...</div>;

  return (
    <div className="space-y-10">
      
      {/* 1. CREATION PANEL */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
            <Plus size={24} className="text-orange-500" /> 
            Create New Banner
        </h3>
        
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Form Inputs */}
            <div className="flex-1 space-y-4">
                <input 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition font-bold" 
                    placeholder="Headline (e.g. PS5 Pro Launch)" 
                    value={newSlide.title}
                    onChange={e => setNewSlide({...newSlide, title: e.target.value})}
                />
                <input 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition" 
                    placeholder="Subtitle (e.g. Experience the future of gaming)" 
                    value={newSlide.subtitle}
                    onChange={e => setNewSlide({...newSlide, subtitle: e.target.value})}
                />
                <div className="flex gap-4">
                    <input 
                        className="w-1/2 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium" 
                        placeholder="Badge (e.g. Limited Edition)" 
                        value={newSlide.badge}
                        onChange={e => setNewSlide({...newSlide, badge: e.target.value})}
                    />
                    <input 
                        className="w-1/2 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium" 
                        placeholder="Price (Optional)" 
                        value={newSlide.price}
                        onChange={e => setNewSlide({...newSlide, price: e.target.value})}
                    />
                </div>

                {/* Theme Selection */}
                <div className="pt-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Text Color Theme</label>
                    <div className="flex gap-2">
                        {['dark', 'light', 'purple', 'orange'].map(t => (
                        <button 
                            key={t}
                            onClick={() => setNewSlide({...newSlide, theme: t as any})}
                            className={`px-4 py-2 rounded-lg capitalize text-sm font-bold border-2 transition-all ${
                                newSlide.theme === t 
                                ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            {t}
                        </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Image Uploader */}
            <div className="w-full lg:w-1/3">
                <div className="h-full border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 bg-gray-50/50 hover:bg-white hover:border-orange-400 transition-all cursor-pointer relative group">
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                        onChange={e => setImageFile(e.target.files?.[0] || null)} 
                    />
                    {imageFile ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <ImageIcon size={32} />
                            </div>
                            <p className="text-green-700 font-bold truncate max-w-[200px]">{imageFile.name}</p>
                            <p className="text-xs text-gray-400 mt-1">Click to change</p>
                        </div>
                    ) : (
                        <div className="text-center group-hover:scale-105 transition-transform">
                            <div className="w-16 h-16 bg-white border border-gray-200 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                                <Upload size={28} />
                            </div>
                            <p className="text-sm font-bold text-gray-600">Upload Banner Image</p>
                            <p className="text-xs text-gray-400 mt-1">Recommended: 1920 x 600px</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <button 
          onClick={handleAddSlide} 
          disabled={uploading}
          className="mt-8 w-full py-4 bg-[#0A2540] text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-[#0A2540]/90 transition-all shadow-xl shadow-blue-900/20 active:scale-[0.99]"
        >
          {uploading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Publish Slide to Homepage</>}
        </button>
      </div>

      {/* 2. ACTIVE SLIDES LIST */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex justify-between items-center">
            <span>Manage Active Slides</span>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs">
                {slides.filter(s => s.is_active).length} / 5 Active
            </span>
        </h3>
        
        <div className="grid gap-4">
            {slides.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400">
                    No banners created yet. Use the form above.
                </div>
            ) : (
                slides.map(slide => (
                <div key={slide.id} className={`p-4 rounded-2xl border flex items-center gap-6 transition-all ${slide.is_active ? 'bg-white border-gray-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60 grayscale'}`}>
                    
                    {/* Preview Thumb */}
                    <div className="w-32 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 relative">
                        <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                        {!slide.is_active && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">INACTIVE</div>
                        )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-lg truncate">{slide.title}</h4>
                        <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                        <div className="flex gap-2 mt-2">
                            {slide.badge && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-bold uppercase">{slide.badge}</span>}
                            <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200 font-bold uppercase">{slide.theme} Theme</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pr-2">
                        <button 
                            onClick={() => handleToggleActive(slide.id, slide.is_active)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                slide.is_active 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                        >
                            {slide.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            {slide.is_active ? 'ON' : 'OFF'}
                        </button>
                        
                        <button 
                            onClick={() => handleDelete(slide.id)} 
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Banner"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};