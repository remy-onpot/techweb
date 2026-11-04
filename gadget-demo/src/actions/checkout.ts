'use server';

import 'server-only';

import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import type { Json } from '@/lib/database.types';
import { storeConfig } from '@/lib/store-config';

type PaymentMethod = 'pay_on_pickup' | 'paystack_momo';

export interface CheckoutPayload {
  customer: { name: string; phone: string; notes: string; email?: string };
  items: Array<{ variantId: string; quantity: number }>;
  paymentMethod: PaymentMethod;
  /** Reuse this UUID when retrying the same checkout attempt. */
  idempotencyKey?: string;
}

type CheckoutResult =
  | { success: true; orderId: string; orderNumber: string; claimCode: string | null; authorizationUrl?: string }
  | { success: false; error: string };

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isRecord(value: Json): value is { [key: string]: Json | undefined } {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export async function checkout(payload: CheckoutPayload): Promise<CheckoutResult> {
  if (!payload || !payload.customer || !Array.isArray(payload.items)) {
    return { success: false, error: 'Invalid checkout details.' };
  }

  const name = payload.customer.name?.trim();
  const phone = payload.customer.phone?.trim();
  const notes = payload.customer.notes?.trim() ?? '';
  const paymentMethod = payload.paymentMethod;
  const customerEmail = payload.customer.email?.trim() || null;

  if (!name || name.length > 200 || !phone || !/^\+[1-9]\d{7,14}$/.test(phone) || notes.length > 4000) {
    return { success: false, error: 'Enter a name, an E.164 phone number, and notes of at most 4,000 characters.' };
  }
  if (paymentMethod !== 'pay_on_pickup' && paymentMethod !== 'paystack_momo') {
    return { success: false, error: 'Choose a supported payment method.' };
  }
  if (!storeConfig.enabledPaymentMethods.includes(paymentMethod)) {
    return { success: false, error: 'That payment method is not enabled for this store.' };
  }
  if (customerEmail && (customerEmail.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail))) {
    return { success: false, error: 'Enter a valid email address or leave it blank.' };
  }
  if (payload.items.length < 1 || payload.items.length > 100 || payload.items.some((item) =>
    !item || !isUuid(item.variantId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000
  )) {
    return { success: false, error: 'Your cart contains invalid items or quantities.' };
  }
  if (paymentMethod === 'paystack_momo') {
    if (!process.env.PAYSTACK_SECRET_KEY) return { success: false, error: 'Paystack is not configured for this store.' };
  }

  const idempotencyKey = payload.idempotencyKey ?? randomUUID();
  if (!isUuid(idempotencyKey)) return { success: false, error: 'Invalid checkout attempt identifier.' };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('create_order_atomic_with_email', {
      p_idempotency_key: idempotencyKey,
      p_full_name: name,
      p_phone: phone,
      p_email: customerEmail,
      p_delivery_notes: notes,
      p_payment_method: paymentMethod,
      p_items: payload.items.map(({ variantId, quantity }) => ({ variant_id: variantId, quantity })) as Json,
    });

    if (error) {
      console.error('Atomic checkout RPC failed:', error.message);
      return { success: false, error: 'We could not place this order. Please review your cart and try again.' };
    }
    if (!isRecord(data) || typeof data.order_id !== 'string' || typeof data.order_number !== 'string' ||
        typeof data.total_amount !== 'number' || !Number.isSafeInteger(data.total_amount) || data.total_amount < 0) {
      console.error('Atomic checkout RPC returned an invalid response.');
      return { success: false, error: 'The order service returned an invalid response.' };
    }

    const claimCode = typeof data.claim_code === 'string' ? data.claim_code : null;
    if (paymentMethod === 'pay_on_pickup') {
      return { success: true, orderId: data.order_id, orderNumber: data.order_number, claimCode };
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const paystackEmail = customerEmail || `${phone}@guest.shop.local`;
    if (!paystackSecret) return { success: false, error: 'Paystack checkout is not configured.' };

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: { Authorization: `Bearer ${paystackSecret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: paystackEmail,
        amount: data.total_amount,
        currency: storeConfig.currencyCode,
        reference: idempotencyKey,
        metadata: { orderId: data.order_id, orderNumber: data.order_number },
      }),
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });

    const paystackResult: unknown = await response.json().catch(() => null);
    if (!response.ok || !paystackResult || typeof paystackResult !== 'object' ||
        !('status' in paystackResult) || paystackResult.status !== true ||
        !('data' in paystackResult) || !paystackResult.data || typeof paystackResult.data !== 'object' ||
        !('authorization_url' in paystackResult.data) || typeof paystackResult.data.authorization_url !== 'string') {
      console.error('Paystack initialization failed for order:', data.order_id);
      return { success: false, error: 'Your order was created, but payment could not be initialized. Contact the store with your order number.' };
    }

    return {
      success: true,
      orderId: data.order_id,
      orderNumber: data.order_number,
      claimCode,
      authorizationUrl: paystackResult.data.authorization_url,
    };
  } catch (error) {
    console.error('Checkout action failed:', error instanceof Error ? error.message : 'Unknown error');
    return { success: false, error: 'Checkout is temporarily unavailable. Please try again.' };
  }
}
