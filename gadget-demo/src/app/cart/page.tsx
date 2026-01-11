"use client";

import React from 'react';
import { useStore } from '@/lib/store';
import { Trash2, Minus, Plus, ArrowRight, CheckSquare, Square, ShoppingBag, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, updateQuantity, toggleItemSelection, toggleAllSelection, removeSelected } = useStore();
  const router = useRouter();

  // Derived State
  const selectedItems = cart.filter(item => item.selected);
  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) return;
    router.push('/checkout');
  };

  if (cart.length === 0) return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
        <ShoppingBag className="text-gray-300" size={40} />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h2>
      <p className="text-slate-500 mb-8">Looks like you haven't added any tech yet.</p>
      <Link href="/" className="bg-[#0A2540] text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
        Start Shopping
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
           <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              Your Cart 
              <span className="text-sm bg-gray-200 text-slate-600 px-3 py-1 rounded-full font-bold">{cart.length}</span>
           </h1>
           <Link href="/" className="text-slate-500 font-bold hover:text-slate-900 flex items-center gap-2">
              <ArrowLeft size={18} /> Continue Shopping
           </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: CART ITEMS LIST (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
             
             {/* Toolbar */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center sticky top-20 z-10">
                <button 
                  onClick={() => toggleAllSelection(!isAllSelected)}
                  className="flex items-center gap-3 font-bold text-slate-700 hover:text-orange-600 transition"
                >
                   {isAllSelected ? <CheckSquare className="text-orange-500" /> : <Square className="text-gray-300" />}
                   Select All ({cart.length})
                </button>
                
                {selectedItems.length > 0 && selectedItems.length < cart.length && (
                   <button 
                     onClick={removeSelected}
                     className="text-red-500 font-bold text-sm flex items-center gap-2 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                   >
                      <Trash2 size={16} /> Remove Selected
                   </button>
                )}
             </div>

             {/* Items */}
             <div className="space-y-4">
                {cart.map((item) => (
                   <div key={item.uniqueId} className={`group bg-white p-4 rounded-2xl border transition-all ${item.selected ? 'border-orange-200 shadow-md shadow-orange-100' : 'border-gray-100 opacity-75 hover:opacity-100'}`}>
                      <div className="flex gap-4 items-start">
                         {/* Checkbox */}
                         <button 
                           onClick={() => toggleItemSelection(item.uniqueId)}
                           className="mt-8 shrink-0 text-gray-300 hover:text-orange-500 transition-colors"
                         >
                            {item.selected ? <CheckSquare className="text-orange-500" size={24} /> : <Square size={24} />}
                         </button>

                         {/* Image */}
                         <div className="w-24 h-24 bg-gray-50 rounded-xl relative overflow-hidden shrink-0 border border-gray-100">
                            <Image 
                              src={item.variant.images?.[0] || item.product.images[0]} 
                              fill 
                              className="object-cover" 
                              alt={item.product.name} 
                            />
                         </div>

                         {/* Details */}
                         <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                               <div>
                                  <h3 className="font-bold text-slate-900 truncate pr-4 text-lg">{item.product.name}</h3>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                     <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded uppercase">
                                        {item.variant.condition}
                                     </span>
                                     {Object.values(item.variant.specs).slice(0, 2).map((s, i) => (
                                        <span key={i} className="text-xs font-bold bg-gray-50 text-slate-400 px-2 py-1 rounded">
                                           {s}
                                        </span>
                                     ))}
                                  </div>
                               </div>
                               <div className="text-right">
                                  <div className="font-black text-slate-900 text-xl">₵{(item.variant.price * item.quantity).toLocaleString()}</div>
                                  <div className="text-xs text-slate-400 font-medium">₵{item.variant.price.toLocaleString()} each</div>
                               </div>
                            </div>

                            {/* Actions Row */}
                            <div className="flex justify-between items-end mt-4">
                               <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                                  <button 
                                    onClick={() => updateQuantity(item.uniqueId, -1)}
                                    className="p-1 hover:bg-white rounded shadow-sm text-slate-600 transition disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                  >
                                     <Minus size={14} />
                                  </button>
                                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.uniqueId, 1)}
                                    className="p-1 hover:bg-white rounded shadow-sm text-slate-600 transition"
                                  >
                                     <Plus size={14} />
                                  </button>
                               </div>
                               
                               <button 
                                 onClick={() => updateQuantity(item.uniqueId, -1000)} // Hacky delete
                                 className="text-slate-400 hover:text-red-500 text-sm font-bold flex items-center gap-1 transition-colors"
                               >
                                  <Trash2 size={16} /> Remove
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>

          {/* RIGHT: SUMMARY CARD (Span 4) */}
          <div className="lg:col-span-4">
             <div className="bg-white p-8 rounded-[2rem] shadow-lg shadow-slate-200 border border-gray-100 sticky top-24">
                <h2 className="text-xl font-black text-slate-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-8">
                   <div className="flex justify-between text-slate-500 font-medium">
                      <span>Selected Items</span>
                      <span>{selectedItems.length}</span>
                   </div>
                   <div className="flex justify-between text-slate-500 font-medium">
                      <span>Subtotal</span>
                      <span>₵{subtotal.toLocaleString()}</span>
                   </div>
                   <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-end">
                      <span className="font-bold text-slate-900">Total to Pay</span>
                      <span className="font-black text-3xl text-slate-900">₵{subtotal.toLocaleString()}</span>
                   </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={selectedItems.length === 0}
                  className="w-full bg-[#0A2540] text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                   Checkout ({selectedItems.length}) <ArrowRight size={20} />
                </button>
                
                <p className="text-center text-xs text-slate-400 mt-4 leading-relaxed px-4">
                   {selectedItems.length === 0 
                     ? "Please select at least one item to proceed."
                     : "Delivery fees are calculated at the next step via WhatsApp."}
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}