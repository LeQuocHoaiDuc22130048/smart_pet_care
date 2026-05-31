import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { cartApi, type CartItem as ApiCartItem } from '@/lib/cartApi';

// ─── Local cart item (UI shape) ───────────────────────────────────────────────
export interface CartItem {
    id: string;       // productId (used as key in local cart)
    itemId?: string;  // server-side cart item id
    name: string;
    price: number;
    quantity: number;
    image: string;
    category: string;
}

interface CartContextType {
    cart: CartItem[];
    isLoading: boolean;
    addToCart: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
    removeFromCart: (id: string) => Promise<void>;
    updateQuantity: (id: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    cartCount: number;
    syncCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Map API cart item → local cart item ─────────────────────────────────────
function mapApiItem(item: ApiCartItem): CartItem {
    // Nếu không có imageUrl từ backend, sẽ dùng placeholder
    // Frontend sẽ cần fetch product detail để lấy ảnh thật
    const fallbackImage = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop';

    return {
        id: item.productId,
        itemId: item.id,
        name: item.productName,
        price: item.unitPrice ?? 0,
        quantity: item.quantity,
        image: item.imageUrl || fallbackImage,
        category: '',
    };
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // ── Sync cart from server ─────────────────────────────────────────────────
    const syncCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart([]);
            return;
        }
        setIsLoading(true);
        try {
            const res = await cartApi.getCart();
            const items = res.result?.items ?? [];
            setCart(items.map(mapApiItem));
        } catch (err) {
            console.error('[CartContext] Error syncing cart:', err);
            // silently fail — keep local state
            setCart([]);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        syncCart();
    }, [syncCart]);

    // ── Add to cart ───────────────────────────────────────────────────────────
    const addToCart = async (item: Omit<CartItem, 'quantity'>) => {
        if (!isAuthenticated) {
            // Optimistic local update for guests
            setCart((prev) => {
                const existing = prev.find((i) => i.id === item.id);
                if (existing) {
                    return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
                }
                return [...prev, { ...item, quantity: 1 }];
            });
            return;
        }

        try {
            const res = await cartApi.addItem(item.id, 1);
            setCart((res.result?.items ?? []).map(mapApiItem));
        } catch {
            // Fallback to local
            setCart((prev) => {
                const existing = prev.find((i) => i.id === item.id);
                if (existing) {
                    return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
                }
                return [...prev, { ...item, quantity: 1 }];
            });
        }
    };

    // ── Remove from cart ──────────────────────────────────────────────────────
    const removeFromCart = async (productId: string) => {
        const item = cart.find((i) => i.id === productId);
        if (!item) return;

        // Optimistic update
        setCart((prev) => prev.filter((i) => i.id !== productId));

        if (isAuthenticated && item.itemId) {
            try {
                const res = await cartApi.removeItem(item.itemId);
                setCart((res.result?.items ?? []).map(mapApiItem));
            } catch {
                // revert
                setCart((prev) => [...prev, item]);
            }
        }
    };

    // ── Update quantity ───────────────────────────────────────────────────────
    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        const item = cart.find((i) => i.id === productId);
        if (!item) return;

        // Optimistic update
        setCart((prev) => prev.map((i) => i.id === productId ? { ...i, quantity } : i));

        if (isAuthenticated && item.itemId) {
            try {
                const res = await cartApi.updateItem(item.itemId, quantity);
                setCart((res.result?.items ?? []).map(mapApiItem));
            } catch {
                // revert
                setCart((prev) => prev.map((i) => i.id === productId ? { ...i, quantity: item.quantity } : i));
            }
        }
    };

    // ── Clear cart ────────────────────────────────────────────────────────────
    const clearCart = async () => {
        setCart([]);
        if (isAuthenticated) {
            try {
                await cartApi.clearCart();
            } catch {
                // ignore
            }
        }
    };

    const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                isLoading,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                syncCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
