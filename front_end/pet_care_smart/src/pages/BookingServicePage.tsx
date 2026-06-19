import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Phone, ChevronRight, ChevronLeft, Star, MessageSquarePlus, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import RatingSummary from '@/components/feedback/RatingSummary';
import { useFeedback } from '@/context/FeedbackContext';
import { useAuth } from '@/context/AuthContext';
import { userApi, type Pet } from '@/lib/userApi';
import {
    bookingApi,
    type ServicePackage,
    type Staff,
    categoryIcon,
    formatPrice,
} from '@/lib/bookingApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    while (dates.length < 12) {
        if (d.getDay() !== 0) dates.push(new Date(d));
        d.setDate(d.getDate() + 1);
    }
    return dates;
};

const toDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VI = ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'];

const TIME_SLOTS = [
    { id: '08:00:00', label: '8:00 SA', sub: 'Buổi sáng' },
    { id: '09:30:00', label: '9:30 SA', sub: 'Buổi sáng' },
    { id: '11:00:00', label: '11:00 SA', sub: 'Buổi sáng' },
    { id: '13:30:00', label: '1:30 CH', sub: 'Buổi chiều' },
    { id: '15:00:00', label: '3:00 CH', sub: 'Buổi chiều' },
    { id: '16:30:00', label: '4:30 CH', sub: 'Buổi chiều' },
];

const STEPS = ['Chọn dịch vụ', 'Chọn ngày & giờ', 'Chọn nhân viên', 'Xác nhận'];

