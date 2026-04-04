import { useState, useEffect, useMemo } from 'react';
import type { Product } from '../types';
import { fetchProducts } from '../mock-api/productsApi';

interface UseProductsOptions {
  category?: string;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  sort?: string;
}

interface UseProductsResult {
  products: Product[];
  allProducts: Product[];
  loading: boolean;
  error: string | null;
}

export function useProducts({
  category = 'all',
  maxPrice = 500000,
  minRating = 0,
  search = '',
  sort = 'default',
}: UseProductsOptions = {}): UseProductsResult {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts()
      .then(data => { if (!cancelled) { setAllProducts(data); setLoading(false); } })
      .catch((err: Error) => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const products = useMemo(() => {
    return allProducts
      .filter(p => category === 'all' || p.category === category)
      .filter(p => p.price <= maxPrice)
      .filter(p => p.rating >= minRating)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sort === 'price-asc')  return a.price - b.price;
        if (sort === 'price-desc') return b.price - a.price;
        if (sort === 'rating')     return b.rating - a.rating;
        return 0;
      });
  }, [allProducts, category, maxPrice, minRating, search, sort]);

  return { products, allProducts, loading, error };
}
