import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ReturnPolicyPage = () => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-background'>
            <div className='bg-[#448B3D] py-10 sm:py-14 px-4 text-center'>
                <RefreshCw className='w-12 h-12 text-white mx-auto mb-3' />
                <h1 className='text-2xl sm:text-3xl font-bold text-white mb-2'>Chính sách đổi trả & Hoàn tiền</h1>
                <p className='text-white/80 text-sm sm:text-base'>Cam kết 100% hài lòng hoặc hoàn tiền</p>
            </div>

            <div className='max-w-3xl mx-auto px-4 sm:px-6 py-10'>
                <Button variant='ghost' onClick={() => navigate(-1)} className='mb-6 rounded-xl'>
                    <ArrowLeft className='w-4 h-4 mr-2' />Quay lại
                </Button>

                {/* Highlight */}
                <div className='bg-green-50 dark:bg-green-950/40 border-2 border-[#448B3D]/30 rounded-2xl p-5 mb-8 text-center'>
                    <p className='text-2xl mb-2'>🛡️</p>
                    <p className='font-bold text-lg text-foreground'>Đổi trả miễn phí trong 7 ngày</p>
                    <p className='text-muted-foreground text-sm mt-1'>Không cần giải thích lý do — Chúng tôi lo phần còn lại</p>
                </div>

                <div className='space-y-5'>
                    {/* Điều kiện đổi trả */}
                    <Card className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                        <h2 className='font-bold text-lg text-foreground mb-4 flex items-center gap-2'>
                            <CheckCircle className='w-5 h-5 text-[#448B3D]' />
                            Điều kiện được đổi trả
                        </h2>
                        <ul className='space-y-2.5'>
                            {[
                                'Sản phẩm còn nguyên vẹn, chưa qua sử dụng, còn đầy đủ bao bì và nhãn mác.',
                                'Trong vòng 7 ngày kể từ ngày nhận hàng.',
                                'Có hóa đơn mua hàng hoặc mã đơn hàng.',
                                'Sản phẩm bị lỗi do nhà sản xuất hoặc giao sai hàng.',
                                'Thức ăn thú cưng: đổi trả nếu bao bì bị hỏng hoặc sản phẩm hết hạn.',
                            ].map((item, i) => (
                                <li key={i} className='flex items-start gap-2 text-sm sm:text-base text-muted-foreground'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-[#448B3D] mt-2 shrink-0' />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Không được đổi trả */}
                    <Card className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                        <h2 className='font-bold text-lg text-foreground mb-4 flex items-center gap-2'>
                            <XCircle className='w-5 h-5 text-red-500' />
                            Trường hợp không áp dụng đổi trả
                        </h2>
                        <ul className='space-y-2.5'>
                            {[
                                'Sản phẩm đã qua sử dụng, bị hư hỏng do người dùng.',
                                'Quá 7 ngày kể từ ngày nhận hàng.',
                                'Sản phẩm thuộc danh mục khuyến mãi đặc biệt (có ghi rõ "không đổi trả").',
                                'Thức ăn đã mở bao bì (trừ trường hợp sản phẩm lỗi).',
                            ].map((item, i) => (
                                <li key={i} className='flex items-start gap-2 text-sm sm:text-base text-muted-foreground'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0' />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Quy trình */}
                    <Card className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                        <h2 className='font-bold text-lg text-foreground mb-4 flex items-center gap-2'>
                            <Clock className='w-5 h-5 text-[#448B3D]' />
                            Quy trình đổi trả
                        </h2>
                        <div className='space-y-4'>
                            {[
                                { step: '1', title: 'Liên hệ chúng tôi', desc: 'Gọi (84) 702 500 551 hoặc nhắn tin qua chatbox để thông báo yêu cầu đổi trả.' },
                                { step: '2', title: 'Xác nhận yêu cầu', desc: 'Nhân viên xác nhận điều kiện và hướng dẫn gửi hàng về trong 24 giờ.' },
                                { step: '3', title: 'Gửi hàng về', desc: 'Đóng gói sản phẩm cẩn thận và gửi về địa chỉ của chúng tôi. Phí vận chuyển do PetCare chịu nếu lỗi từ chúng tôi.' },
                                { step: '4', title: 'Hoàn tiền / Đổi hàng', desc: 'Sau khi nhận và kiểm tra hàng (1-2 ngày), chúng tôi hoàn tiền trong 3-5 ngày làm việc hoặc gửi hàng mới.' },
                            ].map((s, i) => (
                                <div key={i} className='flex gap-4'>
                                    <div className='w-8 h-8 rounded-full bg-[#448B3D] text-white flex items-center justify-center font-bold text-sm shrink-0'>
                                        {s.step}
                                    </div>
                                    <div>
                                        <p className='font-semibold text-foreground'>{s.title}</p>
                                        <p className='text-sm text-muted-foreground mt-0.5'>{s.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Hotline */}
                    <div className='bg-[#448B3D] rounded-2xl p-5 text-center'>
                        <Phone className='w-8 h-8 text-white mx-auto mb-2' />
                        <p className='text-white font-semibold mb-1'>Cần hỗ trợ đổi trả?</p>
                        <a href='tel:+84702500551' className='text-2xl font-bold text-white hover:text-yellow-300 transition-colors'>
                            (84) 702 500 551
                        </a>
                        <p className='text-white/70 text-sm mt-1'>7:00 – 18:00 · Thứ 2 đến Chủ nhật</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnPolicyPage;
