import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Bell, CalendarCheck, CheckCheck, CreditCard, Loader2, MessageSquareText, Package, ShieldCheck, UserRound } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { notificationApi, type NotificationItem, type NotificationType } from '@/lib/notificationApi';
import { cn } from '@/lib/utils';

const typeMeta: Record<NotificationType, { label: string; icon: ComponentType<{ className?: string }>; className: string }> = {
    SYSTEM: { label: 'Hệ thống', icon: ShieldCheck, className: 'bg-slate-100 text-slate-700 dark:bg-slate-900/70 dark:text-slate-300' },
    USER: { label: 'Tài khoản', icon: UserRound, className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300' },
    ORDER: { label: 'Đơn hàng', icon: Package, className: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300' },
    PAYMENT: { label: 'Thanh toán', icon: CreditCard, className: 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300' },
    BOOKING: { label: 'Lịch hẹn', icon: CalendarCheck, className: 'bg-violet-100 text-violet-700 dark:bg-violet-950/70 dark:text-violet-300' },
    FEEDBACK: { label: 'Phản hồi', icon: MessageSquareText, className: 'bg-pink-100 text-pink-700 dark:bg-pink-950/70 dark:text-pink-300' },
};

function formatNotificationTime(value?: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const diffMs = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return 'Vừa xong';
    if (diffMs < hour) return `${Math.max(1, Math.floor(diffMs / minute))} phút trước`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)} giờ trước`;
    if (diffMs < 7 * day) return `${Math.floor(diffMs / day)} ngày trước`;

    return date.toLocaleDateString('vi-VN');
}

function targetPathFor(notification: NotificationItem, role?: 'user' | 'admin') {
    const base = role === 'admin' ? '/admin' : '/dashboard';

    switch (notification.type) {
        case 'ORDER':
        case 'PAYMENT':
            return `${base}?tab=orders`;
        case 'BOOKING':
            return `${base}?tab=bookings`;
        case 'USER':
            return role === 'admin' ? `${base}?tab=customers` : `${base}?tab=profile`;
        case 'FEEDBACK':
            return role === 'admin' ? base : '/feedback';
        case 'SYSTEM':
        default:
            return base;
    }
}

interface NotificationDropdownProps {
    compact?: boolean;
    className?: string;
}

export default function NotificationDropdown({ compact = false, className }: NotificationDropdownProps) {
    const navigate = useNavigate();
    const { pathname, search } = useLocation();
    const { user, isAuthenticated } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const visibleUnreadCount = useMemo(() => Math.min(unreadCount, 99), [unreadCount]);

    const refreshNotifications = useCallback(async () => {
        if (!isAuthenticated) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        setLoading(true);
        try {
            const [listRes, countRes] = await Promise.all([
                notificationApi.getMyNotifications(false),
                notificationApi.getUnreadCount(),
            ]);
            setNotifications(listRes.result ?? []);
            setUnreadCount(countRes.result?.unreadCount ?? 0);
        } catch {
            setNotifications([]);
            setUnreadCount(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        void refreshNotifications();
    }, [refreshNotifications]);

    useEffect(() => {
        if (!isAuthenticated) return;
        const id = window.setInterval(() => {
            void refreshNotifications();
        }, 30000);
        return () => window.clearInterval(id);
    }, [isAuthenticated, refreshNotifications]);

    useEffect(() => {
        setOpen(false);
    }, [pathname, search]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: PointerEvent) => {
            if (!panelRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [open]);

    if (!isAuthenticated) return null;

    const handleOpen = () => {
        setOpen((current) => {
            const next = !current;
            if (next) void refreshNotifications();
            return next;
        });
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0 || actionLoading) return;

        setActionLoading(true);
        try {
            await notificationApi.markAllAsRead();
            setNotifications((current) => current.map((item) => ({ ...item, read: true })));
            setUnreadCount(0);
            toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
        } catch {
            toast.error('Không thể cập nhật thông báo');
        } finally {
            setActionLoading(false);
        }
    };

    const handleNotificationClick = async (notification: NotificationItem) => {
        if (!notification.read) {
            setNotifications((current) => current.map((item) => (
                item.id === notification.id ? { ...item, read: true } : item
            )));
            setUnreadCount((current) => Math.max(0, current - 1));

            try {
                await notificationApi.markAsRead(notification.id);
            } catch {
                void refreshNotifications();
                toast.error('Không thể đánh dấu thông báo đã đọc');
                return;
            }
        }

        setOpen(false);
        navigate(targetPathFor(notification, user?.role));
    };

    return (
        <div ref={panelRef} className={cn('relative', className)}>
            <Button
                type='button'
                variant={compact ? 'ghost' : 'outline'}
                size={compact ? 'icon' : undefined}
                className={cn(
                    'relative rounded-lg hover:bg-[#448B3D]/10',
                    compact ? 'h-10 w-10' : 'h-11 px-3 border-[#448B3D]'
                )}
                onClick={handleOpen}
                aria-expanded={open}
                aria-haspopup='true'
                aria-label={`Thông báo, ${unreadCount} chưa đọc`}
            >
                <Bell className={cn('w-5 h-5', compact ? 'text-foreground' : 'text-[#448B3D]')} />
                {unreadCount > 0 && (
                    <Badge className='absolute -top-2 -right-2 h-5 min-w-5 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] border-2 border-card font-bold'>
                        {unreadCount > 99 ? '99+' : visibleUnreadCount}
                    </Badge>
                )}
                {!compact && <span className='hidden lg:inline ml-2 text-sm font-semibold text-[#448B3D]'>Thông báo</span>}
            </Button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className='absolute right-0 top-full mt-2 z-60 w-[22rem] max-w-[min(22rem,calc(100vw-1rem))]'
                    >
                        <div className='rounded-xl border-2 border-border bg-card shadow-xl overflow-hidden max-h-[min(75vh,30rem)] flex flex-col'>
                            <div className='px-4 py-3 border-b border-border bg-[#448B3D]/5 flex items-center justify-between gap-3'>
                                <div>
                                    <p className='text-sm font-bold text-foreground'>Thông báo</p>
                                    <p className='text-xs text-muted-foreground mt-0.5'>
                                        {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
                                    </p>
                                </div>
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    className='h-8 px-2 text-xs text-[#448B3D] hover:bg-[#448B3D]/10'
                                    onClick={handleMarkAllAsRead}
                                    disabled={unreadCount === 0 || actionLoading}
                                >
                                    {actionLoading ? <Loader2 className='w-3.5 h-3.5 animate-spin' /> : <CheckCheck className='w-3.5 h-3.5' />}
                                    <span className='ml-1'>Đọc hết</span>
                                </Button>
                            </div>

                            <div className='overflow-y-auto flex-1 p-2 min-h-24'>
                                {loading ? (
                                    <div className='flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground'>
                                        <Loader2 className='w-4 h-4 animate-spin' />
                                        Đang tải thông báo...
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className='text-center py-10 px-4'>
                                        <Bell className='w-8 h-8 mx-auto text-muted-foreground/60' />
                                        <p className='mt-3 text-sm font-medium text-foreground'>Chưa có thông báo</p>
                                        <p className='mt-1 text-xs text-muted-foreground'>Các cập nhật đơn hàng, lịch hẹn và thanh toán sẽ xuất hiện tại đây.</p>
                                    </div>
                                ) : (
                                    <ul className='space-y-1'>
                                        {notifications.map((notification) => {
                                            const meta = typeMeta[notification.type] ?? typeMeta.SYSTEM;
                                            const Icon = meta.icon;

                                            return (
                                                <li key={notification.id}>
                                                    <button
                                                        type='button'
                                                        onClick={() => void handleNotificationClick(notification)}
                                                        className={cn(
                                                            'w-full text-left rounded-lg p-2.5 transition-colors flex gap-3 hover:bg-muted/80',
                                                            !notification.read && 'bg-[#448B3D]/10'
                                                        )}
                                                    >
                                                        <span className={cn('mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0', meta.className)}>
                                                            <Icon className='w-4 h-4' />
                                                        </span>
                                                        <span className='min-w-0 flex-1'>
                                                            <span className='flex items-start gap-2'>
                                                                <span className='text-sm font-semibold text-foreground line-clamp-1'>{notification.title}</span>
                                                                {!notification.read && <span className='mt-1.5 h-2 w-2 rounded-full bg-red-500 shrink-0' />}
                                                            </span>
                                                            <span className='block mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed'>
                                                                {notification.message}
                                                            </span>
                                                            <span className='mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground'>
                                                                <span>{meta.label}</span>
                                                                {notification.createdAt && <span>{formatNotificationTime(notification.createdAt)}</span>}
                                                            </span>
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
