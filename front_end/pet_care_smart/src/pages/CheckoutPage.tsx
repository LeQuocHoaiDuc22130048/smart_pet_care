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
        toast.success('Order placed successfully!');
        clearCart();
        setTimeout(() => navigate('/dashboard'), 2000);
    };

    if (cart.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                <h1 className='text-3xl font-bold text-foreground mb-8'>
                    Checkout
                </h1>

                {/* Progress Steps */}
                <div className='flex items-center justify-center mb-12'>
                    <div className='flex items-center space-x-4'>
                        {[1, 2, 3].map((num) => (
                            <div key={num} className='flex items-center'>
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                        step >= num
                                            ? 'bg-[#5B9FD8] text-white'
                                            : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {step > num ? (
                                        <Check className='w-5 h-5' />
                                    ) : (
                                        num
                                    )}
                                </div>
                                {num < 3 && (
                                    <div
                                        className={`w-20 h-1 ${
                                            step > num
                                                ? 'bg-[#5B9FD8]'
                                                : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='grid lg:grid-cols-3 gap-8'>
                    {/* Forms */}
                    <div className='lg:col-span-2 space-y-6'>
                        {step === 1 && (
                            <Card className='p-6 rounded-2xl'>
                                <div className='flex items-center space-x-3 mb-6'>
                                    <MapPin className='w-6 h-6 text-[#5B9FD8]' />
                                    <h2 className='text-xl font-bold text-foreground'>
                                        Shipping Address
                                    </h2>
                                </div>
                                <div className='space-y-4'>
                                    <div className='grid md:grid-cols-2 gap-4'>
                                        <div>
                                            <Label>First Name</Label>
                                            <Input
                                                placeholder='John'
                                                className='mt-1 rounded-xl'
                                            />
                                        </div>
                                        <div>
                                            <Label>Last Name</Label>
                                            <Input
                                                placeholder='Doe'
                                                className='mt-1 rounded-xl'
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Email</Label>
                                        <Input
                                            type='email'
                                            placeholder='john@example.com'
                                            className='mt-1 rounded-xl'
                                        />
                                    </div>
                                    <div>
                                        <Label>Phone</Label>
                                        <Input
                                            placeholder='(555) 123-4567'
                                            className='mt-1 rounded-xl'
                                        />
                                    </div>
                                    <div>
                                        <Label>Street Address</Label>
                                        <Input
                                            placeholder='123 Main St'
                                            className='mt-1 rounded-xl'
                                        />
                                    </div>
                                    <div className='grid md:grid-cols-3 gap-4'>
                                        <div>
                                            <Label>City</Label>
                                            <Input
                                                placeholder='New York'
                                                className='mt-1 rounded-xl'
                                            />
                                        </div>
                                        <div>
                                            <Label>State</Label>
                                            <Input
                                                placeholder='NY'
                                                className='mt-1 rounded-xl'
                                            />
                                        </div>
                                        <div>
                                            <Label>ZIP Code</Label>
                                            <Input
                                                placeholder='10001'
                                                className='mt-1 rounded-xl'
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size='lg'
                                    onClick={() => setStep(2)}
                                    className='w-full mt-6 rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                                >
                                    Continue to Payment
                                </Button>
                            </Card>
                        )}

                        {step === 2 && (
                            <Card className='p-6 rounded-2xl'>
                                <div className='flex items-center space-x-3 mb-6'>
                                    <CreditCard className='w-6 h-6 text-[#5B9FD8]' />
                                    <h2 className='text-xl font-bold text-foreground'>
                                        Payment Method
                                    </h2>
                                </div>

                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={setPaymentMethod}
                                    className='mb-6'
                                >
                                    <div className='flex items-center space-x-2 p-4 border border-border rounded-xl'>
                                        <RadioGroupItem
                                            value='card'
                                            id='card'
                                        />
                                        <Label
                                            htmlFor='card'
                                            className='flex-1 cursor-pointer'
                                        >
                                            Credit/Debit Card
                                        </Label>
                                    </div>
                                    <div className='flex items-center space-x-2 p-4 border border-border rounded-xl'>
                                        <RadioGroupItem
                                            value='paypal'
                                            id='paypal'
                                        />
                                        <Label
                                            htmlFor='paypal'
                                            className='flex-1 cursor-pointer'
                                        >
                                            PayPal
                                        </Label>
                                    </div>
                                </RadioGroup>

                                {paymentMethod === 'card' && (
                                    <div className='space-y-4'>
                                        <div>
                                            <Label>Card Number</Label>
                                            <Input
                                                placeholder='1234 5678 9012 3456'
                                                className='mt-1 rounded-xl'
                                            />
                                        </div>
                                        <div className='grid md:grid-cols-2 gap-4'>
                                            <div>
                                                <Label>Expiry Date</Label>
                                                <Input
                                                    placeholder='MM/YY'
                                                    className='mt-1 rounded-xl'
                                                />
                                            </div>
                                            <div>
                                                <Label>CVV</Label>
                                                <Input
                                                    placeholder='123'
                                                    className='mt-1 rounded-xl'
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Cardholder Name</Label>
                                            <Input
                                                placeholder='John Doe'
                                                className='mt-1 rounded-xl'
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className='flex gap-4 mt-6'>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        onClick={() => setStep(1)}
                                        className='flex-1 rounded-xl'
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        size='lg'
                                        onClick={() => setStep(3)}
                                        className='flex-1 rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                                    >
                                        Review Order
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {step === 3 && (
                            <Card className='p-6 rounded-2xl'>
                                <div className='flex items-center space-x-3 mb-6'>
                                    <User className='w-6 h-6 text-[#5B9FD8]' />
                                    <h2 className='text-xl font-bold text-foreground'>
                                        Review & Place Order
                                    </h2>
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
                                                <h4 className='font-semibold text-sm'>
                                                    {item.name}
                                                </h4>
                                                <p className='text-xs text-muted-foreground'>
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <p className='font-semibold'>
                                                $
                                                {(
                                                    item.price * item.quantity
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className='flex gap-4 mt-6'>
                                    <Button
                                        size='lg'
                                        variant='outline'
                                        onClick={() => setStep(2)}
                                        className='flex-1 rounded-xl'
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        size='lg'
                                        onClick={handlePlaceOrder}
                                        className='flex-1 rounded-xl bg-[#7FD99E] hover:bg-[#4CAF50] text-white'
                                    >
                                        Place Order
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className='p-6 rounded-2xl sticky top-20'>
                            <h3 className='text-xl font-bold text-foreground mb-6'>
                                Order Summary
                            </h3>

                            <div className='space-y-3 mb-6'>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>
                                        Subtotal
                                    </span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>
                                        Shipping
                                    </span>
                                    <span className='text-[#7FD99E]'>Free</span>
                                </div>
                                <div className='flex justify-between text-sm'>
                                    <span className='text-muted-foreground'>
                                        Tax
                                    </span>
                                    <span>
                                        ${(cartTotal * 0.08).toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <Separator className='my-4' />

                            <div className='flex justify-between text-lg font-bold text-foreground'>
                                <span>Total</span>
                                <span className='text-[#5B9FD8]'>
                                    ${(cartTotal * 1.08).toFixed(2)}
                                </span>
                            </div>

                            <div className='mt-6 p-4 rounded-xl bg-[#7FD99E]/10 border border-[#7FD99E]/20'>
                                <p className='text-sm text-center text-muted-foreground'>
                                    <span className='font-semibold text-[#7FD99E]'>
                                        Free shipping
                                    </span>{' '}
                                    on this order!
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
