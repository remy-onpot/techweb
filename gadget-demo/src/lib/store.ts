import { create } from 'zustand';
import { Product, HeroSlide } from './types'; 
import { supabase } from './supabase';

interface StoreState {
  products: Product[];
  heroSlides: HeroSlide[];
  cart: Product[];
  isAdminMode: boolean;
  isLoading: boolean;
  
  // Actions
  fetchStoreData: () => Promise<void>;
  addToCart: (product: Product) => void;
  toggleAdmin: () => void;
  
  // Admin Actions
  addProduct: (product: Product) => void;
}

export const useStore = create<StoreState>((set) => ({
  products: [],
  heroSlides: [],
  cart: [],
  isAdminMode: false,
  isLoading: false,

  toggleAdmin: () => set((state) => ({ isAdminMode: !state.isAdminMode })),

  addToCart: (product) => set((state) => ({ cart: [...state.cart, product] })),

  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),

  // The Real Fetcher: Only trusts Supabase
  fetchStoreData: async () => {
    set({ isLoading: true });
    
    try {
      // 1. Fetch Products from DB
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      // 2. Fetch Hero Slides (If you created the table, otherwise returns null)
      const { data: slides } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        products: (products as any) || [], 
        heroSlides: (slides as any) || [],
        isLoading: false 
      });

    } catch (e) {
      console.error("Error fetching store data:", e);
      set({ isLoading: false });
    }
  }
}));