"use client";
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { ProductForm } from '@/components/admin/ProductForm'; // Logic separated below

// Mock data to visualize - Replace with useStore/Supabase later
const mockProducts = [
  { id: '1', name: 'MacBook Pro M3', stock: 5, price: 32000, active: true, category: 'laptop' },
  { id: '2', name: 'Sony A7 IV', stock: 1, price: 24000, active: false, category: 'camera' },
];

export default function InventoryPage() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-700">Manage your products, specs, and stock levels.</p>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-orange-600 transition shadow-lg shadow-orange-200"
        >
          <Plus size={20} /> Add Product
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Product Name</th>
              <th className="p-4 font-semibold text-gray-600">Category</th>
              <th className="p-4 font-semibold text-gray-600">Price</th>
              <th className="p-4 font-semibold text-gray-600">Stock</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-bold text-slate-900">{product.name}</td>
                <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold uppercase">{product.category}</span></td>
                <td className="p-4">₵{product.price.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {product.stock} units
                  </span>
                </td>
                <td className="p-4">
                   <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-slate-900">
                     {product.active ? <Eye size={16} className="text-green-500"/> : <EyeOff size={16} />}
                     {product.active ? 'Live' : 'Hidden'}
                   </button>
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><Edit size={16} /></button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* The Full Page Form Overlay */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
           <ProductForm onClose={() => setIsEditing(false)} />
        </div>
      )}
    </div>
  );
}