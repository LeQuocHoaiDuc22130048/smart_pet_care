import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { Link } from 'react-router';

const PublicFooter = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className='bg-[#2d5a27] text-white mt-auto'>
            {/* Số điện thoại nổi bật */}
            <div className='bg-[#1e3d1b] py-5 px-4 text-center'>
                <p className='text-white/80 text-base mb-2'>Cần hỗ trợ? Gọi ngay — Miễn phí tư vấn</p>
                <a
                    href='tel:+84702500551'
                    className='inline-flex items-center gap-2 text-3xl font-bold text-white hover:text-yellow-300 transition-colors'
                >
                    <Phone className='w-7 h-7' />
                    (84) 702 500 551
                </a>
                <p className='text-white/60 text-sm mt-1'>Mở cửa: 7:00 – 18:00 · Thứ 2 đến Chủ nhật</p>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
                    {/* Thương hiệu */}
                    <div className='space-y-4'>
                        <div className='flex items-center space-x-3'>
                            <div className='w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center'>
                                <img src='/image-removebg-preview.png' alt='Logo' className='w-10 h-10' />
                            </div>
                            <div>
                                <span className='font-bold text-xl text-white'>PetCare</span>
                                <p className='text-white/60 text-xs'>Chăm sóc vật nuôi</p>
                            </div>
                        </div>
                        <p className='text-white/75 text-base leading-relaxed'>
                            Người bạn đồng hành đáng tin cậy của bà con nông dân trong việc chăm sóc vật nuôi.
                        </p>
                        <div className='flex space-x-3'>
                            {[Facebook, Twitter, Instagram].map((Icon, i) => (
                                <a key={i} href='#' className='w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors'>
                                    <Icon className='w-4 h-4 text-white' />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Liên kết nhanh */}
                    <div>
                        <h3 className='font-bold text-lg text-white mb-4'>Mua sắm</h3>
                        <ul className='space-y-3'>
                            {[
                                { label: '🛒 Tất cả sản phẩm', path: '/products' },
                                { label: '📅 Đặt lịch dịch vụ', path: '/booking' },
                                { label: '🔍 Tìm theo ảnh', path: '/image-search' },
                                { label: '🛍️ Giỏ hàng', path: '/cart' },
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className='text-white/75 hover:text-white transition-colors text-base'>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Dịch vụ */}
                    <div>
                        <h3 className='font-bold text-lg text-white mb-4'>Dịch vụ thú y</h3>
                        <ul className='space-y-3'>
                            {['🛁 Tắm & Cắt lông', '💉 Tiêm phòng', '🏥 Khám sức khỏe', '✂️ Cắt tỉa lông'].map((s) => (
                                <li key={s}>
                                    <Link to='/booking' className='text-white/75 hover:text-white transition-colors text-base'>
                                        {s}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Liên hệ */}
                    <div>
                        <h3 className='font-bold text-lg text-white mb-4'>Liên hệ</h3>
                        <ul className='space-y-3'>
                            <li className='flex items-start gap-2 text-white/75 text-base'>
                                <MapPin className='w-5 h-5 mt-0.5 shrink-0 text-yellow-300' />
                                <span>154 Bắc Hải, P.10, Q.Tân Bình, TP.HCM</span>
                            </li>
                            <li>
                                <a href='tel:+84702500551' className='flex items-center gap-2 text-yellow-300 font-bold text-lg hover:text-yellow-200 transition-colors'>
                                    <Phone className='w-5 h-5 shrink-0' />
                                    (84) 702 500 551
                                </a>
                            </li>
                            <li className='flex items-center gap-2 text-white/75 text-base'>
                                <Mail className='w-5 h-5 shrink-0' />
                                <span>22130048@st.hcmuaf.edu.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className='mt-8 pt-6 border-t border-white/20 text-center'>
                    <p className='text-white/60 text-sm'>
                        © {currentYear} PetCare. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
