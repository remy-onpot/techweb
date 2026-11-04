import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CatalogProductDetail } from '@/components/shop/CatalogProductDetail';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle();
  if (!product) notFound();
  const [{ data: variants }, { data: category }] = await Promise.all([
    supabase.from('product_variants').select('*').eq('product_id', product.id).order('title'),
    product.category_id ? supabase.from('categories').select('name,slug').eq('id', product.category_id).maybeSingle() : Promise.resolve({ data: null, error: null }),
  ]);
  return <CatalogProductDetail product={{ ...product, category_name: category?.name ?? 'Products', category_slug: category?.slug ?? '' }} variants={variants ?? []} />;
}
