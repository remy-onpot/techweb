"use client";

import React from 'react';
import { MarketingManager } from '@/components/admin/MarketingManager';
import { Sparkles, LayoutTemplate } from 'lucide-react';

export default function MarketingPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketing Assets</h1>
          <p className="text-slate-500 mt-2">
            Manage your Hero Slider, Flash Sale banners, and Category Tiles.
          </p>
        </div>
        
        {/* Decorative Icon */}
        <div className="bg-gradient-to-br from-orange-100 to-amber-50 p-3 rounded-2xl border border-orange-100">
           <LayoutTemplate className="text-orange-600 w-8 h-8" />
        </div>
      </div>

      {/* The New Manager Component */}
      <MarketingManager />
    </div>
  );
}