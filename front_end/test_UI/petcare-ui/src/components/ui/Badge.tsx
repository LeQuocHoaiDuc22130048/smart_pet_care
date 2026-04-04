import type { ProductBadge, OrderStatus } from '../../types';

const BADGE_VARIANTS: Record<NonNullable<ProductBadge>, string> = {
  'Best Seller': 'badge-orange',
  'Sale':        'badge-red',
  'New':         'badge-blue',
  'Top Rated':   'badge-purple',
};

export function Badge({ label }: { label: ProductBadge }) {
  if (!label) return null;
  const cls = BADGE_VARIANTS[label] ?? 'badge-neutral';
  return <span className={cls}>{label}</span>;
}

const STATUS_MAP: Record<OrderStatus, [string, string]> = {
  Delivered:  ['badge-green',   'Đã giao'],
  Processing: ['badge-orange',  'Đang xử lý'],
  Shipped:    ['badge-blue',    'Đang giao'],
  Cancelled:  ['badge-red',     'Đã hủy'],
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const [cls, label] = STATUS_MAP[status] ?? ['badge-neutral', status];
  return <span className={cls}>{label}</span>;
}
