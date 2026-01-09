import React from 'react';
import { Product } from '@/lib/types';
import { useStore } from '@/lib/store';
import { ShoppingCart, Cpu, Tv, Camera, Zap } from 'lucide-react';

export const ProductCard = ({ product }: { product: Product }) => {
  const addToCart = useStore((state) => state.addToCart);

  // Dynamic Icon Logic
  const getCategoryIcon = () => {
    switch (product.category) {
      case 'laptop': return <Cpu size={16} />;
      case 'tv': return <Tv size={16} />;
      case 'camera': return <Camera size={16} />;
      default: return <Zap size={16} />;
    }
  };

  // Dynamic Specs Renderer
  const renderSpecs = () => {
    if (product.category === 'laptop') {
      return `${product.specs.processor} | ${product.specs.ram}`;
    }
    if (product.category === 'tv') {
      return `${product.specs.screenSize} ${product.specs.panelType} | ${product.specs.refreshRate}`;
    }
    if (product.category === 'camera') {
      return `${product.specs.megapixels} | ${product.specs.lensMount}`;
    }
    return 'High Performance';
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-4 transition-all duration-300 hover:shadow-2xl hover:border-orange-100 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-48 bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
        />
        {product.condition !== 'New' && (
          <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-1 rounded uppercase">
            {product.condition}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
            {getCategoryIcon()} {product.category}
          </span>
          <span className="text-xs text-gray-400 font-medium">{product.brand}</span>
        </div>

        <h3 className="font-bold text-slate-900 leading-tight text-lg min-h-[3rem]">
          {product.name}
        </h3>

        {/* The Chameleon Line */}
        <div className="bg-slate-50 p-2 rounded-lg text-xs font-medium text-slate-600 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {renderSpecs()}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-gray-50">
          <div>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">₵{product.originalPrice.toLocaleString()}</p>
            )}
            <p className="text-xl font-black text-slate-900">₵{product.price.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => addToCart(product)}
            className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-orange-500 transition-colors shadow-lg shadow-slate-200"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};