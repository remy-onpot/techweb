# Phase 6 — End-to-End CMS & Storefront Disconnect Audit

**Audit date:** 2026-11-04  
**Scope:** `gadget-demo/src` admin writes, public storefront reads, and legacy data references.  
**Result:** The primary homepage and category/product detail routes use the new schema. The repo still contains an older parallel CMS/layout system with active admin writes and old table queries, plus unused storefront components that depend on it. The primary home page currently does not render a product/category listing; it renders CMS sections and category-linked featured cards.

## 1. Homepage CMS data path

### Admin write

1. [`src/app/admin/store-builder/page.tsx`](gadget-demo/src/app/admin/store-builder/page.tsx) presents the section editor. It collects a unique-looking slot key, section type (`hero_banner`, `featured_category`, `announcement`, or `brand_accent`), JSON content, active flag, and sort order. The client parses JSON before submitting.
2. The page calls `saveCmsSection` in [`src/actions/admin-cms.ts`](gadget-demo/src/actions/admin-cms.ts). The server action verifies `app_metadata.role === 'admin'`, validates slot/type/content/sort order, then inserts or updates `cms_sections` with `{slot, section_type, content, is_active, sort_order}`. It revalidates `/` and the Store Builder route. Delete also targets `cms_sections` and revalidates those paths.
3. This is a correct mapping to the new table and JSONB content field, assuming the live database has the migration applied and the authenticated user's role metadata is configured. The Store Builder itself does not offer a category picker; it accepts category IDs in JSON.

### Public read and render

1. [`src/app/page.tsx`](gadget-demo/src/app/page.tsx) creates the server Supabase client and concurrently reads active `cms_sections` ordered by `sort_order, slot` and category rows (`id,name,slug,image_url,parent_id`).
2. Each section's JSON content is checked as an object. `announcement` renders its `text`; `hero_banner` renders title, description, image URL, CTA text and link; `featured_category` resolves `category_id`/`category_ids` against the category query and renders names/image/link; other currently-supported section types fall through to the brand-accent title, description and colors.
3. The home page currently has no imports of the old `HeroGrid`, `CategoryGrid`, `CategoryFeed`, or other legacy homepage composition components. It renders only `cms_sections` and a fallback when no active section exists. `storeConfig.name` remains static configuration for branding, not CMS content.

## 2. Product Details and catalog data path

1. [`src/app/category/[slug]/page.tsx`](gadget-demo/src/app/category/[slug]/page.tsx) resolves the URL slug through `categories`, reads active products by `category_id`, then reads `product_variants(product_id, price, stock_quantity)` for those product IDs. It displays the cheapest in-stock variant price, or cheapest variant if all are out of stock, using `formatMoney`; products with no variants show `Unavailable`.
2. [`src/app/product/[slug]/page.tsx`](gadget-demo/src/app/product/[slug]/page.tsx) loads an active `products` row by slug, its `product_variants` ordered by title, and its category name/slug from `categories`.
3. [`src/components/shop/CatalogProductDetail.tsx`](gadget-demo/src/components/shop/CatalogProductDetail.tsx) receives those DB rows, presents variant choices (out-of-stock choices disabled), formats the selected integer `price` with `formatMoney`, shows `stock_quantity`, and builds the cart product/variant objects from the DB values. The utility [`src/lib/format-money.ts`](gadget-demo/src/lib/format-money.ts) treats the integer as minor currency units and divides by 100 before display.
4. Thus the requested category and product detail routes use the new `products`, `product_variants`, and `categories` tables, not legacy float prices. Note: category cards use `product.base_images[0]`; product detail uses `base_images` and variant stock/prices. The category card's price fallback is `0` when variants exist but no prices are available; currently it filters by stock first and otherwise shows the least price from all variants.

## 3. Legacy code, dummy data, and old table use

### Old table names still referenced

- **`banners` reads/writes:** [`src/lib/store.ts`](gadget-demo/src/lib/store.ts) fetches `banners` and `site_settings`; [`src/components/admin/MarketingManager.tsx`](gadget-demo/src/components/admin/MarketingManager.tsx) reads/inserts/deletes `banners`; that manager is mounted by [`src/app/admin/banners/page.tsx`](gadget-demo/src/app/admin/banners/page.tsx). The primary homepage does not read this data, so the admin page edits a parallel CMS not shown on the primary homepage.
- **`category_sections` reads/writes:** [`src/components/admin/CategoryLayoutManager.tsx`](gadget-demo/src/components/admin/CategoryLayoutManager.tsx) reads/inserts/updates/deletes this table; [`src/hooks/useCategory.ts`](gadget-demo/src/hooks/useCategory.ts) reads it. The admin component is not mounted by the active layouts route found in this audit, and `useCategory` has no use in `src/app` or `src/components` imports. This is legacy/dead-end layout code, but its queries remain in the source.
- **`category_metadata` reads/writes:** [`src/app/admin/layouts/page.tsx`](gadget-demo/src/app/admin/layouts/page.tsx) reads/upserts this table; [`src/components/shop/CategoryFeed.tsx`](gadget-demo/src/components/shop/CategoryFeed.tsx) reads it. The latter component is not imported by the active home page. The layouts admin page is active and is based on the legacy `products.category` string field rather than the new `category_id` relation.
- **`site_settings` reads/writes:** [`src/app/admin/settings/page.tsx`](gadget-demo/src/app/admin/settings/page.tsx), [`src/components/admin/BannerManager.tsx`](gadget-demo/src/components/admin/BannerManager.tsx), and `src/lib/store.ts` still target it. No primary homepage read was found. `BannerManager` is not the manager mounted by `/admin/banners` in the current route.

