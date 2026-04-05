import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Package, Calendar, ShoppingBag, TrendingUp, Clock,
    Plus, Pencil, Trash2, X, PawPrint, Sun, Moon, Settings, Sparkles, User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserOrder {
    id: string;
    productId: string;
    product: string;
    image: string;
    date: string;
    status: 'Đang xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
    total: string;
}
interface UserBooking {
    id: string; service: string; pet: string;
    date: string; time: string;
    status: 'Chờ xác nhận' | 'Đã xác nhận' | 'Hoàn thành' | 'Đã hủy';
}
interface Pet {
    id: string; name: string; species: 'Chó' | 'Mèo' | 'Khác';
    breed: string; age: string; weight: string; notes: string;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">{children}</div>
            </div>
        </div>
    );
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INIT_ORDERS: UserOrder[] = [
    { id: 'ORD-001', productId: '1', product: 'Thức ăn chó hữu cơ cao cấp', image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=80&h=80&fit=crop', date: '08/02/2026', status: 'Hoàn thành', total: '$49.99' },
    { id: 'ORD-002', productId: '2', product: 'Cột cào móng mèo cao cấp', image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=80&h=80&fit=crop', date: '05/02/2026', status: 'Đang giao', total: '$89.99' },
    { id: 'ORD-003', productId: '3', product: 'Bộ dây dắt & vòng cổ chó', image: 'https://images.unsplash.com/photo-1600277971170-8a7d75fb1bd9?w=80&h=80&fit=crop', date: '01/02/2026', status: 'Đang xử lý', total: '$34.99' },
];
const INIT_BOOKINGS: UserBooking[] = [
    { id: 'BK-001', service: 'Spa thú cưng', pet: 'Max', date: '15/02/2026', time: '10:00', status: 'Đã xác nhận' },
    { id: 'BK-002', service: 'Khám sức khỏe', pet: 'Bella', date: '20/02/2026', time: '14:00', status: 'Chờ xác nhận' },
];
const INIT_PETS: Pet[] = [
    { id: 'PET-1', name: 'Max', species: 'Chó', breed: 'Golden Retriever', age: '3', weight: '28', notes: 'Thích chơi bóng' },
    { id: 'PET-2', name: 'Bella', species: 'Mèo', breed: 'British Shorthair', age: '2', weight: '4', notes: 'Dị ứng với tôm' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function orderBadge(s: string) {
    if (s === 'Hoàn thành') return 'bg-green-100 text-green-800 border-0 dark:bg-green-950/60 dark:text-green-300';
    if (s === 'Đang giao') return 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-950/60 dark:text-blue-300';
    if (s === 'Đã hủy') return 'bg-red-100 text-red-800 border-0 dark:bg-red-950/60 dark:text-red-300';
    return 'bg-orange-100 text-orange-800 border-0 dark:bg-orange-950/50 dark:text-orange-300';
}
function bookingBadge(s: string) {
    if (s === 'Hoàn thành') return 'bg-green-100 text-green-800 border-0 dark:bg-green-950/60 dark:text-green-300';
    if (s === 'Đã xác nhận') return 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-950/60 dark:text-blue-300';
    if (s === 'Đã hủy') return 'bg-red-100 text-red-800 border-0 dark:bg-red-950/60 dark:text-red-300';
    return 'bg-orange-100 text-orange-800 border-0 dark:bg-orange-950/50 dark:text-orange-300';
}

const SPECIES = ['Chó', 'Mèo', 'Khác'] as const;

const DASH_TABS = ['overview', 'orders', 'bookings', 'pets', 'profile', 'settings'] as const;
type DashTab = (typeof DASH_TABS)[number];

function parseDashTab(raw: string | null): DashTab {
    if (raw && (DASH_TABS as readonly string[]).includes(raw)) return raw as DashTab;
    return 'overview';
}

// ─── Main component ───────────────────────────────────────────────────────────
const UserDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { theme, setTheme } = useTheme();
    const activeTab = parseDashTab(searchParams.get('tab'));

    const setTab = (value: string) => {
        const t = parseDashTab(value);
        if (t === 'overview') setSearchParams({});
        else setSearchParams({ tab: t });
    };

    const [orders, setOrders] = useState<UserOrder[]>(INIT_ORDERS);
    const [bookings, setBookings] = useState<UserBooking[]>(INIT_BOOKINGS);
    const [pets, setPets] = useState<Pet[]>(INIT_PETS);

    // Pet modal
    const [petModal, setPetModal] = useState<'add' | 'edit' | null>(null);
    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [petForm, setPetForm] = useState<Omit<Pet, 'id'>>({ name: '', species: 'Chó', breed: '', age: '', weight: '', notes: '' });

    // Profile form
    const [profile, setProfile] = useState({ name: user?.name ?? '', phone: '0901234567', address: '123 Đường Lê Lợi, TP.HCM', bio: 'Yêu thú cưng từ nhỏ' });

    const cancelOrder = (id: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Đã hủy' } : o));
        toast.success('Đã hủy đơn hàng');
    };
    const cancelBooking = (id: string) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Đã hủy' } : b));
        toast.success('Đã hủy lịch đặt');
    };

    const openAddPet = () => {
        setPetForm({ name: '', species: 'Chó', breed: '', age: '', weight: '', notes: '' });
        setEditingPet(null);
        setPetModal('add');
    };
    const openEditPet = (p: Pet) => {
        setPetForm({ name: p.name, species: p.species, breed: p.breed, age: p.age, weight: p.weight, notes: p.notes });
        setEditingPet(p);
        setPetModal('edit');
    };
    const savePet = () => {
        if (!petForm.name.trim()) { toast.error('Vui lòng nhập tên thú cưng'); return; }
        if (petModal === 'add') {
            setPets(prev => [...prev, { id: 'PET-' + Date.now(), ...petForm }]);
            toast.success('Đã thêm thú cưng');
        } else if (editingPet) {
            setPets(prev => prev.map(p => p.id === editingPet.id ? { ...p, ...petForm } : p));
            toast.success('Đã cập nhật thú cưng');
        }
        setPetModal(null);
    };
    const deletePet = (id: string) => {
        setPets(prev => prev.filter(p => p.id !== id));
        toast.success('Đã xóa thú cưng');
    };

    const saveProfile = () => {
        toast.success('Đã cập nhật hồ sơ thành công');
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-br from-[#448B3D]/15 via-card to-muted/40 dark:from-[#448B3D]/25 dark:via-card dark:to-muted/20 p-6 sm:p-8 mb-8 shadow-sm">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#448B3D]/20 blur-3xl dark:bg-[#448B3D]/30" />
                <div className="pointer-events-none absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#448B3D]/10 blur-2xl" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="relative shrink-0">
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-4 border-background shadow-lg overflow-hidden bg-[#448B3D]/15 flex items-center justify-center">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-8 w-8 sm:h-10 sm:w-10 text-[#448B3D]" />
                                )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#448B3D] text-white shadow-md">
                                <Sparkles className="h-3.5 w-3.5" />
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-[#448B3D] dark:text-[#7CB878]">Trang cá nhân</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight truncate">
                                Xin chào, {user?.name ?? 'bạn'}
                            </h1>
                            <p className="text-muted-foreground text-sm mt-1 truncate">{user?.email ?? 'Quản lý đơn hàng, lịch và thú cưng'}</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                        <Button variant="outline" className="rounded-xl border-[#448B3D]/40 hover:bg-[#448B3D]/10" onClick={() => navigate('/products')}>
                            <ShoppingBag className="w-4 h-4 mr-2" />
                            Mua sắm
                        </Button>
                        <Button className="rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white" onClick={() => navigate('/booking')}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Đặt lịch
                        </Button>
                    </div>
                </div>
            </section>

            <Tabs value={activeTab} onValueChange={setTab} className="w-full">
                <TabsList className="mb-8 flex h-auto w-full flex-wrap justify-start gap-1.5 rounded-2xl bg-muted/70 p-1.5 border border-border">
                    <TabsTrigger
                        value="overview"
                        className="rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:text-[#448B3D] data-[state=active]:shadow-sm dark:data-[state=active]:text-[#7CB878]"
                    >
                        Tổng quan
                    </TabsTrigger>
                    <TabsTrigger
                        value="orders"
                        className="rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:text-[#448B3D] data-[state=active]:shadow-sm dark:data-[state=active]:text-[#7CB878]"
                    >
                        Đơn hàng
                    </TabsTrigger>
                    <TabsTrigger
                        value="bookings"
                        className="rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:text-[#448B3D] data-[state=active]:shadow-sm dark:data-[state=active]:text-[#7CB878]"
                    >
                        Lịch đặt
                    </TabsTrigger>
                    <TabsTrigger
                        value="pets"
                        className="rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:text-[#448B3D] data-[state=active]:shadow-sm dark:data-[state=active]:text-[#7CB878]"
                    >
                        Thú cưng
                    </TabsTrigger>
                    <TabsTrigger
                        value="profile"
                        className="rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:text-[#448B3D] data-[state=active]:shadow-sm dark:data-[state=active]:text-[#7CB878]"
                    >
                        Hồ sơ
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="rounded-xl px-4 py-2.5 data-[state=active]:bg-card data-[state=active]:text-[#448B3D] data-[state=active]:shadow-sm dark:data-[state=active]:text-[#7CB878]"
                    >
                        Cài đặt
                    </TabsTrigger>
                </TabsList>

                {/* ── Tổng quan ── */}
                <TabsContent value="overview" className="space-y-6 outline-none">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        {[
                            { icon: Package, label: 'Tổng đơn hàng', value: String(orders.length), color: 'bg-[#448B3D]', ring: 'ring-[#448B3D]/20' },
                            { icon: Calendar, label: 'Lịch đặt', value: String(bookings.length), color: 'bg-blue-500', ring: 'ring-blue-500/20' },
                            { icon: PawPrint, label: 'Thú cưng', value: String(pets.length), color: 'bg-orange-500', ring: 'ring-orange-500/20' },
                            { icon: TrendingUp, label: 'Tổng chi tiêu', value: '$174.97', color: 'bg-violet-500', ring: 'ring-violet-500/20' },
                        ].map(stat => (
                            <Card
                                key={stat.label}
                                className={cn(
                                    'relative overflow-hidden border-border/80 p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md',
                                    'bg-card/80 backdrop-blur-sm'
                                )}
                            >
                                <div className={cn('absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 blur-2xl', stat.color)} />
                                <div className={cn('mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md ring-4', stat.color, stat.ring)}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{stat.value}</p>
                            </Card>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <Card className="border-border/80 p-5 sm:p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#448B3D]/15 text-[#448B3D] dark:text-[#7CB878]">
                                    <Package className="h-4 w-4" />
                                </div>
                                <h2 className="font-semibold text-foreground">Đơn hàng gần đây</h2>
                            </div>
                            <div className="space-y-3">
                                {orders.slice(0, 2).map(o => (
                                    <div key={o.id} className="flex items-center gap-3">
                                        <Link
                                            to={`/products/${o.productId}`}
                                            className="flex flex-1 min-w-0 items-center gap-3 rounded-lg -m-1 p-1 hover:bg-muted/70 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#448B3D] focus-visible:ring-offset-2"
                                        >
                                            <img src={o.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{o.product}</p>
                                                <p className="text-xs text-muted-foreground">{o.id} · {o.date}</p>
                                            </div>
                                        </Link>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-semibold">{o.total}</p>
                                            <Badge className={`text-xs ${orderBadge(o.status)}`}>{o.status}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card className="border-border/80 p-5 sm:p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <h2 className="font-semibold text-foreground">Lịch đặt sắp tới</h2>
                            </div>
                            <div className="space-y-3">
                                {bookings.slice(0, 2).map(b => (
                                    <div key={b.id} className="flex items-center justify-between rounded-xl border border-border/80 bg-muted/30 p-3 dark:bg-muted/20">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{b.service}</p>
                                            <p className="text-xs text-muted-foreground">{b.pet} · {b.date} {b.time}</p>
                                        </div>
                                        <Badge className={`text-xs ${bookingBadge(b.status)}`}>{b.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            {
                                icon: ShoppingBag,
                                title: 'Mua sắm',
                                desc: 'Khám phá sản phẩm thú cưng',
                                onClick: () => navigate('/products'),
                                gradient: 'from-[#448B3D]/20 to-transparent dark:from-[#448B3D]/30',
                                iconClass: 'text-[#448B3D] dark:text-[#7CB878]',
                            },
                            {
                                icon: Calendar,
                                title: 'Đặt lịch',
                                desc: 'Lên lịch dịch vụ cho thú cưng',
                                onClick: () => navigate('/booking'),
                                gradient: 'from-blue-500/20 to-transparent dark:from-blue-500/25',
                                iconClass: 'text-blue-600 dark:text-blue-400',
                            },
                            {
                                icon: TrendingUp,
                                title: 'Tìm kiếm AI',
                                desc: 'Tìm sản phẩm bằng hình ảnh',
                                onClick: () => navigate('/image-search'),
                                gradient: 'from-violet-500/20 to-transparent dark:from-violet-500/25',
                                iconClass: 'text-violet-600 dark:text-violet-400',
                            },
                        ].map((tile) => (
                            <Card
                                key={tile.title}
                                role="button"
                                tabIndex={0}
                                onClick={tile.onClick}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tile.onClick(); } }}
                                className="group relative cursor-pointer overflow-hidden border-border/80 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[#448B3D]/30"
                            >
                                <div className={cn('pointer-events-none absolute inset-0 bg-linear-to-br opacity-0 transition-opacity group-hover:opacity-100', tile.gradient)} />
                                <tile.icon className={cn('relative mb-3 h-8 w-8', tile.iconClass)} />
                                <p className="relative font-semibold text-foreground">{tile.title}</p>
                                <p className="relative text-xs text-muted-foreground mt-1 leading-relaxed">{tile.desc}</p>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* ── Đơn hàng ── */}
                <TabsContent value="orders" className="space-y-4 outline-none">
                    <div className="space-y-3">
                        {orders.map(o => (
                            <Card key={o.id} className="border-border/80 p-4 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-center gap-4">
                                    <Link
                                        to={`/products/${o.productId}`}
                                        className="group flex flex-1 min-w-0 items-center gap-4 rounded-xl -m-1 p-1 hover:bg-muted/70 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#448B3D] focus-visible:ring-offset-2"
                                    >
                                        <img src={o.image} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate underline-offset-2 group-hover:underline">{o.product}</p>
                                            <p className="text-sm text-muted-foreground mt-0.5">{o.id} · {o.date}</p>
                                            <Badge className={`text-xs mt-1 ${orderBadge(o.status)}`}>{o.status}</Badge>
                                        </div>
                                    </Link>
                                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                                        <p className="font-semibold text-foreground">{o.total}</p>
                                        {o.status === 'Đang xử lý' && (
                                            <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => cancelOrder(o.id)}>
                                                Hủy
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {orders.length === 0 && <p className="text-center text-muted-foreground py-12">Chưa có đơn hàng nào</p>}
                    </div>
                </TabsContent>

                {/* ── Lịch đặt ── */}
                <TabsContent value="bookings" className="space-y-4 outline-none">
                    <div className="space-y-3">
                        {bookings.map(b => (
                            <Card key={b.id} className="border-border/80 p-4 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-[#448B3D]/15 flex items-center justify-center shrink-0 text-[#448B3D] dark:bg-[#448B3D]/25 dark:text-[#7CB878]">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{b.service}</p>
                                            <p className="text-sm text-muted-foreground">Thú cưng: {b.pet}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.date}</span>
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <Badge className={`text-xs ${bookingBadge(b.status)}`}>{b.status}</Badge>
                                        {b.status === 'Chờ xác nhận' && (
                                            <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={() => cancelBooking(b.id)}>
                                                Hủy
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                        {bookings.length === 0 && <p className="text-center text-muted-foreground py-12">Chưa có lịch đặt nào</p>}
                    </div>
                </TabsContent>

                {/* ── Thú cưng ── */}
                <TabsContent value="pets" className="space-y-4 outline-none">
                    <div className="flex justify-end mb-4">
                        <Button onClick={openAddPet} className="bg-[#448B3D] hover:bg-[#336B2D] text-white">
                            <Plus className="w-4 h-4" /> Thêm thú cưng
                        </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {pets.map(p => (
                            <Card key={p.id} className="border-border/80 p-5 shadow-sm transition-shadow hover:shadow-md">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-950/50 flex items-center justify-center ring-2 ring-orange-200/50 dark:ring-orange-900/50">
                                            <PawPrint className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-foreground">{p.name}</p>
                                            <p className="text-xs text-muted-foreground">{p.species} · {p.breed}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon-sm" variant="ghost" onClick={() => openEditPet(p)}>
                                            <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button size="icon-sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deletePet(p.id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-muted-foreground">Tuổi:</span> <span className="font-medium">{p.age} tuổi</span></div>
                                    <div><span className="text-muted-foreground">Cân nặng:</span> <span className="font-medium">{p.weight} kg</span></div>
                                </div>
                                {p.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{p.notes}"</p>}
                            </Card>
                        ))}
                        {pets.length === 0 && <p className="text-muted-foreground py-8 col-span-2 text-center">Chưa có thú cưng nào</p>}
                    </div>
                </TabsContent>

                {/* ── Hồ sơ ── */}
                <TabsContent value="profile" className="outline-none">
                    <Card className="max-w-lg border-border/80 p-6 shadow-md">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#448B3D]/15 text-[#448B3D] dark:text-[#7CB878]">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">Thông tin cá nhân</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="prof-name">Họ và tên</Label>
                                <Input id="prof-name" className="mt-1" value={profile.name} onChange={e => setProfile(f => ({ ...f, name: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="prof-email">Email</Label>
                                <Input id="prof-email" className="mt-1 opacity-60" value={user?.email ?? ''} readOnly />
                                <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
                            </div>
                            <div>
                                <Label htmlFor="prof-phone">Số điện thoại</Label>
                                <Input id="prof-phone" className="mt-1" value={profile.phone} onChange={e => setProfile(f => ({ ...f, phone: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="prof-address">Địa chỉ</Label>
                                <Input id="prof-address" className="mt-1" value={profile.address} onChange={e => setProfile(f => ({ ...f, address: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="prof-bio">Giới thiệu</Label>
                                <Textarea id="prof-bio" className="mt-1" rows={3} value={profile.bio} onChange={e => setProfile(f => ({ ...f, bio: e.target.value }))} />
                            </div>
                            <Button className="w-full bg-[#448B3D] hover:bg-[#336B2D] text-white" onClick={saveProfile}>
                                Lưu thay đổi
                            </Button>
                        </div>
                    </Card>
                </TabsContent>

                {/* ── Cài đặt ── */}
                <TabsContent value="settings" className="outline-none">
                    <Card className="max-w-xl overflow-hidden border-border/80 shadow-md">
                        <div className="border-b border-border bg-linear-to-r from-[#448B3D]/12 via-transparent to-violet-500/5 px-6 py-5 dark:from-[#448B3D]/25">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#448B3D]/15 text-[#448B3D] shadow-sm dark:bg-[#448B3D]/25 dark:text-[#7CB878]">
                                    <Settings className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Cài đặt giao diện</h2>
                                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                        Chọn chế độ sáng hoặc tối. Tùy chọn được lưu trên trình duyệt và áp dụng cho toàn bộ PetCare.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm font-semibold text-foreground">Chế độ hiển thị</p>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                                <button
                                    type="button"
                                    onClick={() => setTheme('light')}
                                    className={cn(
                                        'flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all',
                                        theme === 'light'
                                            ? 'border-[#448B3D] bg-[#448B3D]/10 shadow-sm dark:bg-[#448B3D]/20'
                                            : 'border-border bg-muted/30 hover:border-[#448B3D]/40 hover:bg-muted/50'
                                    )}
                                >
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                                        <Sun className="h-7 w-7" />
                                    </span>
                                    <span className="font-semibold text-foreground">Sáng</span>
                                    <span className="text-xs text-muted-foreground">Nền sáng, phù hợp ban ngày</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTheme('dark')}
                                    className={cn(
                                        'flex flex-col items-center gap-3 rounded-2xl border-2 p-6 text-center transition-all',
                                        theme === 'dark'
                                            ? 'border-[#448B3D] bg-[#448B3D]/10 shadow-sm dark:bg-[#448B3D]/25'
                                            : 'border-border bg-muted/30 hover:border-[#448B3D]/40 hover:bg-muted/50'
                                    )}
                                >
                                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-100 dark:bg-slate-950 dark:text-slate-200">
                                        <Moon className="h-7 w-7" />
                                    </span>
                                    <span className="font-semibold text-foreground">Tối</span>
                                    <span className="text-xs text-muted-foreground">Giảm chói, phù hợp buổi tối</span>
                                </button>
                            </div>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ── Pet Modal ── */}
            {petModal && (
                <Modal title={petModal === 'add' ? 'Thêm thú cưng' : 'Chỉnh sửa thú cưng'} onClose={() => setPetModal(null)}>
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="pet-name">Tên thú cưng</Label>
                            <Input id="pet-name" className="mt-1" placeholder="Nhập tên" value={petForm.name} onChange={e => setPetForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Loài</Label>
                            <Select value={petForm.species} onValueChange={v => setPetForm(f => ({ ...f, species: v as Pet['species'] }))}>
                                <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="pet-breed">Giống</Label>
                            <Input id="pet-breed" className="mt-1" placeholder="VD: Golden Retriever" value={petForm.breed} onChange={e => setPetForm(f => ({ ...f, breed: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="pet-age">Tuổi</Label>
                                <Input id="pet-age" type="number" className="mt-1" placeholder="0" value={petForm.age} onChange={e => setPetForm(f => ({ ...f, age: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="pet-weight">Cân nặng (kg)</Label>
                                <Input id="pet-weight" type="number" className="mt-1" placeholder="0" value={petForm.weight} onChange={e => setPetForm(f => ({ ...f, weight: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="pet-notes">Ghi chú</Label>
                            <Textarea id="pet-notes" className="mt-1" rows={2} placeholder="Dị ứng, thói quen..." value={petForm.notes} onChange={e => setPetForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button className="flex-1 bg-[#448B3D] hover:bg-[#336B2D] text-white" onClick={savePet}>Lưu</Button>
                            <Button variant="outline" className="flex-1" onClick={() => setPetModal(null)}>Hủy</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default UserDashboardPage;
