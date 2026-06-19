import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { cartApi, type CartItem as ApiCartItem } from '@/lib/cartApi';
import { productApi, type Product } from '@/lib/productApi';

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
const fallbackImage = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop';

function getPrimaryImage(product: Product): string | undefined {
    const primary = product.images?.find((image) => image.isPrimary);
    return primary?.imageUrl ?? product.images?.[0]?.imageUrl;
}

// ─── Map API cart item → local cart item ─────────────────────────────────────
function mapApiItem(item: ApiCartItem, image?: string, category = ''): CartItem {
    return {
        id: item.productId,
        itemId: item.id,
        name: item.productName,
        price: item.unitPrice ?? 0,
        quantity: item.quantity,
        image: item.imageUrl || image || fallbackImage,
        category,
    };
}

async function mapApiItems(items: ApiCartItem[], currentCart: CartItem[] = []): Promise<CartItem[]> {
    return Promise.all(items.map(async (item) => {
        const existing = currentCart.find((cartItem) => cartItem.id === item.productId);
        const existingImage = existing?.image && existing.image !== fallbackImage ? existing.image : undefined;

        if (item.imageUrl || existingImage) {
            return mapApiItem(item, existingImage, existing?.category);
        }

        try {
            const product = (await productApi.getById(item.productId)).result;
            if (!product) return mapApiItem(item, undefined, existing?.category);
            return mapApiItem(item, getPrimaryImage(product), product.category?.map((c) => c.categoryName).join(', ') || existing?.category);
        } catch {
            return mapApiItem(item, undefined, existing?.category);
        }
    }));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const cartRef = useRef<CartItem[]>([]);

    useEffect(() => {
        cartRef.current = cart;
    }, [cart]);

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
            const nextCart = await mapApiItems(items, cartRef.current);
            setCart(nextCart);
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
            const nextCart = await mapApiItems(res.result?.items ?? [], [{ ...item, quantity: 1 }, ...cartRef.current]);
            setCart(nextCart);
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
                const nextCart = await mapApiItems(res.result?.items ?? [], cartRef.current.filter((i) => i.id !== productId));
                setCart(nextCart);
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
                const nextCart = await mapApiItems(res.result?.items ?? [], cartRef.current);
                setCart(nextCart);
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