Searches found no primary storefront query against `banners` or `category_sections`; the old queries are in the parallel store/admin/layout implementation listed above.

### Dummy data and stale product-card model

- [`src/lib/data.ts`](gadget-demo/src/lib/data.ts) exports `initialProducts`; [`src/lib/db.ts`](gadget-demo/src/lib/db.ts) exports a simulated `DB` with hardcoded hero slides/products. Neither file is imported from `src/app` or `src/components` in the current tree search.
- [`src/components/ProductCard.tsx`](gadget-demo/src/components/ProductCard.tsx) is written for the old product shape (`originalPrice`, `brand`, `isFeatured`, etc.) and formats those values with `formatMoney`. No imports of `ProductCard` were found in `src/app` or `src/components` during this audit. Its price model should not be treated as the new variant-price pipeline.
- Older homepage components (`HeroGrid`, `BrandHero`, `BranchSlider`, `FeaturedRow`, `SocialGrid`) and [`src/components/shop/CategoryFeed.tsx`](gadget-demo/src/components/shop/CategoryFeed.tsx) remain in source but are not imported by the active home page. Several take old `Banner`/`Product` props and would rely on the old data pipeline if mounted.

## 4. Remediation checklist for a fully new-schema storefront

1. **Move all CMS editing to the CMS section model:** replace or retire the old banner administration in `src/app/admin/banners/page.tsx` and `src/components/admin/MarketingManager.tsx`; migrate any required banner content into `cms_sections` JSONB. Review `src/components/admin/BannerManager.tsx` and `src/app/admin/settings/page.tsx` if their old settings-based features remain part of the intended CMS.
2. **Remove or migrate legacy category layouts:** update/retire `src/app/admin/layouts/page.tsx` and `src/components/admin/CategoryLayoutManager.tsx`; remove or rewrite `src/hooks/useCategory.ts` and `src/components/shop/CategoryFeed.tsx` to use `categories.id/category_id` and the new CMS/catalog model. The primary home/category/product routes do not currently depend on those components.
3. **Retire obsolete price/product presentation paths:** remove or convert `src/components/ProductCard.tsx`, `src/components/home/*`, and unused `src/lib/data.ts` / `src/lib/db.ts` so any future use cannot reintroduce fixture data or the old float-style product shape. Keep `src/lib/store.ts` for cart state if needed, but remove its unused `fetchStoreData` database loader or convert it from `banners`/`site_settings` and legacy product aliases to current tables.
4. **Confirm final table inventory before live migration:** after code migration, search all of `src` for `banners`, `category_sections`, `category_metadata`, and any legacy product fields (`category`, `base_price`, `originalPrice`). Remove old references where those tables are not intentionally retained, and ensure no production route imports the parallel path.

## Audit conclusion

The specific public homepage CMS path and category/product detail paths are wired to the new schema. The storefront is **not yet wholly severed from the legacy model at repository level**: active admin pages can still write old tables, and unused modules/components preserve old reads and incompatible product assumptions. The current public homepage also has no product feed component, so a featured product/catalog section is not presently provided through that page.

## Phase 6b follow-up — Purge status (2026-11-04)

The legacy purge was completed after this baseline audit. The listed dummy data, legacy homepage components, old product card, category feed/hook, and parallel admin routes/components were deleted. Admin navigation now links to Store Builder for CMS work. The remaining attribute editor now loads category slugs from `categories`; header search now uses product `title`, `base_images`, and `product_variants.price` rather than legacy product columns.

The global Zustand cart now stores only `productId`, `variantId`, `title`, `variantTitle`, `sku`, integer `unitPrice` (pesewas), `image`, and `quantity`. Cart and checkout views use that representation. Persisted carts from the old shape are cleared by the store version migration.

Store Builder now supports selecting an image for `hero_banner` and `featured_category`; it uploads to the configured `media` Storage bucket and writes the resulting public URL into `content.image_url` when saving `cms_sections`.

A final source search found no references under `src` to `banners`, `category_sections`, `category_metadata`, `site_settings`, `base_price`, `originalPrice`, or the removed fetchStoreData loader. TypeScript verification passed with `npm.cmd exec -- tsc --noEmit` after clearing stale `.next` route type artifacts.

