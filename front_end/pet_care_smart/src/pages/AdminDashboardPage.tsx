import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import {
    DollarSign, ShoppingBag, Users, Calendar,
    Plus, Pencil, Trash2, X, Search, Lock, Unlock,
    ChevronLeft, ChevronRight, Settings, Eye, EyeOff, ArrowLeft, Camera, Loader2,
} from 'lucide-react';
import {
    Bar, BarChart, CartesianGrid, Line, LineChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DashboardThemeSettings } from '@/components/dashboard/DashboardThemeSettings';
import { productApi, type Product as ApiProduct, type Category as ApiCategory } from '@/lib/productApi';
import { orderApi, type Order as ApiOrder, type OrderStatus } from '@/lib/orderApi';
import { authApi, type UserIdentity } from '@/lib/authApi';

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
    address: string;
    status: 'Đang xử lý' | 'Đang giao' | 'Hoàn thành' | 'Đã hủy';
    date: string;
}
interface Customer {
    id: string; name: string; email: string; phone: string; address: string;
    orders: number; spent: string; joined: string; status: 'active' | 'blocked';
}
interface Booking {
    id: string; customer: string; service: string; pet: string;
    date: string; time: string;
    status: 'Chờ xác nhận' | 'Đã xác nhận' | 'Hoàn thành' | 'Đã hủy';
}

// ─── Mappers ──────────────────────────────────────────────────────────────────
function mapApiProduct(p: ApiProduct): Product {
    const primary = p.images?.find(i => i.isPrimary) ?? p.images?.[0];
    return {
        id: p.id,
        name: p.productName,
        category: p.categories?.map(c => c.categoryName).join(', ') || 'Khác',
        price: p.price,
        stock: p.stockQuantity,
        status: p.status === 'ACTIVE' ? 'active' : 'inactive',
        image: p.primaryImageUrl ?? primary?.imageUrl ?? 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=80&fit=crop',
    };
}

function mapApiOrder(o: ApiOrder): Order {
    const statusMap: Record<string, Order['status']> = {
        PENDING: 'Đang xử lý', RESERVED: 'Đang xử lý',
        PAYMENT_PENDING: 'Đang xử lý', PAID: 'Đang giao',
        CONFIRMED: 'Hoàn thành', FAILED: 'Đã hủy',
        PAYMENT_FAILED: 'Đã hủy', CANCELLED: 'Đã hủy',
    };
    return {
        id: o.id,
        customer: o.userId ?? 'Khách hàng',
        productId: o.items?.[0]?.productId ?? '',
        product: o.items?.[0]?.productName ?? `Đơn hàng #${o.id.slice(0, 8)}`,
        amount: `${o.totalAmount?.toLocaleString('vi-VN')}₫`,
        address: '',
        status: statusMap[o.status] ?? 'Đang xử lý',
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('vi-VN') : '',
    };
}

