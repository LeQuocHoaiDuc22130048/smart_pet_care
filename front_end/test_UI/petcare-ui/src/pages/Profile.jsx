import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Package, MapPin, Heart, Bell, Shield, LogOut,
  Edit3, Save, X, ChevronDown, ChevronUp, Camera,
  CheckCircle, Clock, Truck, Star, Phone, Mail, Home
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks/useToast';
import { orderHistory } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';

const GREEN = 'rgb(68,139,61)';

/* ─── Sidebar nav items ─────────────────────────────────────── */
const NAV_ITEMS = [
  { key: 'profile',   icon: <User className="w-4 h-4" />,    label: 'Thông tin cá nhân' },
  { key: 'orders',    icon: <Package className="w-4 h-4" />, label: 'Đơn hàng của tôi' },
  { key: 'addresses', icon: <MapPin className="w-4 h-4" />,  label: 'Địa chỉ giao hàng' },
  { key: 'wishlist',  icon: <Heart className="w-4 h-4" />,   label: 'Yêu thích' },
  { key: 'notify',    icon: <Bell className="w-4 h-4" />,    label: 'Thông báo' },
  { key: 'security',  icon: <Shield className="w-4 h-4" />,  label: 'Bảo mật' },
];

const PROFILE_FIELDS = [
  { key: 'name',    label: 'Họ và tên',     type: 'text',  icon: <User className="w-4 h-4" /> },
  { key: 'email',   label: 'Email',          type: 'email', icon: <Mail className="w-4 h-4" /> },
  { key: 'phone',   label: 'Số điện thoại', type: 'tel',   icon: <Phone className="w-4 h-4" /> },
  { key: 'pet',     label: 'Thú cưng',       type: 'text',  icon: <span className="text-sm">🐾</span> },
  { key: 'address', label: 'Địa chỉ',        type: 'text',  icon: <Home className="w-4 h-4" />, full: true },
];

/* ─── Order status icon ─────────────────────────────────────── */
function OrderStatusIcon({ status }) {
  if (status === 'Delivered') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (status === 'Shipped')   return <Truck className="w-4 h-4 text-blue-500" />;
  return <Clock className="w-4 h-4 text-amber-500" />;
}

