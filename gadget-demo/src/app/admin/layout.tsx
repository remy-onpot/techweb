"use client";
import React from 'react';
import { LayoutDashboard, Package, Image as ImageIcon, Users, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A2540] text-white hidden md:flex flex-col">
        <div className="p-6">
          <span className="text-2xl font-bold tracking-tight">Payless<span className="text-orange-500">Admin</span></span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem href="/admin" icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem href="/admin/inventory" icon={<Package size={20} />} label="Inventory" />
          <NavItem href="/admin/banners" icon={<ImageIcon size={20} />} label="Banners & Hero" />
          <NavItem href="/admin/orders" icon={<Users size={20} />} label="Orders" />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}

const NavItem = ({ href, icon, label }: any) => (
  <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition text-slate-300 hover:text-white">
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);