import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import {
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Check,
    Calendar
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const BookingServicePage = () => {
    const SERVICES = [
        {
            id: 'spa',
            name: 'Spa thú cưng',
            icon: '🛁',
            price: 49.99,
            duration: '2 hours',
            description: 'Dịch vụ tắm và spa cao cấp'
        },
        {
            id: 'health',
            name: 'Khám sức khỏe',
            icon: '🏥',
            price: 99.99,
            duration: '1 hour',
            description: 'Kiểm tra sức khỏe toàn diện'
        },
        {
            id: 'Tiêm phòng',
            name: 'Tiêm phòng',
            icon: '💉',
            price: 79.99,
            duration: '30 minutes',
            description: 'Gói tiêm phòng đầy đủ'
        },
        {
            id: 'Cắt tỉa lông',
            name: 'Cắt tỉa lông',
            icon: '✂️',
            price: 39.99,
            duration: '1.5 hours',
            description: 'Dịch vụ cắt tỉa lông chuyên nghiệp'
        }
    ];

    const TIME_SLOTS = [
        '09:00 AM',
        '10:00 AM',
        '11:00 AM',
        '01:00 PM',
        '02:00 PM',
        '03:00 PM',
        '04:00 PM'
    ];

    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>();
    const [selectedTime, setSelectedTime] = useState('');
    const [petName, setPetName] = useState('');
    const [notes, setNotes] = useState('');

    const handleBooking = () => {
        if (!selectedService || !selectedDate || !selectedTime || !petName) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        toast.success(
            "Đặt lịch thành công! Chúng tôi sẽ gửi email xác nhận cho bạn."
        );
        setTimeout(() => navigate('/dashboard'), 2000);
    };

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl font-bold text-foreground mb-4'>
                        Đặt lịch dịch vụ
                    </h1>
                    <p className='text-lg text-muted-foreground'>
                        Chăm sóc chuyên nghiệp cho những người bạn yêu quý
                    </p>
                </div>

                <div className='grid lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Chọn dịch vụ */}
                        <Card className='p-6 rounded-2xl'>
                            <h2 className='text-xl font-bold text-foreground mb-6'>
                                Chọn dịch vụ
                            </h2>
                            <RadioGroup
                                value={selectedService}
                                onValueChange={setSelectedService}
                            >
                                <div className='grid md:grid-cols-2 gap-4'>
                                    {SERVICES.map((service) => (
                                        <div
                                            key={service.id}
                                            className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                                selectedService === service.id
                                                    ? 'border-[#448B3D] bg-[#448B3D]/5'
                                                    : 'border-border hover:border-[#448B3D]/50'
                                            }`}
                                        >
                                            <RadioGroupItem
                                                value={service.id}
                                                id={service.id}
                                                className='absolute top-4 right-4'
                                            />
                                            <label
                                                htmlFor={service.id}
                                                className='cursor-pointer'
                                            >
                                                <div className='text-4xl mb-2'>
                                                    {service.icon}
                                                </div>
                                                <h3 className='font-semibold text-foreground mb-1'>
                                                    {service.name}
                                                </h3>
                                                <p className='text-sm text-muted-foreground mb-2'>
                                                    {service.description}
                                                </p>
                                                <div className='flex items-center justify-between'>
                                                    <span className='text-lg font-bold text-[#448B3D]'>
                                                        ${service.price}
                                                    </span>
                                                    <span className='text-sm text-muted-foreground'>
                                                        {service.duration}
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </RadioGroup>
                        </Card>

                        {/* Chọn ngày & giờ */}
                        <Card className='p-6 rounded-2xl'>
                            <h2 className='text-xl font-bold text-foreground mb-6'>
                                Chọn ngày & giờ
                            </h2>
                            <div className='grid md:grid-cols-2 gap-6'>
                                <div>
                                    <Label className='mb-3 block'>
                                        Chọn ngày
                                    </Label>
                                    <Calendar
                                        mode='single'
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={(date) => date < new Date()}
                                        className='rounded-xl border border-border'
                                    />
                                </div>
                                <div>
                                    <Label className='mb-3 block'>
                                        Chọn giờ
                                    </Label>
                                    <div className='grid grid-cols-2 gap-3'>
                                        {TIME_SLOTS.map((time) => (
                                            <Button
                                                key={time}
                                                variant={
                                                    selectedTime === time
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                onClick={() =>
                                                    setSelectedTime(time)
                                                }
                                                className='rounded-xl'
                                            >
                                                <Clock className='w-4 h-4 mr-2' />
                                                {time}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Thông tin thú cưng */}
                        <Card className='p-6 rounded-2xl'>
                            <h2 className='text-xl font-bold text-foreground mb-6'>
                                Thông tin thú cưng
                            </h2>
                            <div className='space-y-4'>
                                <div>
                                    <Label>Tên thú cưng *</Label>
                                    <Input
                                        value={petName}
                                        onChange={(e) =>
                                            setPetName(e.target.value)
                                        }
                                        placeholder="Nhập tên thú cưng của bạn"
                                        className='mt-1 rounded-xl'
                                    />
                                </div>
                                <div>
                                    <Label>Ghi chú thêm (Tùy chọn)</Label>
                                    <Textarea
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        placeholder='Yêu cầu đặc biệt hoặc lưu ý...'
                                        className='mt-1 rounded-xl min-h-[100px]'
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Tóm tắt đặt lịch */}
                    <div>
                        <Card className='p-6 rounded-2xl sticky top-20'>
                            <h3 className='text-xl font-bold text-foreground mb-6'>
                                Tóm tắt đặt lịch
                            </h3>

                            <div className='space-y-4 mb-6'>
                                {selectedService && (
                                    <div className='p-4 rounded-xl bg-background-alt'>
                                        <p className='text-sm text-muted-foreground mb-1'>
                                            Service
                                        </p>
                                        <p className='font-semibold'>
                                            {
                                                SERVICES.find(
                                                    (s) =>
                                                        s.id === selectedService
                                                )?.name
                                            }
                                        </p>
                                    </div>
                                )}

                                {selectedDate && (
                                    <div className='p-4 rounded-xl bg-background-alt'>
                                        <p className='text-sm text-muted-foreground mb-1'>
                                            Date
                                        </p>
                                        <p className='font-semibold flex items-center'>
                                            <CalendarIcon className='w-4 h-4 mr-2' />
                                            {selectedDate.toLocaleDateString(
                                                'en-US',
                                                {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                }
                                            )}
                                        </p>
                                    </div>
                                )}

                                {selectedTime && (
                                    <div className='p-4 rounded-xl bg-background-alt'>
                                        <p className='text-sm text-muted-foreground mb-1'>
                                            Time
                                        </p>
                                        <p className='font-semibold flex items-center'>
                                            <Clock className='w-4 h-4 mr-2' />
                                            {selectedTime}
                                        </p>
                                    </div>
                                )}

                                {petName && (
                                    <div className='p-4 rounded-xl bg-background-alt'>
                                        <p className='text-sm text-muted-foreground mb-1'>
                                            Pet Name
                                        </p>
                                        <p className='font-semibold'>
                                            {petName}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {selectedService && (
                                <div className='mb-6'>
                                    <div className='flex justify-between text-lg font-bold text-foreground'>
                                        <span>Total</span>
                                        <span className='text-[#448B3D]'>
                                            $
                                            {
                                                SERVICES.find(
                                                    (s) =>
                                                        s.id === selectedService
                                                )?.price
                                            }
                                        </span>
                                    </div>
                                </div>
                            )}

                            <Button
                                size='lg'
                                onClick={handleBooking}
                                disabled={
                                    !selectedService ||
                                    !selectedDate ||
                                    !selectedTime ||
                                    !petName
                                }
                                className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'
                            >
                                <Check className='w-5 h-5 mr-2' />
                                Xác nhận đặt lịch
                            </Button>

                            <div className='mt-4 p-4 rounded-xl bg-[#7FD99E]/10 border border-[#7FD99E]/20'>
                                <p className='text-xs text-center text-muted-foreground'>
                                    <MapPin className='w-3 h-3 inline mr-1' />
                                    Dịch vụ sẽ được thực hiện tại cơ sở của chúng tôi
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingServicePage;
