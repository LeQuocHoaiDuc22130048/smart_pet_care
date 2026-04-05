import { useState } from 'react';
import { Link } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    DollarSign, ShoppingBag, Users, Calendar,
    Plus, Pencil, Trash2, X, Search, Lock, Unlock,
} from 'lucide-react';
import {
    Bar, BarChart, CartesianGrid, Line, LineChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
    id: string; name: string; category: string; price: number;
    stock: number; status: 'active' | 'inactive'; image: string;
}
interface Order {
    id: string;
    customer: string;
    productId: string;
    product: string;
    amount: string;
    status: 'Đang xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
    date: string;
}
interface Customer {
    id: string; name: string; email: string; orders: number;
    spent: string; joined: string; status: 'active' | 'blocked';
}
interface Booking {
    id: string; customer: string; service: string; pet: string;
    date: string; time: string;
    status: 'Chờ xác nhận' | 'Đã xác nhận' | 'Hoàn thành' | 'Đã hủy';
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
const INIT_PRODUCTS: Product[] = [
    { id: 'P1', name: 'Thức ăn chó hữu cơ cao cấp', category: 'Thức ăn', price: 49.99, stock: 45, status: 'active', image: 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=80&h=80&fit=crop' },
    { id: 'P2', name: 'Cột cào móng mèo cao cấp', category: 'Đồ chơi', price: 89.99, stock: 30, status: 'active', image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=80&h=80&fit=crop' },
    { id: 'P3', name: 'Bộ dây dắt & vòng cổ chó', category: 'Phụ kiện', price: 34.99, stock: 80, status: 'active', image: 'https://images.unsplash.com/photo-1600277971170-8a7d75fb1bd9?w=80&h=80&fit=crop' },
    { id: 'P4', name: 'Giường thú cưng chỉnh hình', category: 'Giường', price: 79.99, stock: 25, status: 'active', image: 'https://images.unsplash.com/photo-1553736026-ff14d158d222?w=80&h=80&fit=crop' },
    { id: 'P5', name: 'Đồ chơi thông minh tương tác', category: 'Đồ chơi', price: 44.99, stock: 0, status: 'inactive', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop' },
];
const INIT_ORDERS: Order[] = [
    { id: 'ORD-1234', customer: 'Nguyễn Văn A', productId: '1', product: 'Thức ăn chó cao cấp', amount: '$49.99', status: 'Hoàn thành', date: '11/02/2026' },
    { id: 'ORD-1233', customer: 'Trần Thị B', productId: '2', product: 'Cột cào móng mèo', amount: '$89.99', status: 'Đang xử lý', date: '11/02/2026' },
    { id: 'ORD-1232', customer: 'Lê Văn C', productId: '4', product: 'Giường thú cưng', amount: '$79.99', status: 'Đang giao', date: '10/02/2026' },
    { id: 'ORD-1231', customer: 'Phạm Thị D', productId: '5', product: 'Đồ chơi thông minh', amount: '$44.99', status: 'Đang xử lý', date: '09/02/2026' },
    { id: 'ORD-1230', customer: 'Hoàng Văn E', productId: '3', product: 'Bộ dây dắt chó', amount: '$34.99', status: 'Đã hủy', date: '08/02/2026' },
];
const INIT_CUSTOMERS: Customer[] = [
    { id: 'C1', name: 'Nguyễn Văn An', email: 'user@petcare.vn', orders: 12, spent: '$890', joined: '01/01/2026', status: 'active' },
    { id: 'C2', name: 'Trần Thị Bình', email: 'binh@gmail.com', orders: 5, spent: '$320', joined: '15/01/2026', status: 'active' },
    { id: 'C3', name: 'Lê Văn Cường', email: 'cuong@gmail.com', orders: 8, spent: '$560', joined: '20/01/2026', status: 'active' },
    { id: 'C4', name: 'Phạm Thị Dung', email: 'dung@gmail.com', orders: 2, spent: '$120', joined: '01/02/2026', status: 'blocked' },
];
const INIT_BOOKINGS: Booking[] = [
    { id: 'BK-001', customer: 'Nguyễn Văn An', service: 'Spa thú cưng', pet: 'Max', date: '15/02/2026', time: '10:00', status: 'Đã xác nhận' },
    { id: 'BK-002', customer: 'Trần Thị Bình', service: 'Khám sức khỏe', pet: 'Mimi', date: '16/02/2026', time: '14:00', status: 'Chờ xác nhận' },
    { id: 'BK-003', customer: 'Lê Văn Cường', service: 'Tiêm phòng', pet: 'Buddy', date: '17/02/2026', time: '09:00', status: 'Chờ xác nhận' },
    { id: 'BK-004', customer: 'Phạm Thị Dung', service: 'Cắt tỉa lông', pet: 'Luna', date: '10/02/2026', time: '11:00', status: 'Hoàn thành' },
];
const CHART_DATA = [
    { month: 'T1', sales: 4000, orders: 240 }, { month: 'T2', sales: 3000, orders: 180 },
    { month: 'T3', sales: 5000, orders: 320 }, { month: 'T4', sales: 4500, orders: 280 },
    { month: 'T5', sales: 6000, orders: 380 }, { month: 'T6', sales: 5500, orders: 350 },
];
const CATEGORIES = ['Thức ăn', 'Đồ chơi', 'Phụ kiện', 'Giường', 'Sức khỏe'];
const ORDER_STATUSES = ['Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'] as const;
const BOOKING_STATUSES = ['Chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function orderBadge(s: string) {
    if (s === 'Hoàn thành') return 'bg-green-100 text-green-700 border border-green-300';
    if (s === 'Đang giao') return 'bg-blue-100 text-blue-700 border border-blue-300';
    if (s === 'Đã hủy') return 'bg-red-100 text-red-700 border border-red-300';
    return 'bg-orange-100 text-orange-700 border border-orange-300';
}
function bookingBadge(s: string) {
    if (s === 'Hoàn thành') return 'bg-green-100 text-green-700 border border-green-300';
    if (s === 'Đã xác nhận') return 'bg-blue-100 text-blue-700 border border-blue-300';
    if (s === 'Đã hủy') return 'bg-red-100 text-red-700 border border-red-300';
    return 'bg-orange-100 text-orange-700 border border-orange-300';
}

// ─── Main component ───────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
    const [products, setProducts] = useState<Product[]>(INIT_PRODUCTS);
    const [orders, setOrders] = useState<Order[]>(INIT_ORDERS);
    const [customers, setCustomers] = useState<Customer[]>(INIT_CUSTOMERS);
    const [bookings, setBookings] = useState<Booking[]>(INIT_BOOKINGS);
    const [search, setSearch] = useState('');

    // Product modal state
    const [productModal, setProductModal] = useState<'add' | 'edit' | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [pForm, setPForm] = useState({ name: '', category: 'Thức ăn', price: '', stock: '', status: 'active' as 'active' | 'inactive' });

    const openAddProduct = () => {
        setPForm({ name: '', category: 'Thức ăn', price: '', stock: '', status: 'active' });
        setEditingProduct(null);
        setProductModal('add');
    };
    const openEditProduct = (p: Product) => {
        setPForm({ name: p.name, category: p.category, price: String(p.price), stock: String(p.stock), status: p.status });
        setEditingProduct(p);
        setProductModal('edit');
    };
    const saveProduct = () => {
        if (!pForm.name.trim()) { toast.error('Vui lòng nhập tên sản phẩm'); return; }
        if (productModal === 'add') {
            const newP: Product = {
                id: 'P' + Date.now(), name: pForm.name, category: pForm.category,
                price: parseFloat(pForm.price) || 0, stock: parseInt(pForm.stock) || 0,
                status: pForm.status, image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop',
            };
            setProducts(prev => [newP, ...prev]);
            toast.success('Đã thêm sản phẩm');
        } else if (editingProduct) {
            setProducts(prev => prev.map(p => p.id === editingProduct.id
                ? { ...p, name: pForm.name, category: pForm.category, price: parseFloat(pForm.price) || 0, stock: parseInt(pForm.stock) || 0, status: pForm.status }
                : p));
            toast.success('Đã cập nhật sản phẩm');
        }
        setProductModal(null);
    };
    const deleteProduct = (id: string) => {
        setProducts(prev => prev.filter(p => p.id !== id));
        toast.success('Đã xóa sản phẩm');
    };

    const updateOrderStatus = (id: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        toast.success('Đã cập nhật trạng thái đơn hàng');
    };
    const deleteOrder = (id: string) => {
        setOrders(prev => prev.filter(o => o.id !== id));
        toast.success('Đã xóa đơn hàng');
    };

    const toggleCustomer = (id: string) => {
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' } : c));
        toast.success('Đã cập nhật trạng thái khách hàng');
    };
    const deleteCustomer = (id: string) => {
        setCustomers(prev => prev.filter(c => c.id !== id));
        toast.success('Đã xóa khách hàng');
    };

    const updateBookingStatus = (id: string, status: Booking['status']) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
        toast.success('Đã cập nhật trạng thái lịch đặt');
    };
    const deleteBooking = (id: string) => {
        setBookings(prev => prev.filter(b => b.id !== id));
        toast.success('Đã xóa lịch đặt');
    };

    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
    const filteredOrders = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()));
    const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
    const filteredBookings = bookings.filter(b => b.id.toLowerCase().includes(search.toLowerCase()) || b.customer.toLowerCase().includes(search.toLowerCase()));

