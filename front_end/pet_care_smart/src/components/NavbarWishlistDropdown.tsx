import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWishlist, type WishlistItem } from '@/context/WishlistContext';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';

function formatWishlistPrice(item: WishlistItem) {
    if (item.discount != null && item.discount > 0) {
        const final = item.price * (1 - item.discount / 100);
        return { display: `$${final.toFixed(2)}`, original: `$${item.price.toFixed(2)}` };
    }
    return { display: `$${item.price.toFixed(2)}`, original: null as string | null };
}

export default function NavbarWishlistDropdown() {
    const { wishlist, wishlistCount, removeFromWishlist } = useWishlist();
    const [mobileOpen, setMobileOpen] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        // Navigation should close the open mobile panel.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMobileOpen(false);
    }, [pathname]);

    const closeMobile = () => setMobileOpen(false);

    const renderPanel = () => (
        <div className='rounded-xl border-2 border-border bg-card shadow-xl overflow-hidden max-h-[min(70vh,22rem)] flex flex-col'>
            <div className='px-4 py-3 border-b border-border bg-[#448B3D]/5'>
                <p className='text-sm font-bold text-foreground'>Sản phẩm yêu thích</p>
                {wishlistCount > 0 && (
                    <p className='text-xs text-muted-foreground mt-0.5'>{wishlistCount} sản phẩm</p>
                )}
            </div>
            <div className='overflow-y-auto flex-1 p-2 min-h-16'>
                {wishlist.length === 0 ? (
                    <p className='text-sm text-muted-foreground text-center py-8 px-4'>
                        Chưa có sản phẩm nào. Hãy thêm từ trang sản phẩm!
                    </p>
                ) : (
                    <ul className='space-y-1'>
                        {wishlist.map((item) => {
                            const { display, original } = formatWishlistPrice(item);
                            return (
                                <li key={item.id}>
                                    <div className='flex gap-2 items-center rounded-lg p-1.5 hover:bg-muted/80 transition-colors'>
                                        <Link
                                            to={`/products/${item.id}`}
                                            onClick={closeMobile}
                                            className='flex gap-3 flex-1 min-w-0 py-0.5'
                                        >
                                            <img
                                                src={item.image}
                                                alt=''
                                                className='w-12 h-12 rounded-md object-cover shrink-0 bg-muted'
                                            />
                                            <div className='min-w-0 flex-1 text-left'>
                                                <p className='text-sm font-medium text-foreground line-clamp-2 leading-snug'>
                                                    {item.name}
                                                </p>
                                                <div className='flex flex-wrap items-baseline gap-x-1.5 mt-0.5'>
                                                    <span className='text-xs font-bold text-[#448B3D]'>{display}</span>
                                                    {original && (
                                                        <span className='text-[10px] text-muted-foreground line-through'>
                                                            {original}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                        <button
                                            type='button'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                removeFromWishlist(item.id);
                                            }}
                                            className='shrink-0 p-2 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors'
                                            aria-label={`Xóa ${item.name} khỏi yêu thích`}
                                        >
                                            <Trash2 className='w-4 h-4' />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            <div className='p-2 border-t border-border bg-muted/20'>
                <Button variant='outline' className='w-full border-[#448B3D]/40 text-[#448B3D] hover:bg-[#448B3D]/10' asChild>
                    <Link to='/products' onClick={closeMobile}>
                        Xem tất cả sản phẩm
                    </Link>
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop: mở khi hover cả vùng nút + panel */}
            <div className='relative hidden md:block group'>
                <Button
                    type='button'
                    variant='outline'
                    className={cn(
                        'rounded-lg relative border-[#448B3D] h-11 px-3 hover:bg-[#448B3D]/10',
                        wishlistCount > 0 && 'border-red-400/60'
                    )}
                    aria-label={`Sản phẩm yêu thích, ${wishlistCount} mục`}
                    aria-haspopup='true'
                >
                    <Heart
                        className={cn(
                            'w-5 h-5',
                            wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-[#448B3D]'
                        )}
                    />
                    {wishlistCount > 0 && (
                        <Badge className='absolute -top-2 -right-2 h-6 min-w-6 px-1 flex items-center justify-center bg-red-500 text-white text-xs border-2 border-card font-bold'>
                            {wishlistCount > 99 ? '99+' : wishlistCount}
                        </Badge>
                    )}
                    <span className='hidden lg:inline ml-2 text-sm font-semibold text-[#448B3D]'>Yêu thích</span>
                </Button>
                <div
                    className={cn(
                        'pointer-events-none absolute right-0 top-full z-60 w-80 max-w-[min(20rem,calc(100vw-2rem))] pt-2',
                        'opacity-0 translate-y-1 transition-all duration-150',
                        'group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0'
                    )}
                >
                    {renderPanel()}
                </div>
            </div>

            {/* Mobile: bấm để mở danh sách */}
            <div className='relative md:hidden'>
                <Button
                    type='button'
                    variant='outline'
                    className='rounded-lg relative border-[#448B3D] h-11 w-11 p-0 hover:bg-[#448B3D]/10'
                    onClick={() => setMobileOpen((o) => !o)}
                    aria-expanded={mobileOpen}
                    aria-haspopup='true'
                    aria-label={`Sản phẩm yêu thích, ${wishlistCount} mục`}
                >
                    <Heart
                        className={cn(
                            'w-5 h-5',
                            wishlistCount > 0 ? 'text-red-500 fill-red-500' : 'text-[#448B3D]'
                        )}
                    />
                    {wishlistCount > 0 && (
                        <Badge className='absolute -top-2 -right-2 h-5 min-w-5 px-0.5 flex items-center justify-center bg-red-500 text-white text-[10px] border-2 border-card font-bold'>
                            {wishlistCount > 99 ? '99+' : wishlistCount}
                        </Badge>
                    )}
                </Button>
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className='absolute right-0 top-full mt-2 z-60 w-80 max-w-[min(20rem,calc(100vw-1rem))]'
                        >
                            {renderPanel()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
