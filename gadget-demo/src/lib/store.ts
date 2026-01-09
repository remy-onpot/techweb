import { create } from 'zustand';
import { Product, Banner } from './types'; // <--- Import Banner
import { supabase } from './supabase';

interface StoreState {
  products: Product[];
  banners: Banner[]; // <--- New State
  cart: Product[];
  isAdminMode: boolean;
  isLoading: boolean;
  
  fetchStoreData: () => Promise<void>;
  addToCart: (product: Product) => void;
  toggleAdmin: () => void;
  addProduct: (product: Product) => void;
}

export const useStore = create<StoreState>((set) => ({
  products: [],
  banners: [], // <--- Initialize
  cart: [],
  isAdminMode: false,
  isLoading: false,

  toggleAdmin: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
  addToCart: (product) => set((state) => ({ cart: [...state.cart, product] })),
  addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),

  fetchStoreData: async () => {
    set({ isLoading: true });
    
    try {
      // 1. Fetch Products
      const { data: products } = await supabase.from('products').select('*');
      
      // 2. Fetch Banners (NEW)
      const { data: banners } = await supabase.from('banners').select('*').eq('is_active', true);

      set({ 
        products: (products as any) || [], 
        banners: (banners as any) || [], 
        isLoading: false 
      });
    } catch (e) {
      console.log("Error loading data", e);
      set({ isLoading: false });
    }
  }
}));