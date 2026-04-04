import { Star } from 'lucide-react';
import type { StarSize } from '../../types';

interface StarRatingProps {
  rating: number;
  reviews?: number;
  size?: StarSize;
}

export function StarRating({ rating, reviews, size = 'sm' }: StarRatingProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  return (
    <div className="flex items-center gap-1.5" aria-label={`${rating} out of 5 stars`}>
      <div className="flex">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={`${iconSize} ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-neutral-200 dark:text-neutral-600'}`} />
        ))}
      </div>
      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{rating}</span>
      {reviews !== undefined && <span className="text-xs text-neutral-400">({reviews.toLocaleString()})</span>}
    </div>
  );
}
