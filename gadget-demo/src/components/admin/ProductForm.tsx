"use client";

import React, { useState } from 'react';
import { X, Upload, Save, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/types';

export const ProductForm = ({ onClose }: { onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  
  // Form State
  const [category, setCategory] = useState<Category>('laptop');
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    originalPrice: '',
    stock: '',
    condition: 'New'
  });
  const [specs, setSpecs] = useState<any>({});

  // 1. THE UPLOAD LOGIC
  const handleImageUpload = async () => {
    if (!imageFile) return null;
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // 2. THE SAVE LOGIC
  const handleSave = async () => {
    try {
      setLoading(true);
      setUploadStatus('Uploading Image...');
      
      const imageUrl = await handleImageUpload();
      
      setUploadStatus('Saving Product...');

      const { error } = await supabase.from('products').insert({
        name: formData.name,
        brand: formData.brand,
        category: category,
        price: Number(formData.price),
        original_price: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock_count: Number(formData.stock),
        condition: formData.condition,
        images: imageUrl ? [imageUrl] : [],
        specs: specs
      });

      if (error) throw error;

      setUploadStatus('Success!');
      setTimeout(() => onClose(), 1000);

    } catch (error) {
      console.error(error);
      setUploadStatus('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Fields
  const renderSpecs = () => {
    switch(category) {
      case 'laptop':
        return (
          <>
            <input placeholder="Processor (e.g. i7 11th Gen)" className="input-field" onChange={e => setSpecs({...specs, processor: e.target.value})} />
            <input placeholder="RAM (e.g. 16GB)" className="input-field" onChange={e => setSpecs({...specs, ram: e.target.value})} />
            <input placeholder="Storage (e.g. 512GB SSD)" className="input-field" onChange={e => setSpecs({...specs, storage: e.target.value})} />
            <label className="flex items-center gap-2 text-sm text-slate-700 font-bold mt-2">
               <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" onChange={e => setSpecs({...specs, touchscreen: e.target.checked})} /> 
               Touchscreen Display
            </label>
          </>
        );
      case 'tv':
      case 'monitor':
        return (
          <>
            <input placeholder="Screen Size (e.g. 65 inch)" className="input-field" onChange={e => setSpecs({...specs, screenSize: e.target.value})} />
            <input placeholder="Resolution (e.g. 4K UHD)" className="input-field" onChange={e => setSpecs({...specs, resolution: e.target.value})} />
            <input placeholder="Refresh Rate (e.g. 144Hz)" className="input-field" onChange={e => setSpecs({...specs, refreshRate: e.target.value})} />
          </>
        );
      case 'audio':
        return (
           <>
            <select className="input-field" onChange={e => setSpecs({...specs, type: e.target.value})}>
                <option value="">Select Audio Type...</option>
                <option value="Headphone">Headphone</option>
                <option value="Speaker">Speaker</option>
                <option value="Earbuds">Earbuds</option>
            </select>
            <input placeholder="Battery Life (e.g. 30 Hours)" className="input-field" onChange={e => setSpecs({...specs, batteryLife: e.target.value})} />
            <label className="flex items-center gap-2 text-sm text-slate-700 font-bold mt-2">
               <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" onChange={e => setSpecs({...specs, noiseCancelling: e.target.checked})} /> 
               Active Noise Cancelling
            </label>
           </>
        );
      case 'printer':
        return (
            <>
             <select className="input-field" onChange={e => setSpecs({...specs, type: e.target.value})}>
                 <option value="All-in-One">All-in-One</option>
                 <option value="Laser">Laser</option>
                 <option value="Inkjet">Inkjet</option>
             </select>
             <input placeholder="Connection (e.g. WiFi)" className="input-field" onChange={e => setSpecs({...specs, connection: e.target.value})} />
            </>
        );
      default:
        return <div className="text-sm text-slate-400 font-medium italic">Basic specs only for this category</div>;
    }
  };

  return (
    <div className="w-full md:w-[600px] bg-white h-full shadow-2xl p-8 overflow-y-auto relative flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-black text-slate-900">Add Inventory</h2>
            <p className="text-slate-500 text-sm">Fill in the details below</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="text-slate-500" /></button>
      </div>

      <div className="space-y-6 pb-20">
        
        {/* Image Upload UI */}
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-orange-500 hover:bg-orange-50/50 transition-all cursor-pointer relative bg-slate-50">
          <input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {imageFile ? (
             <div className="flex flex-col items-center text-green-600 animate-in zoom-in duration-200">
                <CheckCircle size={32} className="mb-2" />
                <span className="font-bold text-sm">{imageFile.name} ready</span>
             </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mx-auto text-slate-400 shadow-sm">
                <Upload size={20} />
              </div>
              <p className="text-sm text-slate-600 font-semibold">Click to upload product image</p>
            </div>
          )}
        </div>

        {/* Category Pills */}
        <div>
            <label className="label">Category</label>
            <div className="flex gap-2 flex-wrap">
                {['laptop', 'phone', 'audio', 'monitor', 'printer', 'gaming'].map((cat) => (
                <button 
                    key={cat} 
                    onClick={() => setCategory(cat as Category)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition border shadow-sm ${
                    category === cat 
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900 ring-offset-2' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    {cat}
                </button>
                ))}
            </div>
        </div>

        {/* Basic Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Product Name</label>
            <input className="input-field" placeholder="e.g. HP EliteBook 840 G7" onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="label">Brand</label>
            <input className="input-field" placeholder="e.g. HP" onChange={e => setFormData({...formData, brand: e.target.value})} />
          </div>
          <div>
             <label className="label">Condition</label>
             <select className="input-field" onChange={e => setFormData({...formData, condition: e.target.value})}>
                <option>New</option>
                <option>Open Box</option>
                <option>Refurbished</option>
                <option>Pre-Owned</option>
             </select>
          </div>
          <div>
            <label className="label">Price (GHS)</label>
            <input type="number" className="input-field" placeholder="0.00" onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>
           <div>
            <label className="label">Original Price</label>
            <input type="number" className="input-field" placeholder="Optional" onChange={e => setFormData({...formData, originalPrice: e.target.value})} />
          </div>
          <div>
            <label className="label">Stock Count</label>
            <input type="number" className="input-field" placeholder="1" onChange={e => setFormData({...formData, stock: e.target.value})} />
          </div>
        </div>

        {/* Dynamic Specs */}
        <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <p className="text-xs font-bold uppercase text-blue-700 tracking-wider">
                {category} Specs
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3">
             {renderSpecs()}
          </div>
        </div>

        {/* Status Bar */}
        {uploadStatus && (
            <div className="text-center text-sm font-bold text-orange-600 animate-pulse bg-orange-50 p-2 rounded-lg">
                {uploadStatus}
            </div>
        )}

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#F97316] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#ea580c] transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save to Inventory</>}
        </button>
      </div>

      <style jsx>{`
        /* High contrast labels */
        .label { 
            @apply block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1 tracking-wide; 
        }
        
        /* High contrast inputs with visible placeholders */
        .input-field { 
            @apply w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none 
            focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 
            transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400; 
        }

        /* Customizing select arrows */
        select.input-field {
            @apply appearance-none bg-no-repeat;
            background-position: right 1rem center;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-size: 1.5em 1.5em;
        }
      `}</style>
    </div>
  );
};