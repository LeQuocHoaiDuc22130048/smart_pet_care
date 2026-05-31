import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Send, ChevronDown, Phone, ChevronRight, ChevronLeft, ShoppingBag, Clock, Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/context/AuthContext';
import { sendChatMessage } from '@/lib/chatApi';
import { htmlToPlainText } from '@/lib/htmlSafety';
import type { ChatMessage as ApiChatMessage, BotReply, SuggestionCard } from '@/lib/chatApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    botReply?: BotReply;
}

interface QuickReply {
    label: string;
    action: 'message' | 'navigate' | 'call';
    payload: string;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY_PREFIX = 'pcs_chat_history';
const MAX_STORED_MESSAGES = 50;

function getStorageKey(userId?: string) {
    return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

/** Serialize Message[] → JSON (timestamp as ISO string) */
function saveMessages(messages: Message[], userId?: string) {
    try {
        const key = getStorageKey(userId);
        const data = messages.slice(-MAX_STORED_MESSAGES).map(m => ({
            ...m,
            timestamp: m.timestamp.toISOString(),
        }));
        localStorage.setItem(key, JSON.stringify(data));
    } catch { /* quota exceeded hoặc private mode */ }
}

/** Deserialize JSON → Message[] */
function loadMessages(userId?: string): Message[] {
    try {
        const key = getStorageKey(userId);
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const data = JSON.parse(raw) as Array<Message & { timestamp: string }>;
        return data.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
    } catch {
        return [];
    }
}

function clearMessages(userId?: string) {
    try {
        localStorage.removeItem(getStorageKey(userId));
    } catch { /* ignore */ }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const QUICK_REPLIES: QuickReply[] = [
    { label: '🛒 Tư vấn sản phẩm', action: 'message', payload: 'Gợi ý sản phẩm cho thú cưng' },
    { label: '📅 Đặt lịch dịch vụ', action: 'message', payload: 'Các dịch vụ chăm sóc thú cưng' },
    { label: '🚚 Theo dõi đơn hàng', action: 'navigate', payload: '/dashboard' },
    { label: '📞 Gọi hỗ trợ', action: 'call', payload: 'tel:+84702500551' },
];

const INITIAL_MESSAGE: Message = {
    id: '1',
    text: 'Xin chào bạn! 👋 Mình là trợ lý AI của PetCare Smart. Mình có thể giúp bạn tư vấn sản phẩm, đặt lịch dịch vụ hoặc giải đáp thắc mắc về thú cưng. Bạn cần hỗ trợ gì ạ? 🐾',
    sender: 'bot',
    timestamp: new Date(),
    botReply: { text: '', suggestions: [] },
};

const ERROR_MESSAGE = 'Xin lỗi bạn, mình đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc gọi hotline (84) 702 500 551 nhé! 🙏';

const formatTime = (date: Date) =>
    date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

const formatPrice = (price: number) =>
    price.toLocaleString('vi-VN') + 'đ';

function getPlainTextDescription(description?: string): string {
    return htmlToPlainText(description);
}

// ─── Suggestion Card Component ────────────────────────────────────────────────

const SuggestionCardItem = ({
    card,
    onNavigate,
}: {
    card: SuggestionCard;
    onNavigate: (link: string) => void;
}) => {
    const description = getPlainTextDescription(card.description);

    return (
        <button
            onClick={() => onNavigate(card.link)}
            className='w-full flex items-center gap-3 rounded-xl border border-border bg-background hover:border-[#448B3D] hover:shadow-md transition-all text-left overflow-hidden group p-2'
        >
            {/* Ảnh vuông bên trái */}
            <div className='w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0'>
                {card.imageUrl ? (
                    <img
                        src={card.imageUrl}
                        alt={card.name}
                        className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                        {card.type === 'product'
                            ? <ShoppingBag className='w-6 h-6 opacity-30' />
                            : <Bot className='w-6 h-6 opacity-30' />
                        }
                    </div>
                )}
            </div>

            {/* Info bên phải */}
            <div className='flex-1 min-w-0 space-y-0.5'>
                <p className='text-xs font-medium text-foreground line-clamp-2 leading-tight'>{card.name}</p>
                <p className='text-xs font-bold text-[#448B3D]'>{formatPrice(card.price)}</p>
                {card.type === 'service' && card.durationMinutes && (
                    <p className='text-[10px] text-muted-foreground flex items-center gap-0.5'>
                        <Clock className='w-2.5 h-2.5' />{card.durationMinutes} phút
                    </p>
                )}
                {description && (
                    <p className='text-[10px] text-muted-foreground line-clamp-1'>{description}</p>
                )}
            </div>

            {/* Arrow */}
            <ChevronRight className='w-4 h-4 text-muted-foreground shrink-0 group-hover:text-[#448B3D] transition-colors' />
        </button>
    );
};

// ─── Bot Message Component ────────────────────────────────────────────────────

const BotMessage = ({
    msg,
    onNavigate,
}: {
    msg: Message;
    onNavigate: (link: string) => void;
}) => {
    const suggestions = msg.botReply?.suggestions ?? [];

    return (
        <div className='flex items-start gap-2 flex-row'>
            <div className='w-7 h-7 rounded-full bg-[#448B3D] flex items-center justify-center shrink-0 mt-1'>
                <Bot className='w-4 h-4 text-white' />
            </div>
            <div className='flex flex-col gap-1.5 min-w-0 flex-1 items-start'>
                {/* Text bubble */}
                <div className='px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed whitespace-pre-line bg-card text-foreground shadow-sm border border-border max-w-[85%]'>
                    {msg.text}
                </div>

                {/* Product/Service cards — danh sách dọc */}
                {suggestions.length > 0 && (
                    <div className='flex flex-col gap-2 w-full'>
                        {suggestions.map((card) => (
                            <SuggestionCardItem key={`${card.id}-${card.type}`} card={card} onNavigate={onNavigate} />
                        ))}
                    </div>
                )}
                <span className='text-[10px] text-gray-400 px-1'>{formatTime(msg.timestamp)}</span>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AIChatBot = () => {
    const { user, isLoading: authLoading } = useAuth();
    const userId = user?.id;

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const historyRef = useRef<ApiChatMessage[]>([]);
    const initializedRef = useRef(false);
    const prevUserIdRef = useRef<string | undefined>(undefined);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const showQuickReplies = !isTyping && messages[messages.length - 1]?.sender === 'bot';

    // Load history sau khi auth xong
    useEffect(() => {
        if (authLoading) return; // chờ auth load xong
        if (initializedRef.current) return; // chỉ load 1 lần
        initializedRef.current = true;

        const stored = loadMessages(userId);
        if (stored.length > 0) {
            setMessages(stored);
            historyRef.current = stored
                .filter(m => m.id !== '1')
                .map((m): ApiChatMessage => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text }))
                .slice(-10);
        }
    }, [authLoading, userId]);

    // Khi user login/logout → load lại history của user đó
    useEffect(() => {
        if (authLoading) return;
        if (prevUserIdRef.current === userId) return; // không thay đổi
        prevUserIdRef.current = userId;

        // Lưu history hiện tại trước khi switch
        // (đã được save bởi effect bên dưới)

        const stored = loadMessages(userId);
        const loaded = stored.length > 0 ? stored : [INITIAL_MESSAGE];
        setMessages(loaded);
        historyRef.current = loaded
            .filter(m => m.id !== '1')
            .map((m): ApiChatMessage => ({ role: m.sender === 'user' ? 'user' : 'model', text: m.text }))
            .slice(-10);
    }, [userId, authLoading]);

    // Lưu messages vào localStorage mỗi khi thay đổi
    useEffect(() => {
        if (!initializedRef.current) return;
        saveMessages(messages, userId);
    }, [messages, userId]);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    const setScrollRef = useCallback((el: HTMLDivElement | null) => {
        if (scrollRef.current) {
            scrollRef.current.removeEventListener('scroll', updateScrollState);
        }
        (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        if (el) {
            el.addEventListener('scroll', updateScrollState);
            setTimeout(updateScrollState, 50);
        }
    }, [updateScrollState]);

    const scrollBy = useCallback((dir: 'left' | 'right') => {
        scrollRef.current?.scrollBy({ left: dir === 'right' ? 120 : -120, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleNavigate = useCallback((link: string) => {
        setIsOpen(false);
        window.location.href = link;
    }, []);

    const handleClearHistory = useCallback(() => {
        clearMessages(userId);
        setMessages([INITIAL_MESSAGE]);
        historyRef.current = [];
    }, [userId]);

    const sendMessage = useCallback(async (text: string) => {
        if (!text.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        const userHistoryEntry: ApiChatMessage = { role: 'user', text };
        historyRef.current = [...historyRef.current, userHistoryEntry].slice(-10);

        try {
            const response = await sendChatMessage({
                message: text,
                history: historyRef.current.slice(0, -1),
                userContext: user
                    ? {
                        userName: user.firstName
                            ? `${user.firstName} ${user.lastName ?? ''}`.trim()
                            : user.username,
                    }
                    : undefined,
            });

            const parsed = response.result?.parsed ?? { text: response.result?.reply ?? ERROR_MESSAGE, suggestions: [] };

            const botHistoryEntry: ApiChatMessage = { role: 'model', text: parsed.text };
            historyRef.current = [...historyRef.current, botHistoryEntry].slice(-10);

            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: parsed.text,
                    sender: 'bot',
                    timestamp: new Date(),
                    botReply: parsed,
                },
            ]);
        } catch {
            setMessages(prev => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: ERROR_MESSAGE,
                    sender: 'bot',
                    timestamp: new Date(),
                    botReply: { text: ERROR_MESSAGE, suggestions: [] },
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    }, [isTyping, user]);

    const handleQuickReply = useCallback((reply: QuickReply) => {
        if (reply.action === 'call') {
            window.location.href = reply.payload;
            return;
        }
        if (reply.action === 'navigate') {
            handleNavigate(reply.payload);
            return;
        }
        sendMessage(reply.payload);
    }, [sendMessage, handleNavigate]);

    return (
        <>
            {/* FAB */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        className='fixed bottom-4 right-4 z-50 flex items-center gap-2.5 bg-[#448B3D] hover:bg-[#336B2D] text-white rounded-full shadow-2xl px-4 py-3 sm:px-5 sm:py-3.5 transition-colors'
                        aria-label='Mở hỗ trợ'
                    >
                        <div className='relative'>
                            <Bot className='w-5 h-5' />
                            <span className='absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-300 rounded-full border-2 border-[#448B3D]' />
                        </div>
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
                        className='fixed z-50 flex flex-col overflow-hidden border border-border bg-card shadow-2xl
                            inset-0 rounded-none
                            sm:inset-auto sm:bottom-4 sm:right-4 sm:w-[400px] sm:h-[560px] sm:rounded-2xl'
                    >
                        {/* Header */}
                        <div className='bg-[#448B3D] px-4 py-3 flex items-center justify-between shrink-0'>
                            <div className='flex items-center gap-3'>
                                <div className='relative'>
                                    <div className='w-9 h-9 rounded-full bg-white/20 flex items-center justify-center'>
                                        <Bot className='w-5 h-5 text-white' />
                                    </div>
                                    <span className='absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-300 rounded-full border-2 border-[#448B3D]' />
                                </div>
                                <div>
                                    <p className='text-white font-semibold text-sm leading-tight'>Trợ lý PetCare AI</p>
                                    <p className='text-white/70 text-xs'>Powered by Gemini ✨</p>
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
                                    onClick={handleClearHistory}
                                    className='w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors'
                                    aria-label='Xóa lịch sử'
                                    title='Xóa lịch sử chat'
                                >
                                    <Trash2 className='w-4 h-4' />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className='w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors'
                                    aria-label='Đóng'
                                >
                                    <ChevronDown className='w-4 h-4' />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className='flex-1 overflow-y-auto bg-background px-4 py-4 space-y-3'>
                            {messages.map((msg) =>
                                msg.sender === 'bot' ? (
                                    <BotMessage key={msg.id} msg={msg} onNavigate={handleNavigate} />
                                ) : (
                                    <div key={msg.id} className='flex items-end gap-2 flex-row-reverse'>
                                        <div className='flex flex-col gap-0.5 max-w-[78%] items-end'>
                                            <div className='px-3.5 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed whitespace-pre-line bg-[#448B3D] text-white'>
                                                {msg.text}
                                            </div>
                                            <span className='text-[10px] text-gray-400 px-1'>{formatTime(msg.timestamp)}</span>
                                        </div>
                                    </div>
                                )
                            )}

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

                        {/* Quick replies */}
                        <AnimatePresence>
                            {showQuickReplies && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.18 }}
                                    className='bg-background shrink-0 border-t border-border/50'
                                    onAnimationComplete={updateScrollState}
                                >
                                    <div className='flex items-center gap-1 px-2 py-2'>
                                        <AnimatePresence>
                                            {canScrollLeft ? (
                                                <motion.button
                                                    key='left'
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    onClick={() => scrollBy('left')}
                                                    className='shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-border bg-card text-[#448B3D] hover:bg-[#448B3D] hover:text-white transition-all shadow-sm'
                                                >
                                                    <ChevronLeft className='w-3.5 h-3.5' />
                                                </motion.button>
                                            ) : <div key='lp' className='shrink-0 w-7' />}
                                        </AnimatePresence>

                                        <div
                                            ref={setScrollRef}
                                            className='flex gap-2 overflow-x-auto flex-1 min-w-0'
                                            style={{ scrollbarWidth: 'none' }}
                                        >
                                            {QUICK_REPLIES.map((q) => (
                                                <button
                                                    key={q.label}
                                                    onClick={() => handleQuickReply(q)}
                                                    className='shrink-0 text-xs bg-card border border-[#448B3D]/30 text-[#448B3D] font-medium rounded-full px-3 py-1.5 hover:bg-[#448B3D] hover:text-white active:scale-95 transition-all whitespace-nowrap'
                                                >
                                                    {q.label}
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence>
                                            {canScrollRight ? (
                                                <motion.button
                                                    key='right'
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    onClick={() => scrollBy('right')}
                                                    className='shrink-0 w-7 h-7 flex items-center justify-center rounded-full border border-border bg-card text-[#448B3D] hover:bg-[#448B3D] hover:text-white transition-all shadow-sm'
                                                >
                                                    <ChevronRight className='w-3.5 h-3.5' />
                                                </motion.button>
                                            ) : <div key='rp' className='shrink-0 w-7' />}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Input */}
                        <div className='bg-background border-t border-border px-3 py-3 flex items-center gap-2 shrink-0'>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                                placeholder='Nhập câu hỏi...'
                                className='flex-1 rounded-xl border-border bg-muted focus:border-[#448B3D] text-sm h-10'
                                disabled={isTyping}
                            />
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim() || isTyping}
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
