"use client";

import React, { useState } from 'react';
import { X, Save, Loader2, Smartphone, Laptop, Camera, Monitor, Printer, Gamepad2, Headphones } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Category, Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';

export const AdminQuickAdd = ({ onClose }: { onClose: () => void }) => {
  const addProduct = useStore((state) => state.addProduct);
  const [loading, setLoading] = useState(false);

  // Form State
  const [form, setForm] = useState<Partial<Product>>({
    name: '',
    brand: '',
    price: 0,
    category: 'laptop',
    condition: 'New',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800'], // Default placeholder
    specs: {}
  });

  const CATEGORY_ICONS: Record<string, any> = {
    laptop: Laptop,
    phone: Smartphone,
    audio: Headphones,
    gaming: Gamepad2,
    monitor: Monitor,
    camera: Camera,
    printer: Printer
  };

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        addProduct({
            ...form,
            id: Math.random().toString(),
            stock: 1,
            isFeatured: true
        } as Product);
        setLoading(false);
        onClose();
    }, 1000);
  };

  // Update specs helper
  const updateSpec = (key: string, value: any) => {
    setForm(prev => ({
        ...prev,
        specs: { ...prev.specs, [key]: value }
    }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex bg-[#0F172A]/90 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* LEFT PANEL: The Controls */}
      <div className="w-full md:w-1/2 lg:w-5/12 bg-white h-full overflow-y-auto border-r border-gray-200 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-black text-slate-900">New Product</h2>
                <p className="text-xs text-slate-500 font-medium">Add inventory to live store</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 flex-1">
            
            {/* 1. Category Selection */}
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-3">1. Select Category</label>
                <div className="grid grid-cols-4 gap-2">
                    {Object.keys(CATEGORY_ICONS).map((cat) => {
                        const Icon = CATEGORY_ICONS[cat];
                        const isSelected = form.category === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setForm({ ...form, category: cat as Category })}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                                    isSelected 
                                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600' 
                                    : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <Icon size={20} className="mb-1" />
                                <span className="text-[10px] font-bold uppercase">{cat}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 2. Basic Details */}
            <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-400 uppercase">2. Product Details</label>
                <input 
                    placeholder="Product Name (e.g. MacBook Pro M3)" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-900 transition-all focus:bg-white"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="number" 
                        placeholder="Price (GHS)" 
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium transition-all focus:bg-white"
                        onChange={e => setForm({...form, price: Number(e.target.value)})}
                    />
                     <select 
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none"
                        onChange={e => setForm({...form, brand: e.target.value})}
                     >
                        <option value="">Select Brand...</option>
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="HP">HP</option>
                        <option value="Sony">Sony</option>
                        <option value="Dell">Dell</option>
                     </select>
                </div>
            </div>

            {/* 3. Dynamic Specs */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-4">3. {form.category} Specifics</label>
                <div className="grid grid-cols-1 gap-4">
                    {form.category === 'laptop' && (
                        <>
                            <input placeholder="Processor (e.g. M3 Pro)" className="spec-input" onChange={e => updateSpec('processor', e.target.value)} />
                            <input placeholder="RAM (e.g. 16GB)" className="spec-input" onChange={e => updateSpec('ram', e.target.value)} />
                            <input placeholder="Storage (e.g. 1TB SSD)" className="spec-input" onChange={e => updateSpec('storage', e.target.value)} />
                        </>
                    )}
                    {form.category === 'phone' && (
                        <>
                            <input placeholder="Color (e.g. Titanium)" className="spec-input" onChange={e => updateSpec('color', e.target.value)} />
                            <input placeholder="Storage (e.g. 256GB)" className="spec-input" onChange={e => updateSpec('storage', e.target.value)} />
                        </>
                    )}
                    {(form.category === 'tv' || form.category === 'monitor') && (
                         <>
                            <input placeholder="Screen Size (e.g. 55 inch)" className="spec-input" onChange={e => updateSpec('screenSize', e.target.value)} />
                            <input placeholder="Resolution (e.g. 4K)" className="spec-input" onChange={e => updateSpec('resolution', e.target.value)} />
                        </>
                    )}
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Publish to Store'}
            </button>
        </div>
      </div>

      {/* RIGHT PANEL: The Live Preview */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 bg-slate-900 relative overflow-hidden">
         {/* Background Grid Effect */}
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
         
         <div className="relative z-10 w-full max-w-sm">
            <div className="text-center mb-8">
                <span className="bg-blue-500/20 text-blue-200 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-2 inline-block">
                    Live Preview
                </span>
                <h3 className="text-white text-2xl font-bold">See it before they do.</h3>
            </div>
            
            {/* THE FIX: Reordered props so specific ID/Name overwrites the spread */}
            <div className="transform scale-110 transition-all duration-300">
                <ProductCard product={{
                    ...form as Product, // Spread FIRST
                    id: 'preview',      // Overwrite AFTER
                    price: form.price || 0,
                    // Fallbacks for display
                    name: form.name || 'Product Name Preview',
                    brand: form.brand || 'Brand',
                }} />
            </div>

            <p className="text-slate-500 text-center text-sm mt-8 max-w-xs mx-auto">
                This card will appear instantly in the {form.category} section upon publishing.
            </p>
         </div>
      </div>

      <style jsx>{`
        .spec-input {
            @apply w-full p-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 outline-none;
        }
      `}</style>
    </div>
  );
};