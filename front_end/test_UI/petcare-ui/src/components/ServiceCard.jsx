import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { StarRating } from './ui/StarRating';

export default memo(function ServiceCard({ service, selected, onClick }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`card card-hover p-6 flex flex-col gap-3 cursor-pointer transition-all duration-200 ${
        selected ? 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-neutral-900' : ''
      }`}
      aria-label={service.name}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="text-4xl" aria-hidden="true">{service.icon}</div>
      <div>
        <h3 className="font-bold text-neutral-800 dark:text-neutral-100 text-base leading-snug">{service.name}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{service.description}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-neutral-400">
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{service.duration}</span>
        <StarRating rating={service.rating} reviews={service.reviews} size="sm" />
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
          {service.price.toLocaleString('vi-VN')}đ
        </span>
        {!onClick && (
          <Link to={`/services?book=${service.id}`}
            className="btn-secondary btn-sm"
            aria-label={`Book ${service.name}`}>
            Đặt lịch <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </motion.article>
  );
});
