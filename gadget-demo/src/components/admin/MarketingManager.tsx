"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Banner, BANNER_RULES, BannerSlot } from '@/lib/types';
import { Trash2, AlertCircle, CheckCircle, Loader2, Link as LinkIcon, ImagePlus, LayoutTemplate, MonitorPlay } from 'lucide-react';
import Image from 'next/image';

export const MarketingManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<BannerSlot>('brand_hero'); // Default to the top slot
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [targetLink, setTargetLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dimensions, setDimensions] = useState<{w:number, h:number} | null>(null);

  const rule = BANNER_RULES[selectedSlot];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data } = await supabase.from('banners').select('*').order('created_at', { ascending: false });
    if (data) setBanners(data as any);
  };

  // 🛡️ THE FLEXIBLE ENFORCER (Updated)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset
    setError('');
    setImageFile(null);
    setPreviewUrl('');
    setDimensions(null);

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      setDimensions({ w: img.width, h: img.height });
      
      // 1. Check Minimum Resolution (Allowing -10% wiggle room to be nice)
      const minW = rule.width * 0.9;
      const minH = rule.height * 0.9;

      if (img.width < minW || img.height < minH) {
        setError(`❌ Low Quality Image.\nMinimum required: ${rule.width}x${rule.height}px.\nYour image: ${img.width}x${img.height}px.`);
        return;
      }

      // 2. Check Aspect Ratio (With 20% Flexibility)
      const fileRatio = img.width / img.height;
      const targetRatio = rule.width / rule.height;
      const tolerance = 0.2; 

      if (Math.abs(fileRatio - targetRatio) > tolerance) {
         setError(`❌ Shape Mismatch.\nThis slot needs a ${rule.aspectRatio} shape.\nYour image is too ${fileRatio > targetRatio ? 'wide' : 'tall'}.`);
         return;
      }

      // Pass
      setImageFile(file);
      setPreviewUrl(objectUrl);
    };
    img.src = objectUrl;
  };

  const handleUpload = async () => {
    if (!imageFile || !targetLink) return setError("Image and Link are required");
    setUploading(true);

    try {
      const fileName = `${selectedSlot}-${Date.now()}.${imageFile.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('marketing').upload(fileName, imageFile);
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from('marketing').getPublicUrl(fileName);

      const { data, error } = await supabase.from('banners').insert({
        slot: selectedSlot,
        image_url: publicUrl,
        link: targetLink,
        is_active: true
      }).select().single();

      if (error) throw error;
      
      setBanners([data as any, ...banners]);
      
      // Clean up
      setImageFile(null);
      setPreviewUrl('');
      setTargetLink('');
      setDimensions(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if(!confirm("Remove this banner?")) return;
    setBanners(banners.filter(b => b.id !== id));
    await supabase.from('banners').delete().eq('id', id);
  };

  // Helper to render asset list
  const renderAssetList = (title: string, filterFn: (b: Banner) => boolean) => {
    const assets = banners.filter(filterFn);
    if (assets.length === 0) return null;

    return (
      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
           {title === 'Page Headers' ? <LayoutTemplate size={20}/> : <MonitorPlay size={20}/>}
           {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((b) => (
            <div key={b.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-5 group hover:border-orange-200 transition-colors">
              <div className="w-32 h-24 bg-gray-100 rounded-xl relative overflow-hidden flex-shrink-0 border border-gray-200">
                <Image src={b.image_url} fill className="object-cover" alt="Banner" />
              </div>
              <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded-md text-slate-600 tracking-wide">
                      {BANNER_RULES[b.slot]?.label || b.slot}
                    </span>
                    <button onClick={() => deleteBanner(b.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 font-bold truncate">
                    <LinkIcon size={14} /> {b.link}
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">ID: {b.id.slice(0,8)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      
      {/* 1. UPLOAD SECTION */}
      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-10">
        
        {/* Left: Controls */}
        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
               <div className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">1</div>
               <h2 className="text-lg font-bold text-slate-900">Select Banner Slot</h2>
            </div>
            
            {/* Updated Grid to 3 Columns for better fit */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(BANNER_RULES).map((key) => (
                <button
                  key={key}
                  onClick={() => { setSelectedSlot(key as BannerSlot); setImageFile(null); setPreviewUrl(''); setError(''); }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedSlot === key 
                    ? 'bg-slate-900 text-white border-slate-900 ring-4 ring-slate-100' 
                    : 'bg-white text-slate-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-bold text-xs md:text-sm leading-tight mb-1">{BANNER_RULES[key as BannerSlot].label}</div>
                  <div className={`text-[10px] ${selectedSlot === key ? 'text-slate-400' : 'text-slate-400'}`}>
                    {BANNER_RULES[key as BannerSlot].width}x{BANNER_RULES[key as BannerSlot].height}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
             <div className="flex items-center gap-2 mb-4">
               <div className="bg-slate-900 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">2</div>
               <h2 className="text-lg font-bold text-slate-900">Link Destination</h2>
            </div>
            <div className="relative">
                <LinkIcon className="absolute left-4 top-3.5 text-gray-400 w-4 h-4" />
                <input 
                placeholder="e.g. /category/gaming or /product/123" 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl font-medium focus:ring-2 ring-orange-500 outline-none transition bg-gray-50 focus:bg-white"
                value={targetLink}
                onChange={e => setTargetLink(e.target.value)}
                />
            </div>
          </div>

          <div className="p-4 bg-orange-50 rounded-xl text-orange-900 text-sm border border-orange-100">
            <strong>Designer Brief:</strong> {rule.description} <br/>
            Target Size: <strong>{rule.width} x {rule.height}px</strong> (Flexible)
          </div>
        </div>

        {/* Right: Dropzone */}
        <div className="flex-1">
           <div className={`h-full min-h-[350px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center relative transition-all overflow-hidden ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-white hover:border-orange-400'}`}>
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileSelect} />
              
              {previewUrl ? (
                <div className="relative w-full h-full bg-slate-100 group">
                   <img src={previewUrl} className="w-full h-full object-contain" />
                   
                   {/* Info Overlay */}
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <p className="text-white font-bold">Click to Change</p>
                   </div>

                   {/* Dimensions Badge */}
                   <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-mono shadow-lg">
                      {dimensions?.w} x {dimensions?.h}px
                   </div>
                   
                   {/* Success Badge */}
                   <div className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                     <CheckCircle size={16} /> Ready
                   </div>
                </div>
              ) : (
                <div className="text-center p-8 z-10">
                   <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-gray-400">
                     <ImagePlus size={36} />
                   </div>
                   <h3 className="font-bold text-xl text-slate-700">Drop Graphic Here</h3>
                   <p className="text-slate-400 mt-2 text-sm max-w-xs mx-auto">
                     Accepts any size. We check quality & shape automatically.
                   </p>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center text-center p-8 z-30 animate-in fade-in">
                   <AlertCircle className="text-red-500 w-16 h-16 mb-4" />
                   <h3 className="text-xl font-bold text-red-600 mb-2">Image Issue</h3>
                   <p className="text-slate-600 font-medium whitespace-pre-line leading-relaxed">{error}</p>
                   <button className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-full text-sm font-bold text-slate-600">
                     Try a different image
                   </button>
                </div>
              )}
           </div>
        </div>
      </div>

      <button 
        onClick={handleUpload} 
        disabled={!imageFile || uploading}
        className="w-full py-5 bg-slate-900 text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.99]"
      >
        {uploading ? <Loader2 className="animate-spin" /> : 'Publish Asset to Storefront'}
      </button>

      {/* 2. LIVE ASSETS (Grouped) */}
      <div>
         <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Active Campaigns</h2>
         
         {/* Group 1: The Big Header */}
         {renderAssetList('Page Headers', (b) => b.slot === 'brand_hero')}
         
         {/* Group 2: The Grid Content */}
         {renderAssetList('Grid Content', (b) => b.slot !== 'brand_hero')}
         
         {banners.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
               No active assets found. Upload one above!
            </div>
         )}
      </div>

    </div>
  );
};