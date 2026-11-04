-- Shop-in-a-Box core schema and transactional inventory/order primitives.
-- Apply with Supabase CLI (supabase db push) to a fresh project.

begin;

create extension if not exists pgcrypto with schema extensions;

create sequence if not exists public.order_number_seq;

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  parent_id uuid references public.categories(id) on delete restrict,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_parent_id_idx on public.categories(parent_id);

create function public.enforce_category_depth()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_parent_id uuid;
begin
  if new.parent_id is null then
    return new;
  end if;
  if new.parent_id = new.id then
    raise exception 'A category cannot be its own parent' using errcode = '23514';
  end if;
  select c.parent_id into parent_parent_id
  from public.categories as c
  where c.id = new.parent_id;
  if not found then
    raise exception 'Parent category does not exist' using errcode = '23503';
  end if;
  if parent_parent_id is not null then
    raise exception 'Categories may be at most two levels deep' using errcode = '23514';
  end if;
  if exists (select 1 from public.categories child where child.parent_id = new.id) then
    raise exception 'A category with children cannot become a child category' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger categories_depth_guard
before insert or update of parent_id on public.categories
for each row execute function public.enforce_category_depth();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 240),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  base_images text[] not null default '{}',
  has_variants boolean not null default false,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_active_category_created_idx
  on public.products(category_id, created_at desc) where is_active;
create index products_active_slug_idx on public.products(slug) where is_active;

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text unique,
  title text not null check (length(btrim(title)) between 1 and 240),
  price bigint not null check (price >= 0), -- integer minor units (Pesewas for GHS deployments)
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  attributes jsonb not null default '{}'::jsonb check (jsonb_typeof(attributes) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_sku_not_blank check (sku is null or length(btrim(sku)) > 0)
);

create index product_variants_product_id_idx on public.product_variants(product_id);
create index product_variants_sku_idx on public.product_variants(sku) where sku is not null;

-- An active product must have at least one variant at transaction commit.
create function public.assert_active_product_has_variant()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_product_id uuid;
begin
  if tg_table_name = 'products' then
    target_product_id := coalesce(new.id, old.id);
  else
    target_product_id := coalesce(new.product_id, old.product_id);
  end if;
  if exists (select 1 from public.products p where p.id = target_product_id and p.is_active)
     and not exists (select 1 from public.product_variants v where v.product_id = target_product_id) then
    raise exception 'An active product must have at least one variant' using errcode = '23514';
  end if;
  if tg_table_name = 'product_variants'
     and tg_op = 'UPDATE'
     and old.product_id is distinct from new.product_id
     and exists (select 1 from public.products p where p.id = old.product_id and p.is_active)
     and not exists (select 1 from public.product_variants v where v.product_id = old.product_id) then
    raise exception 'An active product must have at least one variant' using errcode = '23514';
  end if;
  return null;
end;
$$;

create constraint trigger products_require_variant
after insert or update of is_active on public.products
deferrable initially deferred
for each row execute function public.assert_active_product_has_variant();

create constraint trigger variants_preserve_product_variant
after insert or update or delete on public.product_variants
deferrable initially deferred
for each row execute function public.assert_active_product_has_variant();

