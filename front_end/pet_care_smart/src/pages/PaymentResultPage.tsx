import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentResultPage = () => {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const successful = params.get('status') === 'SUCCESS';
    const transactionId = params.get('transactionId');

    return (
        <div className='min-h-screen bg-background flex items-center justify-center px-4 py-12'>
            <Card className='max-w-lg w-full p-8 rounded-2xl text-center'>
                {successful ? (
                    <CheckCircle2 className='w-16 h-16 mx-auto mb-4 text-[#448B3D]' />
                ) : (
                    <XCircle className='w-16 h-16 mx-auto mb-4 text-red-500' />
                )}
                <h1 className='text-2xl font-bold text-foreground mb-2'>
                    {successful ? 'Thanh toán VNPay thành công' : 'Thanh toán VNPay không thành công'}
                </h1>
                <p className='text-muted-foreground mb-3'>
                    {successful
                        ? 'Giao dịch thử nghiệm đã được xác nhận và đơn hàng sẽ được cập nhật.'
                        : 'Giao dịch đã bị hủy hoặc thất bại. Bạn có thể kiểm tra lại đơn hàng.'}
                </p>
                {transactionId && (
                    <p className='text-xs text-muted-foreground mb-6'>Mã giao dịch: {transactionId}</p>
                )}
                <div className='flex gap-3 justify-center'>
                    <Button variant='outline' onClick={() => navigate('/products')}>Tiếp tục mua sắm</Button>
                    <Button
                        className='bg-[#448B3D] hover:bg-[#336B2D] text-white'
                        onClick={() => navigate('/dashboard?tab=orders')}
                    >
                        Xem đơn hàng
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default PaymentResultPage;
