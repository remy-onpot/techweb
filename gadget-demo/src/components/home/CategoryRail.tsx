"use client";

import React, { useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';

// 🎨 Agency-Level Gradient Themes
const CATEGORY_THEMES: Record<string, { gradient: string, text: string, label: string }> = {
  laptop: { 
    gradient: 'from-blue-600 to-cyan-500', 
    text: 'text-blue-100', 
    label: 'Pro Computing' 
  },
  gaming: { 
    gradient: 'from-purple-600 to-indigo-600', 
    text: 'text-purple-100', 
    label: 'Console & PC' 
  },
  audio: { 
    gradient: 'from-orange-500 to-pink-500', 
    text: 'text-orange-100', 
    label: 'High Fidelity' 
  },
  phone: { 
    gradient: 'from-emerald-500 to-teal-500', 
    text: 'text-emerald-100', 
    label: 'Smartphones' 
  },
  default: { 
    gradient: 'from-slate-700 to-slate-900', 
    text: 'text-slate-200', 
    label: 'Tech Gear' 
  }
};

interface RailProps {
  category: string;
  products: Product[];
}

export const CategoryRail = ({ category, products }: RailProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = CATEGORY_THEMES[category] || CATEGORY_THEMES.default;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const current = scrollRef.current;
      const scrollAmount = direction === 'left' ? -320 : 320;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-8 border-b border-gray-100 last:border-0">
      <div className="container mx-auto max-w-[1400px] px-4 md:px-6">
        
        {/* Header (Desktop Only Controls) */}
        <div className="flex items-end justify-between mb-6">
           <div className="flex items-center gap-3">
              <div className={`w-1.5 h-8 rounded-full bg-gradient-to-b ${theme.gradient}`} />
              <h3 className="text-2xl font-black text-slate-900 capitalize tracking-tight">
                {category} <span className="text-gray-400 font-medium text-lg hidden md:inline-block">- {theme.label}</span>
              </h3>
           </div>
           
           {/* Scroll Buttons (Hidden on Mobile) */}
           <div className="hidden md:flex gap-2">
              <button onClick={() => scroll('left')} className="p-2.5 rounded-full border border-gray-200 hover:bg-slate-100 text-slate-600 transition disabled:opacity-50">
                <ChevronLeft size={20}/>
              </button>
              <button onClick={() => scroll('right')} className="p-2.5 rounded-full border border-gray-200 hover:bg-slate-100 text-slate-600 transition">
                <ChevronRight size={20}/>
              </button>
           </div>
        </div>

        {/* The Rail Container */}
        <div className="relative group/rail">
           <div 
             ref={scrollRef}
             className="flex gap-4 md:gap-6 overflow-x-auto pb-8 -mb-8 snap-x snap-mandatory scrollbar-hide px-1"
             style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
           >
              {/* 1. IDENTITY CARD (Sticky-ish Visual Anchor) */}
              <div className="min-w-[260px] md:min-w-[300px] snap-start h-auto">
                 <Link 
                    href={`/category/${category}`}
                    className={`block h-full min-h-[360px] rounded-3xl bg-gradient-to-br ${theme.gradient} p-8 flex flex-col justify-between relative overflow-hidden group/card shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]`}
                 >
                    {/* Abstract Shapes */}
                    <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                       <span className={`text-xs font-black uppercase tracking-widest border border-white/20 px-2 py-1 rounded-md ${theme.text}`}>
                          Collection
                       </span>
                       <h4 className="text-3xl md:text-4xl font-black text-white leading-[0.9] mt-4 capitalize">
                          {category}
                       </h4>
                       <p className={`mt-4 text-sm font-medium leading-relaxed opacity-90 ${theme.text}`}>
                          Browse our full inventory of {category}s. Verified quality, best prices.
                       </p>
                    </div>
                    
                    <div className="relative z-10 inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm shadow-md group-hover/card:bg-slate-50 transition-colors w-fit">
                       View All <ArrowRight size={16} />
                    </div>
                 </Link>
              </div>

              {/* 2. PRODUCTS LIST */}
              {products.map((product) => (
                 <div key={product.id} className="min-w-[300px] md:min-w-[300px] snap-start">
                    <ProductCard product={product} />
                 </div>
              ))}
              
              {/* 3. "SEE MORE" END CARD (Mobile Only) */}
              <div className="min-w-[150px] snap-start flex md:hidden items-center justify-center">
                 <Link href={`/category/${category}`} className="flex flex-col items-center gap-2 text-slate-400">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-200 flex items-center justify-center">
                       <ArrowRight size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase">View All</span>
                 </Link>
              </div>
           </div>
        </div>

      </div>
    </section>
  );
};