create table public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  slot text not null unique check (slot ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  section_type text not null check (section_type in ('hero_banner', 'featured_category', 'announcement', 'brand_accent')),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cms_sections_active_order_idx on public.cms_sections(sort_order, slot) where is_active;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  full_name text not null check (length(btrim(full_name)) between 1 and 200),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  -- SHA-256 hex digest of a one-time, high-entropy claim code; raw code is returned only at creation.
  claim_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_claim_code_hash check (claim_code is null or claim_code ~ '^[0-9a-f]{64}$')
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'ORD-' || to_char(timezone('utc', now()), 'YYYYMMDD') || '-' ||
    lpad(nextval('public.order_number_seq')::text, 8, '0')
  ),
  idempotency_key uuid not null unique,
  customer_id uuid not null references public.customers(id) on delete restrict,
  total_amount bigint not null check (total_amount >= 0), -- integer minor units (Pesewas for GHS deployments)
  payment_method text not null check (payment_method in ('pay_on_pickup', 'paystack_momo')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  fulfillment_status text not null default 'pending'
    check (fulfillment_status in ('pending', 'confirmed', 'ready_for_pickup', 'completed', 'cancelled')),
  delivery_notes text not null default '' check (length(delivery_notes) <= 4000),
  paystack_reference text unique,
  restocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_created_idx on public.orders(customer_id, created_at desc);
create index orders_created_idx on public.orders(created_at desc);
create index orders_fulfillment_created_idx on public.orders(fulfillment_status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_title text not null check (length(btrim(product_title)) > 0),
  variant_title text not null check (length(btrim(variant_title)) > 0),
  sku text,
  unit_price bigint not null check (unit_price >= 0), -- integer minor units (Pesewas for GHS deployments)
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_variant_id_idx on public.order_items(variant_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants
for each row execute function public.set_updated_at();
create trigger cms_sections_set_updated_at before update on public.cms_sections
for each row execute function public.set_updated_at();
create trigger customers_set_updated_at before update on public.customers
for each row execute function public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function public.set_updated_at();

-- No direct anonymous order/customer writes. This trigger makes cancellation restocking
-- part of the same transaction and records the one permitted transition out of a live state.
create function public.restock_cancelled_order()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.fulfillment_status = 'cancelled' and new.fulfillment_status <> 'cancelled' then
    raise exception 'A cancelled order cannot be reopened' using errcode = '23514';
  end if;
  if old.fulfillment_status is distinct from 'cancelled' and new.fulfillment_status = 'cancelled' then
    if old.payment_status = 'paid' then
      raise exception 'Paid orders must be refunded before cancellation' using errcode = '23514';
    end if;
    update public.product_variants v
      set stock_quantity = v.stock_quantity + i.quantity
    from public.order_items i
    where i.order_id = old.id and i.variant_id = v.id;
    new.restocked_at := now();
  end if;
  return new;
end;
$$;

create trigger orders_restock_on_cancel
before update of fulfillment_status on public.orders
for each row execute function public.restock_cancelled_order();

-- Atomic guest checkout. The caller supplies normalized E.164 phone and a stable UUID
-- idempotency key. Prices, snapshots, total, and stock are read/changed only in Postgres.
create function public.create_order_atomic(
  p_idempotency_key uuid,
  p_full_name text,
  p_phone text,
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
  existing_order public.orders%rowtype;
  customer_row public.customers%rowtype;
  item_record record;
  variant_row public.product_variants%rowtype;
  product_row public.products%rowtype;
  order_id_value uuid;
  claim_code_value text;
  total_value bigint := 0;
  total_numeric numeric := 0;
  order_number_value text;
  method_value text := p_payment_method;
  normalized_phone text := p_phone;
  item_count integer;
begin
  if p_idempotency_key is null then
    raise exception 'Idempotency key is required' using errcode = '22023';
  end if;
  if p_full_name is null or length(btrim(p_full_name)) not between 1 and 200 then
    raise exception 'Full name must be between 1 and 200 characters' using errcode = '22023';
  end if;
  if normalized_phone is null or normalized_phone !~ '^\+[1-9][0-9]{7,14}$' then
    raise exception 'Phone must be normalized to E.164 format' using errcode = '22023';
  end if;
  if p_delivery_notes is null or length(p_delivery_notes) > 4000 then
    raise exception 'Delivery notes may not exceed 4000 characters' using errcode = '22023';
  end if;
  if method_value is null or method_value not in ('pay_on_pickup', 'paystack_momo') then
    raise exception 'Unsupported payment method' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 100 then
    raise exception 'Items must be a non-empty array with at most 100 entries' using errcode = '22023';
  end if;

  select * into existing_order from public.orders where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'order_id', existing_order.id,
      'order_number', existing_order.order_number,
      'total_amount', existing_order.total_amount,
      'payment_method', existing_order.payment_method,
      'payment_status', existing_order.payment_status,
      'fulfillment_status', existing_order.fulfillment_status,
      'claim_code', null,
      'replayed', true
    );
  end if;

  -- Ensure duplicate variant IDs cannot evade stock validation by splitting quantities.
  if exists (
    select 1 from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
    group by x.variant_id having count(*) > 1
  ) then
    raise exception 'Each variant may appear only once' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
    where x.variant_id is null or x.quantity is null or x.quantity < 1 or x.quantity > 1000
  ) then
    raise exception 'Each item requires a variant ID and quantity from 1 to 1000' using errcode = '22023';
  end if;

  -- Serialize customer creation for concurrent checkouts on the same phone.
  perform pg_advisory_xact_lock(hashtextextended(normalized_phone, 0));
  select * into customer_row from public.customers where phone = normalized_phone for update;
  if not found then
    claim_code_value := upper(encode(extensions.gen_random_bytes(5), 'hex'));
    insert into public.customers(phone, full_name, claim_code)
      values (normalized_phone, btrim(p_full_name), encode(extensions.digest(claim_code_value, 'sha256'), 'hex'))
      returning * into customer_row;
  else
    update public.customers set full_name = btrim(p_full_name) where id = customer_row.id returning * into customer_row;
  end if;

  -- Lock variants in UUID order to prevent overselling and reduce deadlock risk.
  for item_record in
    select x.variant_id, x.quantity
    from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
    order by x.variant_id
  loop
    select * into variant_row
      from public.product_variants v
      where v.id = item_record.variant_id
      for update;
    if not found then
      raise exception 'A selected variant is unavailable' using errcode = 'P0002';
    end if;
    select * into product_row from public.products p where p.id = variant_row.product_id;
    if not found or not product_row.is_active then
      raise exception 'A selected product is unavailable' using errcode = 'P0002';
    end if;
    if variant_row.stock_quantity < item_record.quantity then
      raise exception 'Insufficient stock for variant %', item_record.variant_id using errcode = '23514';
    end if;
    total_numeric := total_numeric + variant_row.price::numeric * item_record.quantity;
    if total_numeric > 9000000000000000 then
      raise exception 'Order total exceeds supported limit' using errcode = '22003';
    end if;
  end loop;
  total_value := total_numeric::bigint;

  insert into public.orders(idempotency_key, customer_id, total_amount, payment_method, delivery_notes)
    values (p_idempotency_key, customer_row.id, total_value, method_value, btrim(p_delivery_notes))
    returning id, order_number into order_id_value, order_number_value;

  for item_record in
    select x.variant_id, x.quantity
    from jsonb_to_recordset(p_items) as x(variant_id uuid, quantity integer)
    order by x.variant_id
  loop
    select * into variant_row from public.product_variants v where v.id = item_record.variant_id;
    select * into product_row from public.products p where p.id = variant_row.product_id;
    update public.product_variants
      set stock_quantity = stock_quantity - item_record.quantity
      where id = variant_row.id;
    insert into public.order_items(order_id, variant_id, product_title, variant_title, sku, unit_price, quantity)
      values (order_id_value, variant_row.id, product_row.title, variant_row.title,
              variant_row.sku, variant_row.price, item_record.quantity);
  end loop;

  return jsonb_build_object(
    'order_id', order_id_value,
    'order_number', order_number_value,
    'total_amount', total_value,
    'payment_method', method_value,
    'payment_status', 'unpaid',
    'fulfillment_status', 'pending',
    'claim_code', claim_code_value,
    'replayed', false
  );
end;
$$;

comment on function public.create_order_atomic(uuid, text, text, text, text, jsonb) is
  'Guest checkout: validates current catalog/stock, creates customer/order/snapshots atomically, and decrements stock. Claim code is returned only when a customer is first created.';

-- Enable RLS everywhere. Service-role secret-key access bypasses RLS by Supabase design;
-- it must remain server-only. User-facing admin policies use trusted app_metadata claims.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.cms_sections enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Category labels/images are non-sensitive taxonomy. Keep this policy non-recursive;
-- catalog product visibility remains restricted by products_public_read below.
create policy categories_public_read on public.categories for select to anon, authenticated using (true);
create policy categories_admin_all on public.categories for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy products_public_read on public.products for select to anon, authenticated using (is_active);
create policy products_admin_all on public.products for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy variants_public_read on public.product_variants for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.is_active));
create policy variants_admin_all on public.product_variants for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy cms_sections_public_read on public.cms_sections for select to anon, authenticated using (is_active);
create policy cms_sections_admin_all on public.cms_sections for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy customers_admin_read on public.customers for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy customers_admin_update on public.customers for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy customers_owner_read on public.customers for select to authenticated
  using (auth_user_id = (select auth.uid()));
-- No direct client insert/delete: customer rows are created by the checkout RPC.

create policy orders_admin_read on public.orders for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy orders_admin_update on public.orders for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy orders_owner_read on public.orders for select to authenticated
  using (exists (select 1 from public.customers c where c.id = customer_id and c.auth_user_id = (select auth.uid())));

create policy order_items_admin_read on public.order_items for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy order_items_owner_read on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o join public.customers c on c.id = o.customer_id
    where o.id = order_id and c.auth_user_id = (select auth.uid())
  ));

revoke all on public.customers, public.orders, public.order_items from anon, authenticated;
grant select on public.categories, public.products, public.product_variants, public.cms_sections to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.product_variants, public.cms_sections to authenticated;
grant select, update on public.customers to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

revoke all on function public.create_order_atomic(uuid, text, text, text, text, jsonb) from public;
grant execute on function public.create_order_atomic(uuid, text, text, text, text, jsonb) to anon, authenticated;
revoke all on function public.enforce_category_depth() from public, anon, authenticated;
revoke all on function public.assert_active_product_has_variant() from public, anon, authenticated;
revoke all on function public.restock_cancelled_order() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;

commit;
