import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/CartContext';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CartPage = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <div className='text-center py-16'>
                    <div className='w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#448B3D]/20 to-[#FFB86F]/20 flex items-center justify-center'>
                        <ShoppingBag className='w-16 h-16 text-[#448B3D]' />
                    </div>
                    <h2 className='text-2xl font-bold text-foreground mb-4'>Giỏ hàng trống</h2>
                    <p className='text-muted-foreground mb-8'>Hãy thêm sản phẩm vào giỏ hàng của bạn!</p>
                    <Button
                        size='lg'
                        onClick={() => navigate('/products')}
                        className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'
                    >
                        Tiếp tục mua sắm
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <h1 className='text-3xl font-bold text-foreground mb-8'>Giỏ hàng</h1>

                <div className='grid lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-2 space-y-4'>
                        {cart.map((item) => (
                            <Card key={item.id} className='p-4 sm:p-6 rounded-2xl'>
                                <div className='flex items-start sm:items-center gap-3 sm:gap-6'>
                                    <img src={item.image} alt={item.name} className='w-16 h-16 sm:w-24 sm:h-24 object-cover rounded-xl shrink-0' />
                                    <div className='flex-1 min-w-0'>
                                        <h3 className='font-semibold text-foreground mb-1 text-sm sm:text-base'>{item.name}</h3>
                                        <p className='text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-3'>{item.category}</p>
                                        <p className='text-base sm:text-lg font-bold text-[#448B3D]'>${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className='flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0'>
                                        <div className='flex items-center border border-border rounded-xl overflow-hidden'>
                                            <Button variant='ghost' size='sm' onClick={() => updateQuantity(item.id, item.quantity - 1)} className='rounded-none h-9 w-8 p-0'>
                                                <Minus className='w-3 h-3' />
                                            </Button>
                                            <span className='px-2 sm:px-4 py-2 font-semibold text-sm'>{item.quantity}</span>
                                            <Button variant='ghost' size='sm' onClick={() => updateQuantity(item.id, item.quantity + 1)} className='rounded-none h-9 w-8 p-0'>
                                                <Plus className='w-3 h-3' />
                                            </Button>
                                        </div>
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            onClick={() => { removeFromCart(item.id); toast.success('Đã xóa sản phẩm khỏi giỏ hàng'); }}
                                            className='text-destructive hover:text-destructive rounded-xl h-9 w-9'
                                        >
                                            <Trash2 className='w-4 h-4' />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div>
                        <Card className='p-6 rounded-2xl sticky top-20'>
                            <h3 className='text-xl font-bold text-foreground mb-6'>Tóm tắt đơn hàng</h3>

                            <div className='space-y-3 mb-6'>
                                <div className='flex justify-between text-muted-foreground'>
                                    <span>Tạm tính</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className='flex justify-between text-muted-foreground'>
                                    <span>Phí vận chuyển</span>
                                    <span className='text-[#7FD99E]'>Miễn phí</span>
                                </div>
                                <div className='flex justify-between text-muted-foreground'>
                                    <span>Thuế (8%)</span>
                                    <span>${(cartTotal * 0.08).toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator className='my-4' />

                            <div className='flex justify-between text-lg font-bold text-foreground mb-6'>
                                <span>Tổng cộng</span>
                                <span className='text-[#448B3D]'>${(cartTotal * 1.08).toFixed(2)}</span>
                            </div>

                            <Button
                                size='lg'
                                onClick={() => navigate('/checkout')}
                                className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white mb-3'
                            >
                                Tiến hành thanh toán
                                <ArrowRight className='ml-2 w-5 h-5' />
                            </Button>

                            <Button
                                variant='outline'
                                size='lg'
                                onClick={() => navigate('/products')}
                                className='w-full rounded-xl'
                            >
                                Tiếp tục mua sắm
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
