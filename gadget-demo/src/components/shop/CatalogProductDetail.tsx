'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useStore } from '@/lib/store';
import { formatMoney } from '@/lib/format-money';
import type { Category, Product, ProductSpecMap, Variant } from '@/lib/types';

interface CatalogProduct {
  id: string; title: string; slug: string; description: string; category_name: string; category_slug: string;
  base_images: string[]; has_variants: boolean;
}
interface CatalogVariant { id: string; product_id: string; sku: string | null; title: string; price: number; stock_quantity: number; attributes: unknown; images?: string[] }

function specsFrom(value: unknown): ProductSpecMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([, item]) => ['string', 'number', 'boolean'].includes(typeof item))) as ProductSpecMap;
}

export function CatalogProductDetail({ product: row, variants: rows }: { product: CatalogProduct; variants: CatalogVariant[] }) {
  const router = useRouter();
  const addToCart = useStore((state) => state.addToCart);
  const [selectedId, setSelectedId] = useState(rows.find((variant) => variant.stock_quantity > 0)?.id ?? rows[0]?.id ?? '');
  const selected = rows.find((variant) => variant.id === selectedId);
  const category = (row.category_slug || 'accessory') as Category;
  const product: Product = {
    id: row.id, name: row.title, slug: row.slug, brand: '', category,
    description: row.description, price: selected?.price ?? rows[0]?.price ?? 0,
    images: row.base_images ?? [], variants: rows.map((variant) => ({
      id: variant.id, product_id: variant.product_id, sku: variant.sku ?? undefined, condition: 'Standard',
      price: variant.price, stock: variant.stock_quantity, specs: specsFrom(variant.attributes), images: variant.images ?? [],
    })),
  };
  const variant: Variant | undefined = selected ? {
    id: selected.id, product_id: selected.product_id, sku: selected.sku ?? undefined, condition: 'Standard',
    price: selected.price, stock: selected.stock_quantity, specs: specsFrom(selected.attributes), images: selected.images ?? [],
  } : undefined;

  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-10">
    <Link href={row.category_slug ? `/category/${row.category_slug}` : '/'} className="text-sm font-bold text-orange-700">← {row.category_name}</Link>
    <div className="mt-6 grid gap-10 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-3xl bg-white">{row.base_images[0] && <img src={row.base_images[0]} alt={row.title} className="h-full w-full object-contain" />}</div>
      <section className="py-2"><p className="text-sm font-bold uppercase tracking-widest text-orange-700">{row.category_name}</p><h1 className="mt-3 text-3xl font-black md:text-4xl">{row.title}</h1><p className="mt-5 whitespace-pre-wrap leading-relaxed text-slate-600">{row.description}</p>
        <div className="mt-7"><label className="text-sm font-bold">Choose an option<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-2 block w-full rounded-xl border bg-white p-3">{rows.map((item) => <option key={item.id} value={item.id} disabled={item.stock_quantity === 0}>{item.title}{item.stock_quantity === 0 ? ' — out of stock' : ''}</option>)}</select></label></div>
        {selected && <><p className="mt-5 text-3xl font-black">{formatMoney(selected.price)}</p><p className="mt-1 text-sm text-slate-500">{selected.stock_quantity} available</p><div className="mt-4 flex flex-wrap gap-2">{Object.entries(specsFrom(selected.attributes)).map(([key, value]) => <span key={key} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{key}: {String(value)}</span>)}</div></>}
        <button disabled={!variant || variant.stock < 1} onClick={() => { if (variant) { addToCart(product, variant); router.push('/cart'); } }} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 font-bold text-white disabled:opacity-50"><ShoppingCart size={18} /> Add to cart</button>
      </section>
    </div>
  </main>;
}
