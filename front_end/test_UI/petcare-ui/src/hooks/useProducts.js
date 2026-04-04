import { useState, useEffect, useMemo } from 'react';
import { fetchProducts } from '../mock-api/productsApi';

export function useProducts({ category = 'all', maxPrice = 500000, minRating = 0, search = '', sort = 'default' } = {}) {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProducts()
      .then(data => { if (!cancelled) { setAllProducts(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
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

  return { products: filtered, allProducts, loading, error };
}
