import { ArrowLeft, Truck, MapPin, Clock, Package, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ZONES = [
    { zone: 'TP. Hồ Chí Minh', time: '1-2 ngày', fee: 'Miễn phí đơn ≥ 300.000đ\n25.000đ đơn < 300.000đ' },
    { zone: 'Các tỉnh lân cận (Bình Dương, Đồng Nai, Long An...)', time: '2-3 ngày', fee: 'Miễn phí đơn ≥ 500.000đ\n35.000đ đơn < 500.000đ' },
    { zone: 'Miền Trung & Miền Bắc', time: '3-5 ngày', fee: 'Miễn phí đơn ≥ 700.000đ\n45.000đ đơn < 700.000đ' },
    { zone: 'Vùng sâu, vùng xa, hải đảo', time: '5-7 ngày', fee: 'Tính theo thực tế\n(Liên hệ để báo giá)' },
];

const ShippingPolicyPage = () => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-background'>
            <div className='bg-[#448B3D] py-10 sm:py-14 px-4 text-center'>
                <Truck className='w-12 h-12 text-white mx-auto mb-3' />
                <h1 className='text-2xl sm:text-3xl font-bold text-white mb-2'>Chính sách vận chuyển</h1>
                <p className='text-white/80 text-sm sm:text-base'>Giao hàng nhanh — Đóng gói cẩn thận — Theo dõi đơn hàng</p>
            </div>

            <div className='max-w-3xl mx-auto px-4 sm:px-6 py-10'>
                <Button variant='ghost' onClick={() => navigate(-1)} className='mb-6 rounded-xl'>
                    <ArrowLeft className='w-4 h-4 mr-2' />Quay lại
                </Button>

                {/* Highlight */}
                <div className='grid grid-cols-3 gap-3 mb-8'>
                    {[
                        { icon: '🚚', label: 'Giao nhanh', sub: '1-2 ngày nội thành' },
                        { icon: '📦', label: 'Đóng gói kỹ', sub: 'An toàn cho thú cưng' },
                        { icon: '🆓', label: 'Miễn phí ship', sub: 'Đơn từ 300.000đ' },
                    ].map((item, i) => (
                        <div key={i} className='bg-[#448B3D]/8 border border-[#448B3D]/20 rounded-xl p-3 text-center'>
                            <div className='text-2xl mb-1'>{item.icon}</div>
                            <p className='font-bold text-sm text-foreground'>{item.label}</p>
                            <p className='text-xs text-muted-foreground mt-0.5'>{item.sub}</p>
                        </div>
                    ))}
                </div>

                <div className='space-y-5'>
                    {/* Bảng phí */}
                    <Card className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                        <h2 className='font-bold text-lg text-foreground mb-4 flex items-center gap-2'>
                            <MapPin className='w-5 h-5 text-[#448B3D]' />
                            Phí và thời gian giao hàng
                        </h2>
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b border-border'>
                                        <th className='text-left py-2 pr-4 font-semibold text-muted-foreground'>Khu vực</th>
                                        <th className='text-left py-2 pr-4 font-semibold text-muted-foreground'>Thời gian</th>
                                        <th className='text-left py-2 font-semibold text-muted-foreground'>Phí ship</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ZONES.map((z, i) => (
                                        <tr key={i} className='border-b border-border last:border-0'>
                                            <td className='py-3 pr-4 text-foreground font-medium'>{z.zone}</td>
                                            <td className='py-3 pr-4 text-muted-foreground whitespace-nowrap'>{z.time}</td>
                                            <td className='py-3 text-muted-foreground whitespace-pre-line text-xs'>{z.fee}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Quy định */}
                    <Card className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                        <h2 className='font-bold text-lg text-foreground mb-4 flex items-center gap-2'>
                            <Package className='w-5 h-5 text-[#448B3D]' />
                            Quy định đóng gói & giao nhận
                        </h2>
                        <ul className='space-y-2.5'>
                            {[
                                'Tất cả đơn hàng được đóng gói cẩn thận, đảm bảo an toàn cho sản phẩm.',
                                'Thức ăn thú cưng được đóng gói kín, tránh ẩm mốc trong quá trình vận chuyển.',
                                'Đơn hàng được xử lý trong 1-2 giờ làm việc sau khi xác nhận thanh toán.',
                                'Bạn sẽ nhận được SMS/email thông báo khi đơn hàng được giao cho đơn vị vận chuyển.',
                                'Kiểm tra hàng trước khi ký nhận. Từ chối nhận nếu hàng bị hư hỏng.',
                                'Nếu không có người nhận, shipper sẽ liên hệ lại tối đa 2 lần.',
                            ].map((item, i) => (
                                <li key={i} className='flex items-start gap-2 text-sm sm:text-base text-muted-foreground'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-[#448B3D] mt-2 shrink-0' />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Thời gian */}
                    <Card className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                        <h2 className='font-bold text-lg text-foreground mb-4 flex items-center gap-2'>
                            <Clock className='w-5 h-5 text-[#448B3D]' />
                            Thời gian xử lý đơn hàng
                        </h2>
                        <div className='space-y-3'>
                            {[
                                { time: 'Trước 14:00', desc: 'Giao hàng trong ngày (nội thành TP.HCM)' },
                                { time: 'Sau 14:00', desc: 'Giao hàng ngày hôm sau' },
                                { time: 'Thứ 7, Chủ nhật', desc: 'Vẫn giao hàng bình thường' },
                                { time: 'Ngày lễ', desc: 'Có thể chậm 1-2 ngày, sẽ thông báo trước' },
                            ].map((item, i) => (
                                <div key={i} className='flex items-center gap-3 py-2 border-b border-border last:border-0'>
                                    <span className='font-semibold text-[#448B3D] text-sm w-32 shrink-0'>{item.time}</span>
                                    <span className='text-sm text-muted-foreground'>{item.desc}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Hotline */}
                    <div className='bg-[#448B3D] rounded-2xl p-5 text-center'>
                        <Phone className='w-8 h-8 text-white mx-auto mb-2' />
                        <p className='text-white font-semibold mb-1'>Theo dõi đơn hàng hoặc cần hỗ trợ?</p>
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

export default ShippingPolicyPage;
