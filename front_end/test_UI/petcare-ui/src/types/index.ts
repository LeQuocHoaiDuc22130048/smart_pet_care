// ─── Domain types ────────────────────────────────────────────

export type ProductCategory = 'food' | 'accessories' | 'healthcare';
export type ProductBadge = 'Best Seller' | 'Sale' | 'New' | 'Top Rated' | null;

export interface Product {
  id: number;
  name: string;
  category: ProductCategory;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  badge: ProductBadge;
  description: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Service {
  id: number;
  name: string;
  icon: string;
  price: number;
  duration: string;
  description: string;
  rating: number;
  reviews: number;
}

export interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  pet: string;
}

export type OrderStatus = 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

export interface User {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  pet: string;
}

// ─── App context ─────────────────────────────────────────────

export interface AppContextValue {
  cart: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  user: User;
  setUser: (u: User) => void;
}

// ─── Toast ───────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  message?: string;
  duration?: number;
}

export interface ToastFn {
  (opts: ToastOptions): number;
  success: (title: string, message?: string) => number;
  error:   (title: string, message?: string) => number;
  warning: (title: string, message?: string) => number;
  info:    (title: string, message?: string) => number;
}

// ─── Misc ────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md' | 'lg';
export type StarSize      = 'sm' | 'md';
export type ModalSize     = 'sm' | 'md' | 'lg' | 'xl';
