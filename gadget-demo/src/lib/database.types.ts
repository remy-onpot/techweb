export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      categories: Table<
        { id: string; name: string; slug: string; parent_id: string | null; image_url: string | null; created_at: string; updated_at: string },
        { id?: string; name: string; slug: string; parent_id?: string | null; image_url?: string | null; created_at?: string; updated_at?: string },
        { name?: string; slug?: string; parent_id?: string | null; image_url?: string | null; updated_at?: string }
      >;
      products: Table<
        { id: string; title: string; slug: string; description: string; category_id: string | null; base_images: string[]; has_variants: boolean; is_active: boolean; created_at: string; updated_at: string },
        { id?: string; title: string; slug: string; description?: string; category_id?: string | null; base_images?: string[]; has_variants?: boolean; is_active?: boolean; created_at?: string; updated_at?: string },
        { title?: string; slug?: string; description?: string; category_id?: string | null; base_images?: string[]; has_variants?: boolean; is_active?: boolean; updated_at?: string }
      >;
      product_variants: Table<
        { id: string; product_id: string; sku: string | null; title: string; price: number; stock_quantity: number; attributes: Json; created_at: string; updated_at: string },
        { id?: string; product_id: string; sku?: string | null; title: string; price: number; stock_quantity?: number; attributes?: Json; created_at?: string; updated_at?: string },
        { product_id?: string; sku?: string | null; title?: string; price?: number; stock_quantity?: number; attributes?: Json; updated_at?: string }
      >;
      cms_sections: Table<
        { id: string; slot: string; section_type: 'hero_banner' | 'featured_category' | 'announcement' | 'brand_accent'; content: Json; is_active: boolean; sort_order: number; created_at: string; updated_at: string },
        { id?: string; slot: string; section_type: 'hero_banner' | 'featured_category' | 'announcement' | 'brand_accent'; content?: Json; is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string },
        { slot?: string; section_type?: 'hero_banner' | 'featured_category' | 'announcement' | 'brand_accent'; content?: Json; is_active?: boolean; sort_order?: number; updated_at?: string }
      >;
      customers: Table<
        { id: string; phone: string; full_name: string; email: string | null; auth_user_id: string | null; claim_code: string | null; created_at: string; updated_at: string },
        { id?: string; phone: string; full_name: string; email?: string | null; auth_user_id?: string | null; claim_code?: string | null; created_at?: string; updated_at?: string },
        { full_name?: string; email?: string | null; auth_user_id?: string | null; claim_code?: string | null; updated_at?: string }
      >;
      orders: Table<
        { id: string; order_number: string; idempotency_key: string; customer_id: string; email: string | null; total_amount: number; payment_method: 'pay_on_pickup' | 'paystack_momo'; payment_status: 'unpaid' | 'paid' | 'refunded'; fulfillment_status: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled'; delivery_notes: string; paystack_reference: string | null; restocked_at: string | null; created_at: string; updated_at: string },
        { id?: string; order_number?: string; idempotency_key: string; customer_id: string; email?: string | null; total_amount: number; payment_method: 'pay_on_pickup' | 'paystack_momo'; payment_status?: 'unpaid' | 'paid' | 'refunded'; fulfillment_status?: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled'; delivery_notes?: string; paystack_reference?: string | null; restocked_at?: string | null; created_at?: string; updated_at?: string },
        { email?: string | null; payment_status?: 'unpaid' | 'paid' | 'refunded'; fulfillment_status?: 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled'; paystack_reference?: string | null; updated_at?: string }
      >;
      order_items: Table<
        { id: string; order_id: string; variant_id: string | null; product_title: string; variant_title: string; sku: string | null; unit_price: number; quantity: number; created_at: string },
        { id?: string; order_id: string; variant_id?: string | null; product_title: string; variant_title: string; sku?: string | null; unit_price: number; quantity: number; created_at?: string },
        { variant_id?: string | null }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      create_order_atomic: {
        Args: { p_idempotency_key: string; p_full_name: string; p_phone: string; p_delivery_notes: string; p_payment_method: 'pay_on_pickup' | 'paystack_momo'; p_items: Json };
        Returns: Json;
      };
      create_order_atomic_with_email: {
        Args: { p_idempotency_key: string; p_full_name: string; p_phone: string; p_email: string | null; p_delivery_notes: string; p_payment_method: 'pay_on_pickup' | 'paystack_momo'; p_items: Json };
        Returns: Json;
      };
      release_abandoned_stock: { Args: Record<string, never>; Returns: number };
      save_product_with_variants: {
        Args: { p_product_id: string | null; p_title: string; p_slug: string; p_description: string; p_category_id: string | null; p_base_images: string[]; p_variants: Json; p_is_active?: boolean };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
