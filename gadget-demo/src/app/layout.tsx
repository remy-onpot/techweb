import type { Metadata } from "next";
import "./globals.css";
import { DesktopSuggestion } from '@/components/shop/DesktopSuggestion';

export const metadata: Metadata = {
  title: "Shop Raymie | Premium website for Ghana",
  description: "Your one-stop shop for UK Used laptops, gaming consoles, and phones. Located at Accra Mall.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-[#F8FAFC] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
        {children}
        <DesktopSuggestion /> {/* <-- Drop it here */}
      </body>
    </html>
  );
}
