'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, ShoppingBag } from 'lucide-react';
import { listAdminOrders, updateOrderFulfillment, type AdminOrder, type FulfillmentStatus } from '@/actions/admin-orders';
import { formatMoney } from '@/lib/format-money';

const statusLabel: Record<FulfillmentStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  ready_for_pickup: 'Dispatched / ready',
  completed: 'Delivered / completed',
  cancelled: 'Cancelled',
};
const transitions: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await listAdminOrders();
    if (result.success) { setOrders(result.orders); setError(''); }
    else setError(result.error);
    setLoading(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  async function changeStatus(order: AdminOrder, status: FulfillmentStatus) {
    if (status === 'cancelled' && !window.confirm(`Cancel ${order.order_number}? Its reserved inventory will be restocked.`)) return;
    setUpdating(order.id);
    const result = await updateOrderFulfillment(order.id, status);
    setUpdating('');
    if (!result.success) setError(result.error);
    else await refresh();
  }

  return <main className="mx-auto max-w-7xl space-y-6">
    <header className="flex items-center justify-between"><div><h1 className="flex items-center gap-2 text-3xl font-black"><ShoppingBag className="text-orange-500" /> Orders</h1><p className="text-slate-500">Review customer and item snapshots, then update fulfillment.</p></div><span className="rounded-full bg-white px-4 py-2 font-black shadow-sm">{orders.length} orders</span></header>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-2xl border bg-white">
      {loading ? <div className="p-12 text-center"><Loader2 className="mx-auto animate-spin" /></div> : <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Payment</th><th className="p-4">Total</th><th className="p-4">Fulfillment</th><th className="p-4">Details</th></tr></thead>
          <tbody>{orders.map((order) => <Fragment key={order.id}>
            <tr key={order.id} className="border-t align-top">
              <td className="p-4"><strong>{order.order_number}</strong><div className="mt-1 text-xs text-slate-400">{new Date(order.created_at).toLocaleString()}</div></td>
              <td className="p-4"><strong>{order.customer?.full_name ?? 'Guest'}</strong><div className="text-xs text-slate-500">{order.customer?.phone}</div><div className="text-xs text-slate-500">{order.email ?? order.customer?.email}</div></td>
              <td className="p-4"><div className="capitalize">{order.payment_method.replaceAll('_', ' ')}</div><span className="text-xs font-bold uppercase text-slate-500">{order.payment_status}</span></td>
              <td className="p-4 font-black">{formatMoney(order.total_amount)}</td>
              <td className="p-4"><select disabled={updating === order.id || transitions[order.fulfillment_status].length === 0} value={order.fulfillment_status} onChange={(event) => void changeStatus(order, event.target.value as FulfillmentStatus)} className="rounded-lg border p-2 font-semibold"><option value={order.fulfillment_status}>{statusLabel[order.fulfillment_status]}</option>{transitions[order.fulfillment_status].map((status) => <option key={status} value={status}>{statusLabel[status]}</option>)}</select>{updating === order.id && <Loader2 size={14} className="ml-2 inline animate-spin" />}</td>
              <td className="p-4"><button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 font-bold">{expanded === order.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />} Items</button></td>
            </tr>
            {expanded === order.id && <tr key={`${order.id}-details`} className="bg-slate-50"><td colSpan={6} className="p-5">
              <div className="mb-4"><strong>Delivery notes:</strong> <span className="whitespace-pre-wrap text-slate-600">{order.delivery_notes || 'None'}</span></div>
              <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-100 text-xs uppercase"><tr><th className="p-3">Product snapshot</th><th className="p-3">Variant</th><th className="p-3">SKU</th><th className="p-3">Unit price</th><th className="p-3">Qty</th><th className="p-3">Line total</th></tr></thead><tbody>{order.order_items.map((item) => <tr key={item.id} className="border-t"><td className="p-3">{item.product_title}</td><td className="p-3">{item.variant_title}</td><td className="p-3">{item.sku ?? '—'}</td><td className="p-3">{formatMoney(item.unit_price)}</td><td className="p-3">{item.quantity}</td><td className="p-3 font-bold">{formatMoney(item.unit_price * item.quantity)}</td></tr>)}</tbody></table></div>
            </td></tr>}
          </Fragment>)}</tbody>
        </table>
        {!orders.length && <p className="p-12 text-center text-slate-500">No orders yet.</p>}
      </div>}
    </div>
  </main>;
}
