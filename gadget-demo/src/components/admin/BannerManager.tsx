"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { HeroSlide, Product } from '@/lib/types';
import { Trash2, Upload, Plus, Link as LinkIcon, Loader2, ImageIcon, CheckCircle } from 'lucide-react';

export const BannerManager = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [products, setProducts] = useState<Product[]>([]); // For the dropdown
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // New Form Logic
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [linkType, setLinkType] = useState<'category' | 'product'>('category');
  const [linkTarget, setLinkTarget] = useState('laptop');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Get Slides
    const { data: slidesData } = await supabase.from('hero_slides').select('*').order('created_at', { ascending: false });
    if (slidesData) setSlides(slidesData as any);

    // Get Products (for the dropdown selector)
    const { data: prodData } = await supabase.from('products').select('id, name');
    if (prodData) setProducts(prodData as any);
  };

  const handleAddSlide = async () => {
    if (!imageFile) return alert("Please select an image");
    
    setUploading(true);
    
    try {
        // 1. Upload
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `hero-${Date.now()}.${fileExt}`;
        const { error: upError } = await supabase.storage.from('banners').upload(fileName, imageFile);
        if (upError) throw upError;

        const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(fileName);

        // 2. Save
        const { data, error } = await supabase.from('hero_slides').insert({
            image_url: publicUrl,
            link_type: linkType,
            link_target: linkTarget,
            is_active: true
        }).select().single();

        if (error) throw error;
        if (data) setSlides([data as any, ...slides]);
        
        // Reset
        setImageFile(null);
    } catch (e) {
        alert("Error creating banner");
    } finally {
        setUploading(false);
    }
  };

  const deleteSlide = async (id: string) => {
      setSlides(slides.filter(s => s.id !== id));
      await supabase.from('hero_slides').delete().eq('id', id);
  };

  return (
    <div className="space-y-8">
      
      {/* CREATION FORM */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-8">
        
        {/* Left: Image Uploader */}
        <div className="w-full md:w-1/2">
            <div className="border-2 border-dashed border-gray-300 rounded-xl h-64 flex flex-col items-center justify-center relative bg-gray-50 hover:bg-white hover:border-blue-500 transition-all cursor-pointer group">
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={e => setImageFile(e.target.files?.[0] || null)} />
                {imageFile ? (
                    <div className="text-center text-green-600">
                        <CheckCircle size={40} className="mx-auto mb-2" />
                        <p className="font-bold">{imageFile.name}</p>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 group-hover:text-blue-500">
                        <ImageIcon size={40} className="mx-auto mb-2" />
                        <p className="font-medium">Click to Upload Graphic</p>
                        <p className="text-xs mt-1">Recommended: 1600 x 900px</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right: Configuration */}
        <div className="w-full md:w-1/2 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Banner Destination</h3>
                <div className="flex gap-2 mb-4">
                    <button 
                        onClick={() => setLinkType('category')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border ${linkType === 'category' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600'}`}
                    >
                        Link to Category
                    </button>
                    <button 
                        onClick={() => setLinkType('product')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold border ${linkType === 'product' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600'}`}
                    >
                        Link to Product
                    </button>
                </div>

                {linkType === 'category' ? (
                    <select 
                        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={e => setLinkTarget(e.target.value)}
                    >
                        {['laptop', 'audio', 'phone', 'gaming', 'monitor'].map(c => (
                            <option key={c} value={c}>{c.toUpperCase()}</option>
                        ))}
                    </select>
                ) : (
                    <select 
                        className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={e => setLinkTarget(e.target.value)}
                    >
                        <option value="">Select a Product...</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                )}
            </div>

            <button 
                onClick={handleAddSlide}
                disabled={uploading}
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200"
            >
                {uploading ? <Loader2 className="animate-spin" /> : <><Upload size={20} /> Publish Banner</>}
            </button>
        </div>
      </div>

      {/* LIST OF ACTIVE BANNERS */}
      <div className="grid gap-4">
         {slides.map((slide, index) => (
             <div key={slide.id} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                     {index + 1}
                 </div>
                 <img src={slide.image_url} className="w-32 h-20 object-cover rounded-lg bg-gray-100 border" />
                 
                 <div className="flex-1">
                     <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <LinkIcon size={14} />
                        <span className="uppercase">{slide.link_type}:</span>
                        <span className="text-blue-600">{slide.link_target}</span>
                     </div>
                 </div>

                 <button onClick={() => deleteSlide(slide.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                     <Trash2 size={20} />
                 </button>
             </div>
         ))}
      </div>

    </div>
  );
};