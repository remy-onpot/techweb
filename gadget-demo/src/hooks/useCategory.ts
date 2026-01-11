import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, CategorySection } from '@/lib/types';
import { matchesRules } from '@/lib/filter-engine';

export interface SectionWithData extends CategorySection {
  products: Product[];
}

export const useCategory = (slug: string) => {
  const [sections, setSections] = useState<SectionWithData[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategoryData();
  }, [slug]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      // 1. Fetch the Layout Configuration (Admin Rules)
      const { data: layoutData, error: layoutError } = await supabase
        .from('category_sections')
        .select('*')
        .eq('category_slug', slug)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (layoutError) throw layoutError;

      // 2. Fetch Raw Products for this Category
      // Optimization: We fetch ALL products for the category once, then filter in memory.
      // This is much faster than making 10 DB calls for 10 rows.
      const { data: productData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .eq('category', slug);

      if (prodError) throw prodError;

      const rawProducts = (productData as any[]) || [];
      setAllProducts(rawProducts); // Keep raw list for "View All" grid later

      // 3. THE MAGIC: Apply Rules to Create Rows
      const processedSections = (layoutData as CategorySection[]).map(section => {
        // If it's a Brand Row, we don't need to filter products yet (handled by UI)
        if (section.section_type === 'brand_row') {
           return { ...section, products: rawProducts }; 
        }

        // If it's a Product Row, run the Engine
        const filtered = rawProducts.filter(p => matchesRules(p, section.filter_rules));
        
        // Limit to 8 items for the horizontal scroll (Performance)
        return { ...section, products: filtered.slice(0, 8) };
      });

      // Filter out empty sections to avoid ugly gaps
      const validSections = processedSections.filter(s => 
        s.section_type === 'brand_row' || s.products.length > 0
      );

      setSections(validSections);

    } catch (err: any) {
      console.error("Category Load Failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { sections, allProducts, loading, error };
};