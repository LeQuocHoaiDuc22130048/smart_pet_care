import { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import type { AppContextValue, CartItem, Product, User } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_USER: User = {
  name: "Nguyễn Văn An",
  email: "an.nguyen@email.com",
  phone: "0901 234 567",
  address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  avatar: "https://placehold.co/100x100/fde68a/92400e?text=AN",
  pet: "Golden Retriever - Max, 2 tuổi",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart]         = useLocalStorage<CartItem[]>('petcare_cart', []);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('petcare_dark', false);
  const [user, setUser]         = useLocalStorage<User>('petcare_user', DEFAULT_USER);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
  }, [setCart]);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, [setCart]);

  const updateQty = useCallback((id: number, qty: number) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }, [setCart, removeFromCart]);

  const clearCart = useCallback(() => setCart([]), [setCart]);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartTotal, cartCount,
      darkMode, setDarkMode,
      user, setUser,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
