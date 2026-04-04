import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, MapPin, User, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('card');

    const handlePlaceOrder = () => {
        toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
        clearCart();
        setTimeout(() => navigate('/dashboard'), 2000);
    };

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    const stepLabels = ['Địa chỉ giao hàng', 'Thanh toán', 'Xác nhận'];

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <h1 className='text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8'>Thanh toán</h1>

                {/* Progress Steps */}
                <div className='flex items-center justify-center mb-8 sm:mb-12'>
                    <div className='flex items-center'>
                        {[1, 2, 3].map((num) => (
                            <div key={num} className='flex items-center'>
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${step >= num ? 'bg-[#448B3D] text-white' : 'bg-muted text-muted-foreground'}`}>
                                    {step > num ? <Check className='w-4 h-4' /> : num}
                                </div>
                                {num < 3 && <div className={`w-10 sm:w-20 h-1 ${step > num ? 'bg-[#448B3D]' : 'bg-muted'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='grid lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-2 space-y-6'>
                        {step === 1 && (
                            <Card className='p-6 rounded-2xl'>
                                <div className='flex items-center space-x-3 mb-6'>
                                    <MapPin className='w-6 h-6 text-[#448B3D]' />
                                    <h2 className='text-xl font-bold text-foreground'>Địa chỉ giao hàng</h2>
                                </div>
                                <div className='space-y-4'>
                                    <div className='grid md:grid-cols-2 gap-4'>
                                        <div><Label>Họ</Label><Input placeholder='Nguyễn' className='mt-1 rounded-xl' /></div>
                                        <div><Label>Tên</Label><Input placeholder='Văn A' className='mt-1 rounded-xl' /></div>
                                    </div>
                                    <div><Label>Email</Label><Input type='email' placeholder='ban@example.com' className='mt-1 rounded-xl' /></div>
                                    <div><Label>Số điện thoại</Label><Input placeholder='0912 345 678' className='mt-1 rounded-xl' /></div>
                                    <div><Label>Địa chỉ</Label><Input placeholder='123 Đường ABC' className='mt-1 rounded-xl' /></div>
                                    <div className='grid md:grid-cols-3 gap-4'>
                                        <div><Label>Thành phố</Label><Input placeholder='TP. HCM' className='mt-1 rounded-xl' /></div>
                                        <div><Label>Quận/Huyện</Label><Input placeholder='Quận 1' className='mt-1 rounded-xl' /></div>
                                        <div><Label>Mã bưu chính</Label><Input placeholder='700000' className='mt-1 rounded-xl' /></div>
                                    </div>
                                </div>
                                <Button size='lg' onClick={() => setStep(2)} className='w-full mt-6 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'>
                                    Tiếp tục thanh toán
                                </Button>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className='p-6 rounded-2xl'>
                                <div className='flex items-center space-x-3 mb-6'>
                                    <CreditCard className='w-6 h-6 text-[#448B3D]' />
                                    <h2 className='text-xl font-bold text-foreground'>Phương thức thanh toán</h2>
                                </div>
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className='mb-6 space-y-3'>
                                    <div className='flex items-center space-x-2 p-4 border border-border rounded-xl'>
                                        <RadioGroupItem value='card' id='card' />
                                        <Label htmlFor='card' className='flex-1 cursor-pointer'>Thẻ tín dụng / Ghi nợ</Label>
                                    </div>
                                    <div className='flex items-center space-x-2 p-4 border border-border rounded-xl'>
                                        <RadioGroupItem value='cod' id='cod' />
                                        <Label htmlFor='cod' className='flex-1 cursor-pointer'>Thanh toán khi nhận hàng (COD)</Label>
                                    </div>
                                    <div className='flex items-center space-x-2 p-4 border border-border rounded-xl'>
                                        <RadioGroupItem value='momo' id='momo' />
                                        <Label htmlFor='momo' className='flex-1 cursor-pointer'>Ví MoMo</Label>
                                    </div>
                                </RadioGroup>

                                {paymentMethod === 'card' && (
                                    <div className='space-y-4'>
                                        <div><Label>Số thẻ</Label><Input placeholder='1234 5678 9012 3456' className='mt-1 rounded-xl' /></div>
                                        <div className='grid md:grid-cols-2 gap-4'>
                                            <div><Label>Ngày hết hạn</Label><Input placeholder='MM/YY' className='mt-1 rounded-xl' /></div>
                                            <div><Label>CVV</Label><Input placeholder='123' className='mt-1 rounded-xl' /></div>
                                        </div>
                                        <div><Label>Tên chủ thẻ</Label><Input placeholder='NGUYEN VAN A' className='mt-1 rounded-xl' /></div>
                                    </div>
                                )}

                                <div className='flex gap-4 mt-6'>
                                    <Button size='lg' variant='outline' onClick={() => setStep(1)} className='flex-1 rounded-xl'>Quay lại</Button>
                                    <Button size='lg' onClick={() => setStep(3)} className='flex-1 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'>Xem lại đơn hàng</Button>
                                </div>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className='p-6 rounded-2xl'>
                                <div className='flex items-center space-x-3 mb-6'>
                                    <User className='w-6 h-6 text-[#448B3D]' />
                                    <h2 className='text-xl font-bold text-foreground'>Xác nhận đơn hàng</h2>
                                </div>
                                <div className='space-y-4'>
                                    {cart.map((item) => (
                                        <div key={item.id} className='flex items-center space-x-4 pb-4 border-b border-border'>
                                            <img src={item.image} alt={item.name} className='w-16 h-16 object-cover rounded-lg' />
                                            <div className='flex-1'>
                                                <h4 className='font-semibold text-sm'>{item.name}</h4>
                                                <p className='text-xs text-muted-foreground'>Số lượng: {item.quantity}</p>
                                            </div>
                                            <p className='font-semibold'>${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className='flex gap-4 mt-6'>
                                    <Button size='lg' variant='outline' onClick={() => setStep(2)} className='flex-1 rounded-xl'>Quay lại</Button>
                                    <Button size='lg' onClick={handlePlaceOrder} className='flex-1 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'>
                                        <Check className='w-5 h-5 mr-2' />
                                        Đặt hàng
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    <div>
                        <Card className='p-6 rounded-2xl sticky top-20'>
                            <h3 className='text-xl font-bold text-foreground mb-6'>Tóm tắt đơn hàng</h3>
                            <div className='space-y-3 mb-6'>
                                <div className='flex justify-between text-sm'><span className='text-muted-foreground'>Tạm tính</span><span>${cartTotal.toFixed(2)}</span></div>
                                <div className='flex justify-between text-sm'><span className='text-muted-foreground'>Vận chuyển</span><span className='text-[#7FD99E]'>Miễn phí</span></div>
                                <div className='flex justify-between text-sm'><span className='text-muted-foreground'>Thuế (8%)</span><span>${(cartTotal * 0.08).toFixed(2)}</span></div>
                            </div>
                            <Separator className='my-4' />
                            <div className='flex justify-between text-lg font-bold text-foreground'>
                                <span>Tổng cộng</span>
                                <span className='text-[#448B3D]'>${(cartTotal * 1.08).toFixed(2)}</span>
                            </div>
                            <div className='mt-6 p-4 rounded-xl bg-[#448B3D]/10 border border-[#448B3D]/20'>
                                <p className='text-sm text-center text-muted-foreground'>
                                    <span className='font-semibold text-[#448B3D]'>Miễn phí vận chuyển</span> cho đơn hàng này!
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
