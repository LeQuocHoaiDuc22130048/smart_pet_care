import { useState } from "react";
import { Bot, X, Send, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! 👋 I'm your AI pet care assistant. How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const botResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateBotResponse(input),
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages((prev) => [...prev, botResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const generateBotResponse = (userInput: string): string => {
        const lower = userInput.toLowerCase();

        if (lower.includes('product') || lower.includes('buy')) {
            return "I can help you find the perfect products for your pet! Our AI-powered recommendation system can suggest items based on your pet's breed, age, and needs. Would you like personalized recommendations?";
        }
        if (
            lower.includes('booking') ||
            lower.includes('appointment') ||
            lower.includes('service')
        ) {
            return 'We offer various services including Pet Spa, Health Checkups, and Vaccinations. You can book an appointment through our Booking page. Would you like me to show you available time slots?';
        }
        if (
            lower.includes('image') ||
            lower.includes('search') ||
            lower.includes('photo')
        ) {
            return "Our AI Image Search feature allows you to upload a photo of a product, and we'll find similar items in our catalog! Try our Image Search page to get started.";
        }
        if (lower.includes('recommendation') || lower.includes('suggest')) {
            return "Based on your pet's profile, I can recommend products, food, toys, and accessories. Tell me about your pet - what type, breed, and age?";
        }

        return "I'm here to help with product recommendations, service bookings, order tracking, and any questions about pet care. What would you like to know?";
    };

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className='fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl bg-gradient-to-br from-[#5B9FD8] to-[#3D7BA8] hover:from-[#3D7BA8] hover:to-[#5B9FD8] z-50 transition-all duration-300 transform hover:scale-110'
            >
                <Bot className='w-6 h-6 text-white' />
            </Button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-border transition-all duration-300 ${
                isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
            }`}
        >
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-[#5B9FD8] to-[#3D7BA8] rounded-t-2xl'>
                <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center'>
                        <Bot className='w-6 h-6 text-white' />
                    </div>
                    {!isMinimized && (
                        <div>
                            <h3 className='font-semibold text-white'>
                                AI Assistant
                            </h3>
                            <p className='text-xs text-white/80'>
                                Always here to help
                            </p>
                        </div>
                    )}
                </div>
                <div className='flex items-center space-x-1'>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setIsMinimized(!isMinimized)}
                        className='text-white hover:bg-white/20 rounded-lg'
                    >
                        {isMinimized ? (
                            <Maximize2 className='w-4 h-4' />
                        ) : (
                            <Minimize2 className='w-4 h-4' />
                        )}
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setIsOpen(false)}
                        className='text-white hover:bg-white/20 rounded-lg'
                    >
                        <X className='w-4 h-4' />
                    </Button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <ScrollArea className='h-[calc(100%-128px)] p-4'>
                        <div className='space-y-4'>
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                            message.sender === 'user'
                                                ? 'bg-[#5B9FD8] text-white rounded-br-sm'
                                                : 'bg-gray-100 text-foreground rounded-bl-sm'
                                        }`}
                                    >
                                        <p className='text-sm'>
                                            {message.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className='flex justify-start'>
                                    <div className='bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2'>
                                        <div className='flex space-x-2'>
                                            <div
                                                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                                style={{
                                                    animationDelay: '0ms'
                                                }}
                                            ></div>
                                            <div
                                                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                                style={{
                                                    animationDelay: '150ms'
                                                }}
                                            ></div>
                                            <div
                                                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                                                style={{
                                                    animationDelay: '300ms'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className='p-4 border-t border-border'>
                        <div className='flex space-x-2'>
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSend()
                                }
                                placeholder='Type your message...'
                                className='flex-1 rounded-xl border-border focus:border-[#5B9FD8]'
                            />
                            <Button
                                onClick={handleSend}
                                className='rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8]'
                            >
                                <Send className='w-4 h-4' />
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AIChatBot;
