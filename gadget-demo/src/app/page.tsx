"use client";

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, ArrowRight, MapPin, Facebook, Instagram, Linkedin, Phone, Mail, Clock, Zap, Gamepad2, Headphones } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import { Product, Banner } from '@/lib/types';

// --- UTILS ---
const getCleanImageUrl = (url: string | undefined | null) => {
  if (!url) return 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800'; 
  let clean = url;
  if (clean.startsWith('["') || clean.startsWith("['")) {
    try {
      const parsed = JSON.parse(clean.replace(/'/g, '"')); 
      clean = Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
      clean = clean.replace(/[\["\]']/g, ''); 
    }
  }
  return clean.trim();
};

// --- COMPONENT: TOP BRAND HERO (Full Width) ---
const BrandHeroSection = ({ banners }: { banners: Banner[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full relative group">
      <div className="relative w-full aspect-[2/1] md:aspect-[21/9] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Link href={banners[current].link} className="block w-full h-full relative">
              <Image 
                src={getCleanImageUrl(banners[current].image_url)} 
                fill 
                className="object-cover" 
                alt="Brand Hero" 
                priority 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- COMPONENT: GRID HERO SLIDER ---
const HeroSlider = ({ banners }: { banners: Banner[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="w-full h-full bg-[#0A2540] relative flex items-center justify-center overflow-hidden">
         <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-blue-500/20 rounded-full blur-[100px]" />
         <div className="relative z-10 text-center p-8">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
              PAYLESS<span className="text-[#F97316]">4TECH</span>
            </h2>
            <Link href="/shop" className="bg-[#F97316] text-white px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform">
               Start Shopping
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <Link href={banners[current].link} className="block w-full h-full relative">
            <Image 
              src={getCleanImageUrl(banners[current].image_url)} 
              fill 
              className="object-cover" 
              alt="Hero" 
              priority 
            />
          </Link>
        </motion.div>
      </AnimatePresence>
      
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, idx) => (
            <button key={idx} onClick={() => setCurrent(idx)} className={`h-1.5 rounded-full transition-all ${current === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: FLASH CARD ---
const FlashCard = ({ banner, bestDeal }: { banner?: Banner, bestDeal?: Product }) => {
  if (banner) {
    return (
      <Link href={banner.link} className="block w-full h-full relative group">
        <Image src={getCleanImageUrl(banner.image_url)} fill className="object-cover transition-transform duration-700 group-hover:scale-105" alt="Flash" />
      </Link>
    );
  }
  if (bestDeal) {
     return (
        <Link href={`/product/${bestDeal.id}`} className="block w-full h-full bg-[#F97316] relative overflow-hidden group p-6 flex flex-col justify-between">
            <div className="relative z-10 text-white">
                <div className="flex items-center gap-2 mb-2"><Zap className="fill-white w-4 h-4 animate-pulse" /><span className="text-xs font-bold tracking-widest uppercase">Flash Deal</span></div>
                <h3 className="text-xl font-black leading-tight mb-2 line-clamp-2">{bestDeal.name}</h3>
                <div className="inline-block bg-white text-orange-600 px-2 py-1 rounded font-bold text-sm">-₵{((bestDeal.originalPrice || 0) - bestDeal.price).toLocaleString()}</div>
            </div>
            {bestDeal.images[0] && (
                <div className="absolute -bottom-2 -right-2 w-32 h-32 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                    <Image src={getCleanImageUrl(bestDeal.images[0])} fill className="object-contain drop-shadow-2xl" alt="Deal" />
                </div>
            )}
        </Link>
     );
  }
  return <div className="w-full h-full bg-gray-200 animate-pulse min-h-[200px]" />;
};

// --- COMPONENT: TILE CARD ---
const TileCard = ({ banner, title, icon: Icon, color, link }: { banner?: Banner, title: string, icon: any, color: string, link: string }) => {
  if (banner) {
    return (
      <Link href={banner.link} className="block w-full h-full relative group">
        <Image src={getCleanImageUrl(banner.image_url)} fill className="object-cover transition-transform duration-700 group-hover:scale-105" alt={title} />
      </Link>
    );
  }
  return (
    <Link href={link} className={`block w-full h-full ${color} relative p-5 flex flex-col justify-between group overflow-hidden min-h-[160px]`}>
       <div className="relative z-10 flex justify-between items-start">
          <span className="text-lg font-bold text-slate-900">{title}</span>
          <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-110 transition"><Icon size={18} className="text-slate-900"/></div>
       </div>
       <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition" />
    </Link>
  );
};

// --- COMPONENT: CATEGORY ROW (Netflix Style) ---
const CategoryRow = ({ title, category, products, link }: { title: string, category: string, products: Product[], link: string }) => {
  const items = products.filter(p => p.category === category).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="py-8 border-b border-gray-100 last:border-0">
       <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
             <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{title}</h2>
             <Link href={link} className="text-sm font-bold text-orange-600 hover:text-slate-900 flex items-center gap-1 transition-colors">
               View All <ArrowRight size={16} />
             </Link>
          </div>
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x no-scrollbar">
             {items.map(product => (
                <div key={product.id} className="min-w-[280px] md:min-w-0 snap-start">
                   <ProductCard product={product} />
                </div>
             ))}
             <Link href={link} className="min-w-[150px] md:hidden flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 snap-start text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-2"><ArrowRight size={24} /></div>
                <span className="font-bold text-sm">View All</span>
             </Link>
          </div>
       </div>
    </section>
  );
};

// --- COMPONENT: BRANCH SLIDER ---
const BranchSlider = ({ banners }: { banners: Banner[] }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % banners.length), 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const activeImage = banners.length > 0 
    ? getCleanImageUrl(banners[current].image_url)
    : "https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&q=80&w=1200"; 

  const mapLink = "https://goo.gl/maps/YOUR_MAP_LINK_HERE"; // Replace with real link

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8 items-center">
           <div className="w-full md:w-1/3 space-y-6">
              <span className="text-orange-600 font-bold tracking-widest text-xs uppercase">Visit Our Branch</span>
              <h2 className="text-4xl font-black text-slate-900 leading-tight">Come see us at <br/>Accra Mall.</h2>
              <div className="space-y-4 text-slate-600">
                 <div className="flex items-start gap-3"><MapPin className="mt-1 text-slate-900 shrink-0" /><p>Shop 42, Accra Mall,<br/>Spintex Road, Accra, Ghana</p></div>
                 <div className="flex items-center gap-3"><Clock className="text-slate-900 shrink-0" /><p>Mon - Sat: 9:00 AM - 8:00 PM</p></div>
              </div>
              <a href={mapLink} target="_blank" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-transform hover:scale-105">
                 Get Directions <ArrowRight size={18}/>
              </a>
           </div>
           <div className="w-full md:w-2/3 aspect-video md:aspect-[2/1] relative rounded-3xl overflow-hidden shadow-2xl group cursor-pointer">
              <a href={mapLink} target="_blank">
                 <AnimatePresence mode="wait">
                    <motion.div
                      key={current}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0"
                    >
                      <Image src={activeImage} fill className="object-cover transition-transform duration-700 group-hover:scale-105" alt="Location" />
                    </motion.div>
                 </AnimatePresence>
                 <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2">
                    <MapPin size={14} className="text-red-500" /> View on Google Maps
                 </div>
              </a>
           </div>
        </div>
      </div>
    </section>
  );
};

// --- MAIN PAGE ---
export default function Page() {
  const { products, banners, cart, fetchStoreData, isAdminMode, toggleAdmin } = useStore();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchStoreData(); }, []);

  // Filters
  const brandBanners = banners.filter(b => b.slot === 'brand_hero');
  const heroBanners = banners.filter(b => b.slot === 'hero');
  const flashBanner = banners.find(b => b.slot === 'flash');
  const newBanner = banners.find(b => b.slot === 'tile_new');
  const studentBanner = banners.find(b => b.slot === 'tile_student');
  const branchBanners = banners.filter(b => b.slot === 'branch_slider');

  const bestDeal = products.reduce((prev, curr) => {
    const prevDisc = (prev.originalPrice || 0) - prev.price;
    const currDisc = (curr.originalPrice || 0) - curr.price;
    return (currDisc > prevDisc) ? curr : prev;
  }, products[0]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
           <Link href="/" className="font-black text-2xl text-[#0A2540]">PAYLESS<span className="text-[#F97316]">4TECH</span></Link>
           <div className="hidden md:flex flex-1 max-w-md mx-auto relative group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-gray-100 rounded-full py-2 pl-10 outline-none focus:ring-2 ring-orange-100 transition" />
           </div>
           <div className="flex gap-3 items-center">
             <button onClick={toggleAdmin} className="text-xs font-bold text-slate-500 hover:text-orange-600">{isAdminMode ? 'ADMIN' : 'STAFF'}</button>
             <div className="relative p-2 bg-gray-100 rounded-full">
                <ShoppingCart size={20} />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">{cart.length}</span>}
             </div>
           </div>
        </div>
      </header>

      {/* 1. TOP BRAND HERO */}
      <BrandHeroSection banners={brandBanners} />

      {/* 2. HYBRID BENTO GRID */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[500px] mb-10">
          <div className="w-full md:w-1/2 h-[250px] md:h-full rounded-3xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100 flex-shrink-0">
             <HeroSlider banners={heroBanners} />
          </div>
          <div className="flex-1 flex md:grid md:grid-cols-2 md:grid-rows-2 gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x no-scrollbar">
             <div className="min-w-[45vw] md:min-w-0 md:w-auto md:row-span-2 aspect-[3/5] md:aspect-auto md:h-full rounded-3xl overflow-hidden shadow-sm flex-shrink-0 snap-start">
                <FlashCard banner={flashBanner} bestDeal={bestDeal} />
             </div>
             <div className="min-w-[40vw] md:min-w-0 md:w-auto aspect-square md:aspect-auto md:h-auto rounded-3xl overflow-hidden shadow-sm flex-shrink-0 snap-start">
                <TileCard banner={newBanner} title="Gaming" icon={Gamepad2} color="bg-purple-50" link="/category/gaming" />
             </div>
             <div className="min-w-[40vw] md:min-w-0 md:w-auto aspect-square md:aspect-auto md:h-auto rounded-3xl overflow-hidden shadow-sm flex-shrink-0 snap-start">
                <TileCard banner={studentBanner} title="Audio" icon={Headphones} color="bg-blue-50" link="/category/audio" />
             </div>
          </div>
        </div>
      </div>

      {/* 3. CATEGORY ROWS */}
      <div className="bg-white space-y-4">
         <CategoryRow title="Laptops & Computing" category="laptop" products={products} link="/category/laptop" />
         <CategoryRow title="Audio & Sound" category="audio" products={products} link="/category/audio" />
         <CategoryRow title="Smartphones" category="phone" products={products} link="/category/phone" />
         <CategoryRow title="Gaming Consoles" category="gaming" products={products} link="/category/gaming" />
      </div>

      {/* 4. ABOUT US */}
      <section className="py-20 bg-slate-900 text-white text-center">
         <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-3xl font-black mb-6">More Than Just a Tech Store.</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
               We started Payless4Tech with a simple mission: to make premium technology accessible to everyone in Ghana. 
               Quality you can trust, prices you'll love.
            </p>
            <Link href="/about" className="inline-block border border-white/30 px-8 py-3 rounded-full font-bold hover:bg-white hover:text-slate-900 transition-all">
               Read Our Story
            </Link>
         </div>
      </section>

      {/* 5. BRANCH SLIDER */}
      <BranchSlider banners={branchBanners} />

      {/* 6. SOCIAL CONNECT */}
      <section className="py-12 bg-gray-50 border-t border-gray-200">
         <div className="container mx-auto px-4 text-center">
            <h3 className="font-black text-xl mb-8">Connect With Us</h3>
            <div className="flex flex-wrap justify-center gap-6">
               {[
                 { icon: Phone, label: "WhatsApp", color: "hover:text-green-500" },
                 { icon: Facebook, label: "Facebook", color: "hover:text-blue-600" },
                 { icon: Instagram, label: "Instagram", color: "hover:text-pink-500" },
                 { icon: Linkedin, label: "LinkedIn", color: "hover:text-blue-700" },
               ].map((social, i) => (
                  <button key={i} className={`flex flex-col items-center gap-2 text-slate-500 transition-colors ${social.color}`}>
                     <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100">
                        <social.icon size={20} />
                     </div>
                     <span className="text-xs font-bold">{social.label}</span>
                  </button>
               ))}
            </div>
         </div>
      </section>

      {/* 7. PRE-ORDER CTA */}
      <section className="py-16 bg-[#0A2540] relative overflow-hidden">
         <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white max-w-xl">
               <div className="flex items-center gap-2 mb-4 text-orange-400 font-bold tracking-widest text-xs uppercase">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"/> Global Shipping
               </div>
               <h2 className="text-3xl md:text-4xl font-black mb-4">Can't find what you need?</h2>
               <p className="text-blue-200 text-lg mb-8">
                  Pre-order directly from the USA and receive your purchase within <strong>21 days</strong>. Verified authentic.
               </p>
               <button className="bg-[#F97316] text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl shadow-orange-900/50">
                  Start Pre-order Request
               </button>
            </div>
         </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white pt-16 pb-8 border-t border-gray-100">
         <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
               <div className="space-y-4">
                  <div className="font-black text-2xl text-[#0A2540]">PAYLESS<span className="text-[#F97316]">4TECH</span></div>
                  <div className="space-y-2 text-sm text-slate-500">
                     <p className="flex items-center gap-2"><Mail size={14}/> info@payless4tech.com</p>
                     <p className="flex items-center gap-2"><Phone size={14}/> +233 245 151 416</p>
                     <p className="flex items-center gap-2"><MapPin size={14}/> Shop 42, Accra Mall</p>
                  </div>
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 mb-4">Quick Links</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                     <li><Link href="/about" className="hover:text-orange-600">About Us</Link></li>
                     <li><Link href="/shop" className="hover:text-orange-600">All Products</Link></li>
                     <li><Link href="/faq" className="hover:text-orange-600">FAQ</Link></li>
                     <li><Link href="/terms" className="hover:text-orange-600">Returns & Warranty</Link></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 mb-4">Shop</h4>
                  <ul className="space-y-3 text-sm text-slate-500">
                     <li><Link href="/category/laptop" className="hover:text-orange-600">Laptops</Link></li>
                     <li><Link href="/category/phone" className="hover:text-orange-600">Phones</Link></li>
                     <li><Link href="/category/audio" className="hover:text-orange-600">Audio</Link></li>
                     <li><Link href="/category/gaming" className="hover:text-orange-600">Gaming</Link></li>
                  </ul>
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 mb-4">Stay Updated</h4>
                  <p className="text-xs text-slate-500 mb-4">Subscribe for exclusive offers and new drops.</p>
                  <div className="flex gap-2">
                     <input type="email" placeholder="Email address" className="bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm outline-none focus:border-orange-500 w-full" />
                     <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Join</button>
                  </div>
               </div>
            </div>
            <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
               <p>© 2026 Payless4Tech. All rights reserved.</p>
               <div className="flex gap-4"><span>Privacy Policy</span><span>Terms of Service</span></div>
            </div>
         </div>
      </footer>
    </div>
  );
}