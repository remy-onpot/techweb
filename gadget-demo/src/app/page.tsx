"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Menu, User, ArrowRight, Zap, Star } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Product, HeroSlide  } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { CATEGORY_THEMES, GRID_SPANS } from '@/lib/design-system';
// Inside src/app/page.tsx

// Helper to map DB themes to Tailwind classes (This solves the admin needing to know code)
const getThemeClasses = (theme: string) => {
  switch(theme) {
    case 'light': return { text: 'text-slate-900', overlay: 'bg-gradient-to-r from-white/90 via-white/50 to-transparent' };
    case 'purple': return { text: 'text-white', overlay: 'bg-gradient-to-r from-purple-900/90 to-transparent' };
    case 'orange': return { text: 'text-white', overlay: 'bg-gradient-to-r from-orange-600/90 to-transparent' };
    default: return { text: 'text-white', overlay: 'bg-gradient-to-r from-slate-900/90 to-transparent' }; // Dark
  }
};

const HeroSection = () => {
  const { heroSlides } = useStore(); // <--- Pull from Store
  const [current, setCurrent] = useState(0);

  // Auto-rotate logic
  useEffect(() => {
    if (heroSlides.length === 0) return;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % heroSlides.length), 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  if (heroSlides.length === 0) return <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-b-[40px]" />;

  const slide = heroSlides[current];
  const theme = getThemeClasses(slide.theme);

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-b-[40px] shadow-2xl mb-12 bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img src={slide.image_url} className="w-full h-full object-cover" />
          <div className={`absolute inset-0 ${theme.overlay}`} />
          
          <div className="absolute inset-0 container mx-auto px-6 md:px-12 flex flex-col justify-center">
            <motion.div 
              initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} 
              className="max-w-xl"
            >
              {slide.badge && (
                <span className={`inline-block px-4 py-2 rounded-full border border-current text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md ${theme.text}`}>
                  {slide.badge}
                </span>
              )}
              <h1 className={`text-6xl md:text-8xl font-black leading-tight mb-4 ${theme.text}`}>
                {slide.title}
              </h1>
              <p className={`text-2xl md:text-3xl font-light mb-8 opacity-90 ${theme.text}`}>
                {slide.subtitle}
              </p>
              <div className="flex items-center gap-6">
                <button className="bg-[#F97316] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-lg hover:scale-105">
                  Check Deal
                </button>
                {slide.price && (
                  <span className={`text-3xl font-bold ${theme.text}`}>
                    {slide.price}
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-8 left-12 flex gap-3">
        {heroSlides.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${current === i ? 'bg-[#F97316] w-8' : 'bg-white/50'}`} 
          />
        ))}
      </div>
    </div>
  );
};

// --- BENTO CARD COMPONENT ---
// This handles the "Different but professional colours"
const BentoCard = ({ category, products }: { category: string, products: Product[] }) => {
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.default;
  const span = GRID_SPANS[category] || "col-span-1 row-span-1";
  
  // Find the cheapest product to display "From GHS X"
  const catProducts = products.filter(p => p.category === category);
  const startPrice = catProducts.length > 0 ? Math.min(...catProducts.map(p => p.price)) : 0;
  
  // Get a representative image
  const image = catProducts[0]?.images[0] || "";

  return (
    <Link 
      href={`/category/${category}`}
      className={`${span} ${theme} relative group rounded-3xl p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1`}
    >
      {/* Decorative Circle Background (The "Graphic Design" element) */}
      <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all" />

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-3xl font-black tracking-tight uppercase">{category}</h3>
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight size={24} />
            </div>
          </div>
          <p className="font-medium opacity-80 mt-2">{catProducts.length} Devices</p>
        </div>

        <div className="mt-auto pt-12">
           {startPrice > 0 && (
             <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold">
               From ₵{startPrice.toLocaleString()}
             </div>
           )}
        </div>
      </div>

      {/* Floating Product Image */}
     {image && (
  <div className="absolute bottom-0 right-0 w-[85%] h-[85%] pointer-events-none z-0">
    {/* Image Stage */}
    <div className="relative w-full h-full overflow-hidden rounded-tl-[120px] bg-white/10 backdrop-blur-sm">
      <img
        src={image}
        alt={category}
        className="
          absolute inset-0 
          w-full h-full 
          object-contain 
          p-6
          drop-shadow-2xl
          transition-transform duration-700 ease-out
          group-hover:scale-110
          group-hover:-rotate-2
        "
      />
    </div>
  </div>
)}

    </Link>
  );
};

export default function Page() {
  const { products, fetchStoreData, cart, isAdminMode, toggleAdmin } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { fetchStoreData(); }, []);

  // Filter Search
  const searchResults = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-8">
           <Link href="/" className="text-2xl font-black tracking-tighter text-[#0A2540]">
             PAYLESS<span className="text-[#F97316]">4TECH</span>
           </Link>

           <div className="hidden md:flex flex-1 max-w-lg relative">
             <div className="flex items-center w-full bg-slate-100 rounded-full px-5 py-3 focus-within:ring-2 ring-orange-500/50 transition-all">
               <Search className="text-gray-400 w-5 h-5 mr-3" />
               <input 
                 type="text" 
                 placeholder="Search gadgets..." 
                 className="bg-transparent outline-none w-full text-sm font-semibold text-slate-700"
                 onChange={(e) => setSearchQuery(e.target.value)}
                 value={searchQuery}
               />
             </div>
             {/* Search Dropdown */}
             {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-2xl shadow-xl p-2 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                  {searchResults.map(p => (
                    <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl cursor-pointer">
                      <img src={p.images[0]} className="w-10 h-10 object-contain" />
                      <div>
                        <p className="font-bold text-sm">{p.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{p.category}</p>
                      </div>
                      <span className="ml-auto font-bold text-orange-600">₵{p.price}</span>
                    </div>
                  ))}
                </div>
             )}
           </div>

           <div className="flex items-center gap-4">
             <button onClick={toggleAdmin} className="text-xs font-bold text-slate-500 hover:text-orange-600 transition">
               {isAdminMode ? 'ADMIN ON' : 'STAFF'}
             </button>
             <div className="relative p-3 bg-slate-900 text-white rounded-full hover:bg-orange-600 transition-colors cursor-pointer">
               <ShoppingCart size={20} />
               {cart.length > 0 && (
                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white">
                   {cart.length}
                 </span>
               )}
             </div>
           </div>
        </div>
      </nav>

      {/* HERO */}
      <HeroSection />

      {/* BENTO GRID LAYOUT */}
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-[#0A2540] mb-2">Shop Categories</h2>
            <p className="text-slate-500 font-medium">Curated collections for every tech need.</p>
          </div>
          <Link href="/shop" className="hidden md:flex items-center gap-2 font-bold text-orange-600 hover:translate-x-1 transition-transform">
            View All Inventory <ArrowRight size={20} />
          </Link>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 auto-rows-[300px]">
           {/* We explicitly map categories to ensure the bento layout holds */}
           <BentoCard category="laptop" products={products} />
           <BentoCard category="gaming" products={products} />
           <BentoCard category="audio" products={products} />
           <BentoCard category="monitor" products={products} />
           <BentoCard category="phone" products={products} />
           <BentoCard category="camera" products={products} />
        </div>
      </div>

      {/* FLASH DEALS (Horizontal) */}
      <div className="container mx-auto px-6 py-20">
         <div className="flex items-center gap-4 mb-8">
           <div className="bg-red-100 p-3 rounded-xl text-red-600"><Zap size={28} className="fill-current" /></div>
           <h2 className="text-3xl font-black text-[#0A2540]">Flash Deals</h2>
         </div>
         
         <div className="flex gap-6 overflow-x-auto pb-10 snap-x">
            {products.filter(p => p.originalPrice).map(product => (
              <div key={product.id} className="min-w-[300px] snap-center">
                 <ProductCard product={product} />
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}