'use client';

import { useState } from 'react';
import { Plus, Trash2, WandSparkles } from 'lucide-react';
import { storeConfig } from '@/lib/store-config';

export interface MatrixVariant {
  title: string;
  sku: string;
  price: number; // integer Pesewas
  stock_quantity: number;
  attributes: Record<string, string>;
}

interface AttributeInput { id: number; name: string; values: string }

function toPesewas(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 100) : 0;
}

function slugPart(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function ProductMatrixGenerator({ productTitle, initialVariants = [], onChange }: { productTitle: string; initialVariants?: MatrixVariant[]; onChange?: (variants: MatrixVariant[]) => void }) {
  const [attributes, setAttributes] = useState<AttributeInput[]>([{ id: 1, name: '', values: '' }]);
  const [variants, setVariants] = useState<MatrixVariant[]>(initialVariants);
  const [basePrice, setBasePrice] = useState('');
  const [defaultStock, setDefaultStock] = useState('0');
  const [nextId, setNextId] = useState(2);

  function updateVariants(next: MatrixVariant[]) {
    setVariants(next);
    onChange?.(next);
  }

  function generate() {
    const definitions = attributes.map((attribute) => ({
      name: attribute.name.trim(),
      values: [...new Set(attribute.values.split(',').map((value) => value.trim()).filter(Boolean))],
    })).filter((attribute) => attribute.name && attribute.values.length);
    if (!definitions.length) return updateVariants([]);

    const combinations = definitions.length
      ? definitions.reduce<Record<string, string>[]>((rows, definition) =>
          rows.flatMap((row) => definition.values.map((value) => ({ ...row, [definition.name]: value }))), [{}])
      : [{}];
    const productSlug = slugPart(productTitle) || 'PRODUCT';
    updateVariants(combinations.map((combination) => {
      const values = Object.values(combination);
      return {
        title: values.join(' / ') || 'Standard',
        sku: [productSlug, ...values.map(slugPart)].filter(Boolean).join('-'),
        price: toPesewas(basePrice),
        stock_quantity: Math.max(0, Math.floor(Number(defaultStock) || 0)),
        attributes: combination,
      };
    }));
  }

  function editVariant(index: number, update: Partial<MatrixVariant>) {
    updateVariants(variants.map((variant, row) => row === index ? { ...variant, ...update } : variant));
  }

  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
    <div><h3 className="text-lg font-black">Variant matrix</h3><p className="text-sm text-slate-500">Define options and generate every combination.</p></div>
    <div className="space-y-3">
      {attributes.map((attribute, index) => <div key={attribute.id} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
        <input aria-label="Attribute name" placeholder="Attribute (e.g. Color)" value={attribute.name} onChange={(event) => setAttributes(attributes.map((row, i) => i === index ? { ...row, name: event.target.value } : row))} className="rounded-lg border p-2" />
        <input aria-label="Attribute values" placeholder="Comma-separated values (e.g. Red, Blue)" value={attribute.values} onChange={(event) => setAttributes(attributes.map((row, i) => i === index ? { ...row, values: event.target.value } : row))} className="rounded-lg border p-2" />
        <button type="button" aria-label="Remove attribute" onClick={() => setAttributes(attributes.filter((row) => row.id !== attribute.id))} className="rounded-lg border p-2 text-red-600"><Trash2 size={18} /></button>
      </div>)}
    </div>
    <button type="button" onClick={() => { setAttributes([...attributes, { id: nextId, name: '', values: '' }]); setNextId(nextId + 1); }} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold"><Plus size={16} /> Add attribute</button>
    <div className="flex flex-wrap items-end gap-3 border-t pt-4">
      <label className="text-xs font-bold">Base price ({storeConfig.currencySymbol})<input type="number" min="0" step="0.01" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} className="mt-1 block w-36 rounded-lg border p-2 text-sm" /></label>
      <label className="text-xs font-bold">Default stock<input type="number" min="0" step="1" value={defaultStock} onChange={(event) => setDefaultStock(event.target.value)} className="mt-1 block w-32 rounded-lg border p-2 text-sm" /></label>
      <button type="button" onClick={generate} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-bold text-white"><WandSparkles size={16} /> Generate variants</button>
    </div>
    {variants.length > 0 && <>
      <div className="flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-3">
        <label className="text-xs font-bold">Bulk price ({storeConfig.currencySymbol})<input type="number" min="0" step="0.01" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} className="mt-1 block w-36 rounded-lg border p-2 text-sm" /></label>
        <button type="button" onClick={() => updateVariants(variants.map((variant) => ({ ...variant, price: toPesewas(basePrice) })))} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold">Set price for all</button>
        <label className="text-xs font-bold">Default stock<input type="number" min="0" step="1" value={defaultStock} onChange={(event) => setDefaultStock(event.target.value)} className="mt-1 block w-32 rounded-lg border p-2 text-sm" /></label>
        <button type="button" onClick={() => updateVariants(variants.map((variant) => ({ ...variant, stock_quantity: Math.max(0, Math.floor(Number(defaultStock) || 0)) })))} className="rounded-lg border bg-white px-3 py-2 text-sm font-bold">Set stock for all</button>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Variant</th><th className="p-3">SKU</th><th className="p-3">Price</th><th className="p-3">Stock</th></tr></thead>
          <tbody>{variants.map((variant, index) => <tr key={`${variant.sku}-${index}`} className="border-t">
            <td className="p-3 font-semibold">{variant.title}</td>
            <td className="p-3"><input value={variant.sku} onChange={(event) => editVariant(index, { sku: event.target.value })} className="w-full rounded border p-2" /></td>
            <td className="p-3"><input type="number" min="0" step="0.01" value={(variant.price / 100).toFixed(2)} onChange={(event) => editVariant(index, { price: toPesewas(event.target.value) })} className="w-28 rounded border p-2" /></td>
            <td className="p-3"><input type="number" min="0" step="1" value={variant.stock_quantity} onChange={(event) => editVariant(index, { stock_quantity: Math.max(0, Math.floor(Number(event.target.value) || 0)) })} className="w-24 rounded border p-2" /></td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">Prices are submitted as integer Pesewas. Generated {variants.length} combinations.</p>
    </>}
  </section>;
}