/* ─── Order Card ────────────────────────────────────────────── */
function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card overflow-hidden">
      <button
        className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgb(68 139 61 / 0.1)' }}>
            <OrderStatusIcon status={order.status} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm">{order.id}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{order.date} · {order.items.length} sản phẩm</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-2">
          <StatusBadge status={order.status} />
          <span className="font-bold text-sm hidden sm:block" style={{ color: GREEN }}>
            {order.total.toLocaleString('vi-VN')}đ
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-700">
              <div className="space-y-2 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm text-neutral-600 dark:text-neutral-300">
                    <span className="truncate mr-4">{item.name} <span className="text-neutral-400">×{item.qty}</span></span>
                    <span className="font-medium shrink-0">{item.price.toLocaleString('vi-VN')}đ</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-700">
                <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Tổng cộng</span>
                <span className="font-bold" style={{ color: GREEN }}>{order.total.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex gap-2 mt-3">
                <button className="text-xs px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-green-400 transition-colors">
                  Xem chi tiết
                </button>
                {order.status === 'Delivered' && (
                  <button className="text-xs px-3 py-1.5 rounded-full border text-white transition-colors"
                    style={{ backgroundColor: GREEN, borderColor: GREEN }}>
                    Mua lại
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Profile Info Tab ──────────────────────────────────────── */
function ProfileTab({ user, setUser }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...user });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setUser(form);
    setSaving(false);
    setEditing(false);
    toast.success('Đã lưu thông tin', 'Thông tin cá nhân đã được cập nhật');
  };

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <div className="card p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="relative shrink-0">
          <img src={user.avatar} alt={user.name}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-neutral-700 shadow-md" />
          <button
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md bg-white dark:bg-neutral-700 hover:scale-110 transition-transform"
            style={{ border: `2px solid ${GREEN}` }}
            aria-label="Change avatar">
            <Camera className="w-3.5 h-3.5" style={{ color: GREEN }} />
          </button>
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{user.name}</h3>
          <p className="text-sm text-neutral-400 mt-0.5">{user.email}</p>
          <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ backgroundColor: 'rgb(68 139 61 / 0.1)', color: GREEN }}>
              🐾 {user.pet}
            </span>
          </div>
        </div>
        <div className="shrink-0">
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setForm({ ...user }); setEditing(false); }}>
                <X className="w-3.5 h-3.5" /> Hủy
              </Button>
              <Button size="sm" loading={saving} onClick={handleSave}>
                {!saving && <Save className="w-3.5 h-3.5" />} Lưu
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="card p-5 sm:p-6">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-5 text-base">Thông tin chi tiết</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PROFILE_FIELDS.map(field => (
            <div key={field.key} className={field.full ? 'sm:col-span-2' : ''}>
              <label htmlFor={`field-${field.key}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                <span className="text-neutral-400">{field.icon}</span>
                {field.label}
              </label>
              {editing ? (
                <input
                  id={`field-${field.key}`}
                  type={field.type}
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="input"
                />
              ) : (
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 py-2.5 px-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl">
                  {user[field.key] || <span className="text-neutral-400 italic">Chưa cập nhật</span>}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Orders Tab ────────────────────────────────────────────── */
function OrdersTab() {
  const statusCounts = {
    all: orderHistory.length,
    Delivered: orderHistory.filter(o => o.status === 'Delivered').length,
    Shipped: orderHistory.filter(o => o.status === 'Shipped').length,
    Processing: orderHistory.filter(o => o.status === 'Processing').length,
  };
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? orderHistory : orderHistory.filter(o => o.status === filter);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="card p-1 flex gap-1 overflow-x-auto">
        {[
          { key: 'all',        label: 'Tất cả' },
          { key: 'Processing', label: 'Đang xử lý' },
          { key: 'Shipped',    label: 'Đang giao' },
          { key: 'Delivered',  label: 'Đã giao' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="flex-1 min-w-max text-xs sm:text-sm font-medium px-3 py-2 rounded-xl transition-all duration-200 whitespace-nowrap"
            style={filter === f.key
              ? { backgroundColor: GREEN, color: 'white' }
              : { color: '#6b7280' }
            }>
            {f.label}
            <span className="ml-1.5 text-xs opacity-70">({statusCounts[f.key] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-neutral-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Không có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Addresses Tab ─────────────────────────────────────────── */
function AddressesTab() {
  const addresses = [
    { id: 1, label: 'Nhà riêng', name: 'Nguyễn Văn An', phone: '0901 234 567', address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM', default: true },
    { id: 2, label: 'Văn phòng', name: 'Nguyễn Văn An', phone: '0901 234 567', address: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM', default: false },
  ];
  return (
    <div className="space-y-4">
      {addresses.map(addr => (
        <div key={addr.id} className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{addr.label}</span>
              {addr.default && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: 'rgb(68 139 61 / 0.1)', color: GREEN }}>
                  Mặc định
                </span>
              )}
            </div>
            <button className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors shrink-0">Sửa</button>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{addr.name}</p>
          <p className="text-sm text-neutral-500 mt-0.5">{addr.phone}</p>
          <p className="text-sm text-neutral-500 mt-0.5">{addr.address}</p>
        </div>
      ))}
      <button className="w-full card p-4 border-2 border-dashed border-neutral-200 dark:border-neutral-600 text-sm font-medium transition-colors hover:border-green-400"
        style={{ color: GREEN }}>
        + Thêm địa chỉ mới
      </button>
    </div>
  );
}

/* ─── Wishlist Tab ──────────────────────────────────────────── */
function WishlistTab() {
  return (
    <div className="card p-12 text-center text-neutral-400">
      <Heart className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p className="font-medium text-neutral-600 dark:text-neutral-300">Danh sách yêu thích trống</p>
      <p className="text-sm mt-1">Thêm sản phẩm yêu thích để xem ở đây</p>
    </div>
  );
}

/* ─── Notify Tab ────────────────────────────────────────────── */
function NotifyTab() {
  const [settings, setSettings] = useState({
    orderUpdate: true, promotion: true, newProduct: false, reminder: true,
  });
  const labels = {
    orderUpdate: 'Cập nhật đơn hàng',
    promotion: 'Khuyến mãi & ưu đãi',
    newProduct: 'Sản phẩm mới',
    reminder: 'Nhắc nhở lịch hẹn',
  };
  return (
    <div className="card p-5 sm:p-6 space-y-4">
      <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">Cài đặt thông báo</h3>
      {Object.entries(settings).map(([key, val]) => (
        <div key={key} className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-700 last:border-0">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{labels[key]}</span>
          <button
            onClick={() => setSettings(s => ({ ...s, [key]: !s[key] }))}
            className="relative w-11 h-6 rounded-full transition-colors duration-200"
            style={{ backgroundColor: val ? GREEN : '#d1d5db' }}
            role="switch" aria-checked={val}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${val ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Security Tab ──────────────────────────────────────────── */
function SecurityTab() {
  return (
    <div className="space-y-4">
      <div className="card p-5 sm:p-6">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4">Đổi mật khẩu</h3>
        <div className="space-y-3">
          {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'].map(label => (
            <div key={label}>
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">{label}</label>
              <input type="password" className="input" placeholder="••••••••" />
            </div>
          ))}
          <Button className="mt-2">Cập nhật mật khẩu</Button>
        </div>
      </div>
      <div className="card p-5 sm:p-6">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-1">Xác thực 2 bước</h3>
        <p className="text-sm text-neutral-400 mb-4">Bảo vệ tài khoản của bạn với xác thực 2 bước</p>
        <Button variant="outline">Bật xác thực 2 bước</Button>
      </div>
    </div>
  );
}

/* ─── Tab content map ───────────────────────────────────────── */
function TabContent({ tab, user, setUser }) {
  switch (tab) {
    case 'profile':   return <ProfileTab user={user} setUser={setUser} />;
    case 'orders':    return <OrdersTab />;
    case 'addresses': return <AddressesTab />;
    case 'wishlist':  return <WishlistTab />;
    case 'notify':    return <NotifyTab />;
    case 'security':  return <SecurityTab />;
    default:          return null;
  }
}

/* ─── Main Profile Page ─────────────────────────────────────── */
export default function Profile() {
  const { user, setUser } = useApp();
  const [tab, setTab] = useState('profile');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const currentNav = NAV_ITEMS.find(n => n.key === tab);

  return (
    <div className="container-page py-8 sm:py-10">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">Tài khoản của tôi</h1>
        <p className="text-neutral-400 text-sm mt-1">Quản lý thông tin và đơn hàng của bạn</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar (desktop) ── */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-3">
          {/* User card */}
          <div className="card p-5 flex items-center gap-3">
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-neutral-900 dark:text-neutral-100 text-sm truncate">{user.name}</p>
              <p className="text-xs text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="card p-2" aria-label="Account navigation">
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => setTab(item.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                style={tab === item.key
                  ? { backgroundColor: 'rgb(68 139 61 / 0.1)', color: GREEN }
                  : { color: '#6b7280' }
                }
                aria-current={tab === item.key ? 'page' : undefined}>
                <span style={tab === item.key ? { color: GREEN } : { color: '#9ca3af' }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
            <div className="border-t border-neutral-100 dark:border-neutral-700 mt-2 pt-2">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </nav>
        </aside>

        {/* ── Mobile nav dropdown ── */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="w-full card p-4 flex items-center justify-between"
            aria-expanded={mobileNavOpen}>
            <div className="flex items-center gap-2" style={{ color: GREEN }}>
              {currentNav?.icon}
              <span className="font-semibold text-sm">{currentNav?.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${mobileNavOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {mobileNavOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden card mt-1 p-2">
                {NAV_ITEMS.map(item => (
                  <button key={item.key}
                    onClick={() => { setTab(item.key); setMobileNavOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left"
                    style={tab === item.key ? { backgroundColor: 'rgb(68 139 61 / 0.1)', color: GREEN } : { color: '#6b7280' }}>
                    <span style={tab === item.key ? { color: GREEN } : { color: '#9ca3af' }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <div className="border-t border-neutral-100 dark:border-neutral-700 mt-2 pt-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}>
              <TabContent tab={tab} user={user} setUser={setUser} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
