import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, MapPin, User, Check, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { orderApi } from '@/lib/orderApi';
import { paymentApi, type PaymentMethod } from '@/lib/paymentApi';
import { useAuth } from '@/context/AuthContext';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'CASH_ON_DELIVERY', label: 'Thanh toán khi nhận hàng (COD)' },
    { value: 'VNPAY', label: 'VNPay' },
    { value: 'MOMO', label: 'Ví MoMo' },
    { value: 'BANK_TRANSFER', label: 'Chuyển khoản ngân hàng' },
];

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
    const [placing, setPlacing] = useState(false);

    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để đặt hàng');
            navigate('/login');
            return;
        }

        setPlacing(true);
        try {
            // 1. Create order
            const orderRes = await orderApi.createOrder({
                items: cart.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
            });

            const order = orderRes.result;

            // 2. Create payment
            await paymentApi.createPayment({
                orderId: order.id,
                amount: cartTotal,
                paymentMethod,
                description: `Thanh toán đơn hàng #${order.id.slice(0, 8)}`,
            });

            // 3. If VNPAY/MOMO, get payment URL and redirect
            if (paymentMethod === 'VNPAY' || paymentMethod === 'MOMO') {
                try {
                    const paymentRes = await paymentApi.getPaymentByOrder(order.id);
                    const txId = paymentRes.result?.id;
                    if (txId) {
                        const urlRes = await paymentApi.getPaymentUrl(txId);
                        const url = urlRes.result?.paymentUrl;
                        if (url) {
                            await clearCart();
                            window.location.href = url;
                            return;
                        }
                    }
                } catch {
                    // fallback to success flow
                }
            }

            await clearCart();
            toast.success('Đặt hàng thành công! Cảm ơn bạn đã mua sắm.');
            setTimeout(() => navigate('/dashboard?tab=orders'), 1500);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Đặt hàng thất bại. Vui lòng thử lại.';
            toast.error(message);
        } finally {
            setPlacing(false);
        }
    };

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <h1 className='text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8'>Thanh toán</h1>

                {/* Progress Steps */}
                <div className='flex items-center justify-center mb-8 sm:mb-12'>
                    <div className='flex items-center'>
                        {[1, 2, 3].map((num) => (
                            <div key={num} className='flex items-center'>
                                <div
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm ${step >= num ? 'bg-[#448B3D] text-white' : 'bg-muted text-muted-foreground'}`}
                                >
                                    {step > num ? <Check className='w-4 h-4' /> : num}
                                </div>
                                {num < 3 && (
                                    <div className={`w-10 sm:w-20 h-1 ${step > num ? 'bg-[#448B3D]' : 'bg-muted'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='grid lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Step 1: Shipping address */}
                        {step === 1 && (
                            <Card className='p-6 rounded-2xl'>
                                <div className='flex items-center space-x-3 mb-6'>
                                    <MapPin className='w-6 h-6 text-[#448B3D]' />
                                    <h2 className='text-xl font-bold text-foreground'>Địa chỉ giao hàng</h2>
                                </div>
                                <div className='space-y-4'>
                                    <div className='grid md:grid-cols-2 gap-4'>
                                        <div>
                                            <Label>Họ</Label>
                                            <Input placeholder='Nguyễn' className='mt-1 rounded-xl' />
                                        </div>
                                        <div>
                                            <Label>Tên</Label>
                                            <Input placeholder='Văn A' className='mt-1 rounded-xl' />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Số điện thoại</Label>
                                        <Input placeholder='0912 345 678' className='mt-1 rounded-xl' />
                                    </div>
                                    <div>
                                        <Label>Địa chỉ</Label>
                                        <Input placeholder='123 Đường ABC' className='mt-1 rounded-xl' />
                                    </div>
                                    <div className='grid md:grid-cols-3 gap-4'>
                                        <div>
                                            <Label>Tỉnh/Thành phố</Label>
                                            <Input placeholder='TP. HCM' className='mt-1 rounded-xl' />
                                        </div>
                                        <div>
                                            <Label>Quận/Huyện</Label>
                                            <Input placeholder='Quận 1' className='mt-1 rounded-xl' />
                                        </div>
                                        <div>
                                            <Label>Phường/Xã</Label>
                                            <Input placeholder='Phường Bến Nghé' className='mt-1 rounded-xl' />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size='lg'
                                    onClick={() => setStep(2)}
                                    className='w-full mt-6 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'
                                >
                                    Tiếp tục thanh toán
                                </Button>
                            </Card>
                        )}

                        {/* Step 2: Payment method */}
                        {step === 2 && (
                            <Card className='p-6 rounded-2xl'>
                                <div className='flex items-center space-x-3 mb-6'>
                                    <CreditCard className='w-6 h-6 text-[#448B3D]' />
                                    <h2 className='text-xl font-bold text-foreground'>Phương thức thanh toán</h2>
                                </div>
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                                    className='mb-6 space-y-3'
                                >
                                    {PAYMENT_METHODS.map((m) => (
                                        <div
                                            key={m.value}
                                            className='flex items-center space-x-2 p-4 border border-border rounded-xl'
                                        >
                                            <RadioGroupItem value={m.value} id={m.value} />
                                            <Label htmlFor={m.value} className='flex-1 cursor-pointer'>
                                                {m.label}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                <div className='flex gap-4 mt-6'>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        onClick={() => setStep(1)}
                                        className='flex-1 rounded-xl'
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        size='lg'
                                        onClick={() => setStep(3)}
                                        className='flex-1 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'
                                    >
                                        Xem lại đơn hàng
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {/* Step 3: Confirm */}
                        {step === 3 && (
                            <Card className='p-6 rounded-2xl'>
                                <div className='flex items-center space-x-3 mb-6'>
                                    <User className='w-6 h-6 text-[#448B3D]' />
                                    <h2 className='text-xl font-bold text-foreground'>Xác nhận đơn hàng</h2>
                                </div>
                                <div className='space-y-4'>
                                    {cart.map((item) => (
                                        <div
                                            key={item.id}
                                            className='flex items-center space-x-4 pb-4 border-b border-border'
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className='w-16 h-16 object-cover rounded-lg'
                                            />
                                            <div className='flex-1'>
                                                <h4 className='font-semibold text-sm'>{item.name}</h4>
                                                <p className='text-xs text-muted-foreground'>
                                                    Số lượng: {item.quantity}
                                                </p>
                                            </div>
                                            <p className='font-semibold'>
                                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div className='mt-4 p-3 rounded-xl bg-muted/50 text-sm text-muted-foreground'>
                                    Phương thức thanh toán:{' '}
                                    <span className='font-semibold text-foreground'>
                                        {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
                                    </span>
                                </div>
                                <div className='flex gap-4 mt-6'>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        onClick={() => setStep(2)}
                                        className='flex-1 rounded-xl'
                                        disabled={placing}
                                    >
                                        Quay lại
                                    </Button>
                                    <Button
                                        size='lg'
                                        onClick={handlePlaceOrder}
                                        disabled={placing}
                                        className='flex-1 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'
                                    >
                                        {placing ? (
                                            <><Loader2 className='w-4 h-4 mr-2 animate-spin' />Đang xử lý...</>
                                        ) : (
                                            <><Check className='w-5 h-5 mr-2' />Đặt hàng</>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Order summary */}
                    <div>
                        <Card className='p-6 rounded-2xl sticky top-20'>
                            <h3 className='text-xl font-bold text-foreground mb-6'>Tóm tắt đơn hàng</h3>
                            <div className='space-y-3 mb-6'>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>Tạm tính</span>
                                    <span>{cartTotal.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>Vận chuyển</span>
                                    <span className='text-[#7FD99E]'>Miễn phí</span>
                                </div>
                            </div>
                            <Separator className='my-4' />
                            <div className='flex justify-between text-lg font-bold text-foreground'>
                                <span>Tổng cộng</span>
                                <span className='text-[#448B3D]'>{cartTotal.toLocaleString('vi-VN')}₫</span>
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
