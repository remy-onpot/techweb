"use client";
import React from 'react';
import { LayoutDashboard, Package, Image as ImageIcon, Users, LogOut, Layers } from 'lucide-react'; // <--- Added Layers icon
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <--- Added for active state

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A2540] text-white hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6">
          <span className="text-2xl font-bold tracking-tight">Payless<span className="text-orange-500">Admin</span></span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavItem href="/admin" active={pathname === '/admin'} icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavItem href="/admin/inventory" active={pathname === '/admin/inventory'} icon={<Package size={20} />} label="Inventory" />
          <NavItem href="/admin/banners" active={pathname === '/admin/banners'} icon={<ImageIcon size={20} />} label="Banners & Hero" />
          {/* NEW LINK */}
          <NavItem href="/admin/layouts" active={pathname === '/admin/layouts'} icon={<Layers size={20} />} label="Category Layouts" />
          
          <NavItem href="/admin/orders" active={pathname === '/admin/orders'} icon={<Users size={20} />} label="Orders" />
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button className="flex items-center gap-3 text-gray-400 hover:text-white transition w-full p-2 rounded-lg hover:bg-white/5">
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

// Updated NavItem to show Active State
const NavItem = ({ href, icon, label, active }: any) => (
  <Link 
    href={href} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
      active 
      ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' 
      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);