function mapApiUser(u: UserIdentity): Customer {
    return {
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.username,
        phone: '',
        address: '',
        orders: 0,
        spent: '0₫',
        joined: '',
        status: 'active',
    };
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
    { id: 'ORD-1234', customer: 'Nguyễn Văn An', productId: '1', product: 'Thức ăn chó cao cấp', amount: '$49.99', address: '12 Nguyễn Huệ, Q.1, TP.HCM', status: 'Hoàn thành', date: '11/02/2026' },
    { id: 'ORD-1233', customer: 'Trần Thị Bình', productId: '2', product: 'Cột cào móng mèo', amount: '$89.99', address: '45 Lê Lợi, Q.Hoàn Kiếm, Hà Nội', status: 'Đang xử lý', date: '11/02/2026' },
    { id: 'ORD-1232', customer: 'Lê Văn Cường', productId: '4', product: 'Giường thú cưng', amount: '$79.99', address: '78 Trần Phú, Q.Hải Châu, Đà Nẵng', status: 'Đang giao', date: '10/02/2026' },
    { id: 'ORD-1231', customer: 'Phạm Thị Dung', productId: '5', product: 'Đồ chơi thông minh', amount: '$44.99', address: '23 Lý Thường Kiệt, Q.10, TP.HCM', status: 'Đang xử lý', date: '09/02/2026' },
    { id: 'ORD-1230', customer: 'Hoàng Văn E', productId: '3', product: 'Bộ dây dắt chó', amount: '$34.99', address: '56 Đinh Tiên Hoàng, Q.Bình Thạnh, TP.HCM', status: 'Đã hủy', date: '08/02/2026' },
];
const INIT_CUSTOMERS: Customer[] = [
    { id: 'C1', name: 'Nguyễn Văn An', email: 'user@petcare.vn', phone: '0901234567', address: '12 Nguyễn Huệ, Q.1, TP.HCM', orders: 12, spent: '$890', joined: '01/01/2026', status: 'active' },
    { id: 'C2', name: 'Trần Thị Bình', email: 'binh@gmail.com', phone: '0912345678', address: '45 Lê Lợi, Q.Hoàn Kiếm, Hà Nội', orders: 5, spent: '$320', joined: '15/01/2026', status: 'active' },
    { id: 'C3', name: 'Lê Văn Cường', email: 'cuong@gmail.com', phone: '0923456789', address: '78 Trần Phú, Q.Hải Châu, Đà Nẵng', orders: 8, spent: '$560', joined: '20/01/2026', status: 'active' },
    { id: 'C4', name: 'Phạm Thị Dung', email: 'dung@gmail.com', phone: '0934567890', address: '23 Lý Thường Kiệt, Q.10, TP.HCM', orders: 2, spent: '$120', joined: '01/02/2026', status: 'blocked' },
];
const INIT_BOOKINGS: Booking[] = [
    { id: 'BK-001', customer: 'Nguyễn Văn An', service: 'Spa thú cưng', pet: 'Max', date: '15/02/2026', time: '10:00', status: 'Đã xác nhận' },
    { id: 'BK-002', customer: 'Trần Thị Bình', service: 'Khám sức khỏe', pet: 'Mimi', date: '16/02/2026', time: '14:00', status: 'Chờ xác nhận' },
    { id: 'BK-003', customer: 'Lê Văn Cường', service: 'Tiêm phòng', pet: 'Buddy', date: '17/02/2026', time: '09:00', status: 'Chờ xác nhận' },
    { id: 'BK-004', customer: 'Phạm Thị Dung', service: 'Cắt tỉa lông', pet: 'Luna', date: '10/02/2026', time: '11:00', status: 'Hoàn thành' },
    { id: 'BK-005', customer: 'Đỗ Minh Khoa', service: 'Tắm & vệ sinh', pet: 'Coco', date: '06/04/2026', time: '15:00', status: 'Chờ xác nhận' },
    { id: 'BK-006', customer: 'Võ Thị Hà', service: 'Khám tổng quát', pet: 'Milo', date: '12/04/2026', time: '08:30', status: 'Đã xác nhận' },
];
const CHART_DATA = [
    { month: 'T1', sales: 4000, orders: 240 }, { month: 'T2', sales: 3000, orders: 180 },
    { month: 'T3', sales: 5000, orders: 320 }, { month: 'T4', sales: 4500, orders: 280 },
    { month: 'T5', sales: 6000, orders: 380 }, { month: 'T6', sales: 5500, orders: 350 },
];
const CATEGORIES = ['Thức ăn', 'Đồ chơi', 'Phụ kiện', 'Giường', 'Sức khỏe'];
const ORDER_STATUSES = ['Đang xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'] as const;
const BOOKING_STATUSES = ['Chờ xác nhận', 'Đã xác nhận', 'Hoàn thành', 'Đã hủy'] as const;

const ADMIN_TABS = ['overview', 'products', 'products-add', 'product-categories', 'orders', 'order-detail', 'customers', 'customer-detail', 'bookings', 'stats', 'settings'] as const;
type AdminTab = (typeof ADMIN_TABS)[number];

function parseAdminTab(raw: string | null): AdminTab {
    if (raw && (ADMIN_TABS as readonly string[]).includes(raw)) return raw as AdminTab;
    return 'overview';
}

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

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

function parseBookingDateStr(s: string): Date | null {
    const m = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10) - 1;
    const year = parseInt(m[3], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
    return d;
}

function sameCalendarDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Ô lịch tháng (thứ Hai đầu hàng), pad null đầu/cuối */
function buildMonthCalendarCells(view: Date): (Date | null)[] {
    const y = view.getFullYear();
    const mo = view.getMonth();
    const first = new Date(y, mo, 1);
    const pad = first.getDay() === 0 ? 6 : first.getDay() - 1;
    const lastDate = new Date(y, mo + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: pad }, () => null);
    for (let d = 1; d <= lastDate; d++) cells.push(new Date(y, mo, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

// ─── Main component ───────────────────────────────────────────────────────────
const AdminDashboardPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, updateUser } = useAuth();
    const activeTab = parseAdminTab(searchParams.get('tab'));

    // Profile state
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
    const [profileSaved, setProfileSaved] = useState(false);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateUser({ avatar: ev.target?.result as string });
        };
        reader.readAsDataURL(file);
    };

    const saveProfile = () => {
        updateUser({ name: profileForm.name, email: profileForm.email });
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2000);
    };

    const setTab = (value: string) => {
        const t = parseAdminTab(value);
        if (t === 'overview') setSearchParams({}, { replace: true });
        else setSearchParams({ tab: t }, { replace: true });
    };

    // ── API state ─────────────────────────────────────────────────────────────
    const [apiLoading, setApiLoading] = useState(false);
    const [products, setProducts] = useState<Product[]>(INIT_PRODUCTS);
    const [categories, setCategories] = useState<string[]>([...CATEGORIES]);
    const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
    const [orders, setOrders] = useState<Order[]>(INIT_ORDERS);
    const [customers, setCustomers] = useState<Customer[]>(INIT_CUSTOMERS);

    const fetchAdminData = useCallback(async () => {
        setApiLoading(true);
        try {
            const [productsRes, categoriesRes, ordersRes, usersRes] = await Promise.allSettled([
                productApi.getAll(),
                productApi.getAllCategories(),
                orderApi.getAllOrders(),
                authApi.getAllUsers(),
            ]);

            if (productsRes.status === 'fulfilled') {
                setProducts((productsRes.value.result ?? []).map(mapApiProduct));
            }
            if (categoriesRes.status === 'fulfilled') {
                const cats = categoriesRes.value.result ?? [];
                setApiCategories(cats);
                setCategories(cats.map(c => c.categoryName));
            }
            if (ordersRes.status === 'fulfilled') {
                setOrders((ordersRes.value.result ?? []).map(mapApiOrder));
            }
            if (usersRes.status === 'fulfilled') {
                setCustomers((usersRes.value.result ?? []).map(mapApiUser));
            }
        } catch {
            // silently fall back to mock data
        } finally {
            setApiLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ index: number; name: string } | null>(null);
    const [editingCategory, setEditingCategory] = useState<{ index: number; name: string } | null>(null);

    const addCategory = () => {
        const name = newCategoryName.trim();
        if (!name || categories.includes(name)) return;
        setCategories(prev => [...prev, name]);
        setNewCategoryName('');
    };

    const deleteCategory = (idx: number) => setCategories(prev => prev.filter((_, i) => i !== idx));

    const saveEditCategory = () => {
        if (!editingCategory) return;
        const name = editingCategory.name.trim();
        if (!name) return;
        setCategories(prev => prev.map((c, i) => i === editingCategory.index ? name : c));
        setEditingCategory(null);
    };
    const [orders, setOrders] = useState<Order[]>(INIT_ORDERS);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [customers, setCustomers] = useState<Customer[]>(INIT_CUSTOMERS);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [customerPasswords, setCustomerPasswords] = useState<Record<string, string>>(
        () => Object.fromEntries(INIT_CUSTOMERS.map(c => [c.id, 'password123']))
    );
    const [showPasswordFor, setShowPasswordFor] = useState<string | null>(null);
    const [editingPassword, setEditingPassword] = useState<{ id: string; value: string } | null>(null);
    const [bookings, setBookings] = useState<Booking[]>(INIT_BOOKINGS);
    const [search, setSearch] = useState('');
    const [calendarMonth, setCalendarMonth] = useState(() => {
        const n = new Date();
        return new Date(n.getFullYear(), n.getMonth(), 1);
    });
    const [calendarSelectedDay, setCalendarSelectedDay] = useState<Date | null>(null);

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
    const saveProduct = async () => {
        if (!pForm.name.trim()) { toast.error('Vui lòng nhập tên sản phẩm'); return; }
        try {
            const catId = apiCategories.find(c => c.categoryName === pForm.category)?.id;
            const requestData = {
                productName: pForm.name,
                price: parseFloat(pForm.price) || 0,
                stockQuantity: parseInt(pForm.stock) || 0,
                categoryId: catId ? [catId] : [],
                status: (pForm.status === 'active' ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
            };
            if (productModal === 'add') {
                await productApi.create(requestData, []);
                toast.success('Đã thêm sản phẩm');
            } else if (editingProduct) {
                await productApi.update(editingProduct.id, requestData);
                toast.success('Đã cập nhật sản phẩm');
            }
            await fetchAdminData();
        } catch {
            // Fallback to local update
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
        }
        setProductModal(null);
    };
    const deleteProduct = async (id: string) => {
        try {
            await productApi.delete(id);
            await fetchAdminData();
            toast.success('Đã xóa sản phẩm');
        } catch {
            setProducts(prev => prev.filter(p => p.id !== id));
            toast.success('Đã xóa sản phẩm');
        }
    };

    const updateOrderStatus = async (id: string, status: Order['status']) => {
        const apiStatusMap: Record<Order['status'], OrderStatus> = {
            'Đang xử lý': 'PENDING', 'Đang giao': 'CONFIRMED',
            'Hoàn thành': 'CONFIRMED', 'Đã hủy': 'CANCELLED',
        };
        try {
            await orderApi.adminUpdateStatus(id, { status: apiStatusMap[status] });
            await fetchAdminData();
            toast.success('Đã cập nhật trạng thái đơn hàng');
        } catch {
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
            toast.success('Đã cập nhật trạng thái đơn hàng');
        }
    };
    const deleteOrder = async (id: string) => {
        try {
            await orderApi.adminCancelOrder(id);
            await fetchAdminData();
            toast.success('Đã xóa đơn hàng');
        } catch {
            setOrders(prev => prev.filter(o => o.id !== id));
            toast.success('Đã xóa đơn hàng');
        }
    };

    const toggleCustomer = (id: string) => {
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' } : c));
        toast.success('Đã cập nhật trạng thái khách hàng');
    };
    const deleteCustomer = async (id: string) => {
        try {
            await authApi.deleteUser(id);
            await fetchAdminData();
            toast.success('Đã xóa khách hàng');
        } catch {
            setCustomers(prev => prev.filter(c => c.id !== id));
            toast.success('Đã xóa khách hàng');
        }
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

    const calendarCells = useMemo(() => buildMonthCalendarCells(calendarMonth), [calendarMonth]);
    const today = new Date();

    const bookingsForCalendarDay = (day: Date) =>
        filteredBookings.filter((b) => {
            const d = parseBookingDateStr(b.date);
            return d !== null && sameCalendarDay(d, day);
        });

    const shiftCalendarMonth = (delta: number) => {
        setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
        setCalendarSelectedDay(null);
    };

    const lowStock = products.filter(p => p.stock < 10);

    return (
        <div className="w-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển quản trị</h1>
                <p className="text-muted-foreground text-sm mt-1">Quản lý toàn bộ hoạt động kinh doanh</p>
            </div>

            <Tabs value={activeTab} onValueChange={setTab}>
                <TabsList className="mb-6 flex-wrap h-auto gap-1 lg:hidden">
                    <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                    <TabsTrigger value="products">Sản phẩm</TabsTrigger>
                    <TabsTrigger value="orders">Đơn hàng</TabsTrigger>
                    <TabsTrigger value="customers">Khách hàng</TabsTrigger>
                    <TabsTrigger value="bookings">Lịch đặt</TabsTrigger>
                    <TabsTrigger value="stats">Thống kê</TabsTrigger>
                    <TabsTrigger value="settings">Cài đặt</TabsTrigger>
                </TabsList>

                {/* ── Tổng quan ── */}
                <TabsContent value="overview">
                    {apiLoading && (
                        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tải dữ liệu từ server...
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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

                    <div className="grid lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-6">
                        <Card className="p-5">
                            <h2 className="font-semibold text-foreground mb-4">Doanh thu theo tháng</h2>
                            <ResponsiveContainer width="100%" height={260}>
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
                            <ResponsiveContainer width="100%" height={260}>
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

                {/* ── Thêm sản phẩm ── */}
                <TabsContent value="products-add">
                    <Card className="p-6 max-w-2xl">
                        <h2 className="text-lg font-semibold text-foreground mb-6">Thêm sản phẩm mới</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">Tên sản phẩm</label>
                                    <Input placeholder="Nhập tên sản phẩm..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">Danh mục</label>
                                    <Select>
                                        <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">Giá (USD)</label>
                                    <Input type="number" placeholder="0.00" min={0} step={0.01} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">Tồn kho</label>
                                    <Input type="number" placeholder="0" min={0} />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Mô tả</label>
                                <textarea
                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                                    placeholder="Nhập mô tả sản phẩm..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button className="bg-[#448B3D] hover:bg-[#336B2D] text-white">
                                    <Plus className="w-4 h-4" /> Thêm sản phẩm
                                </Button>
                                <Button variant="outline">Hủy</Button>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* ── Danh mục sản phẩm ── */}
                <TabsContent value="product-categories">
                    {/* Form thêm danh mục */}
                    <Card className="p-5 mb-4">
                        <h3 className="text-sm font-semibold text-foreground mb-3">Thêm danh mục mới</h3>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nhập tên danh mục..."
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addCategory()}
                                className="max-w-sm"
                            />
                            <Button
                                onClick={addCategory}
                                disabled={!newCategoryName.trim() || categories.includes(newCategoryName.trim())}
                                className="bg-[#448B3D] hover:bg-[#336B2D] text-white shrink-0"
                            >
                                <Plus className="w-4 h-4" /> Thêm
                            </Button>
                        </div>
                        {newCategoryName.trim() && categories.includes(newCategoryName.trim()) && (
                            <p className="text-xs text-red-500 mt-1.5">Danh mục này đã tồn tại.</p>
                        )}
                    </Card>

                    {/* Danh sách danh mục */}
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="text-left p-3 text-muted-foreground font-medium">#</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Tên danh mục</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Số sản phẩm</th>
                                        <th className="text-left p-3 text-muted-foreground font-medium">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.map((cat, idx) => (
                                        <tr key={cat} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="p-3 text-muted-foreground">{idx + 1}</td>
                                            <td className="p-3 font-medium text-foreground">
                                                {editingCategory?.index === idx ? (
                                                    <div className="flex gap-2 items-center">
                                                        <Input
                                                            value={editingCategory.name}
                                                            onChange={e => setEditingCategory({ index: idx, name: e.target.value })}
                                                            onKeyDown={e => { if (e.key === 'Enter') saveEditCategory(); if (e.key === 'Escape') setEditingCategory(null); }}
                                                            className="h-8 max-w-[200px]"
                                                            autoFocus
                                                        />
                                                        <Button size="sm" onClick={saveEditCategory} className="bg-[#448B3D] hover:bg-[#336B2D] text-white h-8">Lưu</Button>
                                                        <Button size="sm" variant="outline" onClick={() => setEditingCategory(null)} className="h-8">Hủy</Button>
                                                    </div>
                                                ) : cat}
                                            </td>
                                            <td className="p-3 text-muted-foreground">
                                                {products.filter(p => p.category === cat).length}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-1">
                                                    <Button size="icon-sm" variant="ghost" onClick={() => setEditingCategory({ index: idx, name: cat })}>
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button size="icon-sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteCategory(idx)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {categories.length === 0 && (
                                        <tr><td colSpan={4} className="text-center text-muted-foreground py-8">Chưa có danh mục nào</td></tr>
                                    )}
                                </tbody>
                            </table>
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
                                        <th className="text-left p-3 text-muted-foreground font-medium">Thao tác</th>
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
                                                <div className="flex items-center gap-1">
                                                    <Button size="icon-sm" variant="ghost" onClick={() => { setSelectedOrderId(o.id); setSearchParams({ tab: 'order-detail' }); }} title="Xem chi tiết">
                                                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                                                    </Button>
                                                    <Button size="icon-sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteOrder(o.id)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredOrders.length === 0 && <p className="text-center text-muted-foreground py-8">Không tìm thấy đơn hàng</p>}
                        </div>
                    </Card>
                </TabsContent>

                {/* ── Chi tiết đơn hàng ── */}
                <TabsContent value="order-detail">
                    {(() => {
                        const o = orders.find(x => x.id === selectedOrderId) ?? orders[0];
                        if (!o) return <p className="text-center text-muted-foreground py-8">Không có đơn hàng nào.</p>;
                        const product = products.find(p => p.id === o.productId);
                        const statusColors: Record<string, string> = {
                            'Hoàn thành': 'bg-green-100 text-green-700 border border-green-200',
                            'Đang giao': 'bg-blue-100 text-blue-700 border border-blue-200',
                            'Đang xử lý': 'bg-orange-100 text-orange-700 border border-orange-200',
                            'Đã hủy': 'bg-red-100 text-red-700 border border-red-200',
                        };
                        const statusIcons: Record<string, string> = {
                            'Hoàn thành': '✓', 'Đang giao': '🚚', 'Đang xử lý': '⏳', 'Đã hủy': '✕',
                        };
                        return (
                            <div className="space-y-4 max-w-4xl">
                                {/* Back */}
                                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-1"
                                    onClick={() => setSearchParams({ tab: 'orders' })}>
                                    <ArrowLeft className="w-4 h-4" /> Danh sách đơn hàng
                                </Button>

                                {/* Header card */}
                                <Card className="p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Mã đơn hàng</p>
                                            <h2 className="text-xl font-bold text-foreground">{o.id}</h2>
                                            <p className="text-sm text-muted-foreground mt-1">Ngày đặt: {o.date}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${statusColors[o.status] ?? ''}`}>
                                                <span>{statusIcons[o.status]}</span> {o.status}
                                            </span>
                                            <Select value={o.status} onValueChange={v => updateOrderStatus(o.id, v as Order['status'])}>
                                                <SelectTrigger size="sm" className="w-40">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ORDER_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </Card>

                                <div className="grid lg:grid-cols-2 xl:grid-cols-2 gap-4">
                                    {/* Thông tin khách hàng */}
                                    <Card className="p-5 space-y-3">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            <Users className="w-4 h-4 text-[#448B3D]" /> Thông tin khách hàng
                                        </h3>
                                        <div className="space-y-2.5 text-sm">
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground shrink-0">Tên khách hàng</span>
                                                <span className="font-medium text-foreground text-right">{o.customer}</span>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <span className="text-muted-foreground shrink-0">Địa chỉ giao hàng</span>
                                                <span className="font-medium text-foreground text-right">{o.address}</span>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Thông tin sản phẩm */}
                                    <Card className="p-5 space-y-3">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            <ShoppingBag className="w-4 h-4 text-[#448B3D]" /> Sản phẩm đặt mua
                                        </h3>
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                                            {product && (
                                                <img src={product.image} alt={product.name}
                                                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border" />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <Link to={`/products/${o.productId}`}
                                                    className="font-semibold text-[#448B3D] hover:underline text-sm line-clamp-2">
                                                    {o.product}
                                                </Link>
                                                {product && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
                                                )}
                                            </div>
                                            <p className="text-lg font-bold text-foreground shrink-0">{o.amount}</p>
                                        </div>
                                        <div className="flex justify-between text-sm pt-1 border-t border-border">
                                            <span className="text-muted-foreground">Tổng thanh toán</span>
                                            <span className="font-bold text-foreground text-base">{o.amount}</span>
                                        </div>
                                    </Card>
                                </div>

                                {/* Timeline trạng thái */}
                                <Card className="p-5">
                                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#448B3D]" /> Tiến trình đơn hàng
                                    </h3>
                                    <div className="flex items-center gap-0">
                                        {(['Đang xử lý', 'Đang giao', 'Hoàn thành'] as const).map((step, idx, arr) => {
                                            const stepOrder = ['Đang xử lý', 'Đang giao', 'Hoàn thành'];
                                            const currentIdx = stepOrder.indexOf(o.status);
                                            const stepIdx = stepOrder.indexOf(step);
                                            const isDone = o.status !== 'Đã hủy' && stepIdx <= currentIdx;
                                            const isActive = stepIdx === currentIdx && o.status !== 'Đã hủy';
                                            return (
                                                <div key={step} className="flex items-center flex-1">
                                                    <div className="flex flex-col items-center gap-1.5 flex-1">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                                                            ${isActive ? 'bg-[#448B3D] border-[#448B3D] text-white' : isDone ? 'bg-[#448B3D]/20 border-[#448B3D] text-[#448B3D]' : 'bg-muted border-border text-muted-foreground'}`}>
                                                            {isDone && !isActive ? '✓' : idx + 1}
                                                        </div>
                                                        <span className={`text-xs text-center leading-tight ${isActive ? 'font-semibold text-[#448B3D]' : isDone ? 'text-[#448B3D]' : 'text-muted-foreground'}`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                    {idx < arr.length - 1 && (
                                                        <div className={`h-0.5 flex-1 mx-1 rounded ${isDone && stepOrder.indexOf(arr[idx + 1]) <= currentIdx ? 'bg-[#448B3D]' : 'bg-border'}`} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {o.status === 'Đã hủy' && (
                                            <div className="ml-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 border border-red-200">
                                                <span className="text-red-600 text-sm font-semibold">✕ Đã hủy</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        );
                    })()}
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
                                        <th className="text-left p-3 text-muted-foreground font-medium">Địa chỉ</th>
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
                                            <td className="p-3 text-muted-foreground max-w-[180px] truncate" title={c.address}>{c.address}</td>
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
                                                    <Button size="icon-sm" variant="ghost" onClick={() => { setSelectedCustomerId(c.id); setSearchParams({ tab: 'customer-detail' }); }} title="Xem chi tiết">
                                                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                                                    </Button>
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

                {/* ── Chi tiết khách hàng ── */}
                <TabsContent value="customer-detail">
                    {(() => {
                        const c = customers.find(x => x.id === selectedCustomerId) ?? customers[0];
                        if (!c) return <p className="text-muted-foreground py-8 text-center">Không có khách hàng nào.</p>;
                        const customerOrders = orders.filter(o => o.customer === c.name);
                        const pwd = customerPasswords[c.id] ?? '';
                        const isShowingPwd = showPasswordFor === c.id;
                        const isEditingPwd = editingPassword?.id === c.id;
                        return (
                            <div className="space-y-4 max-w-4xl">
                                {/* Back */}
                                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground -ml-1"
                                    onClick={() => setSearchParams({ tab: 'customers' })}>
                                    <ArrowLeft className="w-4 h-4" /> Danh sách khách hàng
                                </Button>

                                {/* Header */}
                                <Card className="p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-full bg-[#448B3D]/15 ring-2 ring-[#448B3D]/30 flex items-center justify-center shrink-0">
                                                <Users className="w-7 h-7 text-[#448B3D]" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-foreground">{c.name}</h2>
                                                <p className="text-sm text-muted-foreground">Tham gia từ {c.joined}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={c.status === 'active' ? 'bg-green-100 text-green-700 border border-green-200 text-sm px-3 py-1' : 'bg-red-100 text-red-700 border border-red-200 text-sm px-3 py-1'}>
                                                {c.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                                            </Badge>
                                            <Button size="sm" variant="outline" onClick={() => toggleCustomer(c.id)} className="gap-1.5">
                                                {c.status === 'active' ? <><Lock className="w-3.5 h-3.5 text-orange-500" /> Khóa tài khoản</> : <><Unlock className="w-3.5 h-3.5 text-green-600" /> Mở khóa</>}
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
                                        {[
                                            { label: 'Tổng đơn hàng', value: String(c.orders) },
                                            { label: 'Tổng chi tiêu', value: c.spent },
                                            { label: 'Đơn hoàn thành', value: String(customerOrders.filter(o => o.status === 'Hoàn thành').length) },
                                        ].map(stat => (
                                            <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/40">
                                                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <div className="grid lg:grid-cols-2 xl:grid-cols-2 gap-4">
                                    {/* Thông tin cá nhân */}
                                    <Card className="p-5 space-y-3">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            <Users className="w-4 h-4 text-[#448B3D]" /> Thông tin cá nhân
                                        </h3>
                                        <div className="space-y-3 text-sm divide-y divide-border">
                                            {[
                                                { label: 'Email', value: c.email },
                                                { label: 'Số điện thoại', value: c.phone },
                                                { label: 'Địa chỉ', value: c.address },
                                                { label: 'Ngày tham gia', value: c.joined },
                                            ].map(row => (
                                                <div key={row.label} className="flex justify-between gap-3 pt-3 first:pt-0">
                                                    <span className="text-muted-foreground shrink-0">{row.label}</span>
                                                    <span className="font-medium text-foreground text-right">{row.value}</span>
                                                </div>
                                            ))}
                                            {/* Mật khẩu */}
                                            <div className="flex justify-between gap-3 pt-3 items-center">
                                                <span className="text-muted-foreground shrink-0">Mật khẩu</span>
                                                <div className="flex items-center gap-2">
                                                    {isEditingPwd ? (
                                                        <>
                                                            <Input type="text" value={editingPassword.value}
                                                                onChange={e => setEditingPassword({ id: c.id, value: e.target.value })}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') { setCustomerPasswords(prev => ({ ...prev, [c.id]: editingPassword.value })); setEditingPassword(null); }
                                                                    if (e.key === 'Escape') setEditingPassword(null);
                                                                }}
                                                                className="h-8 w-36 text-sm" autoFocus />
                                                            <Button size="sm" className="h-8 bg-[#448B3D] hover:bg-[#336B2D] text-white" onClick={() => { setCustomerPasswords(prev => ({ ...prev, [c.id]: editingPassword.value })); setEditingPassword(null); }}>Lưu</Button>
                                                            <Button size="sm" variant="outline" className="h-8" onClick={() => setEditingPassword(null)}>Hủy</Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="font-mono tracking-widest text-foreground select-none text-base">
                                                                {isShowingPwd ? pwd : '••••••••'}
                                                            </span>
                                                            <button type="button" onClick={() => setShowPasswordFor(isShowingPwd ? null : c.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                                                                {isShowingPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                            </button>
                                                            <button type="button" onClick={() => setEditingPassword({ id: c.id, value: pwd })} className="text-muted-foreground hover:text-foreground transition-colors">
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Đơn hàng */}
                                    <Card className="p-5">
                                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                            <ShoppingBag className="w-4 h-4 text-[#448B3D]" /> Đơn hàng của khách
                                        </h3>
                                        {customerOrders.length === 0 ? (
                                            <p className="text-sm text-muted-foreground py-6 text-center">Chưa có đơn hàng nào.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {customerOrders.map(o => (
                                                    <div key={o.id}
                                                        className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors cursor-pointer gap-2"
                                                        onClick={() => { setSelectedOrderId(o.id); setSearchParams({ tab: 'order-detail' }); }}>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-foreground">{o.id}</p>
                                                            <p className="text-xs text-muted-foreground truncate max-w-[160px]">{o.product}</p>
                                                            <p className="text-xs text-muted-foreground">{o.date}</p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-sm font-bold text-foreground">{o.amount}</p>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${orderBadge(o.status)}`}>{o.status}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </div>
                        );
                    })()}
                </TabsContent>

                {/* ── Lịch đặt (lưới lịch vạn niên) ── */}
                <TabsContent value="bookings" className="space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo mã, khách..."
                                className="pl-9 rounded-xl"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button type="button" variant="outline" size="icon" className="rounded-xl shrink-0" onClick={() => shiftCalendarMonth(-1)} aria-label="Tháng trước">
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-semibold text-foreground min-w-44 text-center capitalize">
                                {calendarMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                            </span>
                            <Button type="button" variant="outline" size="icon" className="rounded-xl shrink-0" onClick={() => shiftCalendarMonth(1)} aria-label="Tháng sau">
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className="rounded-xl text-xs h-9"
                                onClick={() => {
                                    const n = new Date();
                                    setCalendarMonth(new Date(n.getFullYear(), n.getMonth(), 1));
                                    setCalendarSelectedDay(null);
                                }}
                            >
                                Tháng này
                            </Button>
                        </div>
                    </div>

                    <Card className="overflow-hidden border-border p-0 shadow-sm">
                        <div className="grid grid-cols-7 gap-px bg-border">
                            {WEEKDAY_LABELS.map((w) => (
                                <div key={w} className="bg-[#448B3D]/12 dark:bg-[#448B3D]/20 text-center text-xs font-semibold text-foreground py-2.5">
                                    {w}
                                </div>
                            ))}
                            {calendarCells.map((day, i) => {
                                if (!day) {
                                    return <div key={`empty-${i}`} className="min-h-[108px] bg-muted/25 dark:bg-muted/10" />;
                                }
                                const dayBookings = bookingsForCalendarDay(day);
                                const isToday = sameCalendarDay(day, today);
                                const isPicked = calendarSelectedDay !== null && sameCalendarDay(day, calendarSelectedDay);
                                return (
                                    <button
                                        key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                                        type="button"
                                        onClick={() =>
                                            setCalendarSelectedDay((prev) => (prev !== null && sameCalendarDay(prev, day) ? null : day))
                                        }
                                        className={cn(
                                            'min-h-[108px] bg-card text-left p-1.5 align-top transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#448B3D]/40',
                                            isToday && 'ring-2 ring-inset ring-[#448B3D] bg-[#448B3D]/[0.07]',
                                            isPicked && 'bg-[#448B3D]/12'
                                        )}
                                    >
                                        <div className="flex justify-between items-start gap-1 mb-1">
                                            <span className={cn('text-sm font-semibold tabular-nums', isToday && 'text-[#448B3D]')}>
                                                {day.getDate()}
                                            </span>
                                            {dayBookings.length > 0 && (
                                                <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1 rounded-sm tabular-nums">
                                                    {dayBookings.length}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1 overflow-hidden">
                                            {dayBookings.slice(0, 3).map((b) => (
                                                <div
                                                    key={b.id}
                                                    className={cn('text-[10px] leading-tight rounded px-1 py-0.5 truncate border', bookingBadge(b.status))}
                                                    title={`${b.time} · ${b.service} · ${b.customer}`}
                                                >
                                                    <span className="font-semibold">{b.time}</span> {b.pet}
                                                </div>
                                            ))}
                                            {dayBookings.length > 3 && (
                                                <p className="text-[10px] text-muted-foreground font-medium">+{dayBookings.length - 3} lịch</p>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </Card>

                    {calendarSelectedDay !== null && (
                        <Card className="p-4 sm:p-5 border-border">
                            <h3 className="font-semibold text-foreground mb-3">
                                Chi tiết{' '}
                                {calendarSelectedDay.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                            {bookingsForCalendarDay(calendarSelectedDay).length === 0 ? (
                                <p className="text-sm text-muted-foreground">Không có lịch trong ngày này (theo bộ lọc tìm kiếm).</p>
                            ) : (
                                <ul className="space-y-3">
                                    {bookingsForCalendarDay(calendarSelectedDay).map((b) => (
                                        <li key={b.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <p className="text-sm font-semibold text-foreground">{b.service}</p>
                                                <p className="text-xs text-muted-foreground">{b.customer} · {b.pet}</p>
                                                <p className="text-xs text-muted-foreground">{b.id} · {b.time}</p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Select value={b.status} onValueChange={(v) => updateBookingStatus(b.id, v as Booking['status'])}>
                                                    <SelectTrigger size="sm" className="w-40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {BOOKING_STATUSES.map((s) => (
                                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Button size="icon-sm" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => deleteBooking(b.id)}>
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>
                    )}

                    {filteredBookings.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">Không có lịch đặt khớp tìm kiếm.</p>
                    )}

                    <p className="text-xs text-muted-foreground">Chọn một ngày trên lưới để xem chi tiết, đổi trạng thái hoặc xóa lịch.</p>
                </TabsContent>

                {/* ── Thống kê (biểu đồ) ── */}
                <TabsContent value="stats">
                    <div className="grid lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                        <Card className="p-5">
                            <h2 className="font-semibold text-foreground mb-4">Doanh thu theo tháng</h2>
                            <ResponsiveContainer width="100%" height={280}>
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
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={CHART_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                    <YAxis stroke="#6B7280" fontSize={12} />
                                    <Tooltip />
                                    <Bar dataKey="orders" fill="#448B3D" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                        <Card className="p-5 lg:col-span-2 2xl:col-span-1">
                            <h2 className="font-semibold text-foreground mb-4">Tổng quan</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Tổng doanh thu', value: '$28,000' },
                                    { label: 'Tổng đơn hàng', value: String(orders.length) },
                                    { label: 'Khách hàng', value: String(customers.length) },
                                    { label: 'Lịch đặt', value: String(bookings.length) },
                                ].map(s => (
                                    <div key={s.label} className="p-3 rounded-xl bg-muted/40 text-center">
                                        <p className="text-xl font-bold text-foreground">{s.value}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                {/* ── Cài đặt ── */}
                <TabsContent value="settings" className="space-y-6">
                    {/* Thông tin cá nhân */}
                    <Card className="max-w-3xl overflow-hidden border-border/80 shadow-md">
                        <div className="border-b border-border bg-linear-to-r from-[#448B3D]/12 via-transparent to-violet-500/5 px-6 py-5 dark:from-[#448B3D]/25">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#448B3D]/15 text-[#448B3D] shadow-sm dark:bg-[#448B3D]/25">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Thông tin cá nhân</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Cập nhật ảnh đại diện, tên và email tài khoản quản trị.</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Avatar */}
                            <div className="flex items-center gap-5">
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 rounded-full overflow-hidden bg-[#448B3D]/15 ring-2 ring-[#448B3D]/30 flex items-center justify-center">
                                        {user?.avatar
                                            ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            : <span className="text-2xl font-bold text-[#448B3D]">{user?.name.charAt(0)}</span>
                                        }
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#448B3D] hover:bg-[#336B2D] text-white flex items-center justify-center shadow-md transition-colors"
                                        title="Đổi ảnh đại diện"
                                    >
                                        <Camera className="w-3.5 h-3.5" />
                                    </button>
                                    <input
                                        ref={avatarInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{user?.name}</p>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="text-xs text-[#448B3D] hover:underline mt-1 font-medium"
                                    >
                                        Thay đổi ảnh đại diện
                                    </button>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="profile-name">Họ và tên</Label>
                                    <Input
                                        id="profile-name"
                                        value={profileForm.name}
                                        onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Nhập họ và tên..."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="profile-email">Email</Label>
                                    <Input
                                        id="profile-email"
                                        type="email"
                                        value={profileForm.email}
                                        onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder="Nhập email..."
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={saveProfile}
                                    className="bg-[#448B3D] hover:bg-[#336B2D] text-white"
                                    disabled={!profileForm.name.trim()}
                                >
                                    {profileSaved ? '✓ Đã lưu' : 'Lưu thay đổi'}
                                </Button>
                                <Button variant="outline" onClick={() => setProfileForm({ name: user?.name ?? '', email: user?.email ?? '' })}>
                                    Đặt lại
                                </Button>
                            </div>
                        </div>
                    </Card>
                    <Card className="max-w-3xl overflow-hidden border-border/80 shadow-md">
                        <div className="border-b border-border bg-linear-to-r from-[#448B3D]/12 via-transparent to-violet-500/5 px-6 py-5 dark:from-[#448B3D]/25">
                            <div className="flex items-start gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#448B3D]/15 text-[#448B3D] shadow-sm dark:bg-[#448B3D]/25 dark:text-[#7CB878]">
                                    <Settings className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">Giao diện và trải nghiệm</h2>
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
                    <Card className="p-6 max-w-3xl border-border/80">
                        <h2 className="font-semibold text-foreground mb-2">Cài đặt hệ thống</h2>
                        <p className="text-sm text-muted-foreground">
                            Cấu hình cửa hàng, thông báo và tích hợp API quản trị sẽ được bổ sung sau.
                        </p>
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
