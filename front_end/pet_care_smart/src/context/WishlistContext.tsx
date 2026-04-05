import { createContext, useContext, useState, type ReactNode } from 'react';

export interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    discount?: number;
    rating?: number;
    reviews?: number;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (item: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    toggleWishlist: (item: WishlistItem) => void;
    isWishlisted: (id: string) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

    const addToWishlist = (item: WishlistItem) => {
        setWishlist(prev => prev.find(i => i.id === item.id) ? prev : [...prev, item]);
    };

    const removeFromWishlist = (id: string) => {
        setWishlist(prev => prev.filter(i => i.id !== id));
    };

    const toggleWishlist = (item: WishlistItem) => {
        setWishlist(prev =>
            prev.find(i => i.id === item.id)
                ? prev.filter(i => i.id !== item.id)
                : [...prev, item]
        );
    };

    const isWishlisted = (id: string) => wishlist.some(i => i.id === id);

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isWishlisted,
            wishlistCount: wishlist.length,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const ctx = useContext(WishlistContext);
    if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
    return ctx;
}
