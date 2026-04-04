import type { Product, Service } from '../types';
import { products, services } from '../data/mockData';

const delay = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

async function simulateFetch<T>(data: T, ms = 700): Promise<T> {
  await delay(ms);
  return data;
}

export const fetchProducts = (): Promise<Product[]> =>
  simulateFetch([...products]);

export const fetchProductById = (id: number | string): Promise<Product | null> =>
  simulateFetch(products.find(p => p.id === +id) ?? null, 500);

export const fetchServices = (): Promise<Service[]> =>
  simulateFetch([...services], 600);

export const fetchRecommendations = (productId: number): Promise<Product[]> =>
  simulateFetch(products.filter(p => p.id !== productId).slice(0, 6), 800);
