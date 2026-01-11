"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sliders, Plus, Trash2, Loader2 } from 'lucide-react';

// 1. Define strict types
interface AttributeOption {
  id: number;
  category: string;
  key: string;
  value: string;
  sort_order: number;
}

// Type for the nested structure: Category -> AttributeKey -> List of Options
type GroupedOptions = Record<string, Record<string, AttributeOption[]>>;

export default function AttributesPage() {
  const [options, setOptions] = useState<AttributeOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Attribute Form
  const [newCat, setNewCat] = useState('laptop');
  const [newKey, setNewKey] = useState('Color');
  const [newVal, setNewVal] = useState('');

  useEffect(() => { fetchOptions(); }, []);

  const fetchOptions = async () => {
    const { data } = await supabase
      .from('attribute_options')
      .select('*')
      .order('category')
      .order('key');
      
    if (data) setOptions(data as AttributeOption[]);
    setLoading(false);
  };

  const addOption = async () => {
    if (!newVal) return;
    setLoading(true);
    await supabase.from('attribute_options').insert({ 
      category: newCat, key: newKey, value: newVal, sort_order: 99 
    });
    setNewVal(''); // Clear input
    fetchOptions(); // Refresh
  };

  const deleteOption = async (id: number) => {
    if(!confirm("Delete this option?")) return;
    await supabase.from('attribute_options').delete().eq('id', id);
    fetchOptions();
  };

  // 2. Grouping Logic with Explicit Type
  const grouped: GroupedOptions = options.reduce((acc, curr) => {
    const cat = curr.category || 'uncategorized';
    const key = curr.key || 'general';

    if (!acc[cat]) acc[cat] = {};
    if (!acc[cat][key]) acc[cat][key] = [];
    
    acc[cat][key].push(curr);
    return acc;
  }, {} as GroupedOptions);

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline"/></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
         <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
            <Sliders className="text-orange-500" /> Attribute Options
         </h1>
         <p className="text-slate-500">Manage dropdown values for the Product Matrix Builder.</p>
      </div>

      {/* ADD NEW BAR */}
      <div className="bg-slate-900 p-6 rounded-2xl text-white mb-10 flex flex-col md:flex-row gap-4 items-end shadow-lg">
         <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
            <select value={newCat} onChange={e => setNewCat(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white font-bold">
               {['laptop', 'phone', 'gaming', 'audio', 'monitor', 'wearable', 'accessory', 'tablet'].map(c => (
                 <option key={c} value={c}>{c.toUpperCase()}</option>
               ))}
            </select>
         </div>
         <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Attribute Name</label>
            <input list="keys" value={newKey} onChange={e => setNewKey(e.target.value)} className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded-lg text-white placeholder:text-slate-500" placeholder="e.g. Storage" />
            <datalist id="keys">
               <option value="Processor"/><option value="RAM"/><option value="Storage"/><option value="Color"/><option value="Platform"/>
            </datalist>
         </div>
         <div className="flex-[2]">
            <label className="text-xs font-bold text-slate-400 uppercase">Value to Add</label>
            <input value={newVal} onChange={e => setNewVal(e.target.value)} className="w-full bg-white text-slate-900 border border-white p-2.5 rounded-lg font-bold placeholder:text-gray-400" placeholder="e.g. 128GB SSD or Midnight Blue" />
         </div>
         <button onClick={addOption} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-lg px-6 font-bold flex items-center gap-2 transition">
            <Plus size={18} /> Add
         </button>
      </div>

      {/* LIST */}
      <div className="grid md:grid-cols-2 gap-8">
         {Object.entries(grouped).map(([category, keys]) => (
            <div key={category} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
               <div className="bg-slate-50 p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-black text-lg capitalize text-slate-800">{category}</h3>
                  <span className="text-xs font-bold bg-white border border-gray-200 px-2 py-1 rounded text-slate-400">
                    {Object.keys(keys).length} Attributes
                  </span>
               </div>
               
               <div className="p-4 space-y-6">
                  {Object.entries(keys).map(([key, values]) => (
                     <div key={key}>
                        <h4 className="text-xs font-bold text-orange-600 uppercase mb-2 tracking-wide">{key}</h4>
                        <div className="flex flex-wrap gap-2">
                           {/* Explicitly mapping over values which are now known to be AttributeOption[] */}
                           {values.map((opt) => (
                              <div key={opt.id} className="group relative bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 flex items-center gap-2 hover:border-red-200 hover:bg-red-50 transition">
                                 {opt.value}
                                 <button 
                                   onClick={() => deleteOption(opt.id)} 
                                   className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                   title="Remove option"
                                 >
                                    <Trash2 size={12} />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}