import { useRef, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { orderApi, type Order } from '@/lib/orderApi';
import { userApi, type Pet as ApiPet, type UserProfile } from '@/lib/userApi';
import { DashboardThemeSettings } from '@/components/dashboard/DashboardThemeSettings';
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
    Plus, Pencil, Trash2, X, PawPrint, Settings, Sparkles, User as UserIcon, Camera, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserBooking {
    id: string; service: string; pet: string;
    date: string; time: string;
    status: 'Chờ xác nhận' | 'Đã xác nhận' | 'Hoàn thành' | 'Đã hủy';
}
interface Pet {
    id: string; name: string; species: string;
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
const INIT_BOOKINGS: UserBooking[] = [
    { id: 'BK-001', service: 'Spa thú cưng', pet: 'Max', date: '15/02/2026', time: '10:00', status: 'Đã xác nhận' },
    { id: 'BK-002', service: 'Khám sức khỏe', pet: 'Bella', date: '20/02/2026', time: '14:00', status: 'Chờ xác nhận' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function orderStatusLabel(s: string): string {
    const map: Record<string, string> = {
        PENDING: 'Đang xử lý', RESERVED: 'Đã giữ hàng',
        PAYMENT_PENDING: 'Chờ thanh toán', PAID: 'Đã thanh toán',
        CONFIRMED: 'Đã xác nhận', FAILED: 'Thất bại',
        PAYMENT_FAILED: 'TT thất bại', CANCELLED: 'Đã hủy',
    };
    return map[s] ?? s;
}
function orderBadge(s: string) {
    if (s === 'CONFIRMED' || s === 'PAID') return 'bg-green-100 text-green-800 border-0 dark:bg-green-950/60 dark:text-green-300';
    if (s === 'RESERVED' || s === 'PAYMENT_PENDING') return 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-950/60 dark:text-blue-300';
    if (s === 'CANCELLED' || s === 'FAILED' || s === 'PAYMENT_FAILED') return 'bg-red-100 text-red-800 border-0 dark:bg-red-950/60 dark:text-red-300';
    return 'bg-orange-100 text-orange-800 border-0 dark:bg-orange-950/50 dark:text-orange-300';
}
function bookingBadge(s: string) {
    if (s === 'Hoàn thành') return 'bg-green-100 text-green-800 border-0 dark:bg-green-950/60 dark:text-green-300';
    if (s === 'Đã xác nhận') return 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-950/60 dark:text-blue-300';
    if (s === 'Đã hủy') return 'bg-red-100 text-red-800 border-0 dark:bg-red-950/60 dark:text-red-300';
    return 'bg-orange-100 text-orange-800 border-0 dark:bg-orange-950/50 dark:text-orange-300';
}

const SPECIES_OPTIONS = [
    { value: 'HOUSEHOLD_PET', label: 'Thú cưng gia đình' },
    { value: 'EXOTIC_PET', label: 'Thú cưng ngoại lai' },
    { value: 'LIVESTOCK', label: 'Gia súc' },
    { value: 'POULTRY', label: 'Gia cầm' },
    { value: 'AQUACULTURE', label: 'Thủy sản' },
] as const;

const DASH_TABS = ['overview', 'orders', 'bookings', 'pets', 'profile', 'settings'] as const;
type DashTab = (typeof DASH_TABS)[number];

function parseDashTab(raw: string | null): DashTab {
    if (raw && (DASH_TABS as readonly string[]).includes(raw)) return raw as DashTab;
    return 'overview';
}

// ─── Main component ───────────────────────────────────────────────────────────
const UserDashboardPage = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = parseDashTab(searchParams.get('tab'));

    const setTab = (value: string) => {
        const t = parseDashTab(value);
        if (t === 'overview') setSearchParams({});
        else setSearchParams({ tab: t });
    };

    // ── API state ─────────────────────────────────────────────────────────────
    const [orders, setOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [pets, setPets] = useState<ApiPet[]>([]);
    const [petsLoading, setPetsLoading] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Bookings remain local (no booking service in API)
    const [bookings, setBookings] = useState<UserBooking[]>(INIT_BOOKINGS);

    // ── Fetch orders ──────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        setOrdersLoading(true);
        try {
            const res = await orderApi.getMyOrders();
            setOrders(res.result ?? []);
        } catch {
            // silently fail
        } finally {
            setOrdersLoading(false);
        }
    }, []);

    // ── Fetch pets ────────────────────────────────────────────────────────────
    const fetchPets = useCallback(async () => {
        setPetsLoading(true);
        try {
            const res = await userApi.getMyPets();
            setPets(res.result ?? []);
        } catch {
            // silently fail
        } finally {
            setPetsLoading(false);
        }
    }, []);

    // ── Fetch profile ─────────────────────────────────────────────────────────
    const fetchProfile = useCallback(async () => {
        setProfileLoading(true);
        try {
            const res = await userApi.getMyProfile();
            setProfile(res.result);
        } catch {
            // silently fail
        } finally {
            setProfileLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        fetchPets();
        fetchProfile();
    }, [fetchOrders, fetchPets, fetchProfile]);

    // ── Profile form ──────────────────────────────────────────────────────────
    const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '', email: '' });
    useEffect(() => {
        if (profile) {
            setProfileForm({
                firstName: profile.firstName ?? '',
                lastName: profile.lastName ?? '',
                phone: profile.phone ?? '',
                email: profile.email ?? '',
            });
        }
    }, [profile]);

    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        // Local preview
        const reader = new FileReader();
        reader.onload = (ev) => updateUser({ avatar: ev.target?.result as string });
        reader.readAsDataURL(file);
        // Upload to server
        try {
            await userApi.updateProfile({ avatar: file });
            toast.success('Đã cập nhật ảnh đại diện');
        } catch {
            toast.error('Không thể cập nhật ảnh đại diện');
        }
    };

    const saveProfile = async () => {
        try {
            console.log('[UserDashboard] Saving profile:', profileForm);
            const res = await userApi.updateProfile({
                firstName: profileForm.firstName,
                lastName: profileForm.lastName,
                phone: profileForm.phone,
                email: profileForm.email,
            });
            console.log('[UserDashboard] Profile updated:', res);
            setProfile(res.result);
            updateUser({ firstName: res.result.firstName, lastName: res.result.lastName });
            toast.success('Đã cập nhật hồ sơ thành công');
        } catch (err) {
            console.error('[UserDashboard] Error updating profile:', err);
            toast.error('Không thể cập nhật hồ sơ');
        }
    };

    // ── Cancel order ──────────────────────────────────────────────────────────
    const cancelOrder = async (id: string) => {
        try {
            await orderApi.cancelOrder(id);
            await fetchOrders();
            toast.success('Đã hủy đơn hàng');
        } catch {
            toast.error('Không thể hủy đơn hàng');
        }
    };

    const cancelBooking = (id: string) => {
        setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'Đã hủy' } : b));
        toast.success('Đã hủy lịch đặt');
    };

    // ── Pet modal ─────────────────────────────────────────────────────────────
    const [petModal, setPetModal] = useState<'add' | 'edit' | null>(null);
    const [editingPet, setEditingPet] = useState<ApiPet | null>(null);
    const [petForm, setPetForm] = useState({
        name: '', species: 'HOUSEHOLD_PET' as ApiPet['species'],
        breed: '', age: '', weight: '', healthNotes: '',
    });
    const [petSaving, setPetSaving] = useState(false);

    const openAddPet = () => {
        setPetForm({ name: '', species: 'HOUSEHOLD_PET', breed: '', age: '', weight: '', healthNotes: '' });
        setEditingPet(null);
        setPetModal('add');
    };
    const openEditPet = (p: ApiPet) => {
        setPetForm({
            name: p.name, species: p.species,
            breed: p.breed ?? '', age: String(p.age ?? ''),
            weight: String(p.weight ?? ''), healthNotes: p.healthNotes ?? '',
        });
        setEditingPet(p);
        setPetModal('edit');
    };

    const savePet = async () => {
        if (!petForm.name.trim()) { toast.error('Vui lòng nhập tên thú cưng'); return; }
        setPetSaving(true);
        try {
            if (petModal === 'add') {
                await userApi.createPet({
                    name: petForm.name, species: petForm.species,
                    breed: petForm.breed || undefined,
                    age: petForm.age ? parseInt(petForm.age) : undefined,
                    weight: petForm.weight ? parseFloat(petForm.weight) : undefined,
                    healthNotes: petForm.healthNotes || undefined,
                });
                toast.success('Đã thêm thú cưng');
            } else if (editingPet) {
                await userApi.updatePet(editingPet.id, {
                    name: petForm.name, species: petForm.species,
                    breed: petForm.breed || undefined,
                    age: petForm.age ? parseInt(petForm.age) : undefined,
                    weight: petForm.weight ? parseFloat(petForm.weight) : undefined,
                    healthNotes: petForm.healthNotes || undefined,
                });
                toast.success('Đã cập nhật thú cưng');
            }
            await fetchPets();
            setPetModal(null);
        } catch {
            toast.error('Không thể lưu thú cưng');
        } finally {
            setPetSaving(false);
        }
    };

    const deletePet = async (id: string) => {
        try {
            await userApi.deletePet(id);
            await fetchPets();
            toast.success('Đã xóa thú cưng');
        } catch {
            toast.error('Không thể xóa thú cưng');
        }
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
                            { icon: TrendingUp, label: 'Tổng chi tiêu', value: orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0).toLocaleString('vi-VN') + '₫', color: 'bg-violet-500', ring: 'ring-violet-500/20' },
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
                                {ordersLoading ? (
                                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#448B3D]" /></div>
                                ) : orders.slice(0, 2).map(o => (
                                    <div key={o.id} className="flex items-center gap-3">
                                        <div className="flex flex-1 min-w-0 items-center gap-3 rounded-lg -m-1 p-1 hover:bg-muted/70 transition-colors">
                                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                                <Package className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {o.items?.[0]?.productName ?? `Đơn hàng #${o.id.slice(0, 8)}`}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{o.id.slice(0, 8)} · {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : ''}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-semibold">{o.totalAmount?.toLocaleString('vi-VN')}₫</p>
                                            <Badge className={`text-xs ${orderBadge(o.status)}`}>{orderStatusLabel(o.status)}</Badge>
                                        </div>
                                    </div>
                                ))}
                                {!ordersLoading && orders.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Chưa có đơn hàng nào</p>
                                )}
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
                    {ordersLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#448B3D]" /></div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map(o => (
                                <Card key={o.id} className="border-border/80 p-4 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-1 min-w-0 items-center gap-4 rounded-xl -m-1 p-1">
                                            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                                <Package className="w-7 h-7 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-foreground truncate">
                                                    {o.items?.[0]?.productName ?? `Đơn hàng #${o.id.slice(0, 8)}`}
                                                    {(o.items?.length ?? 0) > 1 && ` +${(o.items?.length ?? 1) - 1} sản phẩm`}
                                                </p>
                                                <p className="text-sm text-muted-foreground mt-0.5">#{o.id.slice(0, 8)} · {o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : ''}</p>
                                                <Badge className={`text-xs mt-1 ${orderBadge(o.status)}`}>{orderStatusLabel(o.status)}</Badge>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 flex flex-col items-end gap-2">
                                            <p className="font-semibold text-foreground">{o.totalAmount?.toLocaleString('vi-VN')}₫</p>
                                            {(o.status === 'PENDING' || o.status === 'RESERVED') && (
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
                    )}
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

                {/* ── Hồ sơ ── */}
                <TabsContent value="profile" className="outline-none">
                    <Card className="max-w-lg border-border/80 p-6 shadow-md">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#448B3D]/15 text-[#448B3D] dark:text-[#7CB878]">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold text-foreground">Thông tin cá nhân</h2>
                        </div>
                        {profileLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#448B3D]" /></div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 pb-4 border-b border-border">
                                    <div className="relative shrink-0">
                                        <div className="w-20 h-20 rounded-full overflow-hidden bg-[#448B3D]/15 ring-2 ring-[#448B3D]/30 flex items-center justify-center">
                                            {user?.avatar
                                                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                                : <UserIcon className="w-8 h-8 text-[#448B3D]" />
                                            }
                                        </div>
                                        <button type="button" onClick={() => avatarInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#448B3D] hover:bg-[#336B2D] text-white flex items-center justify-center shadow-md transition-colors">
                                            <Camera className="w-3.5 h-3.5" />
                                        </button>
                                        <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{user?.name}</p>
                                        <p className="text-sm text-muted-foreground">{user?.username}</p>
                                        <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-xs text-[#448B3D] hover:underline mt-1 font-medium">Thay đổi ảnh đại diện</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="prof-first">Họ</Label>
                                        <Input id="prof-first" className="mt-1" value={profileForm.firstName} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} />
                                    </div>
                                    <div>
                                        <Label htmlFor="prof-last">Tên</Label>
                                        <Input id="prof-last" className="mt-1" value={profileForm.lastName} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="prof-email">Email</Label>
                                    <Input id="prof-email" className="mt-1" value={profileForm.email} onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))} />
                                </div>
                                <div>
                                    <Label htmlFor="prof-phone">Số điện thoại</Label>
                                    <Input id="prof-phone" className="mt-1" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
                                </div>
                                <Button className="w-full bg-[#448B3D] hover:bg-[#336B2D] text-white" onClick={saveProfile}>
                                    Lưu thay đổi
                                </Button>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                {/* ── Cài đặt ── */}
                < TabsContent value="settings" className="outline-none" >
                    <Card className="max-w-xl overflow-hidden border-border/80 shadow-md">
                        <div className="border-b border-border bg-linear-to-r from-[#448B3D]/12 via-transparent to-violet-500/5 px-6 py-5 dark:from-[#448B3D]/25">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#448B3D]/15 text-[#448B3D] shadow-sm dark:bg-[#448B3D]/25 dark:text-[#7CB878]">
                                    <Settings className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Cài đặt giao diện</h2>
                                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                        Chế độ sáng, tối hoặc theo hệ thống. Tuỳ chọn được lưu trên trình duyệt và áp dụng cho toàn bộ PetCare.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <DashboardThemeSettings />
                        </div>
                    </Card>
                </TabsContent >
            </Tabs >

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
                            <Select value={petForm.species} onValueChange={v => setPetForm(f => ({ ...f, species: v as ApiPet['species'] }))}>
                                <SelectTrigger className="mt-1 w-full"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {SPECIES_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
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
                            <Label htmlFor="pet-notes">Ghi chú sức khỏe</Label>
                            <Textarea id="pet-notes" className="mt-1" rows={2} placeholder="Dị ứng, thói quen..." value={petForm.healthNotes} onChange={e => setPetForm(f => ({ ...f, healthNotes: e.target.value }))} />
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button className="flex-1 bg-[#448B3D] hover:bg-[#336B2D] text-white" onClick={savePet} disabled={petSaving}>
                                {petSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu'}
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => setPetModal(null)}>Hủy</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default UserDashboardPage;
