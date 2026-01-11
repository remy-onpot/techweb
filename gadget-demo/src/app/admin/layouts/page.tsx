"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Loader2, Layers, RefreshCw, ImagePlus } from 'lucide-react';

interface CategoryMeta {
  slug: string;
  title: string;
  subtitle: string;
  image_url: string;
}

export default function LayoutsPage() {
  const [categories, setCategories] = useState<CategoryMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Get existing saved layouts
    const { data: meta } = await supabase.from('category_metadata').select('*');
    const metaMap = new Map(meta?.map(m => [m.slug, m]) || []);

    // 2. Get ALL currently active categories from your products
    // This ensures that if you add a 'Drone', it automatically shows up here to be edited.
    const { data: products } = await supabase
      .from('products')
      .select('category')
      .eq('is_active', true);
      
    const activeSlugs = Array.from(new Set(
      products?.map(p => (p.category || 'uncategorized').toLowerCase()) || []
    ));

    // 3. Merge them
    const mergedList: CategoryMeta[] = activeSlugs.map(slug => {
      const existing = metaMap.get(slug);
      // Default values if no layout exists yet
      return existing || { 
        slug, 
        title: slug.charAt(0).toUpperCase() + slug.slice(1) + 's', // e.g. "laptop" -> "Laptops"
        subtitle: 'Shop Collection', 
        image_url: '' 
      };
    });

    setCategories(mergedList);
    setLoading(false);
  };

  const handleUpdate = (slug: string, field: keyof CategoryMeta, value: string) => {
    setCategories(prev => prev.map(c => c.slug === slug ? { ...c, [field]: value } : c));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Upsert all categories to the database
      const { error } = await supabase.from('category_metadata').upsert(categories);
      if (error) throw error;
      alert("✅ Homepage layouts updated successfully!");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center flex flex-col items-center gap-4"><Loader2 className="animate-spin text-orange-500" size={32}/><p className="text-slate-400 font-medium">Loading your categories...</p></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <Layers className="text-orange-500 fill-orange-100" size={32} /> 
            Storefront Layouts
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage the "Identity Cards" displayed on your homepage rails.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="p-3 rounded-xl border border-gray-200 text-slate-500 hover:bg-white hover:text-slate-900 transition"
              title="Refresh Categories"
            >
              <RefreshCw size={20} />
            </button>
            <button 
              onClick={saveAll}
              disabled={saving}
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
            </button>
        </div>
      </div>

      {/* Grid of Editors */}
      <div className="grid gap-8">
        {categories.map((cat) => (
          <div key={cat.slug} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-8">
            
            {/* Visual Preview */}
            <div className="w-full md:w-64 flex-shrink-0">
               <label className="text-xs font-bold uppercase text-slate-400 mb-2 block tracking-wider">Preview Card</label>
               <div className="aspect-[4/5] rounded-2xl bg-slate-900 overflow-hidden relative border border-slate-200 group">
                  {cat.image_url ? (
                    <>
                      <img src={cat.image_url} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-100 border-2 border-dashed border-slate-200">
                        <ImagePlus size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold">No Image</span>
                    </div>
                  )}
                  
                  {/* Text Overlay Preview */}
                  <div className="absolute bottom-0 left-0 p-5 w-full">
                     <h4 className="text-2xl font-black text-white leading-none mb-2">{cat.title}</h4>
                     <p className="text-xs text-gray-300 font-medium">{cat.subtitle}</p>
                  </div>
               </div>
            </div>

            {/* Edit Fields */}
            <div className="flex-1 space-y-5">
               <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl capitalize text-slate-900">{cat.slug}</h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase tracking-widest">
                    ID: {cat.slug}
                  </span>
               </div>

               <div className="grid md:grid-cols-2 gap-5">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500">Display Title</label>
                      <input 
                        value={cat.title || ''} 
                        onChange={e => handleUpdate(cat.slug, 'title', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-bold text-slate-900 focus:border-orange-500 focus:bg-white outline-none transition" 
                        placeholder="e.g. Laptops"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500">Subtitle / Tagline</label>
                      <input 
                        value={cat.subtitle || ''} 
                        onChange={e => handleUpdate(cat.slug, 'subtitle', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl font-medium text-slate-700 focus:border-orange-500 focus:bg-white outline-none transition" 
                        placeholder="e.g. Pro Computing"
                      />
                   </div>
                   <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                        Background Image URL 
                        <span className="text-[10px] font-normal text-slate-400 lowercase">(Unsplash, Supabase Storage, etc.)</span>
                      </label>
                      <input 
                        value={cat.image_url || ''} 
                        onChange={e => handleUpdate(cat.slug, 'image_url', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-slate-600 font-mono text-xs focus:border-orange-500 focus:bg-white outline-none transition" 
                      />
                   </div>
               </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
             <p className="text-slate-400 font-medium">No categories found. Add some products to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
}