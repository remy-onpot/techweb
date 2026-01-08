export const products = [
  // --- THE BENTO HERO ITEMS (Top 3) ---
  {
    id: 1,
    name: "HP EliteBook 1040 G8",
    category: "laptop",
    price: "7,800 GHS",
    // Image: Sleek silver laptop (looks like EliteBook)
    image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=1000",
    badge: "Business Class",
    specs: "i7 11th Gen | 16GB RAM | x360 Touch",
    bgColor: "bg-blue-600",
    description: "Premium business 2-in-1 with 16GB RAM and NVMe SSD."
  },
  {
    id: 2,
    name: "PS5 30th Anniversary",
    category: "gaming",
    price: "8,500 GHS",
    // Image: Gaming console vibe
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000", 
    badge: "Limited Edition",
    specs: "1TB SSD | Retro Grey Bundle",
    bgColor: "bg-purple-600",
    description: "Rare limited edition console. High resale value."
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    category: "audio",
    price: "4,200 GHS",
    // Image: Sleek headphones
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=1000",
    badge: "Top Rated",
    specs: "30Hr Battery | Best-in-Class ANC",
    bgColor: "bg-orange-500",
    description: "Industry leading noise canceling headphones."
  },

  // --- EXTRA INVENTORY (For Search Demo) ---
  {
    id: 4,
    name: "Samsung Odyssey OLED G9",
    category: "monitor",
    price: "15,000 GHS",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=1000",
    badge: "Ultrawide",
    specs: "49-inch | 240Hz | 0.03ms",
    bgColor: "bg-cyan-600",
    description: "The ultimate immersive gaming experience."
  },
  {
    id: 5,
    name: "Lenovo Yoga 9i",
    category: "laptop",
    price: "9,200 GHS",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&q=80&w=1000",
    badge: "Premium 2-in-1",
    specs: "i7 12th Gen | OLED Screen",
    bgColor: "bg-indigo-600",
    description: "Rotating soundbar and stunning OLED display."
  },
  {
    id: 6,
    name: "JBL BoomBox 3",
    category: "audio",
    price: "5,500 GHS",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=1000", // JBL vibe
    badge: "Party Monster",
    specs: "24H Playtime | Waterproof",
    bgColor: "bg-red-600",
    description: "Massive sound with deep bass."
  },
  {
    id: 7,
    name: "HP ZBook Firefly G7",
    category: "laptop",
    price: "6,500 GHS",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1000",
    badge: "Workstation",
    specs: "Core i5 | 1TB SSD",
    bgColor: "bg-gray-700",
    description: "Mobile workstation for creators."
  }
];

export const categories = [
  { name: "Laptops", id: "laptop", icon: "Laptop", color: "bg-blue-500" },
  { name: "Gaming", id: "gaming", icon: "Gamepad2", color: "bg-purple-500" },
  { name: "Audio", id: "audio", icon: "Headphones", color: "bg-orange-500" },
  { name: "Monitors", id: "monitor", icon: "Monitor", color: "bg-cyan-500" },
];