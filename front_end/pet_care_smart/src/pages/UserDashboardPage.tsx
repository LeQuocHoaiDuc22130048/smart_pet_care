import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
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
    Plus, Pencil, Trash2, X, PawPrint,
} from 'lucide-react';
import { toast } from 'sonner';

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
    if (s === 'Hoàn thành') return 'bg-green-100 text-green-700 border-0';
    if (s === 'Đang giao') return 'bg-blue-100 text-blue-700 border-0';
    if (s === 'Đã hủy') return 'bg-red-100 text-red-700 border-0';
    return 'bg-orange-100 text-orange-700 border-0';
}
function bookingBadge(s: string) {
    if (s === 'Hoàn thành') return 'bg-green-100 text-green-700 border-0';
    if (s === 'Đã xác nhận') return 'bg-blue-100 text-blue-700 border-0';
    if (s === 'Đã hủy') return 'bg-red-100 text-red-700 border-0';
    return 'bg-orange-100 text-orange-700 border-0';
}

const SPECIES = ['Chó', 'Mèo', 'Khác'] as const;

// ─── Main component ───────────────────────────────────────────────────────────
const UserDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

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
        <div className="max-w-5xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Xin chào, {user?.name ?? 'bạn'} 👋</h1>
                <p className="text-muted-foreground text-sm mt-1">Quản lý đơn hàng, lịch đặt và thú cưng của bạn</p>
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="mb-6 flex-wrap h-auto gap-1">
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                    <TabsTrigger value="bookings">Lịch đặt</TabsTrigger>
                    <TabsTrigger value="pets">Thú cưng</TabsTrigger>
                    <TabsTrigger value="profile">Hồ sơ</TabsTrigger>
                </TabsList>

                {/* ── Tổng quan ── */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { icon: Package, label: 'Tổng đơn hàng', value: String(orders.length), color: 'bg-[#448B3D]' },
                            { icon: Calendar, label: 'Lịch đặt', value: String(bookings.length), color: 'bg-blue-500' },
                            { icon: PawPrint, label: 'Thú cưng', value: String(pets.length), color: 'bg-orange-400' },
                            { icon: TrendingUp, label: 'Tổng chi tiêu', value: '$174.97', color: 'bg-purple-500' },
                        ].map(stat => (
                            <Card key={stat.label} className="p-4">
                                <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                                    <stat.icon className="w-4 h-4 text-white" />
                                </div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                            </Card>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        <Card className="p-5">
                            <h2 className="font-semibold text-foreground mb-4">Đơn hàng gần đây</h2>
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
                        <Card className="p-5">
                            <h2 className="font-semibold text-foreground mb-4">Lịch đặt sắp tới</h2>
                            <div className="space-y-3">
                                {bookings.slice(0, 2).map(b => (
                                    <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
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
                        <Card className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/products')}>
                            <ShoppingBag className="w-7 h-7 text-[#448B3D] mb-2" />
                            <p className="font-semibold text-foreground">Mua sắm</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Khám phá sản phẩm thú cưng</p>
                        </Card>
                        <Card className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/booking')}>
                            <Calendar className="w-7 h-7 text-blue-500 mb-2" />
                            <p className="font-semibold text-foreground">Đặt lịch</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Lên lịch dịch vụ cho thú cưng</p>
                        </Card>
                        <Card className="p-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/image-search')}>
                            <TrendingUp className="w-7 h-7 text-purple-500 mb-2" />
                            <p className="font-semibold text-foreground">Tìm kiếm AI</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Tìm sản phẩm bằng hình ảnh</p>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── Đơn hàng ── */}
                <TabsContent value="orders">
                    <div className="space-y-3">
                        {orders.map(o => (
                            <Card key={o.id} className="p-4">
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
                <TabsContent value="bookings">
                    <div className="space-y-3">
                        {bookings.map(b => (
                            <Card key={b.id} className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#448B3D]/10 flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-[#448B3D]" />
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
                <TabsContent value="pets">
                    <div className="flex justify-end mb-4">
                        <Button onClick={openAddPet} className="bg-[#448B3D] hover:bg-[#336B2D] text-white">
                            <Plus className="w-4 h-4" /> Thêm thú cưng
                        </Button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {pets.map(p => (
                            <Card key={p.id} className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                            <PawPrint className="w-5 h-5 text-orange-500" />
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
                <TabsContent value="profile">
                    <Card className="p-6 max-w-lg">
                        <h2 className="font-semibold text-foreground mb-5">Thông tin cá nhân</h2>
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
