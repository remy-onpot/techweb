'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Save, X } from 'lucide-react';
import { createCategory, listAdminCategories, saveProduct, type AdminProduct, type CategoryRecord } from '@/actions/admin-catalog';
import { ProductMatrixGenerator, type MatrixVariant } from '@/components/admin/ProductMatrixGenerator';

function slugify(value: string) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function ProductForm({ onClose, initialData }: { onClose: () => void; initialData?: AdminProduct | null }) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [slug, setSlug] = useState(initialData?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(Boolean(initialData));
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '');
  const [imagesText, setImagesText] = useState((initialData?.base_images ?? []).join('\n'));
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [variants, setVariants] = useState<MatrixVariant[]>(() => (initialData?.product_variants ?? []).map((variant) => ({
    title: variant.title,
    sku: variant.sku ?? '',
    price: variant.price,
    stock_quantity: variant.stock_quantity,
    attributes: variant.attributes ?? {},
  })));
  const [categoryName, setCategoryName] = useState('');
  const [categoryParent, setCategoryParent] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void listAdminCategories().then((result) => {
      if (result.success) setCategories(result.categories);
      else setError(result.error);
    });
  }, []);

  const rootCategories = useMemo(() => categories.filter((category) => category.parent_id === null), [categories]);

  async function handleCreateCategory(event?: FormEvent) {
    event?.preventDefault();
    const name = categoryName.trim();
    const result = await createCategory({ name, slug: slugify(name), parentId: categoryParent || null });
    if (!result.success) { setError(result.error); return; }
    setCategories((current) => [...current, result.category].sort((a, b) => a.name.localeCompare(b.name)));
    setCategoryId(result.category.id);
    setCategoryName('');
    setCategoryParent('');
    setShowCategoryForm(false);
    setError('');
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const result = await saveProduct({
      id: initialData?.id,
      title,
      slug: slug || slugify(title),
      description,
      categoryId: categoryId || null,
      baseImages: imagesText.split(/\r?\n/).map((image) => image.trim()).filter(Boolean),
      variants,
      isActive,
    });
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    onClose();
  }

  return <div className="flex h-full flex-col bg-slate-50">
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <div><h2 className="text-xl font-black">{initialData ? 'Edit product' : 'Create product'}</h2><p className="text-sm text-slate-500">Product and variants save as one database transaction.</p></div>
      <button type="button" onClick={onClose} aria-label="Close product form" className="rounded-lg p-2 hover:bg-slate-100"><X /></button>
    </header>
    <form onSubmit={handleSave} className="flex-1 space-y-6 overflow-y-auto p-5 md:p-8">
      <section className="grid gap-4 rounded-2xl border bg-white p-5 md:grid-cols-2">
        <label className="text-sm font-bold">Product title<input required maxLength={240} value={title} onChange={(event) => { setTitle(event.target.value); if (!slugEdited) setSlug(slugify(event.target.value)); }} className="mt-2 block w-full rounded-lg border p-3 font-medium" /></label>
        <label className="text-sm font-bold">URL slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} className="mt-2 block w-full rounded-lg border p-3 font-medium" /></label>
        <label className="text-sm font-bold md:col-span-2">Description<textarea maxLength={20000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-2 block w-full rounded-lg border p-3 font-medium" /></label>
        <div className="md:col-span-2">
          <label className="text-sm font-bold">Category<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="mt-2 block w-full rounded-lg border p-3 font-medium"><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.parent_id ? '— ' : ''}{category.name}</option>)}</select></label>
          <button type="button" onClick={() => setShowCategoryForm((value) => !value)} className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-orange-700"><Plus size={16} /> Create category inline</button>
          {showCategoryForm && <div className="mt-3 rounded-xl bg-slate-50 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input aria-label="New category name" placeholder="Category name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} className="rounded-lg border p-2" />
              <select aria-label="Parent category" value={categoryParent} onChange={(event) => setCategoryParent(event.target.value)} className="rounded-lg border p-2"><option value="">Top-level category</option>{rootCategories.map((category) => <option key={category.id} value={category.id}>Child of {category.name}</option>)}</select>
            </div>
            <button type="button" onClick={handleCreateCategory} disabled={!categoryName.trim()} className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Save and select category</button>
          </div>}
        </div>
        <label className="text-sm font-bold md:col-span-2">Image URLs <span className="font-normal text-slate-400">(one per line)</span><textarea rows={3} value={imagesText} onChange={(event) => setImagesText(event.target.value)} className="mt-2 block w-full rounded-lg border p-3 font-medium" /></label>
        <label className="flex items-center gap-2 text-sm font-bold md:col-span-2"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> Publish product</label>
      </section>

      <ProductMatrixGenerator productTitle={title} initialVariants={variants} onChange={setVariants} />
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <div className="flex justify-end"><button disabled={loading || variants.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white disabled:opacity-50">{loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}{loading ? 'Saving…' : 'Save product'}</button></div>
    </form>
  </div>;
}
