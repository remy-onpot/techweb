"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Search, Menu, ChevronLeft, ChevronRight, Star, Truck, Shield, Headphones, CreditCard, Plus, Edit2, Trash2, X, Laptop, Gamepad2, Monitor, HeadphonesIcon, ArrowRight, Check } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  badge: string;
  specs: string;
  rating: number;
  featured: boolean;
  inStock: boolean;
}

const ModernEcommerce = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [heroProducts, setHeroProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const colors = {
    navy: "bg-[#0A2540]",
    orange: "bg-[#F97316]",
    orangeHover: "hover:bg-[#ea580c]",
    cyanText: "text-[#00AEEF]",
    offWhite: "bg-[#F9FAFB]",
    charcoal: "text-[#111827]",
    cardWhite: "bg-white",
  };

  useEffect(() => {
    loadProducts();
  }, []);

 const loadProducts = () => {
    // Check if we are in the browser
    if (typeof window === 'undefined') return;

    try {
      // Use standard localStorage instead of window.storage
      const saved = window.localStorage.getItem('payless_products');
      
      if (saved) {
        const allProducts = JSON.parse(saved);
        setProducts(allProducts);
        setHeroProducts(allProducts.filter((p: any) => p.featured).slice(0, 3));
      } else {
        // Initialize default products if nothing is saved
        const defaultProducts = [
          {
            id: Date.now(),
            name: "HP EliteBook 1040 G8",
            category: "laptop",
            price: 7800,
            image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=1200",
            badge: "Business Class",
            specs: "i7 11th Gen | 16GB RAM | x360 Touch",
            rating: 4.9,
            featured: true,
            inStock: true
          },
          {
            id: Date.now() + 1,
            name: "PS5 30th Anniversary",
            category: "gaming",
            price: 8500,
            image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800",
            badge: "Limited Edition",
            specs: "1TB SSD | Retro Grey Bundle",
            rating: 5.0,
            featured: true,
            inStock: true
          },
          {
            id: Date.now() + 2,
            name: "Sony WH-1000XM5",
            category: "audio",
            price: 4200,
            image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
            badge: "Top Rated",
            specs: "30Hr Battery | Best-in-Class ANC",
            rating: 4.8,
            featured: true,
            inStock: true
          },
          {
            id: Date.now() + 3,
            name: "Samsung Odyssey OLED G9",
            category: "monitor",
            price: 15000,
            image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000",
            badge: "Ultrawide",
            specs: "49-inch | 240Hz | 0.03ms",
            rating: 4.9,
            featured: false,
            inStock: true
          },
          {
            id: Date.now() + 4,
            name: "Lenovo Yoga 9i",
            category: "laptop",
            price: 9200,
            image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1000",
            badge: "Premium 2-in-1",
            specs: "i7 12th Gen | OLED Screen",
            rating: 4.7,
            featured: false,
            inStock: true
          },
          {
            id: Date.now() + 5,
            name: "JBL BoomBox 3",
            category: "audio",
            price: 5500,
            image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=1000",
            badge: "Party Monster",
            specs: "24H Playtime | Waterproof",
            rating: 4.6,
            featured: false,
            inStock: true
          },
          {
            id: Date.now() + 6,
            name: "HP ZBook Firefly G7",
            category: "laptop",
            price: 6500,
            image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1000",
            badge: "Workstation",
            specs: "Core i5 | 1TB SSD",
            rating: 4.5,
            featured: false,
            inStock: true
          },
          {
            id: Date.now() + 7,
            name: "Dell Latitude 7400",
            category: "laptop",
            price: 5800,
            image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
            badge: "Budget Pick",
            specs: "i5 8th Gen | 8GB RAM",
            rating: 4.4,
            featured: false,
            inStock: true
          }
        ];
        
        // Save defaults immediately so they persist
        window.localStorage.setItem('payless_products', JSON.stringify(defaultProducts));
        setProducts(defaultProducts);
        setHeroProducts(defaultProducts.filter((p: any) => p.featured).slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = (updatedProducts: any[]) => {
    try {
      window.localStorage.setItem('payless_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
      setHeroProducts(updatedProducts.filter(p => p.featured).slice(0, 3));
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Failed to save. Please try again.');
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    const newProduct = { ...productData, id: Date.now() };
    await saveProducts([...products, newProduct]);
    setShowAdminModal(false);
  };

  const updateProduct = async (productData: Omit<Product, 'id'>) => {
    if (!editingProduct) return;
    const updated = products.map(p => p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p);
    await saveProducts(updated);
    setShowAdminModal(false);
    setEditingProduct(null);
  };

  const deleteProduct = async (id: number) => {
    if (confirm('Delete this product?')) {
      await saveProducts(products.filter(p => p.id !== id));
    }
  };

  const categories = [
    { name: "All", id: "all", icon: <Star size={18} /> },
    { name: "Laptops", id: "laptop", icon: <Laptop size={18} /> },
    { name: "Gaming", id: "gaming", icon: <Gamepad2 size={18} /> },
    { name: "Audio", id: "audio", icon: <HeadphonesIcon size={18} /> },
    { name: "Monitors", id: "monitor", icon: <Monitor size={18} /> }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products.filter(p => !p.featured)
    : products.filter(p => p.category === activeCategory && !p.featured);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(heroProducts.length, 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroProducts.length]);

  return (
    <div className={`min-h-screen ${colors.offWhite}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${colors.navy} shadow-lg`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            
            {/* Logo */}
            <div className="flex items-center gap-0 cursor-pointer group">
              <span className={`text-xl md:text-2xl font-bold tracking-tight ${colors.cyanText}`}>
                Payless
              </span>
              <div className={`${colors.orange} px-1.5 py-0.5 ml-0.5 rounded-sm transform -skew-x-6 group-hover:skew-x-0 transition-transform`}>
                <span className="text-white font-bold text-base md:text-lg inline-block transform skew-x-6 group-hover:skew-x-0 transition-transform">
                  4tech
                </span>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-lg relative">
              <input 
                type="text" 
                placeholder="Search laptops, consoles, phones..." 
                className="w-full bg-[#163455] border border-[#2a4d75] rounded-lg py-2.5 pl-12 pr-4 text-sm text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-4 top-2.5 text-blue-300 w-4 h-4" />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => setIsAdmin(!isAdmin)}
                className="hidden md:flex p-2 hover:bg-white/10 rounded-full text-blue-100 transition"
              >
                <User size={22} />
              </button>
              
              <button className="relative p-2 hover:bg-white/10 rounded-full text-white transition">
                <Heart className="w-5 h-5 md:w-6 md:h-6" />
                {wishlistCount > 0 && (
                  <span className={`absolute -top-1 -right-1 ${colors.orange} text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center`}>
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button className="relative p-2 hover:bg-white/10 rounded-full text-white transition">
                <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
                {cartCount > 0 && (
                  <span className={`absolute -top-1 -right-1 ${colors.orange} text-white text-[10px] font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center border-2 border-[#0A2540]`}>
                    {cartCount}
                  </span>
                )}
              </button>

              <button className="md:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-[#163455] border border-[#2a4d75] rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-2.5 text-blue-300 w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Bento Grid */}
      <section className="pt-6 md:pt-8 pb-8 md:pb-10 px-4">
        <div className="container mx-auto max-w-7xl">
          {isAdmin && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => { setEditingProduct(null); setShowAdminModal(true); }}
                className={`${colors.orange} text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm`}
              >
                <Plus size={18} /> Add Product
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20">Loading...</div>
          ) : heroProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-4 md:gap-5 md:h-[550px]">
              {/* Main Hero Card */}
              <div className="col-span-1 md:col-span-8 md:row-span-2 relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-white group h-[400px] md:h-auto">
                <div className="relative z-20 flex flex-col justify-between p-6 md:p-8 h-full md:w-1/2">
                  <div>
                    {heroProducts[0]?.badge && (
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-blue-50 text-[#0A2540]">
                        {heroProducts[0].badge}
                      </span>
                    )}
                    <h2 className="text-2xl md:text-4xl font-extrabold leading-tight mb-2 text-gray-900">
                      {heroProducts[0]?.name || 'Featured Product'}
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base font-medium mb-4">
                      {heroProducts[0]?.specs}
                    </p>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-2xl md:text-3xl font-bold text-gray-900">
                        ₵{heroProducts[0]?.price?.toLocaleString()}
                      </span>
                      {heroProducts[0]?.inStock && (
                        <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                          <Check size={16} /> In Stock
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => setCartCount(c => c + 1)}
                        className={`${colors.orange} ${colors.orangeHover} text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all`}
                      >
                        Buy Now <ArrowRight size={16} />
                      </button>
                      {isAdmin && heroProducts[0] && (
                        <button
                          onClick={() => { setEditingProduct(heroProducts[0]); setShowAdminModal(true); }}
                          className="p-2.5 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <Edit2 size={18} className="text-gray-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute right-0 top-0 w-full md:w-1/2 h-full bg-gradient-to-br from-blue-50 to-purple-50">
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
                  <img 
                    src={heroProducts[0]?.image} 
                    alt={heroProducts[0]?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              {/* Small Cards */}
              {heroProducts.slice(1, 3).map((product, idx) => (
                <div 
                  key={product.id}
                  className="col-span-1 md:col-span-4 relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all bg-white group h-[250px]"
                >
                  <div className="relative z-20 p-5 h-full flex flex-col justify-between">
                    <div>
                      {product.badge && (
                        <span className="inline-block px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 mb-2">
                          {product.badge}
                        </span>
                      )}
                      <h3 className="text-xl font-bold mb-1 text-gray-900">{product.name}</h3>
                      <p className="text-xs text-gray-600">{product.specs}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-900">₵{product.price.toLocaleString()}</span>
                      <button 
                        onClick={() => setCartCount(c => c + 1)}
                        className={`${colors.orange} text-white p-2 rounded-lg hover:bg-orange-600 transition`}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="absolute right-0 top-0 w-2/5 h-full opacity-30 group-hover:opacity-50 transition-opacity">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-4">No featured products yet</p>
              {isAdmin && (
                <button
                  onClick={() => { setEditingProduct(null); setShowAdminModal(true); }}
                  className={`${colors.orange} text-white px-6 py-3 rounded-lg font-semibold`}
                >
                  Add Your First Product
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Category Pills */}
      <section className="mb-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap border
                  ${activeCategory === cat.id 
                    ? `${colors.navy} text-white border-transparent shadow-md` 
                    : 'bg-white border-[#0A2540] text-[#0A2540] hover:bg-gray-50'
                  }
                `}
              >
                {cat.icon}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group relative"
              >
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    <button
                      onClick={() => { setEditingProduct(product); setShowAdminModal(true); }}
                      className="bg-white p-1.5 rounded-lg shadow-md hover:bg-blue-50"
                    >
                      <Edit2 size={14} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="bg-white p-1.5 rounded-lg shadow-md hover:bg-red-50"
                    >
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                )}

                <div className="relative h-32 md:h-44 bg-gray-100 rounded-xl overflow-hidden mb-3">
                  {product.badge && (
                    <span className={`absolute top-2 left-2 ${colors.orange} text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm z-10`}>
                      {product.badge}
                    </span>
                  )}
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {!isAdmin && (
                    <button
                      onClick={() => setWishlistCount(w => w + 1)}
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-red-50"
                    >
                      <Heart size={14} className="text-gray-600" />
                    </button>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-bold text-gray-500">{product.rating || 4.5}</span>
                  </div>
                  <h3 className="font-bold text-sm md:text-base leading-tight mb-1 text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">{product.specs}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-base md:text-lg font-bold text-gray-900">
                      ₵{product.price?.toLocaleString()}
                    </span>
                    <button 
                      onClick={() => setCartCount(c => c + 1)}
                      className="p-2 rounded-lg border border-[#0A2540] text-[#0A2540] hover:bg-blue-50 transition"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Modal */}
      {showAdminModal && (
        <AdminModal
          product={editingProduct}
          onSave={editingProduct ? updateProduct : addProduct}
          onClose={() => { setShowAdminModal(false); setEditingProduct(null); }}
        />
      )}

      {/* Trust Footer */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Truck size={24} />, text: "Free Delivery", sub: "On orders over ₵2000" },
              { icon: <Shield size={24} />, text: "Warranty", sub: "1 Year Guarantee" },
              { icon: <Headphones size={24} />, text: "Support", sub: "24/7 Assistance" },
              { icon: <Star size={24} />, text: "Trusted", sub: "100% Genuine Tech" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-3">
                <div className="text-[#0A2540] p-3 bg-blue-50 rounded-full">{item.icon}</div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{item.text}</p>
                  <p className="text-xs text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A2540] text-gray-300 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-0 mb-4">
                <span className="text-2xl font-bold text-[#00AEEF]">Payless</span>
                <div className="bg-[#F97316] px-1.5 py-0.5 ml-0.5 rounded-sm transform -skew-x-6">
                  <span className="text-white font-bold text-lg inline-block transform skew-x-6">4tech</span>
                </div>
              </div>
              <p className="text-sm">Premium tech at unbeatable prices. Accra's trusted gadget store.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Shop</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Laptops</a></li>
                <li><a href="#" className="hover:text-white transition">Gaming</a></li>
                <li><a href="#" className="hover:text-white transition">Audio</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Warranty</a></li>
                <li><a href="#" className="hover:text-white transition">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Newsletter</h4>
              <div className="flex gap-2">
                <input type="email" placeholder="Your email" className="bg-[#163455] px-3 py-2 rounded-lg flex-1 text-sm outline-none" />
                <button className="bg-[#F97316] px-4 py-2 rounded-lg hover:bg-[#ea580c] transition font-semibold text-sm">
                  Join
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center text-sm">
            <p>© 2026 Payless4tech. All rights reserved. Made in Accra 🇬🇭</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface AdminModalProps {
  product: Product | null;
  onSave: (data: Omit<Product, 'id'>) => void;
  onClose: () => void;
}

const AdminModal = ({ product, onSave, onClose }: AdminModalProps) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    category: 'laptop',
    price: '' as string | number,
    rating: '4.5' as string | number,
    image: '',
    badge: '',
    specs: '',
    featured: false,
    inStock: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Name and price are required');
      return;
    }
    onSave({ ...formData, price: parseFloat(String(formData.price)), rating: parseFloat(String(formData.rating)) });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
          <h3 className="text-xl font-bold">{product ? 'Edit' : 'Add'} Product</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] outline-none"
              placeholder="e.g. HP EliteBook 1040 G8"
            />
          </div>

          {/* Price & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Price (GHS) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] outline-none bg-white"
              >
                <option value="laptop">Laptop</option>
                <option value="gaming">Gaming</option>
                <option value="audio">Audio</option>
                <option value="monitor">Monitor</option>
              </select>
            </div>
          </div>

          {/* Specs & Image Row */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Specs Summary</label>
              <input
                type="text"
                value={formData.specs}
                onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] outline-none"
                placeholder="e.g. i7 11th Gen | 16GB RAM"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Image URL</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] outline-none"
                placeholder="https://images.unsplash.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">Use a transparent PNG for best results.</p>
            </div>
          </div>

          {/* Badge & Rating Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Badge (Optional)</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] outline-none"
                placeholder="e.g. Best Seller"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] outline-none"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-8 py-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316]"
              />
              <span className="text-sm font-medium text-gray-700">Featured (Hero)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-4 h-4 text-[#F97316] rounded focus:ring-[#F97316]"
              />
              <span className="text-sm font-medium text-gray-700">In Stock</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#F97316] text-white rounded-lg font-semibold hover:bg-[#ea580c] transition shadow-md"
            >
              {product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModernEcommerce;