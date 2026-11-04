// UI adapter types for the catalog rows used by the product detail and cart.
// Prices and stock values are integers from product_variants.
export type Category = 'laptop' | 'audio' | 'phone' | 'gaming' | 'monitor' | 'printer' | 'accessory' | 'camera' | 'tv' | 'tablet' | 'wearable';
export type ProductSpecMap = Record<string, string | number | boolean>;

export interface Variant {
  id: string;
  product_id: string;
  sku?: string;
  condition: string;
  /** Integer price in pesewas. */
  price: number;
  stock: number;
  specs: ProductSpecMap;
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: Category;
  description?: string;
  /** Starting integer price in pesewas. */
  price: number;
  images: string[];
  variants?: Variant[];
  specs?: ProductSpecMap;
}
