begin;

create function public.save_product_with_variants(
  p_product_id uuid,
  p_title text,
  p_slug text,
  p_description text,
  p_category_id uuid,
  p_base_images text[],
  p_variants jsonb,
  p_is_active boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_product_id uuid := coalesce(p_product_id, gen_random_uuid());
  variant jsonb;
  variant_id_value uuid;
  retained_variant_ids uuid[] := array[]::uuid[];
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'Admin role required' using errcode = '42501';
  end if;
  if p_title is null or length(btrim(p_title)) not between 1 and 240 then
    raise exception 'Product title must be between 1 and 240 characters' using errcode = '22023';
  end if;
  if p_slug is null or p_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Invalid product slug' using errcode = '22023';
  end if;
  if p_description is null or length(p_description) > 20000 then
    raise exception 'Product description is too long' using errcode = '22023';
  end if;
  if p_base_images is null or cardinality(p_base_images) > 30 then
    raise exception 'Provide at most 30 product images' using errcode = '22023';
  end if;
  if p_variants is null or jsonb_typeof(p_variants) <> 'array' or jsonb_array_length(p_variants) < 1 or jsonb_array_length(p_variants) > 500 then
    raise exception 'A product must have between 1 and 500 variants' using errcode = '22023';
  end if;
  if p_category_id is not null and not exists (select 1 from public.categories c where c.id = p_category_id) then
    raise exception 'Selected category does not exist' using errcode = '23503';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_variants) as v(sku text, title text, price bigint, stock_quantity integer, attributes jsonb)
    where v.title is null or length(btrim(v.title)) not between 1 and 240
       or v.price is null or v.price < 0
       or v.stock_quantity is null or v.stock_quantity < 0
       or v.attributes is null or jsonb_typeof(v.attributes) <> 'object'
  ) then
    raise exception 'Variant title, price, stock, or attributes are invalid' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_variants) as v(sku text, title text, price bigint, stock_quantity integer, attributes jsonb)
    where v.sku is null or btrim(v.sku) = ''
  ) or (select count(*) <> count(distinct lower(btrim(v.sku))) from jsonb_to_recordset(p_variants) as v(sku text, title text, price bigint, stock_quantity integer, attributes jsonb)) then
    raise exception 'Each variant requires a unique SKU' using errcode = '23505';
  end if;

  if p_product_id is null then
    insert into public.products(id, title, slug, description, category_id, base_images, has_variants, is_active)
      values (saved_product_id, btrim(p_title), p_slug, p_description, p_category_id, p_base_images,
              jsonb_array_length(p_variants) > 1, false);
  else
    perform 1 from public.products where id = p_product_id for update;
    if not found then raise exception 'Product not found' using errcode = 'P0002'; end if;
    update public.products set is_active = false where id = p_product_id;
    update public.products set title = btrim(p_title), slug = p_slug, description = p_description,
      category_id = p_category_id, base_images = p_base_images,
      has_variants = jsonb_array_length(p_variants) > 1
      where id = p_product_id;
    -- Do not remove a variant that may still need to be restocked by order cancellation.
    if exists (
      select 1
      from public.product_variants old_variant
      join public.order_items oi on oi.variant_id = old_variant.id
      join public.orders o on o.id = oi.order_id
      where old_variant.product_id = p_product_id
        and not exists (
          select 1 from jsonb_to_recordset(p_variants) as incoming(sku text, title text, price bigint, stock_quantity integer, attributes jsonb)
          where lower(btrim(incoming.sku)) = lower(old_variant.sku)
        )
        and o.fulfillment_status not in ('completed', 'cancelled')
    ) then
      raise exception 'A variant in an open order cannot be removed' using errcode = '23514';
    end if;
  end if;

  for variant in select value from jsonb_array_elements(p_variants)
  loop
    select id into variant_id_value from public.product_variants
      where product_id = saved_product_id and lower(sku) = lower(btrim(variant ->> 'sku'))
      for update;
    if found then
      update public.product_variants set
        title = btrim(variant ->> 'title'), price = (variant ->> 'price')::bigint,
        stock_quantity = (variant ->> 'stock_quantity')::integer,
        attributes = coalesce(variant -> 'attributes', '{}'::jsonb)
      where id = variant_id_value;
    else
      insert into public.product_variants(product_id, sku, title, price, stock_quantity, attributes)
        values (saved_product_id, btrim(variant ->> 'sku'), btrim(variant ->> 'title'),
                (variant ->> 'price')::bigint, (variant ->> 'stock_quantity')::integer,
                coalesce(variant -> 'attributes', '{}'::jsonb))
        returning id into variant_id_value;
    end if;
    retained_variant_ids := array_append(retained_variant_ids, variant_id_value);
  end loop;

  delete from public.product_variants
   where product_id = saved_product_id and not (id = any(retained_variant_ids));

  update public.products set is_active = coalesce(p_is_active, true) where id = saved_product_id;
  return saved_product_id;
end;
$$;

revoke all on function public.save_product_with_variants(uuid, text, text, text, uuid, text[], jsonb, boolean) from public, anon;
grant execute on function public.save_product_with_variants(uuid, text, text, text, uuid, text[], jsonb, boolean) to authenticated;

commit;
