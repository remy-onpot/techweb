"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Banner } from '@/lib/types';

interface HeroGridProps {
  banners: Banner[];
}

export const HeroGrid = ({ banners }: HeroGridProps) => {
  const mainHeroes = banners.filter(b => b.slot === 'main_hero');
  const sideTops = banners.filter(b => b.slot === 'side_top');
  const sideBottoms = banners.filter(b => b.slot === 'side_bottom');

  const [indices, setIndices] = useState({ main: 0, top: 0, bottom: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setIndices(prev => ({
        main: mainHeroes.length > 1 ? (prev.main + 1) % mainHeroes.length : 0,
        top: sideTops.length > 1 ? (prev.top + 1) % sideTops.length : 0,
        bottom: sideBottoms.length > 1 ? (prev.bottom + 1) % sideBottoms.length : 0,
      }));
    }, 6000);
    return () => clearInterval(interval);
  }, [mainHeroes.length, sideTops.length, sideBottoms.length]);

  if (mainHeroes.length === 0 && sideTops.length === 0 && sideBottoms.length === 0) return null;

  const activeMain = mainHeroes[indices.main];
  const activeTop = sideTops[indices.top];
  const activeBottom = sideBottoms[indices.bottom];

  return (
    // FIX 1: Removed 'pt-6' (was creating the awkward gap). Reduced 'mb-12' to 'mb-8'.
    <section className="px-3 md:px-4 mb-8">
      
      {/* FIX 2: Increased max-width from 1400px to 1600px to fill laptop screens */}
      <div className="container mx-auto max-w-[1600px]">
        
        <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-3 md:gap-4 h-auto md:h-[450px]">
          
          {/* MAIN HERO CARD */}
          <div className="col-span-1 md:col-span-8 md:row-span-2 relative rounded-3xl md:rounded-[2.5rem] overflow-hidden group shadow-xl aspect-[2/1] md:aspect-auto md:h-full bg-slate-900">
            <AnimatePresence mode="wait">
              {activeMain && (
                <motion.div
                  key={activeMain.id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-full h-full"
                        style={{ background: `radial-gradient(circle at 0% 0%, #00AEEF 0%, transparent 50%), radial-gradient(circle at 100% 100%, #F7931E 0%, transparent 50%), linear-gradient(135deg, #00AEEF 0%, #F7931E 100%)` }} 
                      />
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                  </div>

                  <div className="relative z-10 h-full flex flex-col md:flex-row items-start md:items-center p-6 md:p-14">
                    <div className="w-full md:w-1/2 space-y-3 md:space-y-6 z-20 flex flex-col items-start text-left pt-2 md:pt-0">
                      {activeMain.label && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">{activeMain.label}</span>
                        </div>
                      )}
                      
                      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[0.95] tracking-tight drop-shadow-md">
                        {activeMain.title}
                      </h1>
                      
                      <p className="hidden xs:block text-white/90 text-sm md:text-lg font-medium leading-relaxed max-w-sm drop-shadow-md line-clamp-2">
                        {activeMain.description}
                      </p>
                      
                      <Link 
                        href={activeMain.link_url} 
                        className="group/btn bg-white text-slate-900 pl-5 pr-2 py-1.5 md:py-3 rounded-full font-bold text-sm md:text-lg shadow-lg flex items-center gap-2 mt-1 hover:scale-105 transition-transform"
                      >
                        <span>{activeMain.cta_text || 'Shop'}</span>
                        <div className="w-7 h-7 md:w-10 md:h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                          <ArrowRight size={14} className="md:w-5 md:h-5"/>
                        </div>
                      </Link>
                    </div>

                    <div className="absolute bottom-[-5%] right-[-10%] md:static w-[70%] md:w-1/2 h-[60%] md:h-full flex items-center justify-center z-10 pointer-events-none">
                       <div className="relative w-full h-full md:scale-125">
                         <Image 
                            src={activeMain.image_url}
                            fill
                            className="object-contain object-bottom md:object-center drop-shadow-[-10px_20px_30px_rgba(0,0,0,0.4)]"
                            alt={activeMain.title}
                            priority
                         />
                       </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {mainHeroes.length > 1 && (
                <div className="absolute bottom-4 left-6 flex gap-1 z-30">
                    {mainHeroes.map((_, idx) => (
                        <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${indices.main === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`} />
                    ))}
                </div>
            )}
          </div>

          {/* SIDE CARDS */}
          <div className="col-span-1 md:col-span-4 md:row-span-2 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-3 md:gap-4 h-36 md:h-full">
            
            {/* TOP SIDE */}
            <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden group shadow-lg bg-[#0F172A]">
              <AnimatePresence mode="wait">
                {activeTop && (
                  <motion.div
                    key={activeTop.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Link href={activeTop.link_url} className="block w-full h-full relative p-4 md:p-8 flex flex-col justify-center items-start z-20">
                        <div className="relative z-20 max-w-[80%] md:max-w-[60%]">
                          {activeTop.label && <div className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5">{activeTop.label}</div>}
                          <h2 className="text-lg md:text-3xl font-black text-white leading-none mb-1 md:mb-3 uppercase line-clamp-2">{activeTop.title}</h2>
                          <span className="text-[10px] md:text-xs font-bold text-cyan-400 border-b border-cyan-400 pb-0.5">Shop</span>
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 right-[-20%] md:right-[-10%] w-[70%] h-[90%]">
                          <Image src={activeTop.image_url} fill className="object-contain drop-shadow-lg" alt={activeTop.title}/>
                        </div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BOTTOM SIDE */}
            <div className="relative rounded-2xl md:rounded-[2.5rem] overflow-hidden group shadow-lg bg-white border border-gray-100">
              <AnimatePresence mode="wait">
                {activeBottom && (
                  <motion.div
                    key={activeBottom.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 w-full h-full"
                  >
                      <Link href={activeBottom.link_url} className="block w-full h-full relative p-4 md:p-8 flex items-center">
                        <div className="w-full md:w-1/2 relative z-20">
                          <div className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{activeBottom.label || 'Deal'}</div>
                          <h2 className="text-lg md:text-3xl font-black text-slate-900 leading-none mb-1 md:mb-2 uppercase line-clamp-2">{activeBottom.title}</h2>
                        </div>
                        <div className="absolute bottom-0 right-0 w-[50%] h-[80%]">
                            <Image src={activeBottom.image_url} fill className="object-contain object-bottom-right drop-shadow-lg" alt={activeBottom.title}/>
                        </div>
                      </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};