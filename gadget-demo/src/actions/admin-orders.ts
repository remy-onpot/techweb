'use server';

import 'server-only';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type FulfillmentStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled';
export interface AdminOrderItem { id: string; product_title: string; variant_title: string; sku: string | null; unit_price: number; quantity: number }
export interface AdminOrder { id: string; order_number: string; customer_id: string; total_amount: number; payment_method: 'pay_on_pickup' | 'paystack_momo'; payment_status: 'unpaid' | 'paid' | 'refunded'; fulfillment_status: FulfillmentStatus; delivery_notes: string; email: string | null; created_at: string; customer: { full_name: string; phone: string; email: string | null } | null; order_items: AdminOrderItem[] }

async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.role !== 'admin') throw new Error('Administrator access required.');
  return supabase;
}

export async function listAdminOrders() {
  try {
    const supabase = await getAdminClient();
    const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(250);
    if (error) throw error;
    const orderRows = orders ?? [];
    const customerIds = [...new Set(orderRows.map((order) => order.customer_id))];
    const orderIds = orderRows.map((order) => order.id);
    const [{ data: customers, error: customerError }, { data: items, error: itemError }] = await Promise.all([
      customerIds.length ? supabase.from('customers').select('id,full_name,phone,email').in('id', customerIds) : Promise.resolve({ data: [], error: null }),
      orderIds.length ? supabase.from('order_items').select('id,order_id,product_title,variant_title,sku,unit_price,quantity').in('order_id', orderIds) : Promise.resolve({ data: [], error: null }),
    ]);
    if (customerError) throw customerError;
    if (itemError) throw itemError;
    const customerMap = new Map((customers ?? []).map((customer) => [customer.id, customer]));
    return { success: true as const, orders: orderRows.map((order) => ({
      ...order,
      customer: customerMap.get(order.customer_id) ?? null,
      order_items: (items ?? []).filter((item) => item.order_id === order.id),
    })) as AdminOrder[] };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Unable to load orders.' };
  }
}

const allowedNext: Record<FulfillmentStatus, FulfillmentStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['ready_for_pickup', 'cancelled'],
  ready_for_pickup: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export async function updateOrderFulfillment(orderId: string, next: FulfillmentStatus) {
  try {
    const supabase = await getAdminClient();
    const { data: order, error: readError } = await supabase.from('orders').select('fulfillment_status').eq('id', orderId).single();
    if (readError) throw readError;
    if (!allowedNext[order.fulfillment_status as FulfillmentStatus]?.includes(next)) throw new Error('That fulfillment status transition is not allowed.');
    const { data: updated, error } = await supabase.from('orders').update({ fulfillment_status: next }).eq('id', orderId).eq('fulfillment_status', order.fulfillment_status).select('id').maybeSingle();
    if (error) throw error;
    if (!updated) throw new Error('The order status changed concurrently. Reload and try again.');
    revalidatePath('/admin/orders');
    return { success: true as const };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : 'Unable to update order status.' };
  }
}
