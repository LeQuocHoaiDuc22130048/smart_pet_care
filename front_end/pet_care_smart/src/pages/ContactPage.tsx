import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const ContactPage = () => {
    const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.phone || !form.message) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            toast.success('Đã gửi tin nhắn! Chúng tôi sẽ liên hệ lại trong vòng 30 phút.');
            setForm({ name: '', phone: '', email: '', subject: '', message: '' });
            setLoading(false);
        }, 1000);
    };

    return (
        <div className='min-h-screen bg-background'>
            {/* Hero */}
            <div className='bg-[#448B3D] py-10 sm:py-14 px-4 text-center'>
                <MessageCircle className='w-12 h-12 text-white mx-auto mb-3' />
                <h1 className='text-2xl sm:text-3xl font-bold text-white mb-2'>Liên hệ & Hỗ trợ</h1>
                <p className='text-white/80 text-sm sm:text-base'>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
            </div>

            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
                <div className='grid lg:grid-cols-2 gap-8 lg:gap-12'>

                    {/* Left — Contact info */}
                    <div className='space-y-5'>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
                            {/* Hotline nổi bật */}
                            <Card className='p-5 sm:p-6 rounded-2xl border-2 border-[#448B3D]/30 bg-[#448B3D]/5 mb-5'>
                                <div className='flex items-center gap-4'>
                                    <div className='w-14 h-14 rounded-2xl bg-[#448B3D] flex items-center justify-center shrink-0'>
                                        <Phone className='w-7 h-7 text-white' />
                                    </div>
                                    <div>
                                        <p className='text-sm text-muted-foreground mb-0.5'>Hotline hỗ trợ</p>
                                        <a href='tel:+84702500551' className='text-2xl font-bold text-[#448B3D] hover:underline'>
                                            (84) 702 500 551
                                        </a>
                                        <p className='text-xs text-muted-foreground mt-0.5'>Miễn phí tư vấn · Gọi ngay</p>
                                    </div>
                                </div>
                            </Card>

                            {/* Thông tin liên hệ */}
                            <Card className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                                <h2 className='font-bold text-lg text-foreground mb-4'>Thông tin liên hệ</h2>
                                <div className='space-y-4'>
                                    {[
                                        { icon: MapPin, label: 'Địa chỉ', value: '154 Bắc Hải, Phường 10, Quận Tân Bình, TP. Hồ Chí Minh', color: 'text-red-500' },
                                        { icon: Phone, label: 'Điện thoại', value: '(+84) 702 500 551', color: 'text-[#448B3D]', href: 'tel:+84702500551' },
                                        { icon: Mail, label: 'Email', value: '22130048@st.hcmuaf.edu.vn', color: 'text-blue-500', href: 'mailto:22130048@st.hcmuaf.edu.vn' },
                                        { icon: Clock, label: 'Giờ làm việc', value: 'Thứ 2 – Chủ nhật: 7:00 – 18:00', color: 'text-orange-500' },
                                    ].map((item, i) => (
                                        <div key={i} className='flex items-start gap-3'>
                                            <div className={`w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                                                <item.icon className={`w-4 h-4 ${item.color}`} />
                                            </div>
                                            <div>
                                                <p className='text-xs text-muted-foreground'>{item.label}</p>
                                                {item.href ? (
                                                    <a href={item.href} className='text-sm font-medium text-foreground hover:text-[#448B3D] transition-colors'>
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className='text-sm font-medium text-foreground'>{item.value}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Mạng xã hội */}
                            <Card className='p-5 rounded-2xl border-2 border-border mt-5'>
                                <h2 className='font-bold text-base text-foreground mb-3'>Kết nối với chúng tôi</h2>
                                <div className='flex gap-3'>
                                    <a href='#' className='flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors'>
                                        <Facebook className='w-4 h-4' /> Facebook
                                    </a>
                                    <a href='#' className='flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors'>
                                        <MessageCircle className='w-4 h-4' /> Zalo
                                    </a>
                                </div>
                            </Card>

                            {/* Google Map placeholder */}
                            <Card className='overflow-hidden rounded-2xl border-2 border-border mt-5'>
                                <div className='bg-muted h-52 flex items-center justify-center'>
                                    <div className='text-center'>
                                        <MapPin className='w-10 h-10 text-[#448B3D] mx-auto mb-2' />
                                        <p className='text-sm font-medium text-foreground'>Bản đồ Google Maps</p>
                                        <p className='text-xs text-muted-foreground mt-1'>154 Bắc Hải, Q.Tân Bình, TP.HCM</p>
                                        <a
                                            href='https://maps.google.com/?q=154+Bac+Hai+Tan+Binh+Ho+Chi+Minh'
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-block mt-3 text-xs text-[#448B3D] underline font-medium'
                                        >
                                            Xem trên Google Maps →
                                        </a>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Right — Contact form */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                        <Card className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                            <h2 className='font-bold text-xl text-foreground mb-5'>Gửi tin nhắn cho chúng tôi</h2>
                            <form onSubmit={handleSubmit} className='space-y-4'>
                                <div className='grid sm:grid-cols-2 gap-4'>
                                    <div>
                                        <Label htmlFor='name'>Họ và tên <span className='text-red-500'>*</span></Label>
                                        <Input
                                            id='name'
                                            value={form.name}
                                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                            placeholder='Nguyễn Văn A'
                                            className='mt-1 rounded-xl h-11'
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor='phone'>Số điện thoại <span className='text-red-500'>*</span></Label>
                                        <Input
                                            id='phone'
                                            type='tel'
                                            value={form.phone}
                                            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                            placeholder='0912 345 678'
                                            className='mt-1 rounded-xl h-11'
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor='email'>Email</Label>
                                    <Input
                                        id='email'
                                        type='email'
                                        value={form.email}
                                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        placeholder='ban@example.com'
                                        className='mt-1 rounded-xl h-11'
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='subject'>Chủ đề</Label>
                                    <Input
                                        id='subject'
                                        value={form.subject}
                                        onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                        placeholder='VD: Hỏi về sản phẩm, Đặt lịch dịch vụ...'
                                        className='mt-1 rounded-xl h-11'
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='message'>Nội dung <span className='text-red-500'>*</span></Label>
                                    <Textarea
                                        id='message'
                                        value={form.message}
                                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                        placeholder='Nhập nội dung cần hỗ trợ...'
                                        className='mt-1 rounded-xl min-h-[120px]'
                                    />
                                </div>

                                <Button
                                    type='submit'
                                    disabled={loading}
                                    className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-12 text-base'
                                >
                                    {loading ? (
                                        <span className='flex items-center gap-2'>
                                            <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                                            Đang gửi...
                                        </span>
                                    ) : (
                                        <span className='flex items-center gap-2'>
                                            <Send className='w-4 h-4' /> Gửi tin nhắn
                                        </span>
                                    )}
                                </Button>

                                <p className='text-xs text-muted-foreground text-center'>
                                    Chúng tôi sẽ phản hồi trong vòng <strong>30 phút</strong> trong giờ làm việc
                                </p>
                            </form>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
