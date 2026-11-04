'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { checkout } from '@/actions/checkout';
import { useStore } from '@/lib/store';
import { formatMoney } from '@/lib/format-money';
import { storeConfig } from '@/lib/store-config';

function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  const callingCode = storeConfig.phoneCountryCode;
  if (digits.startsWith('0')) return `+${callingCode}${digits.slice(1)}`;
  if (digits.startsWith(callingCode)) return `+${digits}`;
  return trimmed;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useStore();
  const items = useMemo(() => cart, [cart]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<(typeof storeConfig.enabledPaymentMethods)[number]>(storeConfig.enabledPaymentMethods[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const idempotencyKey = useRef('');
  const estimatedTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (items.length === 0) {
    return <main className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-2xl font-black">Your cart is empty</h1><Link className="mt-5 inline-block text-orange-600" href="/cart">Return to cart</Link></main>;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await checkout({
      customer: { name, phone: normalizePhone(phone), email, notes },
      items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      paymentMethod,
      idempotencyKey: idempotencyKey.current || (idempotencyKey.current = crypto.randomUUID()),
    });

    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    sessionStorage.setItem(`shop-order:${result.orderId}`, JSON.stringify({ claimCode: result.claimCode, orderNumber: result.orderNumber }));
    clearCart();
    if (result.authorizationUrl) {
      window.location.href = result.authorizationUrl;
      return;
    }
    router.push(`/order-success/${result.orderId}`);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-5">
        <section className="space-y-6 md:col-span-3">
          <Link href="/cart" className="inline-flex items-center gap-2 font-bold text-slate-500"><ArrowLeft size={18} /> Back to cart</Link>
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <h1 className="mb-6 text-2xl font-black">Checkout</h1>
            <form id="checkout" onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-bold">Full name <span className="text-red-500">*</span>
                <input required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-medium outline-none focus:border-orange-400" autoComplete="name" />
              </label>
              <label className="block text-sm font-bold">Phone number <span className="text-red-500">*</span>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="024 123 4567 or +233…" className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-medium outline-none focus:border-orange-400" autoComplete="tel" />
              </label>
              <label className="block text-sm font-bold">Email address <span className="font-normal text-slate-400">(optional)</span>
                <input type="email" maxLength={320} value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3 font-medium outline-none focus:border-orange-400" autoComplete="email" />
              </label>
              <label className="block text-sm font-bold">Delivery notes <span className="font-normal text-slate-400">(optional)</span>
                <textarea maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 font-medium outline-none focus:border-orange-400" placeholder="Landmark, preferred delivery time, or pickup notes" />
              </label>

              <fieldset>
                <legend className="mb-3 text-sm font-bold">Payment method</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {storeConfig.enabledPaymentMethods.map((method) => (
                    <label key={method} className={`cursor-pointer rounded-xl border p-4 ${paymentMethod === method ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
                      <input type="radio" name="paymentMethod" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="mr-2 accent-orange-600" />
                      <span className="font-bold">{method === 'pay_on_pickup' ? 'Pay on pickup' : 'Pay with Mobile Money'}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
            </form>
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:sticky md:top-8 md:col-span-2">
          <h2 className="mb-5 text-xl font-black">Order summary</h2>
          <div className="space-y-4">
            {items.map((item) => <div key={item.variantId} className="flex justify-between gap-3 text-sm">
              <span className="text-slate-600">{item.quantity} × {item.title} <span className="block text-xs text-slate-400">{item.variantTitle}</span></span>
              <strong className="whitespace-nowrap">{formatMoney(item.unitPrice * item.quantity)}</strong>
            </div>)}
          </div>
          <div className="mt-5 flex justify-between border-t border-dashed pt-5 text-lg font-black"><span>Estimated total</span><span>{formatMoney(estimatedTotal)}</span></div>
          <p className="mt-2 text-xs text-slate-500">Final price and availability are confirmed securely when the order is placed.</p>
          <button form="checkout" type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white disabled:opacity-60">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Processing…</> : <><ShieldCheck size={18} /> Place order</>}
          </button>
        </aside>
      </div>
    </main>
  );
}
