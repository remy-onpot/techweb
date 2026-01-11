"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Banner } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

export const BrandHero = ({ banners }: { banners: Banner[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const activeBanner = banners[current];

  return (
    // FIX: Reduced 'mb-6' to 'mb-4' to reduce gap between this and HeroGrid
    <section className="relative w-full mb-4 group px-3 md:px-4">
      <div className="container mx-auto max-w-[1600px] relative"> {/* FIX: Match Width of HeroGrid */}
        <div className="relative w-full aspect-[2/1] md:aspect-[21/9] overflow-hidden rounded-3xl md:rounded-[2.5rem] shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBanner.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <div className="relative w-full h-full">
                  <Image 
                    src={activeBanner.image_url} 
                    fill 
                    className="object-cover" 
                    alt={activeBanner.title || 'Brand Banner'}
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent" />
              </div>

              {(activeBanner.title || activeBanner.label) && (
                 <div className="absolute inset-0 flex items-center px-6 md:px-16">
                    <div className="max-w-lg space-y-4">
                       {activeBanner.label && (
                          <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest rounded-md">
                             {activeBanner.label}
                          </span>
                       )}
                       
                       <h2 className="text-3xl md:text-6xl font-black text-white leading-[1.1] drop-shadow-lg">
                          {activeBanner.title}
                       </h2>
                       
                       {activeBanner.link_url && (
                          <Link 
                            href={activeBanner.link_url} 
                            className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all transform hover:scale-105"
                          >
                             {activeBanner.cta_text || 'Shop Now'} <ArrowRight size={18} />
                          </Link>
                       )}
                    </div>
                 </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};