begin;

alter table public.customers add column email text;
alter table public.orders add column email text;

-- Keep the original atomic checkout implementation as the single source of
-- pricing, stock locking, order snapshots, and idempotency. This wrapper persists
-- optional email in the same transaction as the underlying RPC.
create function public.create_order_atomic_with_email(
  p_idempotency_key uuid,
  p_full_name text,
  p_phone text,
  p_email text,
  p_delivery_notes text,
  p_payment_method text,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result jsonb;
  target_order_id uuid;
  target_customer_id uuid;
  normalized_email text := nullif(lower(btrim(p_email)), '');
begin
  if normalized_email is not null and
     (length(normalized_email) > 320 or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$') then
    raise exception 'Invalid email address' using errcode = '22023';
  end if;

  result := public.create_order_atomic(
    p_idempotency_key, p_full_name, p_phone, p_delivery_notes, p_payment_method, p_items
  );
  target_order_id := (result ->> 'order_id')::uuid;

  if normalized_email is not null then
    update public.orders set email = normalized_email where id = target_order_id returning customer_id into target_customer_id;
    update public.customers set email = normalized_email where id = target_customer_id;
  end if;
  return result;
end;
$$;

create function public.release_abandoned_stock()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  released_count integer;
begin
  update public.orders
     set fulfillment_status = 'cancelled'
   where payment_method = 'paystack_momo'
     and payment_status = 'unpaid'
     and fulfillment_status <> 'cancelled'
     and created_at < now() - interval '30 minutes';
  get diagnostics released_count = row_count;
  return released_count;
end;
$$;

comment on function public.release_abandoned_stock() is
  'Cancels unpaid Paystack/MoMo orders older than 30 minutes; the cancellation trigger restores linked variant stock exactly once.';

revoke all on function public.create_order_atomic_with_email(uuid, text, text, text, text, text, jsonb) from public;
grant execute on function public.create_order_atomic_with_email(uuid, text, text, text, text, text, jsonb) to anon, authenticated;
revoke all on function public.release_abandoned_stock() from public, anon, authenticated;
grant execute on function public.release_abandoned_stock() to service_role;

commit;
