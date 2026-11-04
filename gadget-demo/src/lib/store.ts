import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product, Variant } from './types';

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  sku: string | null;
  /** Integer price in pesewas. */
  unitPrice: number;
  image: string;
  quantity: number;
}

interface StoreState {
  cart: CartItem[];
  isCartOpen: boolean;
  isAdminMode: boolean;
  addToCart: (product: Product, variant: Variant) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  clearCart: () => void;
  toggleAdmin: () => void;
  toggleCart: (isOpen?: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      isAdminMode: false,
      toggleAdmin: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
      toggleCart: (isOpen) => set((state) => ({ isCartOpen: isOpen ?? !state.isCartOpen })),
      addToCart: (product, variant) => {
        const currentCart = get().cart;
        const existing = currentCart.find((item) => item.variantId === variant.id);
        if (existing && existing.quantity >= variant.stock) {
          alert(`Only ${variant.stock} units available!`);
          return;
        }
        const item: CartItem = {
          productId: product.id,
          variantId: variant.id,
          title: product.name,
          variantTitle: variant.condition,
          sku: variant.sku ?? null,
          unitPrice: variant.price,
          image: variant.images?.[0] || product.images[0] || '',
          quantity: 1,
        };
        set({
          cart: existing
            ? currentCart.map((cartItem) => cartItem.variantId === variant.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem)
            : [...currentCart, item],
          isCartOpen: true,
        });
      },
      removeFromCart: (variantId) => set((state) => ({ cart: state.cart.filter((item) => item.variantId !== variantId) })),
      updateQuantity: (variantId, delta) => set((state) => ({
        cart: state.cart
          .map((item) => item.variantId === variantId ? { ...item, quantity: item.quantity + delta } : item)
          .filter((item) => item.quantity > 0),
      })),
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'payless-storage',
      version: 2,
      migrate: () => ({ cart: [], isAdminMode: false }),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cart: state.cart, isAdminMode: state.isAdminMode }),
    },
  ),
);
