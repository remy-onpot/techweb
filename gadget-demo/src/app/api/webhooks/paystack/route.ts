import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function signatureIsValid(rawBody: string, signature: string, secret: string): boolean {
  if (!/^[0-9a-f]{128}$/i.test(signature)) return false;
  const supplied = Buffer.from(signature, 'hex');
  const expected = createHmac('sha512', secret).update(rawBody, 'utf8').digest();
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error('Paystack webhook received without server configuration.');
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 500 });
  }

  const signature = request.headers.get('x-paystack-signature');
  const rawBody = await request.text();
  if (!signature || !signatureIsValid(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  if (!event || typeof event !== 'object' || !('event' in event) || event.event !== 'charge.success') {
    return NextResponse.json({ received: true });
  }
  if (!('data' in event) || !event.data || typeof event.data !== 'object') {
    return NextResponse.json({ error: 'Invalid event payload.' }, { status: 400 });
  }

  const data = event.data;
  const metadata = 'metadata' in data && data.metadata && typeof data.metadata === 'object' ? data.metadata : null;
  const orderId = metadata && 'orderId' in metadata && typeof metadata.orderId === 'string' ? metadata.orderId : null;
  const reference = 'reference' in data && typeof data.reference === 'string' ? data.reference : null;
  const amount = 'amount' in data && typeof data.amount === 'number' ? data.amount : null;
  const status = 'status' in data && typeof data.status === 'string' ? data.status : null;

  if (!orderId || !reference || amount === null || !Number.isSafeInteger(amount) || amount < 0 || status !== 'success') {
    return NextResponse.json({ error: 'Missing or invalid payment details.' }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: order, error: readError } = await admin
      .from('orders')
      .select('id, total_amount, payment_method, payment_status, fulfillment_status, paystack_reference')
      .eq('id', orderId)
      .maybeSingle();

    if (readError) {
      console.error('Paystack webhook order lookup failed:', readError.message);
      return NextResponse.json({ error: 'Unable to process event.' }, { status: 500 });
    }
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    if (order.payment_method !== 'paystack_momo') {
      console.error('Paystack success event received for a non-Paystack order:', order.id);
      return NextResponse.json({ error: 'Payment method mismatch.' }, { status: 400 });
    }
    if (order.payment_status === 'paid') return NextResponse.json({ received: true, alreadyProcessed: true });
    if (order.fulfillment_status === 'cancelled') {
      console.error('Successful payment received for cancelled order:', order.id);
      return NextResponse.json({ received: true, requiresReconciliation: true });
    }
    if (order.total_amount !== amount) {
      console.error('Paystack amount mismatch for order:', order.id);
      return NextResponse.json({ error: 'Payment amount mismatch.' }, { status: 400 });
    }
    if (order.paystack_reference && order.paystack_reference !== reference) {
      console.error('Paystack reference mismatch for order:', order.id);
      return NextResponse.json({ error: 'Payment reference mismatch.' }, { status: 400 });
    }

    const { data: updated, error: updateError } = await admin
      .from('orders')
      .update({ payment_status: 'paid', fulfillment_status: 'confirmed', paystack_reference: reference })
      .eq('id', order.id)
      .eq('payment_status', 'unpaid')
      .neq('fulfillment_status', 'cancelled')
      .select('id')
      .maybeSingle();

    if (updateError) {
      console.error('Paystack webhook order update failed:', updateError.message);
      return NextResponse.json({ error: 'Unable to update order.' }, { status: 500 });
    }
    if (!updated) {
      const { data: current } = await admin.from('orders').select('payment_status').eq('id', order.id).maybeSingle();
      if (current?.payment_status === 'paid') return NextResponse.json({ received: true, alreadyProcessed: true });
      return NextResponse.json({ error: 'Order state changed before payment update.' }, { status: 409 });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook processing failed:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Unable to process event.' }, { status: 500 });
  }
}
