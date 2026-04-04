import { useState, useRef, useEffect, memo } from 'react';
import { MessageCircle, X, Send, Bot, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotResponses } from '../data/mockData';

const QUICK_REPLIES = ['Thức ăn cho chó', 'Lịch tiêm phòng', 'Dịch vụ grooming', 'Giá cả'];

function getBotReply(msg) {
  const lower = msg.toLowerCase();
  for (const key of Object.keys(chatbotResponses)) {
    if (key !== 'default' && lower.includes(key)) return chatbotResponses[key];
  }
  return chatbotResponses['default'];
}

function formatTime(date) {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-neutral-100 dark:bg-neutral-700 px-4 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1 items-center" aria-label="Bot is typing">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-2 h-2 bg-neutral-400 rounded-full"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Xin chào! Tôi là PetBot 🐾 Tôi có thể giúp gì cho bạn hôm nay?', time: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, typing, open, minimized]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    const now = new Date();
    setMessages(m => [...m, { from: 'user', text: msg, time: now }]);
    setInput('');
    setTyping(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    setTyping(false);
    setMessages(m => [...m, { from: 'bot', text: getBotReply(msg), time: new Date() }]);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      {/* Floating button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setOpen(!open); setMinimized(false); }}
        className="fixed bottom-6 right-6 z-50 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors"
        style={{ backgroundColor: 'rgb(68,139,61)' }}
        aria-label={open ? 'Close chat' : 'Open chat with PetBot'}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={open ? 'x' : 'chat'}
            initial={{ rotate: -90, scale: 0 }} animate={{ rotate: 0, scale: 1 }} exit={{ rotate: 90, scale: 0 }}
            transition={{ duration: 0.2 }}>
            {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
          </motion.div>
        </AnimatePresence>
        {/* Unread dot */}
        {!open && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" aria-hidden="true" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 card overflow-hidden flex flex-col"
            style={{ height: minimized ? 'auto' : '480px' }}
            role="dialog"
            aria-label="PetBot chat window"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-green-700 to-green-600 px-4 py-3 flex items-center gap-3 shrink-0"
              style={{ background: 'linear-gradient(to right, rgb(52,110,46), rgb(68,139,61))' }}>
              <div className="bg-white/20 rounded-full p-1.5">
                <Bot className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">PetBot AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" aria-hidden="true" />
                  <p className="text-orange-100 text-xs">Luôn sẵn sàng hỗ trợ</p>
                </div>
              </div>
              <button onClick={() => setMinimized(!minimized)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
                aria-label={minimized ? 'Expand chat' : 'Minimize chat'}>
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50 dark:bg-neutral-900/50" role="log" aria-live="polite">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex flex-col gap-1 ${m.from === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        m.from === 'user'
                          ? 'text-white rounded-br-sm'
                          : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-bl-sm shadow-sm border border-neutral-100 dark:border-neutral-700'
                      }`}
                      style={m.from === 'user' ? { backgroundColor: 'rgb(68,139,61)' } : {}}>
                        {m.text}
                      </div>
                      <span className="text-[10px] text-neutral-400 px-1">{formatTime(m.time)}</span>
                    </div>
                  ))}
                  {typing && <TypingIndicator />}
                  <div ref={bottomRef} />
                </div>

                {/* Quick replies */}
                {messages.length <= 2 && (
                  <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-neutral-100 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                    {QUICK_REPLIES.map(r => (
                      <button key={r} onClick={() => send(r)}
                        className="text-xs px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors"
                        style={{ color: 'rgb(68,139,61)' }}>
                        {r}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-neutral-100 dark:border-neutral-700 flex gap-2 bg-white dark:bg-neutral-800 shrink-0">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 text-sm bg-neutral-100 dark:bg-neutral-700 dark:text-white rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-700"
                    aria-label="Type a message"
                    disabled={typing}
                  />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => send()}
                    disabled={!input.trim() || typing}
                    className="disabled:opacity-40 text-white p-2.5 rounded-full transition-colors"
                    style={{ backgroundColor: 'rgb(68,139,61)' }}
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
