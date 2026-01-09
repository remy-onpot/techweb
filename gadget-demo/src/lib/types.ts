export type Category = 'laptop' | 'audio' | 'phone' | 'gaming' | 'monitor' | 'printer' | 'accessory' | 'camera' | 'tv';

export interface ProductSpecs {
  // Laptop
  processor?: string;
  ram?: string;
  storage?: string;
  screenSize?: string;
  touchscreen?: boolean;
  
  // Monitor/TV
  resolution?: string;
  refreshRate?: string;
  panelType?: string;
  
  // Audio/Printers - CHANGED 'type' TO string
  type?: string; 
  batteryLife?: string;
  noiseCancelling?: boolean;
  
  // Phone/Gaming
  color?: string;
  edition?: string;
  connection?: string; // For printers (WiFi)
  
  // Camera
  megapixels?: string;
  lensMount?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice?: number;
  images: string[];
  specs: ProductSpecs;
  stock: number;
  isFeatured?: boolean;
  condition: 'New' | 'Open Box' | 'Refurbished' | 'Pre-Owned';
}

export interface HeroSlide {
  id: string;
  image_url: string;
  link_type: 'category' | 'product';
  link_target: string; // The slug or ID
  is_active: boolean;
}
export type BannerSlot = 'brand_hero' | 'hero' | 'flash' | 'tile_new' | 'tile_student' | 'branch_slider';
export interface BannerConfig {
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
}

// 📐 THE RULES (Single Source of Truth)
export const BANNER_RULES: Record<BannerSlot, BannerConfig> = {
  brand_hero: {
    label: "Page Header (Top)",
    width: 1920,
    height: 822,
    aspectRatio: "21:9",
    description: "Massive top banner. Use for major site-wide announcements."
  },
  hero: {
    label: "Hero Slider (Grid)",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
    description: "Main slider inside the product grid."
  },
  flash: {
    label: "Flash Sale Card",
    width: 800,
    height: 1600,
    aspectRatio: "1:2",
    description: "Tall vertical card. Great for single product focus."
  },
  tile_new: {
    label: "New Arrivals Tile",
    width: 800,
    height: 800,
    aspectRatio: "1:1",
    description: "Square tile. Keep text minimal."
  },
  tile_student: {
    label: "Student/Audio Tile",
    width: 800,
    height: 800,
    aspectRatio: "1:1",
    description: "Square tile for special campaigns."
  },
  branch_slider: {
    label: "Branch Location Slider",
    width: 1200,
    height: 600,
    aspectRatio: "2:1",
    description: "Photos of the shop front, map view, or interior. Links to Google Maps."
  }
};

export interface Banner {
  id: string;
  slot: BannerSlot;
  image_url: string;
  link: string;
  is_active: boolean;
}

export interface HeroSlide {
  id: string;
  image_url: string;
  link_type: 'category' | 'product';
  link_target: string;
  is_active: boolean;
  // Legacy fields (optional support)
  title?: string;
  subtitle?: string;
  badge?: string;
}