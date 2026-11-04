'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrderSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const [details, setDetails] = useState<{ claimCode: string | null; orderNumber: string } | null>(null);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    let active = true;
    void params.then(({ orderId: id }) => {
      const raw = sessionStorage.getItem(`shop-order:${id}`);
      if (!active) return;
      setOrderId(id);
      if (raw) {
        try { setDetails(JSON.parse(raw) as { claimCode: string | null; orderNumber: string }); }
        catch { setDetails({ claimCode: null, orderNumber: id }); }
      } else setDetails({ claimCode: null, orderNumber: id });
    });
    return () => { active = false; };
  }, [params]);

  return <main className="mx-auto flex min-h-[80vh] max-w-xl flex-col items-center justify-center px-5 text-center">
    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</div>
    <h1 className="text-3xl font-black">Order received</h1>
    <p className="mt-3 text-slate-600">Order <strong>{details?.orderNumber ?? orderId}</strong> has been placed. The store will follow up using your phone number.</p>
    {details?.claimCode && <div className="mt-7 w-full rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h2 className="font-black">Save your order claim code</h2>
      <p className="mt-1 text-sm text-slate-600">Keep this code safe. You’ll need it to link this guest order to an account later.</p>
      <code className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-xl font-black tracking-widest">{details.claimCode}</code>
    </div>}
    <Link href="/" className="mt-8 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white">Continue shopping</Link>
  </main>;
}
