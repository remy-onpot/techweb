"use client";

import React from 'react';
import { CategoryLayoutManager } from '@/components/admin/CategoryLayoutManager';
import { SlidersHorizontal } from 'lucide-react';

export default function LayoutsPage() {
  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Storefront Layouts</h1>
          <p className="text-slate-500 mt-2">
            Design your category pages dynamically. Create rows, set filters, and organize content.
          </p>
        </div>
        
        {/* Decorative Icon */}
        <div className="bg-gradient-to-br from-blue-100 to-indigo-50 p-3 rounded-2xl border border-blue-100">
           <SlidersHorizontal className="text-blue-600 w-8 h-8" />
        </div>
      </div>

      {/* The Manager Component */}
      <CategoryLayoutManager />
    </div>
  );
}