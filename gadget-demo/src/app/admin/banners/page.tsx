"use client";

import React from 'react';
import { BannerManager } from '@/components/admin/BannerManager';
import { Sparkles } from 'lucide-react';

export default function BannersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hero Banners</h1>
          <p className="text-slate-500 mt-2">
            Control the first thing your customers see. Limit of 5 active slides recommended.
          </p>
        </div>
        
        {/* Decorative Icon */}
        <div className="bg-gradient-to-br from-purple-100 to-blue-50 p-3 rounded-2xl border border-blue-100">
           <Sparkles className="text-blue-600 w-8 h-8" />
        </div>
      </div>

      {/* The Manager Component */}
      <BannerManager />
    </div>
  );
}