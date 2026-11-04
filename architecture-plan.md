# Shop-in-a-Box Architecture Plan

## Purpose and current baseline

This plan describes the rebuild of the existing `gadget-demo/` application into a single-tenant, clone-and-deploy retail template. Each client deployment will have its own Supabase project and store configuration; there is no tenant identifier or cross-store data model.

The existing app is Next.js 16.1.1 with the App Router, React 19.2.3, TypeScript 5, Tailwind CSS 4, Supabase JS 2 with `@supabase/ssr`, and Zustand 5. Routes live under `gadget-demo/src/app`. The storefront includes home, category, product, cart, checkout, account, and login routes. Admin routes cover inventory, orders, attributes, banners, layouts, and settings. Shared UI is under `src/components` and `src/hooks`; the Zustand store in `src/lib/store.ts` currently persists full product/variant cart snapshots and an `isAdminMode` flag in localStorage. Product detail and many admin screens are client-fetching; home and category feed contain server-rendered Supabase queries. Existing admin components include a product form with variant editing and storage upload, plus separate banner/category-layout tooling. Current schema is inferred from queries only: no SQL migration files were found in the repository. The current checkout writes orders and order items directly from the browser and sends a WhatsApp confirmation. Existing Ghana-specific names, contact values, currency formatting, demo data, and legacy table names must be addressed during the rebuild.

## Target architecture

- Use the App Router with server-rendered public catalog pages where practical and small client components for interactive controls.
- Separate Supabase clients by runtime: browser client for explicitly public/authenticated browser operations, cookie-aware server client for server components/actions/routes, and service-role client only for narrowly scoped server-only tasks if required. Never expose a service-role key to the browser.
- Treat Postgres as the authority for prices, stock, order lifecycle, role checks, and data constraints. The browser cart stores only `{ variantId, quantity }`; product names, prices, and stock in local state are display data only.
- Keep the deployment single-tenant. Store branding, currency/locale, contact channels, and enabled payment methods are deployment settings rather than tenant rows.
- Use integer minor units for every amount. The default deployment may label these Pesewas/GHS, but the schema and display formatter must make the unit explicit and avoid floating-point arithmetic.

## Sequential implementation plan

### 1. Confirm deployment contract and configuration

1. Inventory current routes, shared components, data access, storage buckets, and environment variables; identify existing live Supabase schema and any data that must be preserved before replacing the legacy model.
2. Define the template environment contract in `.env.example`: public Supabase URL/anon key, server-only service role if truly needed, public site URL, Paystack secret key and webhook secret/signature policy, and store display defaults. Keep credentials out of source control.
3. Add typed store configuration for store name, locale, currency code/display, support/WhatsApp contacts, enabled payment methods, and payment configuration state.

### 2. Establish database migrations and security

1. Add ordered SQL migrations under a conventional Supabase migrations directory. Use UUID primary keys, UTC timestamps, explicit checks, foreign keys, indexes for actual lookup paths, and integer monetary columns (`bigint` minor units where appropriate).
2. Create `categories` with `parent_id` self-reference and an enforced maximum depth of two levels. Add unique slug constraints at the intended scope and indexes for parent/slug lookups.
3. Create `products` with category relation, title/slug/description, `base_images`, and `has_variants`; define catalog visibility/active state so public reads can distinguish publishable products.
4. Create `product_variants` with product relation, optional unique SKU, title, integer `price`, nonnegative `stock_quantity`, JSONB attributes, and timestamps. Enforce the business rule that every published product has at least one variant using a deferred constraint trigger or a controlled publish RPC; ordinary row constraints cannot express this cross-row rule.
5. Create `cms_sections` with constrained section type (`hero_banner`, `featured_category`, `announcement`, `brand_accent`), JSONB content, active state, slot/order fields, and timestamps. Add a uniqueness rule for slots if the home-page contract requires one section per slot.
6. Create guest-claimable `customers` with normalized phone, full name, nullable unique `auth_user_id`, and unique high-entropy claim code. Store only a hash of the claim code if it is used as a bearer credential; never expose another customer's order history based solely on an easily guessed code.
7. Create `orders` with unique human-readable `order_number`, customer relation, integer `total_amount`, constrained payment method/status and fulfillment status, delivery notes/address as appropriate, timestamps, and payment-provider reference fields needed for idempotency/reconciliation.
8. Create `order_items` with order relation, nullable variant relation using `ON DELETE SET NULL`, immutable product/variant/SKU/price/quantity snapshots, and checks for positive quantity and nonnegative unit price.
9. Enable RLS on every application table. Add public `SELECT` policies only for active/published catalog and CMS rows. Add admin policies using `auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'` for catalog/CMS/order management. Customer/order reads and writes must be narrowly scoped; public clients must not be able to create arbitrary orders or alter prices/statuses.
10. Add indexes for foreign keys and common reads (active catalog, category/slug, variant product/SKU, CMS slot/order, normalized customer phone, order number/customer/created time, order items by order). Verify policies and query plans against the actual queries.

### 3. Implement transactional order and inventory primitives

1. Add a Postgres RPC for order placement that accepts validated customer/contact details and a list of variant IDs and quantities, locks relevant variant rows in a deterministic order, confirms products are active and stock is sufficient, decrements stock, calculates totals from database prices, writes the order and immutable items in one transaction, and returns only the created order summary.
2. Make the RPC safe against duplicate submissions with an idempotency key unique per checkout attempt. Define the stock reservation point and expiry/release policy for unpaid Paystack transactions so abandoned checkouts do not permanently consume stock.
3. Add a cancellation restock mechanism. On transition to `cancelled`, restock each order item exactly once, preferably with a transactional status-transition RPC or trigger that records/guards the one-time restock. Prevent repeated status updates from incrementing stock repeatedly; define how paid cancellations/refunds differ.
4. Restrict RPC execution grants to the intended roles and verify all authorization decisions within the transaction, not only in UI/middleware.

