import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { storeConfig } from '@/lib/store-config';
import type { Json } from '@/lib/database.types';

export const dynamic = 'force-dynamic';

function objectContent(content: Json): Record<string, Json | undefined> {
  return content !== null && typeof content === 'object' && !Array.isArray(content) ? content : {};
}

function text(content: Record<string, Json | undefined>, key: string, fallback = '') {
  return typeof content[key] === 'string' ? content[key] as string : fallback;
}

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: sections }, { data: categories }] = await Promise.all([
    supabase.from('cms_sections').select('*').eq('is_active', true).order('sort_order').order('slot'),
    supabase.from('categories').select('id,name,slug,image_url,parent_id').order('name'),
  ]);
  const categoryMap = new Map((categories ?? []).map((category) => [category.id, category]));

  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4"><Link href="/" className="text-xl font-black">{storeConfig.name}</Link><nav className="flex gap-4 text-sm font-bold"><Link href="/category/all">Shop</Link><Link href="/cart">Cart</Link></nav></div>
    </header>
    {(sections ?? []).map((section) => {
      const content = objectContent(section.content);
      if (section.section_type === 'announcement') return <div key={section.id} className="bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white">{text(content, 'text')}</div>;
      if (section.section_type === 'hero_banner') {
        const imageUrl = text(content, 'image_url');
        return <section key={section.id} className="relative isolate mx-auto flex min-h-[320px] max-w-7xl items-center overflow-hidden bg-slate-900 px-6 py-16 text-white md:min-h-[480px] md:rounded-b-3xl md:px-16">
          {imageUrl && <img src={imageUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50" />}
          <div className="max-w-2xl"><p className="mb-3 text-sm font-bold uppercase tracking-[0.2em]">{storeConfig.name}</p><h1 className="text-4xl font-black md:text-6xl">{text(content, 'title', 'Welcome to our store')}</h1><p className="mt-4 max-w-xl text-lg text-white/80">{text(content, 'description')}</p>{text(content, 'cta_text') && <Link href={text(content, 'link_url', '/category/all')} className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 font-bold text-slate-900">{text(content, 'cta_text')}</Link>}</div>
        </section>;
      }
      if (section.section_type === 'featured_category') {
        const requestedIds = [content.category_id, ...(Array.isArray(content.category_ids) ? content.category_ids : [])].filter((id): id is string => typeof id === 'string');
        const chosen = requestedIds.map((id) => categoryMap.get(id)).filter((category): category is NonNullable<typeof category> => Boolean(category));
        const image = text(content, 'image_url') || chosen[0]?.image_url || '';
        return <section key={section.id} className="mx-auto max-w-7xl px-4 py-8"><Link href={text(content, 'link_url', chosen[0] ? `/category/${chosen[0].slug}` : '/category/all')} className="group relative block min-h-56 overflow-hidden rounded-3xl bg-orange-100 p-8">
          {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]" />}
          <div className="relative rounded-xl bg-white/85 p-5 backdrop-blur-sm md:max-w-md"><h2 className="text-2xl font-black">{text(content, 'title', chosen.map((category) => category.name).join(', ') || 'Featured categories')}</h2><p className="mt-2 text-sm text-slate-600">{chosen.map((category) => category.name).join(' · ')}</p></div>
        </Link></section>;
      }
      const background = text(content, 'background_color', '#0A2540');
      const foreground = text(content, 'text_color', '#ffffff');
      return <section key={section.id} className="mx-auto my-8 max-w-7xl rounded-3xl px-6 py-12 md:px-12" style={{ backgroundColor: background, color: foreground }}><h2 className="text-3xl font-black">{text(content, 'title')}</h2><p className="mt-3 max-w-3xl">{text(content, 'description')}</p></section>;
    })}
    {(!sections || sections.length === 0) && <section className="mx-auto max-w-7xl px-5 py-24 text-center"><h1 className="text-4xl font-black">{storeConfig.name}</h1><p className="mt-3 text-slate-500">Your store is ready for its first CMS section.</p></section>}
    <footer className="mt-16 border-t bg-white px-4 py-8 text-center text-sm text-slate-500">{storeConfig.name}</footer>
  </main>;
}
