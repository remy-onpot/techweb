import React from 'react';
import { Product } from '@/lib/types';
import { ShoppingCart, Cpu, Tv, Camera, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const ProductCard = ({ product }: { product: Product }) => {
  // NOTE: We removed useStore/addToCart. 
  // You cannot add to cart from the grid anymore because the user hasn't selected a variant (RAM/Storage) yet.

  // Dynamic Icon Logic
  const getCategoryIcon = () => {
    switch (product.category) {
      case 'laptop': return <Cpu size={16} />;
      case 'tv': return <Tv size={16} />;
      case 'camera': return <Camera size={16} />;
      default: return <Zap size={16} />;
    }
  };

  // Dynamic Specs Renderer (Fixed for Safety)
  const renderSpecs = () => {
    // 1. Safety Check: If specs are missing
    if (!product.specs) return "View options & details";

    // 2. Safe Access with Optional Chaining (?.) and Fallbacks (||)
    if (product.category === 'laptop') {
      return `${product.specs.processor || 'CPU?'} | ${product.specs.ram || 'RAM?'}`;
    }
    if (product.category === 'tv' || product.category === 'monitor') {
      return `${product.specs.screenSize || 'Size?'} ${product.specs.panelType || ''} | ${product.specs.refreshRate || ''}`;
    }
    if (product.category === 'camera') {
      return `${product.specs.megapixels || 'MP'} | ${product.specs.lensMount || 'Lens'}`;
    }
    
    // Fallback: Just show the first available spec value
    return Object.values(product.specs)[0] ? String(Object.values(product.specs)[0]) : 'High Performance';
  };

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="bg-white rounded-2xl border border-gray-100 p-4 transition-all duration-300 hover:shadow-2xl hover:border-orange-100 hover:-translate-y-1 h-full flex flex-col">
        
        {/* Image Container */}
        <div className="relative h-48 bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
          {/* Safety check for images array */}
          <img 
            src={product.images?.[0] || '/placeholder.png'} 
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Removed specific Condition badge because Parent Product doesn't have one. 
              Added a generic 'In Stock' or 'Featured' badge if applicable. */}
          {product.isFeatured && (
            <div className="absolute top-2 left-2 bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-1 rounded uppercase">
              Featured
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
              {getCategoryIcon()} {product.category}
            </span>
            <span className="text-xs text-gray-400 font-medium">{product.brand}</span>
          </div>

          <h3 className="font-bold text-slate-900 leading-tight text-lg min-h-[3rem] line-clamp-2">
            {product.name}
          </h3>

          {/* The Chameleon Line */}
          <div className="bg-slate-50 p-2 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="truncate">{renderSpecs()}</span>
          </div>

          <div className="pt-2 mt-auto flex items-center justify-between border-t border-gray-50">
            <div>
              {product.originalPrice && (
                <p className="text-xs text-gray-400 line-through">₵{product.originalPrice.toLocaleString()}</p>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-xs text-gray-500 font-medium">from</span>
<p className="text-xl font-black text-slate-900">
   ₵{(product.price || 0).toLocaleString()}
</p>              </div>
            </div>
            
            {/* Changed to "View" button because we need to select variants first */}
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-orange-500 transition-colors shadow-lg shadow-slate-200">
              <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};