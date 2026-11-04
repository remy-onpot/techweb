'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { formatMoney } from '@/lib/format-money';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  const router = useRouter();
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (!cart.length) return <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 text-center">
    <ShoppingBag className="mb-6 text-gray-300" size={40} />
    <h1 className="text-2xl font-black">Your cart is empty</h1>
    <p className="my-4 text-slate-500">Check out the latest products in our store.</p>
    <Link href="/" className="rounded-xl bg-slate-900 px-8 py-3 font-bold text-white">Start shopping</Link>
  </div>;

  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-12">
    <div className="mb-8 flex items-center justify-between"><h1 className="text-3xl font-black">Shopping Cart ({cart.length})</h1><Link href="/" className="flex items-center gap-2"><ArrowLeft size={18} /> Continue shopping</Link></div>
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="space-y-4 lg:col-span-2">{cart.map((item) => <article key={item.variantId} className="flex gap-4 rounded-2xl border bg-white p-4">
        <div className="relative h-24 w-24 shrink-0 rounded-xl bg-slate-50">{item.image && <Image src={item.image} fill alt={item.title} className="object-contain p-2" unoptimized />}</div>
        <div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><div><h2 className="font-bold">{item.title}</h2><p className="text-sm text-slate-500">{item.variantTitle}{item.sku ? ` · ${item.sku}` : ''}</p></div><strong>{formatMoney(item.unitPrice * item.quantity)}</strong></div>
          <div className="mt-4 flex items-center justify-between"><button onClick={() => removeFromCart(item.variantId)} className="flex items-center gap-1 text-sm text-red-600"><Trash2 size={15} /> Remove</button><div className="flex items-center gap-3"><button aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.variantId, -1)}><Minus size={16} /></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(item.variantId, 1)}><Plus size={16} /></button></div></div>
        </div>
      </article>)}</section>
      <aside className="h-fit rounded-2xl border bg-white p-6"><h2 className="text-xl font-black">Order Summary</h2><div className="my-5 flex justify-between"><span>Subtotal</span><strong>{formatMoney(subtotal)}</strong></div><button onClick={() => router.push('/checkout')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white">Checkout <ArrowRight size={18} /></button></aside>
    </div>
  </main>;
}
