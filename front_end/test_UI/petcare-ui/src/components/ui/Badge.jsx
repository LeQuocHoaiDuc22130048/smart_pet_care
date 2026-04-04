const variants = {
  'Best Seller': 'badge-orange',
  'Sale':        'badge-red',
  'New':         'badge-blue',
  'Top Rated':   'badge-purple',
  default:       'badge-neutral',
};

export function Badge({ label }) {
  if (!label) return null;
  const cls = variants[label] || variants.default;
  return <span className={cls}>{label}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    Delivered: ['badge-green',   'Đã giao'],
    Processing:['badge-orange',  'Đang xử lý'],
    Shipped:   ['badge-blue',    'Đang giao'],
    Cancelled: ['badge-red',     'Đã hủy'],
  };
  const [cls, label] = map[status] || ['badge-neutral', status];
  return <span className={cls}>{label}</span>;
}
