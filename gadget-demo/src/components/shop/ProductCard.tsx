import Image from 'next/image';
import Link from 'next/link';
import type { Database } from '@/lib/database.types';
import { formatMoney } from '@/lib/format-money';

type Product = Database['public']['Tables']['products']['Row'];

export function ProductCard({ product, cheapestVariantPrice, totalStock }: {
  product: Product;
  cheapestVariantPrice: number;
  totalStock: number;
}) {
  return <Link href={`/product/${product.slug}`} className="group relative block overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg">
    {totalStock === 0 && <span className="absolute left-3 top-3 z-10 rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">Out of Stock</span>}
    <div className="relative aspect-square bg-slate-100">{product.base_images[0] && <Image src={product.base_images[0]} alt={product.title} fill className="object-contain p-4 transition group-hover:scale-105" unoptimized />}</div>
    <div className="p-4"><h2 className="line-clamp-2 font-bold">{product.title}</h2><p className="mt-2 font-black">{formatMoney(cheapestVariantPrice)}</p></div>
  </Link>;
}
