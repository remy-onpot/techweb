"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Filter, Edit, Trash2, 
  AlertCircle, CheckCircle, Package, TrendingUp, Layers, Plus 
} from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductForm } from '@/components/admin/ProductForm';

// --- TYPE FIXES ---
// Renamed the inner property to 'product_variants' to match the new table name
interface InventoryProduct extends Omit<Product, 'variants'> {
  base_images: string[]; 
  product_variants: {
    id: string;
    stock: number;
    price: number;
    condition: string;
  }[];
  // Computed fields
  totalStock: number;
  minPrice: number;
  maxPrice: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);

  // 1. FETCH DATA (Updated Table Name)
  const fetchInventory = async () => {
    setLoading(true);
    
    // JOIN QUERY: Now fetching 'product_variants' instead of 'variants'
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          stock,
          price,
          condition
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inventory:", error);
    } else if (data) {
      // 2. CALCULATE STATS
      const processed: InventoryProduct[] = data.map((p: any) => {
        // Map the DB response (product_variants) to our local variable
        const variants = p.product_variants || [];
        
        const totalStock = variants.reduce((sum: number, v: any) => sum + v.stock, 0);
        const prices = variants.map((v: any) => v.price);
        
        const minPrice = prices.length > 0 ? Math.min(...prices) : (p.base_price || 0);
        const maxPrice = prices.length > 0 ? Math.max(...prices) : (p.base_price || 0);

        return {
          ...p,
          base_images: p.base_images || [],
          product_variants: variants, // Keep consistent naming
          totalStock,
          minPrice,
          maxPrice
        };
      });
      setProducts(processed);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // 3. DELETE LOGIC
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete the product and all its variants.")) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
    } else {
      alert(error.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Global Inventory</h1>
          <p className="text-slate-500 mt-1">Manage parent products and their matrix variants.</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="bg-[#0A2540] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-xl shadow-slate-900/20 active:scale-95"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
            <input 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
         </div>
         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition">
               <Filter size={18}/> Filters
            </button>
            <button onClick={fetchInventory} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition">
               <TrendingUp size={20}/>
            </button>
         </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">SKUs</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Total Stock</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Price Range</th>
                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={5} className="p-12 text-center text-slate-400 font-bold animate-pulse">Loading Inventory...</td></tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                  
                  {/* PRODUCT INFO */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 overflow-hidden relative">
                        {product.base_images && product.base_images.length > 0 ? (
                          <img src={product.base_images[0]} className="w-full h-full object-cover" alt={product.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={20}/></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                           <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{product.brand}</span>
                           <span className="text-slate-300">•</span>
                           <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded capitalize">{product.category}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* VARIANTS COUNT */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Layers size={16} className="text-slate-400"/>
                       <span className="font-bold text-slate-700">{product.product_variants.length} Variants</span>
                    </div>
                    {product.product_variants.length > 0 && (
                       <div className="text-xs text-slate-400 mt-1 pl-6">
                          e.g. {product.product_variants[0].condition}
                       </div>
                    )}
                  </td>

                  {/* TOTAL STOCK */}
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs ${product.totalStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                       {product.totalStock > 0 ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                       {product.totalStock} Units
                    </div>
                  </td>

                  {/* PRICE RANGE */}
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-slate-700 text-sm">
                       {product.minPrice === product.maxPrice 
                         ? `₵${product.minPrice.toLocaleString()}` 
                         : `₵${product.minPrice.toLocaleString()} - ₵${product.maxPrice.toLocaleString()}`
                       }
                    </div>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                          onClick={() => {
                             setEditingProduct(product); // Set the specific product data
                             setIsEditing(true);         // Open the modal
                          }} 
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                       >
                          <Edit size={18}/>
                       </button>
                       <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       >
                          <Trash2 size={18}/>
                       </button>
                    </div>
                  </td>

                </tr>
              ))}
              
              {!loading && filteredProducts.length === 0 && (
                 <tr>
                    <td colSpan={5} className="text-center py-20">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <Search size={32}/>
                       </div>
                       <p className="text-slate-500 font-bold">No products found matching "{search}"</p>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* THE MODAL FORM */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="w-full max-w-[95vw] h-[90vh] bg-slate-50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <ProductForm 
                 initialData={editingProduct} // Pass the data!
                 onClose={() => { 
                    setIsEditing(false); 
                    setEditingProduct(null); // Clear selection on close
                    fetchInventory(); 
                 }} 
              />
            </div>
        </div>
      )}
    </div>
  );
}