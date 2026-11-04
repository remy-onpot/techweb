'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit, Loader2, Package, Plus, Search, Trash2 } from 'lucide-react';
import { archiveProduct, listAdminCatalog, type AdminProduct } from '@/actions/admin-catalog';
import { ProductForm } from '@/components/admin/ProductForm';
import { formatMoney } from '@/lib/format-money';

export default function InventoryPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await listAdminCatalog();
    if (result.success) { setProducts(result.products); setError(''); }
    else setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  const filtered = useMemo(() => products.filter((product) => `${product.title} ${product.slug} ${product.product_variants.map((variant) => variant.sku ?? '').join(' ')}`.toLowerCase().includes(search.toLowerCase())), [products, search]);

  async function handleDelete(product: AdminProduct) {
    if (!window.confirm(`Archive “${product.title}”? It will no longer appear in the storefront.`)) return;
    const result = await archiveProduct(product.id);
    if (!result.success) setError(result.error);
    else setProducts((current) => current.map((item) => item.id === product.id ? { ...item, is_active: false } : item));
  }

  return <section className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div><h1 className="text-3xl font-black">Inventory</h1><p className="text-slate-500">Products and variant stock</p></div>
      <button onClick={() => { setEditing(null); setFormOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"><Plus size={18} /> Add product</button>
    </header>
    <label className="flex max-w-lg items-center gap-2 rounded-xl border bg-white px-3"><Search size={18} className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search product or SKU" className="w-full py-3 outline-none" /></label>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-2xl border bg-white">
      {loading ? <div className="p-14 text-center"><Loader2 className="mx-auto animate-spin text-orange-500" /></div> : <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Variants</th><th className="p-4">Stock</th><th className="p-4">Price range</th><th className="p-4">Actions</th></tr></thead>
          <tbody>{filtered.map((product) => {
            const prices = product.product_variants.map((variant) => variant.price);
            const min = prices.length ? Math.min(...prices) : 0;
            const max = prices.length ? Math.max(...prices) : 0;
            const stock = product.product_variants.reduce((total, variant) => total + variant.stock_quantity, 0);
            return <tr key={product.id} className={`border-t ${product.is_active ? '' : 'opacity-60'}`}>
              <td className="p-4"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-slate-100">{product.base_images[0] ? <img src={product.base_images[0]} alt="" className="h-full w-full object-cover" /> : <Package size={18} className="text-slate-400" />}</div><div><strong>{product.title}</strong>{!product.is_active && <span className="ml-2 rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">Archived</span>}<div className="text-xs text-slate-400">/{product.slug}</div></div></div></td>
              <td className="p-4 text-slate-600">{product.category_name ?? '—'}</td>
              <td className="p-4">{product.product_variants.length}</td><td className="p-4">{stock}</td>
              <td className="p-4 font-semibold">{formatMoney(min)}{max !== min ? ` – ${formatMoney(max)}` : ''}</td>
              <td className="p-4"><div className="flex gap-2"><button aria-label={`Edit ${product.title}`} onClick={() => { setEditing(product); setFormOpen(true); }} className="rounded-lg border p-2"><Edit size={16} /></button><button aria-label={`Archive ${product.title}`} onClick={() => void handleDelete(product)} disabled={!product.is_active} className="rounded-lg border p-2 text-red-600 disabled:opacity-40"><Trash2 size={16} /></button></div></td>
            </tr>;
          })}</tbody>
        </table>
        {!filtered.length && <p className="p-12 text-center text-slate-500">No products found.</p>}
      </div>}
    </div>
    {formOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 md:p-8"><div className="h-[95vh] w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl"><ProductForm initialData={editing ?? undefined} onClose={() => { setFormOpen(false); setEditing(null); void refresh(); }} /></div></div>}
  </section>;
}
