import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, ChevronDown, Phone } from 'lucide-react';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const QUICK_REPLIES = [
    '🛒 Tư vấn sản phẩm',
    '📅 Đặt lịch dịch vụ',
    '🚚 Theo dõi đơn hàng',
    '📞 Gọi hỗ trợ',
];

const generateBotResponse = (userInput: string): string => {
    const lower = userInput.toLowerCase();
    if (lower.includes('sản phẩm') || lower.includes('mua') || lower.includes('tư vấn'))
        return 'Bạn cần tìm sản phẩm gì cho vật nuôi? Thức ăn, thuốc hay phụ kiện? Tôi sẽ giúp bạn chọn đúng loại phù hợp nhé! 🐾';
    if (lower.includes('đặt lịch') || lower.includes('dịch vụ') || lower.includes('khám'))
        return 'Chúng tôi có các dịch vụ: Tắm & cắt lông, Khám sức khỏe, Tiêm phòng. Bạn muốn đặt lịch dịch vụ nào? Tôi có thể hướng dẫn bạn đặt lịch ngay!';
    if (lower.includes('đơn hàng') || lower.includes('giao hàng') || lower.includes('theo dõi'))
        return 'Để theo dõi đơn hàng, bạn vào mục "Trang cá nhân" → "Đơn hàng". Nếu cần hỗ trợ thêm, gọi ngay (84) 702 500 551 nhé!';
    if (lower.includes('gọi') || lower.includes('điện thoại') || lower.includes('liên hệ'))
        return 'Hotline hỗ trợ: 📞 (84) 702 500 551\nMở cửa: 7:00 – 18:00 hàng ngày\nBà con cứ gọi, chúng tôi luôn sẵn sàng!';
    if (lower.includes('giá') || lower.includes('bao nhiêu') || lower.includes('tiền'))
        return 'Giá sản phẩm rất đa dạng, phù hợp với mọi ngân sách. Bạn xem chi tiết tại trang Sản phẩm hoặc gọi (84) 702 500 551 để được báo giá cụ thể!';
    return 'Tôi có thể giúp bạn tư vấn sản phẩm, đặt lịch dịch vụ hoặc theo dõi đơn hàng. Bạn cần hỗ trợ gì ạ? 😊';
};

const formatTime = (date: Date) =>
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Xin chào bà con! 👋 Tôi là trợ lý tư vấn của PetCare. Tôi có thể giúp gì cho bạn hôm nay?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                text: generateBotResponse(text),
                sender: 'bot',
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 1200);
    };

    return (
        <>
            {/* FAB button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className='fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#448B3D] hover:bg-[#336B2D] text-white rounded-full shadow-2xl px-5 py-3.5 transition-colors'
                        aria-label='Mở hỗ trợ'
                    >
                        <div className='relative'>
                            <Bot className='w-5 h-5' />
                            {/* Online dot */}
                            <span className='absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-300 rounded-full border-2 border-[#448B3D]' />
                        </div>
                        <span className='text-sm font-semibold'>Hỗ trợ</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.95 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className='fixed bottom-6 right-6 z-50 w-[360px] sm:w-[380px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-border bg-card'
                        style={{ height: '520px' }}
                    >
                        {/* ── Header ── */}
                        <div className='bg-[#448B3D] px-4 py-3 flex items-center justify-between shrink-0'>
                            <div className='flex items-center gap-3'>
                                <div className='relative'>
                                    <div className='w-9 h-9 rounded-full bg-white/20 flex items-center justify-center'>
                                        <Bot className='w-5 h-5 text-white' />
                                    </div>
                                    <span className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 rounded-full border-2 border-[#448B3D]' />
                                </div>
                                <div>
                                    <p className='text-white font-semibold text-sm leading-tight'>Trợ lý PetCare</p>
                                    <p className='text-white/70 text-xs'>Đang hoạt động</p>
                                </div>
                            </div>
                            <div className='flex items-center gap-1'>
                                <a
                                    href='tel:+84702500551'
                                    className='w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors'
                                    title='Gọi hỗ trợ'
                                >
                                    <Phone className='w-4 h-4' />
                                </a>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className='w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors'
                                    aria-label='Đóng'
                                >
                                    <ChevronDown className='w-4 h-4' />
                                </button>
                            </div>
                        </div>

                        {/* ── Messages ── */}
                        <div className='flex-1 overflow-y-auto bg-background px-4 py-4 space-y-3'>
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar bot */}
                                    {msg.sender === 'bot' && (
                                        <div className='w-7 h-7 rounded-full bg-[#448B3D] flex items-center justify-center shrink-0 mb-0.5'>
                                            <Bot className='w-4 h-4 text-white' />
                                        </div>
                                    )}

                                    <div className={`flex flex-col gap-0.5 max-w-[78%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div
                                            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.sender === 'user'
                                                ? 'bg-[#448B3D] text-white rounded-br-sm'
                                                : 'bg-card text-foreground rounded-bl-sm shadow-sm border border-border'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                        <span className='text-[10px] text-gray-400 px-1'>
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className='flex items-end gap-2'>
                                    <div className='w-7 h-7 rounded-full bg-[#448B3D] flex items-center justify-center shrink-0'>
                                        <Bot className='w-4 h-4 text-white' />
                                    </div>
                                    <div className='bg-card rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-border'>
                                        <div className='flex gap-1.5 items-center h-4'>
                                            {[0, 160, 320].map((d) => (
                                                <span
                                                    key={d}
                                                    className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                                    style={{ animationDelay: `${d}ms` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* ── Quick replies ── */}
                        <div className='bg-background px-4 pb-2 flex gap-2 overflow-x-auto shrink-0' style={{ scrollbarWidth: 'none' }}>
                            {QUICK_REPLIES.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => sendMessage(q)}
                                    className='shrink-0 text-xs bg-card border border-[#448B3D]/30 text-[#448B3D] font-medium rounded-full px-3 py-1.5 hover:bg-[#448B3D] hover:text-white transition-colors whitespace-nowrap'
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* ── Input ── */}
                        <div className='bg-background border-t border-border px-3 py-3 flex items-center gap-2 shrink-0'>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                                placeholder='Nhập câu hỏi...'
                                className='flex-1 rounded-xl border-border bg-muted focus:border-[#448B3D] text-sm h-10'
                            />
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim()}
                                className='w-10 h-10 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0'
                                aria-label='Gửi'
                            >
                                <Send className='w-4 h-4 text-white' />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChatBot;
