"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export const Header = () => {
  const { cart, isAdminMode, toggleAdmin } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-white/90 backdrop-blur-md border-gray-200 py-3" 
          : "bg-white border-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between gap-4">
        
        {/* LOGO MATCHING THE IMAGE */}
        <Link href="/" className="flex items-center gap-0.5 z-50 select-none">
           {/* 'Payless' in Cyan Blue */}
           <span className="font-black text-2xl md:text-3xl tracking-tighter text-[#00AEEF]">
             Payless
           </span>
           {/* '4tech' in White on Orange Box */}
           <span className="bg-[#F7931E] text-white px-1.5 py-0.5 font-black text-2xl md:text-3xl tracking-tighter leading-none -mb-1">
             4tech
           </span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto relative group">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#F7931E] transition-colors" />
           <input 
             placeholder="Search laptops, consoles..." 
             className="w-full bg-gray-100/80 border-transparent border focus:bg-white focus:border-orange-200 rounded-full py-2.5 pl-10 pr-4 outline-none transition-all text-sm font-medium" 
           />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 z-50">
           <button 
             onClick={toggleAdmin} 
             className="hidden md:block text-[10px] font-black text-slate-400 hover:text-[#F7931E] border border-slate-200 px-2 py-1 rounded uppercase transition-colors"
           >
             {isAdminMode ? 'Admin Mode' : 'Staff Mode'}
           </button>

           <Link href="/cart" className="relative p-2.5 bg-gray-100 rounded-full hover:bg-orange-50 text-slate-700 hover:text-[#F7931E] transition-colors">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {cart.length}
                </span>
              )}
           </Link>
           
           <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X /> : <Menu />}
           </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 flex flex-col gap-4 md:hidden shadow-xl animate-in slide-in-from-top-5">
           <input placeholder="Search..." className="w-full bg-gray-100 p-3 rounded-xl" />
           <nav className="flex flex-col gap-2 font-bold text-slate-600">
              <Link href="/category/laptop" className="p-2 hover:bg-gray-50 rounded-lg">Laptops</Link>
              <Link href="/category/phone" className="p-2 hover:bg-gray-50 rounded-lg">Phones</Link>
              <Link href="/category/gaming" className="p-2 hover:bg-gray-50 rounded-lg">Gaming</Link>
           </nav>
        </div>
      )}
    </header>
  );
};