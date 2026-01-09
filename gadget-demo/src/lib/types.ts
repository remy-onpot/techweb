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
  title: string;
  subtitle: string;
  badge: string;
  price: string;
  image_url: string;
  theme: 'dark' | 'light' | 'purple' | 'orange';
  is_active: boolean;
}