const BookingServicePage = () => {
    const navigate = useNavigate();
    const { getByService, avgRating } = useFeedback();
    const { isAuthenticated } = useAuth();

    // ── Step state ────────────────────────────────────────────────────────────
    const [step, setStep] = useState(0);
    // step 4 = màn hình hoàn thành + feedback

    // ── API data ──────────────────────────────────────────────────────────────
    const [services, setServices] = useState<ServicePackage[]>([]);
    const [servicesLoading, setServicesLoading] = useState(true);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [pets, setPets] = useState<Pet[]>([]);
    const [petsLoading, setPetsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ── Selections ────────────────────────────────────────────────────────────
    const [selectedServiceId, setSelectedServiceId] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [selectedPetId, setSelectedPetId] = useState('');
    const [notes, setNotes] = useState('');

    // ── Feedback ──────────────────────────────────────────────────────────────
    const [showFbForm, setShowFbForm] = useState(false);
    const [fbDone, setFbDone] = useState(false);
    // For feedback tab selection (uses service id)
    const [feedbackServiceId, setFeedbackServiceId] = useState('');

    const availableDates = getAvailableDates();
    const selectedService = services.find(s => s.id === selectedServiceId);
    const selectedStaff = staffList.find(s => s.id === selectedStaffId);
    const selectedPet = pets.find(p => p.id === selectedPetId);
    const timeSlot = TIME_SLOTS.find(t => t.id === selectedTime);

    // ── Fetch service packages on mount ───────────────────────────────────────
    useEffect(() => {
        setServicesLoading(true);
        bookingApi.getServicePackages()
            .then(res => {
                setServices(res.result ?? []);
                if (res.result?.length) setFeedbackServiceId(res.result[0].id);
            })
            .catch(() => toast.error('Không thể tải danh sách dịch vụ'))
            .finally(() => setServicesLoading(false));
    }, []);

    // ── Fetch staff when entering step 2 ─────────────────────────────────────
    useEffect(() => {
        if (step === 2 && staffList.length === 0) {
            setStaffLoading(true);
            bookingApi.getStaff()
                .then(res => setStaffList(res.result ?? []))
                .catch(() => toast.error('Không thể tải danh sách nhân viên'))
                .finally(() => setStaffLoading(false));
        }
    }, [step, staffList.length]);

    // ── Fetch pets when entering step 2 (need auth) ───────────────────────────
    useEffect(() => {
        if (step === 2 && isAuthenticated && pets.length === 0) {
            setPetsLoading(true);
            userApi.getMyPets()
                .then(res => setPets(res.result ?? []))
                .catch(() => {/* silently fail — user may not have pets yet */ })
                .finally(() => setPetsLoading(false));
        }
    }, [step, isAuthenticated, pets.length]);

    const canNext = () => {
        if (step === 0) return !!selectedServiceId;
        if (step === 1) return !!selectedDate && !!selectedTime;
        if (step === 2) return !!selectedStaffId && !!selectedPetId;
        return true;
    };

    const handleConfirm = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đặt lịch');
            navigate('/login');
            return;
        }
        if (!selectedServiceId || !selectedDate || !selectedTime || !selectedStaffId || !selectedPetId) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setSubmitting(true);
        try {
            await bookingApi.createBooking({
                petId: selectedPetId,
                servicePackageId: selectedServiceId,
                staffId: selectedStaffId,
                appointmentDate: toDateString(selectedDate),
                appointmentTime: selectedTime,
                notes: notes || undefined,
            });
            toast.success('🎉 Đặt lịch thành công! Chúng tôi sẽ xác nhận sớm nhất.');
            setStep(4);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Đặt lịch thất bại';
            if (msg.includes('6106') || msg.toLowerCase().includes('not available')) {
                toast.error('Nhân viên đã có lịch vào khung giờ này. Vui lòng chọn giờ khác.');
            } else if (msg.includes('6104') || msg.toLowerCase().includes('pet not found')) {
                toast.error('Không tìm thấy thú cưng. Vui lòng kiểm tra lại.');
            } else {
                toast.error(msg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatDateDisplay = (d: Date) =>
        `${DAYS_VI[d.getDay()]}, ${d.getDate()} ${MONTHS_VI[d.getMonth()]} ${d.getFullYear()}`;

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-2xl mx-auto px-4 sm:px-6'>

                {/* Header */}
                <div className='text-center mb-8'>
                    <h1 className='text-3xl sm:text-4xl font-bold text-foreground mb-2'>📅 Đặt lịch dịch vụ</h1>
                    <p className='text-muted-foreground'>Bác sĩ đến tận nơi — Không cần đi xa</p>
                    <a href='tel:+84702500551' className='inline-flex items-center gap-2 mt-3 text-[#448B3D] font-semibold hover:underline'>
                        <Phone className='w-4 h-4' />
                        Hoặc gọi ngay: (84) 702 500 551
                    </a>
                </div>

                {/* Step indicator */}
                <div className='flex items-center justify-between mb-8 px-2'>
                    {STEPS.map((label, i) => (
                        <div key={i} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : 'flex-none'}`}>
                            <div className='flex flex-col items-center shrink-0'>
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${i < step ? 'bg-[#448B3D] text-white' :
                                    i === step ? 'bg-[#448B3D] text-white ring-4 ring-[#448B3D]/20' :
                                        'bg-muted text-muted-foreground'
                                    }`}>
                                    {i < step ? <Check className='w-4 h-4' /> : i + 1}
                                </div>
                                <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-[#448B3D]' : 'text-muted-foreground'}`}>
                                    {label}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${i < step ? 'bg-[#448B3D]' : 'bg-muted'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                    >

                        {/* ── BƯỚC 1: Chọn dịch vụ ── */}
                        {step === 0 && (
                            <Card className='p-6 rounded-2xl'>
                                <h2 className='text-xl font-bold text-foreground mb-5'>Bạn cần dịch vụ gì?</h2>
                                {servicesLoading ? (
                                    <div className='flex justify-center py-10'>
                                        <Loader2 className='w-8 h-8 animate-spin text-[#448B3D]' />
                                    </div>
                                ) : services.length === 0 ? (
                                    <div className='flex flex-col items-center py-10 gap-2 text-muted-foreground'>
                                        <AlertCircle className='w-8 h-8' />
                                        <p>Hiện chưa có dịch vụ nào. Vui lòng thử lại sau.</p>
                                    </div>
                                ) : (
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        {services.map(svc => (
                                            <button
                                                key={svc.id}
                                                onClick={() => setSelectedServiceId(svc.id)}
                                                className={`text-left p-5 rounded-xl border-2 transition-all ${selectedServiceId === svc.id
                                                    ? 'border-[#448B3D] bg-[#448B3D]/8 shadow-md'
                                                    : 'border-border hover:border-[#448B3D]/50 hover:bg-muted/40'
                                                    }`}
                                            >
                                                <div className='text-4xl mb-3'>{categoryIcon(svc.category)}</div>
                                                <p className='font-bold text-lg text-foreground mb-1'>{svc.name}</p>
                                                <p className='text-sm text-muted-foreground mb-3'>{svc.description}</p>
                                                <div className='flex items-center justify-between'>
                                                    <span className='text-xl font-bold text-[#448B3D]'>{formatPrice(svc.price)}</span>
                                                    <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full'>~{svc.durationMinutes} phút</span>
                                                </div>
                                                {selectedServiceId === svc.id && (
                                                    <div className='mt-3 flex items-center gap-1 text-[#448B3D] text-sm font-semibold'>
                                                        <Check className='w-4 h-4' /> Đã chọn
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* ── BƯỚC 2: Chọn ngày & giờ ── */}
                        {step === 1 && (
                            <Card className='p-6 rounded-2xl'>
                                <h2 className='text-xl font-bold text-foreground mb-5'>Chọn ngày & giờ</h2>

                                {/* Chọn ngày */}
                                <div className='mb-6'>
                                    <Label className='text-base font-semibold mb-3 block'>📆 Chọn ngày</Label>
                                    <div className='grid grid-cols-3 sm:grid-cols-4 gap-2'>
                                        {availableDates.map((d, i) => {
                                            const isSelected = selectedDate?.toDateString() === d.toDateString();
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedDate(d)}
                                                    className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all ${isSelected
                                                        ? 'border-[#448B3D] bg-[#448B3D] text-white shadow-md'
                                                        : 'border-border hover:border-[#448B3D]/50 hover:bg-muted/40'
                                                        }`}
                                                >
                                                    <span className={`text-xs font-medium ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                                        {DAYS_VI[d.getDay()]}
                                                    </span>
                                                    <span className='text-xl font-bold leading-tight'>{d.getDate()}</span>
                                                    <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                                        {MONTHS_VI[d.getMonth()]}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Chọn giờ */}
                                <div>
                                    <Label className='text-base font-semibold mb-3 block'>🕐 Chọn giờ</Label>
                                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                                        {TIME_SLOTS.map(slot => {
                                            const isSelected = selectedTime === slot.id;
                                            return (
                                                <button
                                                    key={slot.id}
                                                    onClick={() => setSelectedTime(slot.id)}
                                                    className={`flex flex-col items-center py-4 rounded-xl border-2 transition-all ${isSelected
                                                        ? 'border-[#448B3D] bg-[#448B3D] text-white shadow-md'
                                                        : 'border-border hover:border-[#448B3D]/50 hover:bg-muted/40'
                                                        }`}
                                                >
                                                    <span className='text-xl font-bold'>{slot.label}</span>
                                                    <span className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                                                        {slot.sub}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* ── BƯỚC 3: Chọn nhân viên & thú cưng ── */}
                        {step === 2 && (
                            <Card className='p-6 rounded-2xl'>
                                <h2 className='text-xl font-bold text-foreground mb-5'>Chọn nhân viên & thú cưng</h2>
                                <div className='space-y-6'>
                                    {/* Chọn nhân viên */}
                                    <div>
                                        <p className='text-base font-semibold mb-3'>👨‍⚕️ Chọn nhân viên</p>
                                        {staffLoading ? (
                                            <div className='flex justify-center py-6'>
                                                <Loader2 className='w-6 h-6 animate-spin text-[#448B3D]' />
                                            </div>
                                        ) : staffList.length === 0 ? (
                                            <p className='text-sm text-muted-foreground text-center py-4'>Không có nhân viên khả dụng</p>
                                        ) : (
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                {staffList.map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setSelectedStaffId(s.id)}
                                                        className={`text-left p-4 rounded-xl border-2 transition-all ${selectedStaffId === s.id
                                                            ? 'border-[#448B3D] bg-[#448B3D]/8 shadow-md'
                                                            : 'border-border hover:border-[#448B3D]/50 hover:bg-muted/40'
                                                            }`}
                                                    >
                                                        <div className='flex items-center gap-3'>
                                                            <div className='w-10 h-10 rounded-full bg-[#448B3D]/15 flex items-center justify-center text-lg shrink-0'>
                                                                {s.avatarUrl
                                                                    ? <img src={s.avatarUrl} alt={s.name} className='w-10 h-10 rounded-full object-cover' />
                                                                    : '👤'}
                                                            </div>
                                                            <div className='min-w-0'>
                                                                <p className='font-semibold text-foreground truncate'>{s.name}</p>
                                                                {s.specialization && (
                                                                    <p className='text-xs text-muted-foreground truncate'>{s.specialization}</p>
                                                                )}
                                                            </div>
                                                            {selectedStaffId === s.id && (
                                                                <Check className='w-4 h-4 text-[#448B3D] ml-auto shrink-0' />
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Chọn thú cưng */}
                                    <div>
                                        <p className='text-base font-semibold mb-3'>🐾 Chọn thú cưng</p>
                                        {!isAuthenticated ? (
                                            <div className='rounded-xl border border-orange-200 bg-orange-50 dark:bg-orange-950/20 p-4 text-sm text-orange-700 dark:text-orange-300'>
                                                Vui lòng <button onClick={() => navigate('/login')} className='font-bold underline'>đăng nhập</button> để chọn thú cưng của bạn.
                                            </div>
                                        ) : petsLoading ? (
                                            <div className='flex justify-center py-6'>
                                                <Loader2 className='w-6 h-6 animate-spin text-[#448B3D]' />
                                            </div>
                                        ) : pets.length === 0 ? (
                                            <div className='rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground text-center'>
                                                Bạn chưa có thú cưng nào.{' '}
                                                <button onClick={() => navigate('/dashboard?tab=pets')} className='text-[#448B3D] font-semibold underline'>
                                                    Thêm thú cưng
                                                </button>
                                            </div>
                                        ) : (
                                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                                {pets.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => setSelectedPetId(p.id)}
                                                        className={`text-left p-4 rounded-xl border-2 transition-all ${selectedPetId === p.id
                                                            ? 'border-[#448B3D] bg-[#448B3D]/8 shadow-md'
                                                            : 'border-border hover:border-[#448B3D]/50 hover:bg-muted/40'
                                                            }`}
                                                    >
                                                        <div className='flex items-center gap-3'>
                                                            <div className='w-10 h-10 rounded-full bg-[#448B3D]/15 flex items-center justify-center text-lg shrink-0'>
                                                                {p.imageUrl
                                                                    ? <img src={p.imageUrl} alt={p.name} className='w-10 h-10 rounded-full object-cover' />
                                                                    : '🐾'}
                                                            </div>
                                                            <div className='min-w-0'>
                                                                <p className='font-semibold text-foreground truncate'>{p.name}</p>
                                                                <p className='text-xs text-muted-foreground truncate'>
                                                                    {p.breed ?? p.species}
                                                                    {p.age ? ` · ${p.age} tuổi` : ''}
                                                                </p>
                                                            </div>
                                                            {selectedPetId === p.id && (
                                                                <Check className='w-4 h-4 text-[#448B3D] ml-auto shrink-0' />
                                                            )}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Ghi chú */}
                                    <div>
                                        <p className='text-base font-semibold mb-2'>📝 Ghi chú thêm (không bắt buộc)</p>
                                        <Textarea
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder='VD: Chó hay cắn, mèo sợ nước, cần tiêm vắc-xin dại...'
                                            className='rounded-xl text-base min-h-[80px]'
                                        />
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* ── BƯỚC 4: Xác nhận ── */}
                        {step === 3 && (
                            <Card className='p-6 rounded-2xl'>
                                <h2 className='text-xl font-bold text-foreground mb-5'>✅ Xác nhận thông tin</h2>

                                <div className='space-y-3 mb-6'>
                                    {[
                                        { label: '🛁 Dịch vụ', value: selectedService ? `${categoryIcon(selectedService.category)} ${selectedService.name}` : '' },
                                        { label: '💰 Giá', value: selectedService ? formatPrice(selectedService.price) : '' },
                                        { label: '⏱ Thời gian', value: selectedService ? `~${selectedService.durationMinutes} phút` : '' },
                                        { label: '📆 Ngày', value: selectedDate ? formatDateDisplay(selectedDate) : '' },
                                        { label: '🕐 Giờ', value: timeSlot?.label ?? '' },
                                        { label: '👨‍⚕️ Nhân viên', value: selectedStaff?.name ?? '' },
                                        { label: '🐾 Thú cưng', value: selectedPet ? `${selectedPet.name}${selectedPet.breed ? ` (${selectedPet.breed})` : ''}` : '' },
                                        ...(notes ? [{ label: '📝 Ghi chú', value: notes }] : []),
                                    ].map(row => (
                                        <div key={row.label} className='flex gap-3 py-3 border-b border-border last:border-0'>
                                            <span className='text-muted-foreground text-sm w-32 shrink-0'>{row.label}</span>
                                            <span className='font-semibold text-foreground text-sm'>{row.value}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className='bg-[#448B3D]/8 border border-[#448B3D]/20 rounded-xl p-4 mb-6'>
                                    <p className='text-sm text-foreground leading-relaxed'>
                                        📌 Sau khi đặt lịch, trạng thái sẽ là <strong>Chờ xác nhận</strong>. Bạn có thể theo dõi trong <a href='/dashboard?tab=bookings' className='text-[#448B3D] font-bold underline'>trang cá nhân</a>.
                                    </p>
                                </div>

                                <Button
                                    size='lg'
                                    onClick={handleConfirm}
                                    disabled={submitting}
                                    className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-14 text-lg'
                                >
                                    {submitting ? (
                                        <><Loader2 className='w-5 h-5 mr-2 animate-spin' /> Đang xử lý...</>
                                    ) : (
                                        <><Check className='w-5 h-5 mr-2' /> Xác nhận đặt lịch</>
                                    )}
                                </Button>
                            </Card>
                        )}

                    </motion.div>
                </AnimatePresence>

                {/* Navigation buttons — ẩn ở step 4 */}
                {step < 4 && (
                    <div className='flex gap-3 mt-6'>
                        {step > 0 && (
                            <Button
                                variant='outline'
                                size='lg'
                                onClick={() => setStep(s => s - 1)}
                                className='flex-1 rounded-xl h-13 text-base font-semibold'
                            >
                                <ChevronLeft className='w-5 h-5 mr-1' />
                                Quay lại
                            </Button>
                        )}
                        {step < 3 && (
                            <Button
                                size='lg'
                                onClick={() => setStep(s => s + 1)}
                                disabled={!canNext()}
                                className='flex-1 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-13 text-base disabled:opacity-50'
                            >
                                Tiếp theo
                                <ChevronRight className='w-5 h-5 ml-1' />
                            </Button>
                        )}
                    </div>
                )}

                {/* ── BƯỚC 4: Hoàn thành + Feedback ── */}
                {step === 4 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className='space-y-6'
                    >
                        {/* Thành công */}
                        <Card className='p-6 sm:p-8 rounded-2xl text-center border-2 border-[#448B3D]/30 bg-[#448B3D]/5'>
                            <div className='w-16 h-16 rounded-full bg-[#448B3D] flex items-center justify-center mx-auto mb-4'>
                                <Check className='w-8 h-8 text-white' />
                            </div>
                            <h2 className='text-2xl font-bold text-foreground mb-2'>Đặt lịch thành công! 🎉</h2>
                            <p className='text-muted-foreground mb-1'>
                                Lịch của bạn đang <strong>chờ xác nhận</strong>. Theo dõi trạng thái trong trang cá nhân.
                            </p>
                            {selectedService && (
                                <p className='text-sm text-muted-foreground'>
                                    {categoryIcon(selectedService.category)} <strong>{selectedService.name}</strong>
                                    {selectedPet && ` cho ${selectedPet.name}`}
                                    {selectedDate && ` · ${formatDateDisplay(selectedDate)}`}
                                    {timeSlot && ` · ${timeSlot.label}`}
                                </p>
                            )}
                            <div className='flex flex-col sm:flex-row gap-3 justify-center mt-6'>
                                <Button onClick={() => navigate('/')} variant='outline' className='rounded-xl'>
                                    Về trang chủ
                                </Button>
                                <Button onClick={() => navigate('/dashboard?tab=bookings')} variant='outline' className='rounded-xl border-[#448B3D]/40 text-[#448B3D]'>
                                    Xem lịch đặt
                                </Button>
                                <Button onClick={() => navigate('/booking')} className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'>
                                    Đặt lịch khác
                                </Button>
                            </div>
                        </Card>

                        {/* Feedback dịch vụ vừa đặt */}
                        {!fbDone ? (
                            <Card className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                                <div className='flex items-start justify-between mb-4 flex-wrap gap-2'>
                                    <div>
                                        <h3 className='font-bold text-lg text-foreground'>
                                            Bạn đã từng dùng dịch vụ này?
                                        </h3>
                                        <p className='text-sm text-muted-foreground mt-0.5'>
                                            Chia sẻ trải nghiệm để giúp bà con khác tham khảo
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowFbForm(v => !v)}
                                        className='flex items-center gap-1.5 text-sm font-semibold text-[#448B3D] hover:underline'
                                    >
                                        <MessageSquarePlus className='w-4 h-4' />
                                        {showFbForm ? 'Đóng' : 'Viết đánh giá'}
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {showFbForm && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.22 }}
                                            className='overflow-hidden'
                                        >
                                            <FeedbackForm
                                                type='service'
                                                serviceId={selectedServiceId}
                                                serviceName={selectedService?.name}
                                                onSuccess={() => { setShowFbForm(false); setFbDone(true); }}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ) : (
                            <div className='text-center py-4'>
                                <p className='text-[#448B3D] font-semibold'>✅ Cảm ơn bạn đã gửi đánh giá!</p>
                            </div>
                        )}
                    </motion.div>
                )}

            </div>

            {/* ── Đánh giá dịch vụ (hiển thị bên dưới trang) ── */}
            {step < 4 && (
                <div className='max-w-2xl mx-auto px-4 sm:px-6 pb-12'>
                    <div className='border-t border-border pt-10 mt-4'>
                        <h2 className='text-2xl font-bold text-foreground mb-2'>
                            Đánh giá từ khách hàng
                        </h2>

                        {/* Tabs dịch vụ */}
                        {!servicesLoading && services.length > 0 && (
                            <div className='flex flex-wrap gap-2 mb-6'>
                                {services.map(svc => {
                                    const svcFbs = getByService(svc.id);
                                    const avg = avgRating(svcFbs);
                                    return (
                                        <button
                                            key={svc.id}
                                            onClick={() => setFeedbackServiceId(svc.id)}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${feedbackServiceId === svc.id
                                                ? 'border-[#448B3D] bg-[#448B3D]/8 text-[#448B3D]'
                                                : 'border-border hover:border-[#448B3D]/40'
                                                }`}
                                        >
                                            <span>{categoryIcon(svc.category)}</span>
                                            <span>{svc.name}</span>
                                            {svcFbs.length > 0 && (
                                                <span className='flex items-center gap-0.5 text-yellow-500'>
                                                    <Star className='w-3 h-3 fill-yellow-400' />
                                                    {avg.toFixed(1)}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {feedbackServiceId && (() => {
                            const svcFbs = getByService(feedbackServiceId);
                            const svc = services.find(s => s.id === feedbackServiceId);
                            return (
                                <div className='space-y-5'>
                                    {svcFbs.length > 0 && (
                                        <RatingSummary feedbacks={svcFbs} avgRating={avgRating(svcFbs)} />
                                    )}

                                    {svcFbs.length === 0 ? (
                                        <div className='text-center py-8'>
                                            <p className='text-3xl mb-2'>💬</p>
                                            <p className='font-semibold text-foreground'>Chưa có đánh giá cho dịch vụ này</p>
                                            <p className='text-sm text-muted-foreground mt-1'>Đặt lịch và chia sẻ trải nghiệm của bạn!</p>
                                        </div>
                                    ) : null}

                                    {/* Nút viết đánh giá */}
                                    <div>
                                        <button
                                            onClick={() => setShowFbForm(v => !v)}
                                            className='flex items-center gap-2 text-sm font-semibold text-[#448B3D] hover:underline'
                                        >
                                            <MessageSquarePlus className='w-4 h-4' />
                                            {showFbForm ? 'Đóng form' : `Viết đánh giá cho "${svc?.name}"`}
                                        </button>

                                        <AnimatePresence>
                                            {showFbForm && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.22 }}
                                                    className='overflow-hidden mt-4'
                                                >
                                                    <Card className='p-5 rounded-2xl border-2 border-[#448B3D]/20'>
                                                        <FeedbackForm
                                                            type='service'
                                                            serviceId={feedbackServiceId}
                                                            serviceName={svc?.name}
                                                            onSuccess={() => setShowFbForm(false)}
                                                        />
                                                    </Card>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            );
                        })()}

                        {!feedbackServiceId && (
                            <p className='text-muted-foreground text-sm text-center py-6'>
                                Chọn một dịch vụ ở trên để xem đánh giá
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingServicePage;
