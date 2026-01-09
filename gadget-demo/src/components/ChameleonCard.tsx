import { Product } from '@/lib/db';
import { Laptop, Tv, Headphones, Cpu, Zap, Wifi } from 'lucide-react';

export const ChameleonCard = ({ product }: { product: Product }) => {
  // Logic to determine which specs to highlight on the card based on category
  const renderKeySpecs = () => {
    switch (product.category) {
      case 'laptop':
        return (
          <div className="flex gap-2 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"><Cpu size={12}/> {product.specs.processor}</span>
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"><Zap size={12}/> {product.specs.ram}</span>
          </div>
        );
      case 'tv':
        return (
          <div className="flex gap-2 mt-2 text-xs text-gray-500">
             <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"><Tv size={12}/> {product.specs.resolution}</span>
             <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"><Zap size={12}/> {product.specs.refresh_rate}</span>
          </div>
        );
      case 'audio':
        return (
           <div className="flex gap-2 mt-2 text-xs text-gray-500">
             <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"><Wifi size={12}/> {product.specs.connection}</span>
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="group relative bg-white border border-gray-100 hover:border-orange-200 rounded-2xl p-4 transition-all hover:shadow-xl hover:-translate-y-1">
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
        {product.badges.map(b => (
          <span key={b} className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">{b}</span>
        ))}
      </div>

      {/* Image */}
      <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl mb-4 overflow-hidden">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
      </div>

      {/* Content */}
      <div>
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">{product.category}</p>
        <h3 className="font-bold text-gray-900 text-lg leading-tight mt-1">{product.name}</h3>
        
        {/* CHAMELEON SPECS RENDERED HERE */}
        {renderKeySpecs()}

        <div className="mt-4 flex items-end justify-between">
          <div>
             <span className="text-sm text-gray-400 line-through">₵{product.originalPrice.toLocaleString()}</span>
             <div className="text-xl font-black text-slate-900">₵{product.price.toLocaleString()}</div>
          </div>
          <button className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-orange-500 transition-colors">
            <span className="sr-only">Add</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};