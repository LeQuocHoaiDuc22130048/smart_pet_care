import { Heart } from 'lucide-react';
import { useWishlist, type WishlistItem } from '@/context/WishlistContext';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface Props {
    item: WishlistItem;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    showLabel?: boolean;
}

const WishlistButton = ({ item, size = 'md', className, showLabel = false }: Props) => {
    const { toggleWishlist, isWishlisted } = useWishlist();
    const liked = isWishlisted(item.id);

    const iconSize = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }[size];
    const btnSize = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-11 h-11' }[size];

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        toggleWishlist(item);
        toast.success(liked ? 'Đã xóa khỏi yêu thích' : '❤️ Đã thêm vào yêu thích');
    };

    return (
        <motion.button
            onClick={handleClick}
            whileTap={{ scale: 0.85 }}
            className={cn(
                'flex items-center justify-center rounded-full border-2 transition-all duration-200',
                liked
                    ? 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-500'
                    : 'border-border bg-card text-muted-foreground hover:border-red-300 hover:text-red-400',
                showLabel ? 'gap-1.5 px-3 rounded-xl' : btnSize,
                className
            )}
            aria-label={liked ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
        >
            <Heart className={cn(iconSize, liked && 'fill-red-500')} />
            {showLabel && (
                <span className='text-sm font-medium'>
                    {liked ? 'Đã thích' : 'Yêu thích'}
                </span>
            )}
        </motion.button>
    );
};

export default WishlistButton;
