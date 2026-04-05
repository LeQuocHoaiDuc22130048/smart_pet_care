import { ArrowLeft, Shield, Lock, Eye, Database, Bell, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
    {
        icon: Database,
        title: '1. Thông tin chúng tôi thu thập',
        content: [
            'Họ tên, số điện thoại, địa chỉ email khi bạn đăng ký tài khoản hoặc đặt hàng.',
            'Địa chỉ giao hàng để thực hiện đơn hàng.',
            'Lịch sử mua hàng và đặt lịch dịch vụ.',
            'Thông tin thiết bị và địa chỉ IP khi truy cập website (dùng để cải thiện trải nghiệm).',
        ],
    },
    {
        icon: Eye,
        title: '2. Mục đích sử dụng thông tin',
        content: [
            'Xử lý đơn hàng và giao hàng đến địa chỉ của bạn.',
            'Xác nhận lịch đặt dịch vụ và nhắc nhở qua điện thoại/email.',
            'Gửi thông tin khuyến mãi, tin tức (bạn có thể hủy đăng ký bất kỳ lúc nào).',
            'Cải thiện chất lượng dịch vụ và trải nghiệm người dùng.',
            'Tuân thủ các quy định pháp luật hiện hành.',
        ],
    },
    {
        icon: Lock,
        title: '3. Bảo mật thông tin',
        content: [
            'Dữ liệu được mã hóa SSL/TLS trong quá trình truyền tải.',
            'Mật khẩu được mã hóa một chiều (hash), chúng tôi không lưu mật khẩu gốc.',
            'Chỉ nhân viên được ủy quyền mới có quyền truy cập dữ liệu khách hàng.',
            'Hệ thống được kiểm tra bảo mật định kỳ.',
        ],
    },
    {
        icon: Bell,
        title: '4. Chia sẻ thông tin với bên thứ ba',
        content: [
            'Chúng tôi KHÔNG bán thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào.',
            'Thông tin chỉ được chia sẻ với đối tác vận chuyển để thực hiện giao hàng.',
            'Đối tác thanh toán nhận thông tin cần thiết để xử lý giao dịch.',
            'Cơ quan nhà nước khi có yêu cầu hợp pháp.',
        ],
    },
    {
        icon: Shield,
        title: '5. Quyền của bạn',
        content: [
            'Yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân của mình.',
            'Hủy đăng ký nhận email marketing bất kỳ lúc nào.',
            'Yêu cầu hạn chế xử lý dữ liệu trong một số trường hợp.',
            'Khiếu nại nếu cho rằng quyền lợi của bạn bị vi phạm.',
        ],
    },
    {
        icon: Mail,
        title: '6. Liên hệ về quyền riêng tư',
        content: [
            'Email: 22130048@st.hcmuaf.edu.vn',
            'Điện thoại: (+84) 702 500 551',
            'Địa chỉ: 154 Bắc Hải, P.10, Q.Tân Bình, TP.HCM',
            'Chúng tôi sẽ phản hồi trong vòng 3-5 ngày làm việc.',
        ],
    },
];

const PrivacyPolicyPage = () => {
    const navigate = useNavigate();
    return (
        <div className='min-h-screen bg-background'>
            <div className='bg-[#448B3D] py-10 sm:py-14 px-4 text-center'>
                <Shield className='w-12 h-12 text-white mx-auto mb-3' />
                <h1 className='text-2xl sm:text-3xl font-bold text-white mb-2'>Chính sách bảo mật</h1>
                <p className='text-white/80 text-sm sm:text-base'>Cập nhật lần cuối: 01/04/2026</p>
            </div>

            <div className='max-w-3xl mx-auto px-4 sm:px-6 py-10'>
                <Button variant='ghost' onClick={() => navigate(-1)} className='mb-6 rounded-xl'>
                    <ArrowLeft className='w-4 h-4 mr-2' />Quay lại
                </Button>

                <div className='bg-[#448B3D]/8 border border-[#448B3D]/20 rounded-2xl p-5 mb-8'>
                    <p className='text-foreground text-sm sm:text-base leading-relaxed'>
                        PetCare cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
                    </p>
                </div>

                <div className='space-y-5'>
                    {SECTIONS.map((sec, i) => (
                        <Card key={i} className='p-5 sm:p-6 rounded-2xl border-2 border-border'>
                            <div className='flex items-start gap-4'>
                                <div className='w-10 h-10 rounded-xl bg-[#448B3D]/10 flex items-center justify-center shrink-0 mt-0.5'>
                                    <sec.icon className='w-5 h-5 text-[#448B3D]' />
                                </div>
                                <div className='flex-1'>
                                    <h2 className='font-bold text-lg text-foreground mb-3'>{sec.title}</h2>
                                    <ul className='space-y-2'>
                                        {sec.content.map((item, j) => (
                                            <li key={j} className='flex items-start gap-2 text-sm sm:text-base text-muted-foreground'>
                                                <span className='w-1.5 h-1.5 rounded-full bg-[#448B3D] mt-2 shrink-0' />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
