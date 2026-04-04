import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Phone, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

const SERVICES = [
    { id: 'spa', icon: '🛁', name: 'Tắm & Cắt lông', desc: 'Tắm sạch, cắt tỉa gọn gàng', price: '150.000đ', duration: '~2 giờ' },
    { id: 'health', icon: '🏥', name: 'Khám sức khỏe', desc: 'Kiểm tra sức khỏe toàn diện', price: '250.000đ', duration: '~1 giờ' },
    { id: 'vaccine', icon: '💉', name: 'Tiêm phòng', desc: 'Tiêm đầy đủ các loại vắc-xin', price: '200.000đ', duration: '~30 phút' },
    { id: 'groom', icon: '✂️', name: 'Cắt tỉa lông', desc: 'Cắt tỉa lông chuyên nghiệp', price: '120.000đ', duration: '~1.5 giờ' },
];

// Tạo danh sách 14 ngày tới (bỏ qua Chủ nhật)
const getAvailableDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let d = new Date(today);
    d.setDate(d.getDate() + 1); // bắt đầu từ ngày mai
    while (dates.length < 12) {
        if (d.getDay() !== 0) dates.push(new Date(d)); // bỏ Chủ nhật
        d.setDate(d.getDate() + 1);
    }
    return dates;
};

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VI = ['Th.1', 'Th.2', 'Th.3', 'Th.4', 'Th.5', 'Th.6', 'Th.7', 'Th.8', 'Th.9', 'Th.10', 'Th.11', 'Th.12'];

const TIME_SLOTS = [
    { id: 'morning1', label: '8:00 SA', sub: 'Buổi sáng' },
    { id: 'morning2', label: '9:30 SA', sub: 'Buổi sáng' },
    { id: 'morning3', label: '11:00 SA', sub: 'Buổi sáng' },
    { id: 'afternoon1', label: '1:30 CH', sub: 'Buổi chiều' },
    { id: 'afternoon2', label: '3:00 CH', sub: 'Buổi chiều' },
    { id: 'afternoon3', label: '4:30 CH', sub: 'Buổi chiều' },
];

const STEPS = ['Chọn dịch vụ', 'Chọn ngày & giờ', 'Thông tin', 'Xác nhận'];

const BookingServicePage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [selectedService, setSelectedService] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState('');
    const [phone, setPhone] = useState('');
    const [notes, setNotes] = useState('');

    const availableDates = getAvailableDates();
    const service = SERVICES.find(s => s.id === selectedService);
    const timeSlot = TIME_SLOTS.find(t => t.id === selectedTime);

    const canNext = () => {
        if (step === 0) return !!selectedService;
        if (step === 1) return !!selectedDate && !!selectedTime;
        if (step === 2) return !!petName && !!phone;
        return true;
    };

    const handleConfirm = () => {
        toast.success('🎉 Đặt lịch thành công! Chúng tôi sẽ gọi xác nhận cho bạn sớm nhất.');
        setTimeout(() => navigate('/'), 2500);
    };

    const formatDate = (d: Date) =>
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
                        <div key={i} className='flex items-center flex-1'>
                            <div className='flex flex-col items-center'>
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
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    {SERVICES.map(svc => (
                                        <button
                                            key={svc.id}
                                            onClick={() => setSelectedService(svc.id)}
                                            className={`text-left p-5 rounded-xl border-2 transition-all ${selectedService === svc.id
                                                    ? 'border-[#448B3D] bg-[#448B3D]/8 shadow-md'
                                                    : 'border-border hover:border-[#448B3D]/50 hover:bg-muted/40'
                                                }`}
                                        >
                                            <div className='text-4xl mb-3'>{svc.icon}</div>
                                            <p className='font-bold text-lg text-foreground mb-1'>{svc.name}</p>
                                            <p className='text-sm text-muted-foreground mb-3'>{svc.desc}</p>
                                            <div className='flex items-center justify-between'>
                                                <span className='text-xl font-bold text-[#448B3D]'>{svc.price}</span>
                                                <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full'>{svc.duration}</span>
                                            </div>
                                            {selectedService === svc.id && (
                                                <div className='mt-3 flex items-center gap-1 text-[#448B3D] text-sm font-semibold'>
                                                    <Check className='w-4 h-4' /> Đã chọn
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
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

                        {/* ── BƯỚC 3: Thông tin ── */}
                        {step === 2 && (
                            <Card className='p-6 rounded-2xl'>
                                <h2 className='text-xl font-bold text-foreground mb-5'>Thông tin thú cưng</h2>
                                <div className='space-y-5'>
                                    <div>
                                        <Label htmlFor='petName' className='text-base font-semibold'>
                                            🐾 Tên thú cưng <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input
                                            id='petName'
                                            value={petName}
                                            onChange={e => setPetName(e.target.value)}
                                            placeholder='VD: Milu, Bông, Lucky...'
                                            className='mt-2 rounded-xl h-12 text-base'
                                        />
                                    </div>

                                    <div>
                                        <Label className='text-base font-semibold mb-2 block'>
                                            🐶 Loại thú cưng
                                        </Label>
                                        <div className='grid grid-cols-3 gap-3'>
                                            {['🐕 Chó', '🐈 Mèo', '🐾 Khác'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setPetType(type)}
                                                    className={`py-3 rounded-xl border-2 font-semibold text-sm transition-all ${petType === type
                                                            ? 'border-[#448B3D] bg-[#448B3D] text-white'
                                                            : 'border-border hover:border-[#448B3D]/50'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor='phone' className='text-base font-semibold'>
                                            📞 Số điện thoại <span className='text-red-500'>*</span>
                                        </Label>
                                        <Input
                                            id='phone'
                                            type='tel'
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder='VD: 0912 345 678'
                                            className='mt-2 rounded-xl h-12 text-base'
                                        />
                                        <p className='text-xs text-muted-foreground mt-1'>Chúng tôi sẽ gọi xác nhận lịch qua số này</p>
                                    </div>

                                    <div>
                                        <Label htmlFor='notes' className='text-base font-semibold'>
                                            📝 Ghi chú thêm (không bắt buộc)
                                        </Label>
                                        <Textarea
                                            id='notes'
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            placeholder='VD: Chó hay cắn, mèo sợ nước, cần tiêm vắc-xin dại...'
                                            className='mt-2 rounded-xl text-base min-h-[90px]'
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
                                        { label: '🛁 Dịch vụ', value: service ? `${service.icon} ${service.name}` : '' },
                                        { label: '💰 Giá', value: service?.price ?? '' },
                                        { label: '📆 Ngày', value: selectedDate ? formatDate(selectedDate) : '' },
                                        { label: '🕐 Giờ', value: timeSlot?.label ?? '' },
                                        { label: '🐾 Thú cưng', value: `${petName}${petType ? ` (${petType})` : ''}` },
                                        { label: '📞 Điện thoại', value: phone },
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
                                        📌 Sau khi đặt lịch, chúng tôi sẽ <strong>gọi điện xác nhận</strong> trong vòng 30 phút. Nếu cần thay đổi, gọi <a href='tel:+84702500551' className='text-[#448B3D] font-bold underline'>(84) 702 500 551</a>.
                                    </p>
                                </div>

                                <Button
                                    size='lg'
                                    onClick={handleConfirm}
                                    className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-14 text-lg'
                                >
                                    <Check className='w-5 h-5 mr-2' />
                                    Xác nhận đặt lịch
                                </Button>
                            </Card>
                        )}

                    </motion.div>
                </AnimatePresence>

                {/* Navigation buttons */}
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

            </div>
        </div>
    );
};

export default BookingServicePage;
