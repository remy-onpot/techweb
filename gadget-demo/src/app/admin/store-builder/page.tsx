'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteCmsSection, listCmsSections, saveCmsSection, type CmsSection, type CmsSectionType } from '@/actions/admin-cms';
import type { Json } from '@/lib/database.types';
import { createClient } from '@/lib/supabase/client';

const TYPES: CmsSectionType[] = ['hero_banner', 'featured_category', 'announcement', 'brand_accent'];
const defaultContent: Record<CmsSectionType, string> = {
  hero_banner: '{\n  "title": "Welcome to our store",\n  "description": "Discover our latest products",\n  "image_url": "https://",\n  "cta_text": "Shop now",\n  "link_url": "/category/example"\n}',
  featured_category: '{\n  "title": "Featured collection",\n  "category_id": "",\n  "image_url": "",\n  "link_url": ""\n}',
  announcement: '{\n  "text": "Free delivery on selected orders"\n}',
  brand_accent: '{\n  "title": "Our promise",\n  "description": "Quality products and helpful service",\n  "background_color": "#0A2540",\n  "text_color": "#ffffff"\n}',
};

export default function StoreBuilderPage() {
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [editing, setEditing] = useState<CmsSection | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [slot, setSlot] = useState('');
  const [type, setType] = useState<CmsSectionType>('hero_banner');
  const [content, setContent] = useState(defaultContent.hero_banner);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [active, setActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    const result = await listCmsSections();
    if (result.success) setSections(result.sections);
    else setError(result.error);
    setLoading(false);
  }
  useEffect(() => { void refresh(); }, []);

  function startEdit(section?: CmsSection) {
    setFormOpen(true);
    setEditing(section ?? null);
    setSlot(section?.slot ?? '');
    setType(section?.section_type ?? 'hero_banner');
    setContent(section ? JSON.stringify(section.content, null, 2) : defaultContent.hero_banner);
    setImageFile(null);
    setActive(section?.is_active ?? true);
    setSortOrder(section?.sort_order ?? sections.length);
    setError('');
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    let parsed: Json;
    try { parsed = JSON.parse(content) as Json; }
    catch { setError('Content must be valid JSON.'); return; }
    setSaving(true);
    let finalContent = parsed;
    if (imageFile) {
      setUploading(true);
      const supabase = createClient();
      const extension = imageFile.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'image';
      const path = `cms/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(path, imageFile, { upsert: false });
      if (uploadError) {
        setUploading(false);
        setSaving(false);
        setError(`Image upload failed: ${uploadError.message}`);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
      finalContent = { ...(parsed as Record<string, Json>), image_url: publicUrl };
      setContent(JSON.stringify(finalContent, null, 2));
      setImageFile(null);
      setUploading(false);
    }
    const result = await saveCmsSection({ id: editing?.id, slot, sectionType: type, content: finalContent, isActive: active, sortOrder });
    setSaving(false);
    if (!result.success) { setError(result.error); return; }
    setEditing(null);
    setFormOpen(false);
    await refresh();
  }

  async function remove(section: CmsSection) {
    if (!window.confirm(`Delete the ${section.slot} section?`)) return;
    const result = await deleteCmsSection(section.id);
    if (!result.success) setError(result.error);
    else setSections((current) => current.filter((item) => item.id !== section.id));
  }

  return <main className="mx-auto max-w-6xl space-y-6">
    <header className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-black">Store Builder</h1><p className="text-slate-500">Manage home page content sections.</p></div><button onClick={() => startEdit()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white"><Plus size={18} /> Add section</button></header>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {formOpen ? <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-white p-5">
      <h2 className="text-xl font-black">{editing ? `Edit ${editing.slot}` : 'New section'}</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-bold">Slot key<input required maxLength={80} pattern="[a-z0-9][a-z0-9_-]*" value={slot} onChange={(event) => setSlot(event.target.value)} placeholder="home-hero" className="mt-1 block w-full rounded-lg border p-2" /></label>
        <label className="text-sm font-bold">Section type<select value={type} onChange={(event) => { const next = event.target.value as CmsSectionType; setType(next); if (!editing) setContent(defaultContent[next]); }} className="mt-1 block w-full rounded-lg border p-2">{TYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-bold">Sort order<input type="number" value={sortOrder} onChange={(event) => setSortOrder(Number(event.target.value))} className="mt-1 block w-full rounded-lg border p-2" /></label>
      </div>
      {(type === 'hero_banner' || type === 'featured_category') && <label className="block text-sm font-bold">Upload section image<input type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} className="mt-1 block w-full rounded-lg border p-3" />{imageFile && <span className="mt-1 block text-xs text-slate-500">Selected: {imageFile.name} (saved to content.image_url)</span>}</label>}
      <label className="block text-sm font-bold">Content JSON<textarea required rows={10} value={content} onChange={(event) => setContent(event.target.value)} className="mt-1 block w-full rounded-lg border p-3 font-mono text-sm" /></label>
      <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Active on storefront</label>
      <div className="flex gap-3"><button disabled={saving} className="rounded-lg bg-emerald-700 px-5 py-2 font-bold text-white">{saving ? <Loader2 className="animate-spin" /> : uploading ? 'Uploading image…' : 'Save section'}</button><button type="button" onClick={() => { setEditing(null); setSlot(''); setFormOpen(false); setError(''); setImageFile(null); }} className="rounded-lg border px-5 py-2 font-bold">Close</button></div>
    </form> : null}
    <section className="space-y-3">
      {loading ? <div className="p-12 text-center"><Loader2 className="mx-auto animate-spin" /></div> : sections.map((section) => <article key={section.id} className="flex flex-col justify-between gap-3 rounded-2xl border bg-white p-5 sm:flex-row sm:items-center">
        <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{section.slot}</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{section.section_type}</span><span className={`rounded-full px-2 py-1 text-xs ${section.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{section.is_active ? 'Active' : 'Draft'}</span></div><pre className="mt-2 max-w-3xl overflow-auto text-xs text-slate-500">{JSON.stringify(section.content, null, 2)}</pre></div>
        <div className="flex gap-2"><button onClick={() => startEdit(section)} className="rounded-lg border p-2" aria-label="Edit section"><Pencil size={16} /></button><button onClick={() => void remove(section)} className="rounded-lg border p-2 text-red-600" aria-label="Delete section"><Trash2 size={16} /></button></div>
      </article>)}
      {!loading && !sections.length && <p className="rounded-xl border bg-white p-10 text-center text-slate-500">No CMS sections yet.</p>}
    </section>
  </main>;
}