    const lowStock = products.filter(p => p.stock < 10);

    return (
        <div className="max-w-7xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển quản trị</h1>
                <p className="text-muted-foreground text-sm mt-1">Quản lý toàn bộ hoạt động kinh doanh</p>
            </div>

            <Tabs defaultValue="overview">
                <TabsList className="mb-6 flex-wrap h-auto gap-1">
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                    <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                    <TabsTrigger value="customers">Khách hàng</TabsTrigger>
                    <TabsTrigger value="bookings">Lịch đặt</TabsTrigger>
                </TabsList>

                {/* ── Tổng quan ── */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {[
                            { icon: DollarSign, label: 'Doanh thu', value: '$45,890', change: '+12.5%' },
                            { icon: ShoppingBag, label: 'Đơn hàng', value: String(orders.length), change: '+8.2%' },
                            { icon: Users, label: 'Khách hàng', value: String(customers.length), change: '+15.3%' },
                            { icon: Calendar, label: 'Lịch đặt', value: String(bookings.length), change: '+5.1%' },
                        ].map(stat => (
                            <Card key={stat.label} className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#448B3D] flex items-center justify-center">
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 border-0 text-xs">{stat.change}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            </Card>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-6">
                        <Card className="p-5">
                            <h2 className="font-semibold text-foreground mb-4">Doanh thu theo tháng</h2>
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={CHART_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                    <YAxis stroke="#6B7280" fontSize={12} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="sales" stroke="#448B3D" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </Card>
                        <Card className="p-5">
                            <h2 className="font-semibold text-foreground mb-4">Đơn hàng theo tháng</h2>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={CHART_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                    <YAxis stroke="#6B7280" fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="orders" fill="#448B3D" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <Card className="p-5">
                            <h2 className="font-semibold text-foreground mb-4">Đơn hàng gần đây</h2>
                            <div className="space-y-3">
                                {orders.slice(0, 4).map(o => (
                                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                                        <div className="min-w-0 pr-2">
                                            <p className="text-sm font-medium text-foreground">{o.id}</p>
                                            <Link
                                                to={`/products/${o.productId}`}
                                                className="text-xs font-medium text-[#448B3D] hover:underline truncate block max-w-[220px]"
                                            >
                                                {o.product}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">{o.customer} · {o.date}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">{o.amount}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${orderBadge(o.status)}`}>{o.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card className="p-5">
                            <h2 className="font-semibold text-foreground mb-4">Sản phẩm sắp hết hàng</h2>
                            {lowStock.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Không có sản phẩm nào sắp hết hàng</p>
                            ) : (
                                <div className="space-y-3">
                                    {lowStock.map(p => (
                                        <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                                                <p className="text-xs text-muted-foreground">{p.category}</p>
                                            </div>
                                            <Badge className={p.stock === 0 ? 'bg-red-100 text-red-700 border-0' : 'bg-orange-100 text-orange-700 border-0'}>
                                                {p.stock === 0 ? 'Hết hàng' : `Còn ${p.stock}`}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </TabsContent>

                {/* ── Sản phẩm ── */}
                <TabsContent value="products">
                    <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input placeholder="Tìm sản phẩm..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <Button onClick={openAddProduct} className="bg-[#448B3D] hover:bg-[#336B2D] text-white">
                            <Plus className="w-4 h-4" /> Thêm sản phẩm
                        </Button>
                    </div>
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-3 text-muted-foreground font-medium">Ảnh</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Tên</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Danh mục</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Giá</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Tồn kho</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Trạng thái</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(p => (
                                        <tr key={p.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="p-3">
                                                <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                            </td>
                                            <td className="p-3 font-medium text-foreground max-w-[180px] truncate">{p.name}</td>
                                            <td className="p-3 text-muted-foreground">{p.category}</td>
                                            <td className="p-3 font-medium">${p.price.toFixed(2)}</td>
                                            <td className="p-3">
                                                <span className={p.stock === 0 ? 'text-red-600 font-medium' : p.stock < 10 ? 'text-orange-600 font-medium' : 'text-foreground'}>{p.stock}</span>
                                            </td>
                                            <td className="p-3">
                                                <Badge className={p.status === 'active' ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                                                    {p.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1">
                                                    <Button size="icon-sm" variant="ghost" onClick={() => openEditProduct(p)}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button size="icon-sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteProduct(p.id)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredProducts.length === 0 && <p className="text-center text-muted-foreground py-8">Không tìm thấy sản phẩm</p>}
                        </div>
                    </Card>
                </TabsContent>

                {/* ── Đơn hàng ── */}
                <TabsContent value="orders">
                    <div className="relative mb-4 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Tìm đơn hàng..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-3 text-muted-foreground font-medium">Mã</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Khách hàng</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Sản phẩm</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Số tiền</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Ngày</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Trạng thái</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map(o => (
                                        <tr key={o.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="p-3 font-medium text-foreground">{o.id}</td>
                                            <td className="p-3 text-muted-foreground">{o.customer}</td>
                                            <td className="p-3 max-w-[200px]">
                                                <Link
                                                    to={`/products/${o.productId}`}
                                                    className="text-[#448B3D] font-medium hover:underline truncate block"
                                                    title={o.product}
                                                >
                                                    {o.product}
                                                </Link>
                                            </td>
                                            <td className="p-3 font-medium">{o.amount}</td>
                                            <td className="p-3 text-muted-foreground">{o.date}</td>
                                            <td className="p-3">
                                                <Select value={o.status} onValueChange={v => updateOrderStatus(o.id, v as Order['status'])}>
                                                    <SelectTrigger size="sm" className="w-36">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-3">
                                                <Button size="icon-sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteOrder(o.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredOrders.length === 0 && <p className="text-center text-muted-foreground py-8">Không tìm thấy đơn hàng</p>}
                        </div>
                    </Card>
                </TabsContent>

                {/* ── Khách hàng ── */}
                <TabsContent value="customers">
                    <div className="relative mb-4 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Tìm khách hàng..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-3 text-muted-foreground font-medium">Tên</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Email</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Đơn hàng</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Chi tiêu</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Ngày tham gia</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Trạng thái</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map(c => (
                                        <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="p-3 font-medium text-foreground">{c.name}</td>
                                            <td className="p-3 text-muted-foreground">{c.email}</td>
                                            <td className="p-3 text-center">{c.orders}</td>
                                            <td className="p-3 font-medium">{c.spent}</td>
                                            <td className="p-3 text-muted-foreground">{c.joined}</td>
                                            <td className="p-3">
                                                <Badge className={c.status === 'active' ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-700 border-0'}>
                                                    {c.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1">
                                                    <Button size="icon-sm" variant="ghost" onClick={() => toggleCustomer(c.id)} title={c.status === 'active' ? 'Khóa' : 'Mở khóa'}>
                                                        {c.status === 'active' ? <Lock className="w-3.5 h-3.5 text-orange-500" /> : <Unlock className="w-3.5 h-3.5 text-green-600" />}
                                                    </Button>
                                                    <Button size="icon-sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteCustomer(c.id)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredCustomers.length === 0 && <p className="text-center text-muted-foreground py-8">Không tìm thấy khách hàng</p>}
                        </div>
                    </Card>
                </TabsContent>

                {/* ── Lịch đặt ── */}
                <TabsContent value="bookings">
                    <div className="relative mb-4 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Tìm lịch đặt..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-3 text-muted-foreground font-medium">Mã</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Khách hàng</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Dịch vụ</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Thú cưng</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Ngày</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Giờ</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Trạng thái</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Xóa</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredBookings.map(b => (
                                        <tr key={b.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="p-3 font-medium text-foreground">{b.id}</td>
                                            <td className="p-3 text-muted-foreground">{b.customer}</td>
                                            <td className="p-3 text-muted-foreground">{b.service}</td>
                                            <td className="p-3 text-muted-foreground">{b.pet}</td>
                                            <td className="p-3 text-muted-foreground">{b.date}</td>
                                            <td className="p-3 text-muted-foreground">{b.time}</td>
                                            <td className="p-3">
                                                <Select value={b.status} onValueChange={v => updateBookingStatus(b.id, v as Booking['status'])}>
                                                    <SelectTrigger size="sm" className="w-36">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {BOOKING_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="p-3">
                                                <Button size="icon-sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteBooking(b.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredBookings.length === 0 && <p className="text-center text-muted-foreground py-8">Không tìm thấy lịch đặt</p>}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* ── Product Modal ── */}
            {productModal && (
                <Modal title={productModal === 'add' ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm'} onClose={() => setProductModal(null)}>
                    <div className="space-y-3">
                        <div>
                            <Label htmlFor="pname">Tên sản phẩm</Label>
                            <Input id="pname" className="mt-1" placeholder="Nhập tên sản phẩm" value={pForm.name} onChange={e => setPForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div>
                            <Label>Danh mục</Label>
                            <Select value={pForm.category} onValueChange={v => setPForm(f => ({ ...f, category: v }))}>
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="pprice">Giá ($)</Label>
                                <Input id="pprice" type="number" className="mt-1" placeholder="0.00" value={pForm.price} onChange={e => setPForm(f => ({ ...f, price: e.target.value }))} />
                            </div>
                            <div>
                                <Label htmlFor="pstock">Tồn kho</Label>
                                <Input id="pstock" type="number" className="mt-1" placeholder="0" value={pForm.stock} onChange={e => setPForm(f => ({ ...f, stock: e.target.value }))} />
                            </div>
                        </div>
                        <div>
                            <Label>Trạng thái</Label>
                            <Select value={pForm.status} onValueChange={v => setPForm(f => ({ ...f, status: v as 'active' | 'inactive' }))}>
                                <SelectTrigger className="mt-1 w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Hoạt động</SelectItem>
                                    <SelectItem value="inactive">Ẩn</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <Button className="flex-1 bg-[#448B3D] hover:bg-[#336B2D] text-white" onClick={saveProduct}>Lưu</Button>
                            <Button variant="outline" className="flex-1" onClick={() => setProductModal(null)}>Hủy</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboardPage;
