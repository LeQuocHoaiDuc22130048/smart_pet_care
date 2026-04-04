import { products, services } from '../data/mockData';

const delay = (ms) => new Promise(r => setTimeout(r, ms));

// Simulate network latency + occasional errors
const simulateFetch = async (data, ms = 700, errorRate = 0) => {
  await delay(ms);
  if (Math.random() < errorRate) throw new Error('Network error. Please try again.');
  return data;
};

export const fetchProducts = () => simulateFetch([...products]);
export const fetchProductById = (id) => simulateFetch(products.find(p => p.id === +id) || null, 500);
export const fetchServices = () => simulateFetch([...services], 600);
export const fetchRecommendations = (productId) =>
  simulateFetch(products.filter(p => p.id !== productId).slice(0, 6), 800);
