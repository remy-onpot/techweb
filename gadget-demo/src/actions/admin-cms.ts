'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/lib/database.types';

export type CmsSectionType = 'hero_banner' | 'featured_category' | 'announcement' | 'brand_accent';
export interface CmsSection { id: string; slot: string; section_type: CmsSectionType; content: Json; is_active: boolean; sort_order: number }

async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== 'admin') throw new Error('Administrator access required.');
  return supabase;
}

export async function listCmsSections() {
  try {
    const supabase = await getAdminClient();
    const { data, error } = await supabase.from('cms_sections').select('*').order('sort_order').order('slot');
    if (error) throw error;
    return { success: true as const, sections: (data ?? []) as CmsSection[] };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Unable to load sections.' };
  }
}

export async function saveCmsSection(input: { id?: string; slot: string; sectionType: CmsSectionType; content: Json; isActive: boolean; sortOrder: number }) {
  try {
    const supabase = await getAdminClient();
    const slot = input.slot.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(slot)) throw new Error('Use a short slot key with letters, numbers, dashes, or underscores.');
    if (!['hero_banner', 'featured_category', 'announcement', 'brand_accent'].includes(input.sectionType)) throw new Error('Invalid section type.');
    if (input.content === null || Array.isArray(input.content) || typeof input.content !== 'object') throw new Error('Section content must be a JSON object.');
    if (!Number.isInteger(input.sortOrder)) throw new Error('Sort order must be a whole number.');
    const values = { slot, section_type: input.sectionType, content: input.content, is_active: input.isActive, sort_order: input.sortOrder };
    const query = input.id
      ? supabase.from('cms_sections').update(values).eq('id', input.id)
      : supabase.from('cms_sections').insert(values);
    const { error } = await query;
    if (error) throw error;
    revalidatePath('/');
    revalidatePath('/admin/store-builder');
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Unable to save section.' };
  }
}

export async function deleteCmsSection(id: string) {
  try {
    const supabase = await getAdminClient();
    const { error } = await supabase.from('cms_sections').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/');
    revalidatePath('/admin/store-builder');
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Unable to delete section.' };
  }
}
