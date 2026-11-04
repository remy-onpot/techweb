'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface CategoryRecord { id: string; name: string; slug: string; parent_id: string | null }
export interface AdminVariant { id: string; sku: string | null; title: string; price: number; stock_quantity: number; attributes: Record<string, string> }
export interface AdminProduct { id: string; title: string; slug: string; description: string; category_id: string | null; category_name?: string | null; base_images: string[]; is_active: boolean; product_variants: AdminVariant[] }
export interface ProductInput { id?: string; title: string; slug: string; description: string; categoryId: string | null; baseImages: string[]; variants: Array<Omit<AdminVariant, 'id'>>; isActive: boolean }

async function adminClient() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || user?.app_metadata?.role !== 'admin') throw new Error('You must be signed in as a store administrator.');
  return supabase;
}

export async function listAdminCategories() {
  try {
    const supabase = await adminClient();
    const { data, error } = await supabase.from('categories').select('id,name,slug,parent_id').order('name');
    if (error) throw error;
    return { success: true as const, categories: (data ?? []) as CategoryRecord[] };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not load categories.' };
  }
}

export async function listAdminCatalog() {
  try {
    const supabase = await adminClient();
    const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('categories').select('id,name,slug,parent_id').order('name'),
    ]);
    if (productsError) throw productsError;
    if (categoriesError) throw categoriesError;
    const categoryNames = new Map((categories ?? []).map((category) => [category.id, category.name]));
    const ids = (products ?? []).map((product) => product.id);
    const { data: variants, error: variantsError } = ids.length
      ? await supabase.from('product_variants').select('id,product_id,sku,title,price,stock_quantity,attributes').in('product_id', ids)
      : { data: [], error: null };
    if (variantsError) throw variantsError;
    return {
      success: true as const,
      products: (products ?? []).map((product) => ({
        ...product,
        category_name: product.category_id ? categoryNames.get(product.category_id) ?? null : null,
        product_variants: (variants ?? []).filter((variant) => variant.product_id === product.id).map((variant) => ({
          id: variant.id, sku: variant.sku, title: variant.title, price: variant.price,
          stock_quantity: variant.stock_quantity, attributes: variant.attributes as Record<string, string>,
        })),
      })) as AdminProduct[],
      categories: (categories ?? []) as CategoryRecord[],
    };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not load catalog.' };
  }
}

export async function createCategory(input: { name: string; slug: string; parentId: string | null }) {
  try {
    const supabase = await adminClient();
    const name = input.name.trim();
    const slug = input.slug.trim().toLowerCase();
    if (!name || name.length > 120 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Enter a category name and valid URL slug.');
    const { data, error } = await supabase.from('categories').insert({ name, slug, parent_id: input.parentId }).select('id,name,slug,parent_id').single();
    if (error) throw error;
    revalidatePath('/admin/inventory');
    revalidatePath('/');
    return { success: true as const, category: data as CategoryRecord };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not create category.' };
  }
}

export async function saveProduct(input: ProductInput) {
  try {
    const supabase = await adminClient();
    if (!input.title.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug) || !input.variants.length) throw new Error('Title, valid slug, and at least one variant are required.');
    if (input.variants.some((variant) => !variant.title.trim() || !Number.isSafeInteger(variant.price) || variant.price < 0 || !Number.isInteger(variant.stock_quantity) || variant.stock_quantity < 0)) throw new Error('Check variant titles, prices, and stock quantities.');
    const skus = input.variants.map((variant) => variant.sku?.trim().toLowerCase() ?? '');
    if (skus.some((sku) => !sku) || new Set(skus).size !== skus.length) throw new Error('Every variant needs a unique SKU.');
    const { data, error } = await supabase.rpc('save_product_with_variants', {
      p_product_id: input.id ?? null,
      p_title: input.title.trim(),
      p_slug: input.slug.trim().toLowerCase(),
      p_description: input.description,
      p_category_id: input.categoryId,
      p_base_images: input.baseImages,
      p_variants: input.variants,
      p_is_active: input.isActive,
    });
    if (error) throw error;
    revalidatePath('/admin/inventory');
    revalidatePath('/');
    return { success: true as const, id: data as string };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not save product.' };
  }
}

export async function archiveProduct(id: string) {
  try {
    const supabase = await adminClient();
    const { error } = await supabase.from('products').update({ is_active: false }).eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/inventory');
    revalidatePath('/');
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Could not delete product.' };
  }
}
