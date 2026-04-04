import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, PawPrint, CheckCircle, ChevronDown } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import { Button } from '../components/ui/Button';
import { ServiceCardSkeleton } from '../components/ui/Skeleton';
import { fetchServices } from '../mock-api/productsApi';
import { useToast } from '../hooks/useToast';

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const INITIAL_FORM = { date: '', time: '', petName: '', petType: 'dog', petAge: '', notes: '' };

function BookingForm({ service, onSuccess }) {
  const toast = useToast();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.petName.trim()) e.petName = 'Vui lòng nhập tên thú cưng';
    if (!form.date) e.date = 'Vui lòng chọn ngày';
    if (!form.time) e.time = 'Vui lòng chọn giờ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success('Đặt lịch thành công!', `${service.name} - ${form.date} lúc ${form.time}`);
    onSuccess({ ...form, service });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="rounded-xl p-3.5 border mb-4"
        style={{ backgroundColor: 'rgb(68 139 61 / 0.08)', borderColor: 'rgb(68 139 61 / 0.2)' }}>
        <p className="font-semibold text-sm" style={{ color: 'rgb(52,110,46)' }}>{service.icon} {service.name}</p>
        <p className="font-bold text-lg mt-0.5" style={{ color: 'rgb(68,139,61)' }}>{service.price.toLocaleString('vi-VN')}đ</p>
      </div>

      {/* Pet name */}
      <div>
        <label htmlFor="petName" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1.5">
          Tên thú cưng *
        </label>
        <input id="petName" value={form.petName} onChange={e => set('petName', e.target.value)}
          placeholder="VD: Max, Luna..."
          className={`input ${errors.petName ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          aria-describedby={errors.petName ? 'petName-error' : undefined}
        />
        {errors.petName && <p id="petName-error" className="text-xs text-red-500 mt-1" role="alert">{errors.petName}</p>}
      </div>

      {/* Pet type + age */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="petType" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1.5">Loại thú cưng</label>
          <div className="relative">
            <select id="petType" value={form.petType} onChange={e => set('petType', e.target.value)}
              className="input appearance-none pr-8 cursor-pointer">
              <option value="dog">🐶 Chó</option>
              <option value="cat">🐱 Mèo</option>
              <option value="rabbit">🐰 Thỏ</option>
              <option value="other">🐾 Khác</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" aria-hidden="true" />
          </div>
        </div>
        <div>
          <label htmlFor="petAge" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1.5">Tuổi</label>
          <input id="petAge" value={form.petAge} onChange={e => set('petAge', e.target.value)}
            placeholder="VD: 2 tuổi" className="input" />
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1.5">
          Ngày hẹn *
        </label>
        <input id="date" type="date" value={form.date} onChange={e => set('date', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className={`input ${errors.date ? 'border-red-400' : ''}`}
          aria-describedby={errors.date ? 'date-error' : undefined}
        />
        {errors.date && <p id="date-error" className="text-xs text-red-500 mt-1" role="alert">{errors.date}</p>}
      </div>

      {/* Time slots */}
      <div>
        <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-2">
          Giờ hẹn * {errors.time && <span className="text-red-500 ml-1">{errors.time}</span>}
        </label>
        <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Time slots">
          {TIME_SLOTS.map(t => (
            <button key={t} type="button" onClick={() => set('time', t)}
              className={`text-xs py-2 rounded-lg border font-medium transition-colors ${
                form.time === t
                  ? 'text-white border-transparent'
                  : 'border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-green-400 hover:text-green-700'
              }`}
              style={form.time === t ? { backgroundColor: 'rgb(68,139,61)', borderColor: 'rgb(68,139,61)' } : {}}
              aria-pressed={form.time === t}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 block mb-1.5">Ghi chú</label>
        <textarea id="notes" value={form.notes} onChange={e => set('notes', e.target.value)}
          placeholder="Thông tin thêm về thú cưng..."
          rows={2} className="input resize-none" />
      </div>

      <Button type="submit" variant="secondary" size="lg" loading={loading} className="w-full">
        {!loading && 'Xác nhận đặt lịch'}
      </Button>
    </form>
  );
}

function SuccessScreen({ booking, onReset }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="text-center py-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}>
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
      </motion.div>
      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Đặt lịch thành công!</h3>
      <p className="text-sm text-neutral-400 mb-5">Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.</p>
      <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4 text-sm text-left space-y-2 mb-5">
        <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Dịch vụ:</span> <span className="text-neutral-500">{booking.service.name}</span></p>
        <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Thú cưng:</span> <span className="text-neutral-500">{booking.petName}</span></p>
        <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Ngày:</span> <span className="text-neutral-500">{booking.date}</span></p>
        <p><span className="font-medium text-neutral-700 dark:text-neutral-300">Giờ:</span> <span className="text-neutral-500">{booking.time}</span></p>
      </div>
      <Button variant="outline" onClick={onReset} className="w-full">Đặt lịch khác</Button>
    </motion.div>
  );
}

export default function Services() {
  const [searchParams] = useSearchParams();
  const preselect = searchParams.get('book');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(preselect ? +preselect : null);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    fetchServices().then(data => { setServices(data); setLoading(false); });
  }, []);

  const selectedService = services.find(s => s.id === selectedId);

  const handleSuccess = (data) => setBooking(data);
  const handleReset = () => { setBooking(null); setSelectedId(null); };

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">Dịch vụ chăm sóc</h1>
        <p className="text-neutral-400 mt-1">Chọn dịch vụ và đặt lịch hẹn cho thú cưng của bạn</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Service grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array(6).fill(0).map((_, i) => <ServiceCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((s, i) => (
                <motion.div key={s.id} custom={i} initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <ServiceCard service={s} selected={selectedId === s.id} onClick={() => setSelectedId(s.id)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Booking panel */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg mb-5 flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: 'rgb(68,139,61)' }} /> Đặt lịch hẹn
            </h2>

            <AnimatePresence mode="wait">
              {booking ? (
                <SuccessScreen key="success" booking={booking} onReset={handleReset} />
              ) : !selectedService ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-10 text-neutral-400">
                  <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Chọn dịch vụ để đặt lịch</p>
                  <p className="text-xs mt-1 opacity-70">Click vào dịch vụ bên trái</p>
                </motion.div>
              ) : (
                <motion.div key={selectedId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <BookingForm service={selectedService} onSuccess={handleSuccess} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
