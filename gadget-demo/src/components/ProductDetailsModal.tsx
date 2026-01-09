import React, { useState } from 'react';
import { X, ShoppingCart, Heart, Shield, Truck } from 'lucide-react';

// 1. Define the shape of your Product
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  badge?: string;
  description?: string;
  specs?: string;
  rating?: number;
  featured?: boolean;
}

// 2. Define the props the Modal accepts
interface ProductDetailsModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: any) => void; // accepts the product + selected config
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ product, onClose, onAddToCart }) => {
  const [activeImage, setActiveImage] = useState(product.image);
  
  // Configuration State
  const [config, setConfig] = useState({
    ram: '16GB',
    storage: '512GB',
    condition: 'New'
  });

  // Base price calculation logic
  const calculatePrice = () => {
    let base = product.price;
    if (config.ram === '32GB') base += 800;
    if (config.storage === '1TB') base += 600;
    if (config.condition === 'Open Box') base -= 500;
    return base;
  };

  const currentPrice = calculatePrice();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0A2540]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* LEFT: Image Gallery */}
        <div className="w-full md:w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-center relative">
          <div className="relative w-full aspect-square max-w-[400px] mb-4">
             <img 
               src={activeImage} 
               alt={product.name} 
               className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-500" 
             />
          </div>
          {/* Thumbnails */}
          <div className="flex gap-3 overflow-x-auto p-2">
            {[product.image, product.image].map((img, i) => (
              <button 
                key={i}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${activeImage === img ? 'border-[#F97316]' : 'border-transparent'}`}
              >
                <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Product Info & Config */}
        <div className="w-full md:w-1/2 p-8 md:p-10 overflow-y-auto">
          <div className="mb-6">
            <span className="text-[#F97316] font-bold text-sm tracking-wide uppercase mb-2 block">
              {product.category || 'Tech Deal'}
            </span>
            <h2 className="text-3xl font-bold text-[#0A2540] mb-2">{product.name}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">IN STOCK</span>
              <span>SKU: PL-{product.id}</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Specs Configuration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Memory (RAM)</label>
              <div className="flex flex-wrap gap-2">
                {['8GB', '16GB', '32GB'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setConfig({ ...config, ram: opt })}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                      ${config.ram === opt 
                        ? 'border-[#F97316] bg-[#F97316]/10 text-[#F97316]' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Storage (SSD)</label>
              <div className="flex flex-wrap gap-2">
                {['256GB', '512GB', '1TB'].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setConfig({ ...config, storage: opt })}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                      ${config.storage === opt 
                        ? 'border-[#F97316] bg-[#F97316]/10 text-[#F97316]' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & Actions */}
            <div className="pt-6 border-t border-gray-100">
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-bold text-[#0A2540]">
                  ₵{currentPrice.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 mb-1.5 line-through">
                  ₵{(currentPrice * 1.2).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onAddToCart({ ...product, config, price: currentPrice })}
                  className="flex-1 bg-[#F97316] hover:bg-[#ea580c] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95 transition-all"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
                <button className="p-3.5 border-2 border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                  <Heart size={20} />
                </button>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield size={16} className="text-[#0A2540]" />
                12 Month Warranty
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck size={16} className="text-[#0A2540]" />
                Free Delivery inside Accra
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;