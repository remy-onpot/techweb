import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

export const AdminPanel = ({ onClose }: { onClose: () => void }) => {
  const [selectedCategory, setSelectedCategory] = useState('laptop');
  const [formData, setFormData] = useState<any>({});

  // THE CHAMELEON FORM LOGIC
  const renderDynamicInputs = () => {
    switch(selectedCategory) {
      case 'laptop':
        return (
          <>
            <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Processor</label><input type="text" className="w-full p-2 border rounded mt-1" placeholder="e.g. M3 Pro" /></div>
            <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">RAM</label><input type="text" className="w-full p-2 border rounded mt-1" placeholder="e.g. 16GB" /></div>
            <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Storage</label><input type="text" className="w-full p-2 border rounded mt-1" placeholder="e.g. 512GB SSD" /></div>
            <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Battery Cycles</label><input type="number" className="w-full p-2 border rounded mt-1" placeholder="e.g. 12" /></div>
          </>
        );
      case 'tv':
        return (
          <>
            <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Resolution</label><input type="text" className="w-full p-2 border rounded mt-1" placeholder="e.g. 4K" /></div>
            <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Panel Type</label><select className="w-full p-2 border rounded mt-1"><option>OLED</option><option>QLED</option><option>LED</option></select></div>
            <div className="col-span-2"><label className="text-xs font-bold uppercase text-gray-500">Smart OS</label><input type="text" className="w-full p-2 border rounded mt-1" placeholder="e.g. Android TV" /></div>
          </>
        );
      case 'console':
        return (
          <>
             <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Edition</label><select className="w-full p-2 border rounded mt-1"><option>Disc</option><option>Digital</option></select></div>
             <div className="col-span-1"><label className="text-xs font-bold uppercase text-gray-500">Controllers Included</label><input type="number" className="w-full p-2 border rounded mt-1" defaultValue={1} /></div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-xl font-bold">Quick-Add Product</h2>
            <p className="text-sm text-slate-400">Inventory Management System</p>
          </div>
          <button onClick={onClose}><X /></button>
        </div>

        {/* Body */}
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          
          {/* Category Selector */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">1. Select Product Category</label>
            <div className="flex gap-2">
              {['laptop', 'tv', 'console', 'audio'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all border-2 ${
                    selectedCategory === cat 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-bold uppercase text-gray-500">Product Name</label>
                <input className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. PlayStation 5 Slim" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-gray-500">Price (GHS)</label>
                <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" placeholder="0.00" />
              </div>
              <div>
                 <label className="text-xs font-bold uppercase text-gray-500">Stock Count</label>
                 <input type="number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg" placeholder="10" />
              </div>
            </div>

            {/* DYNAMIC SPECS SECTION */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
               <div className="flex items-center gap-2 mb-4">
                 <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                 <h3 className="font-bold text-blue-900 capitalize">Specs for {selectedCategory}</h3>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {renderDynamicInputs()}
               </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Cancel</button>
          <button className="px-6 py-3 font-bold bg-slate-900 text-white hover:bg-orange-500 rounded-xl shadow-lg shadow-blue-900/10 transition flex items-center gap-2">
            <Save size={18} /> Save Product
          </button>
        </div>
      </div>
    </div>
  );
};