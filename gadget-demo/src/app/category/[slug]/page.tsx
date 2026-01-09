"use client";

import React, { useEffect, use } from 'react';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import { ArrowLeft, PackageX } from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_THEMES } from '@/lib/design-system';

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using React.use()
  const { slug } = use(params);
  
  const { products, fetchProducts, isLoading } = useStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const categoryProducts = products.filter(
    (p) => p.category.toLowerCase() === slug.toLowerCase()
  );

  // Get the theme color or default to slate
  const themeClass = CATEGORY_THEMES[slug] || "bg-slate-900 text-white";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dynamic Header */}
      <div className={`py-12 px-6 ${themeClass} relative overflow-hidden shadow-xl`}>
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
         
         <div className="container mx-auto relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition font-medium">
              <ArrowLeft size={20} /> Back to Shop
            </Link>
            <h1 className="text-5xl md:text-7xl font-black capitalize tracking-tight mb-2">
              {slug}
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              Browse our premium collection of {slug}s. Quality checked and verified.
            </p>
         </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-6 py-12">
        {isLoading ? (
           <div className="text-center py-20 text-gray-400">Loading inventory...</div>
        ) : categoryProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="bg-gray-100 p-6 rounded-full mb-4">
              <PackageX size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-600">No products found</h2>
            <p>We are currently restocking our {slug} selection.</p>
            <Link href="/" className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-full font-bold hover:bg-orange-500 transition">
              View All Categories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}