### 4. Replace data access boundaries and types

1. Introduce typed Supabase clients for browser and server contexts and generated database types from the migration schema. Keep service-role access server-only and avoid it when RLS-backed server clients suffice.
2. Move protected writes to Server Actions or Route Handlers, validate inputs at the boundary, return typed success/error results, and avoid client-side direct writes to orders, inventory, payment status, or fulfillment status.
3. Replace legacy product/category/order/banner types and table names with the target schema. Remove duplicate mock stores and normalize all prices as integer minor units.
4. Keep public catalog reads cache-aware and server-rendered where appropriate; retain client components for filters, variant selection, cart controls, upload previews, and admin editing.

### 5. Rebuild cart and frictionless checkout

1. Replace the persisted cart shape with `{ variantId, quantity }` entries and a versioned localStorage key. Handle unavailable/removed variants gracefully and do not use stale browser prices for totals.
2. Implement checkout fields for full name, phone, and delivery notes/address as configured by the store. Do not require customer authentication.
3. In the Server Action, normalize and validate phone, find or create the customer safely under concurrent submissions, generate a cryptographically random claim code for new customers, and call the transactional order RPC.
4. Return the claim code once to the customer with clear save/recovery guidance. Do not expose claim codes in logs or broad admin/customer queries. Define a later secure account-claim flow that verifies phone ownership before associating `auth_user_id`.
5. Add clear pending/success/error states, preserve cart on failure, clear purchased quantities only after successful order creation, and show order number and next steps after success.

### 6. Implement payment lifecycle

1. Add site settings for enabled `pay_on_pickup` and `paystack_momo` methods; render only configured and available methods.
2. For pay-on-pickup, create an unpaid order through the same server-side transaction and show pickup/delivery instructions.
3. For Paystack, initialize the transaction from a server-only route/action using the authoritative order amount and order/customer reference; store the provider reference and return the hosted checkout URL. Do not mark an order paid from a browser redirect.
4. Add `/api/webhooks/paystack`: verify the provider signature against the raw request body using the server secret, validate event type/reference/amount/currency against the stored order, and process `charge.success` idempotently. Set payment status to `paid` and fulfillment to `confirmed` only after successful verification.
5. Add webhook replay protection, event/reference uniqueness, safe logging without secrets/PII, and a reconciliation path for provider/database disagreements. Define refund behavior and prevent cancellation restock from silently refunding or restocking paid orders without the intended policy.

### 7. Build admin product matrix and category tooling

1. Replace the legacy inventory editor with product create/edit flows matching the new schema, including images, category, active state, and variant definitions.
2. Build the Matrix Generator: collect attribute names and option values, generate the Cartesian product deterministically, show editable SKU/title/price/stock rows, flag duplicate SKUs, and support “set base price for all” and “set default stock for all”. Prices are entered/displayed in currency units but converted to integer minor units at the validated boundary.
3. Support inline category creation in the product drawer, with parent selection constrained to the two-level hierarchy and immediate selection of the created category.
4. Use safe Supabase Storage upload policies, validate image type/size, generate non-colliding object paths, and handle cleanup/replacement errors.

### 8. Build CMS Store Builder and storefront rendering

1. Implement an admin Store Builder for `cms_sections`: create/edit/reorder/activate sections, validate type-specific JSON content, and preview the public home page representation.
2. Render active CMS sections from server-side data using a typed renderer for hero banners, featured categories, announcement bars, and brand accents. Unknown or invalid content should fail gracefully.
3. Replace hardcoded brand, contact, currency, and social values with store configuration/settings and provide neutral defaults suitable for a fresh clone.

### 9. Rebuild order administration and customer account claiming

1. Add order list/detail views with snapshots, customer contact/delivery information, payment status, fulfillment status, timestamps, and payment references safe for admin display.
2. Restrict state changes to explicit valid transitions; make cancellation call the guarded transactional cancellation/restock routine. Show confirmation and resulting state clearly.
3. Add secure customer claim flow: authenticate/verify phone ownership, validate claim code safely, attach the customer record to the authenticated user once, and expose only that customer's order history.

### 10. Remove legacy paths and document deployment

1. Remove unused demo arrays and obsolete table integrations; identify any seed data as explicitly optional and safe for local development only.
2. Remove fake admin toggles and placeholder actions; ensure logout, forms, upload, category, CMS, payment, and order controls have working outcomes and accessible loading/error states.
3. Document Supabase setup, migrations, admin-role assignment, storage bucket setup, environment variables, Paystack webhook configuration, deployment steps, store configuration, and backup/restore expectations.

### 11. Verification gates before release

1. Type-check and lint; build the production bundle.
2. Verify migration from a clean Supabase project, RLS behavior for anonymous/customer/admin roles, storage policies, and generated types.
3. Exercise concurrent checkout/stock contention, invalid variant/quantity/price tampering, idempotent retries, abandoned payment stock release, cancellation restock exactly once, and order snapshot preservation after catalog edits/deletes.
4. Exercise Paystack initialization and signed/invalid/replayed webhook events in a sandbox; verify payment and fulfillment transitions and reconciliation behavior.
5. Review mobile-first storefront and admin behavior, keyboard/accessibility basics, error states, and a fresh clone setup using only documented configuration.

## Approval boundary

Phase 1 consists only of this audit and plan. No migration or application-code changes should begin until this plan is reviewed and explicitly approved. After approval, implementation should proceed in the sequence above, with the database/security foundation completed before checkout, payment, and admin refactors.
