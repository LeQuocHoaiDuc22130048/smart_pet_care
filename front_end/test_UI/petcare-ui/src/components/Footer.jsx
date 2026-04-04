import { memo } from 'react';
import { Link } from 'react-router-dom';
import { PawPrint, Share2, Heart, Play, Mail, Phone, MapPin } from 'lucide-react';

export default memo(function Footer() {
  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 text-neutral-400 mt-auto" role="contentinfo">
      <div className="container-page py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl mb-4" style={{ color: 'rgb(68,139,61)' }}>
            <PawPrint className="w-6 h-6" aria-hidden="true" />
            PetCare
          </Link>
          <p className="text-sm leading-relaxed text-neutral-500">
            Nền tảng chăm sóc thú cưng toàn diện với AI. Yêu thương thú cưng của bạn như chúng tôi yêu thương chúng.
          </p>
          <div className="flex gap-2 mt-5">
            {[Share2, Heart, Play].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social media link"
                className="p-2 bg-neutral-800 rounded-lg transition-colors duration-200 hover:text-white"
                style={{ '--hover-bg': 'rgb(68,139,61)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgb(68,139,61)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-semibold text-neutral-200 mb-4 text-sm uppercase tracking-wider">Liên kết</h3>
          <ul className="space-y-2.5 text-sm">
            {[['/', 'Trang chủ'], ['/products', 'Sản phẩm'], ['/services', 'Dịch vụ'], ['/image-search', 'Tìm kiếm ảnh'], ['/profile', 'Tài khoản']].map(([to, label]) => (
              <li key={to}>
                <Link to={to} className="transition-colors hover:text-green-400">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-semibold text-neutral-200 mb-4 text-sm uppercase tracking-wider">Dịch vụ</h3>
          <ul className="space-y-2.5 text-sm">
            {['Grooming thú cưng', 'Khám thú y', 'Tiêm phòng', 'Khách sạn thú cưng', 'Tư vấn AI 24/7'].map(s => (
              <li key={s} className="text-neutral-500">{s}</li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold text-neutral-200 mb-4 text-sm uppercase tracking-wider">Liên hệ</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'rgb(68,139,61)' }} aria-hidden="true" />
              <span>123 Nguyễn Huệ, Q.1, TP.HCM</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 shrink-0" style={{ color: 'rgb(68,139,61)' }} aria-hidden="true" />
              <a href="tel:18001234" className="hover:text-green-400 transition-colors">1800 1234</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 shrink-0" style={{ color: 'rgb(68,139,61)' }} aria-hidden="true" />
              <a href="mailto:hello@petcare.vn" className="hover:text-green-400 transition-colors">hello@petcare.vn</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-800 py-5">
        <div className="container-page flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-600">
          <p>© 2026 PetCare Vietnam. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-neutral-400 transition-colors">Chính sách bảo mật</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">Điều khoản sử dụng</a>
          </div>
        </div>
      </div>
    </footer>
  );
});
