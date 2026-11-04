import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/format-money';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase.from('categories').select('id,name,slug').eq('slug', slug).maybeSingle();
  if (!category) notFound();

  const { data: products } = await supabase.from('products').select('*').eq('category_id', category.id).eq('is_active', true).order('created_at', { ascending: false });
  const productIds = (products ?? []).map((product) => product.id);
  let variants: { product_id: string; price: number; stock_quantity: number }[] = [];
  if (productIds.length) {
    const result = await supabase.from('product_variants').select('product_id,price,stock_quantity').in('product_id', productIds);
    variants = result.data ?? [];
  }

  return <main className="mx-auto min-h-screen max-w-7xl px-4 py-10">
    <Link href="/" className="text-sm font-bold text-orange-700">← Store home</Link>
    <h1 className="mt-5 text-3xl font-black">{category.name}</h1>
    <p className="mt-1 text-slate-500">{products?.length ?? 0} products</p>
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {(products ?? []).map((product) => {
        const productVariants = (variants ?? []).filter((variant) => variant.product_id === product.id);
        const availablePrices = productVariants.filter((variant) => variant.stock_quantity > 0).map((variant) => variant.price);
        const allPrices = productVariants.map((variant) => variant.price);
        const price = availablePrices.length ? Math.min(...availablePrices) : allPrices.length ? Math.min(...allPrices) : 0;
        return <Link key={product.id} href={`/product/${product.slug}`} className="overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-1 hover:shadow-lg">
          <div className="aspect-square bg-slate-100">{product.base_images[0] && <img src={product.base_images[0]} alt={product.title} className="h-full w-full object-cover" />}</div>
          <div className="p-4"><h2 className="line-clamp-2 font-bold">{product.title}</h2><p className="mt-2 font-black">{productVariants.length ? formatMoney(price) : 'Unavailable'}</p></div>
        </Link>;
      })}
    </div>
    {!products?.length && <p className="mt-10 rounded-2xl bg-white p-8 text-center text-slate-500">No products are available in this category yet.</p>}
  </main>;
}
