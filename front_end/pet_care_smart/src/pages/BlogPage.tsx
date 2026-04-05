import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Clock, ArrowRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const POSTS = [
    {
        id: '1',
        title: 'Cách chăm sóc chó Golden Retriever đúng cách',
        excerpt: 'Golden Retriever là giống chó thân thiện, năng động. Tìm hiểu chế độ ăn, lịch tiêm phòng và cách tắm rửa phù hợp để bé luôn khỏe mạnh.',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=400&fit=crop',
        category: 'Chăm sóc chó',
        date: '10/04/2026',
        readTime: '5 phút',
        featured: true,
    },
    {
        id: '2',
        title: 'Thức ăn nào tốt nhất cho mèo con dưới 6 tháng tuổi?',
        excerpt: 'Dinh dưỡng đúng trong giai đoạn đầu đời quyết định sức khỏe lâu dài của mèo. Bài viết tổng hợp các loại thức ăn phù hợp và lịch cho ăn khoa học.',
        image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&h=400&fit=crop',
        category: 'Dinh dưỡng',
        date: '05/04/2026',
        readTime: '4 phút',
        featured: false,
    },
    {
        id: '3',
        title: 'Dấu hiệu nhận biết chó bị bệnh cần đưa đi khám ngay',
        excerpt: 'Nhiều bệnh ở chó nếu phát hiện sớm sẽ điều trị dễ dàng hơn. Hãy chú ý những dấu hiệu bất thường này để bảo vệ sức khỏe thú cưng kịp thời.',
        image: 'https://images.unsplash.com/photo-1625321171045-1fea4ac688e9?w=600&h=400&fit=crop',
        category: 'Sức khỏe',
        date: '01/04/2026',
        readTime: '6 phút',
        featured: false,
    },
    {
        id: '4',
        title: 'Lịch tiêm phòng cho chó và mèo — Bảng tổng hợp đầy đủ',
        excerpt: 'Tiêm phòng đúng lịch giúp bảo vệ thú cưng khỏi các bệnh nguy hiểm. Xem bảng lịch tiêm phòng theo từng độ tuổi cho chó và mèo.',
        image: 'https://images.unsplash.com/photo-1511024654425-72f2d89820be?w=600&h=400&fit=crop',
        category: 'Tiêm phòng',
        date: '28/03/2026',
        readTime: '3 phút',
        featured: false,
    },
    {
        id: '5',
        title: 'Cách tắm cho chó tại nhà — Hướng dẫn từng bước',
        excerpt: 'Tắm cho chó không khó nếu bạn biết đúng cách. Bài viết hướng dẫn chi tiết từ chuẩn bị dụng cụ đến kỹ thuật tắm an toàn cho bé.',
        image: 'https://images.unsplash.com/photo-1600277971170-8a7d75fb1bd9?w=600&h=400&fit=crop',
        category: 'Chăm sóc chó',
        date: '20/03/2026',
        readTime: '7 phút',
        featured: false,
    },
    {
        id: '6',
        title: 'Mèo có cần tắm không? Tần suất và cách tắm đúng',
        excerpt: 'Mèo tự vệ sinh nhưng đôi khi vẫn cần tắm. Tìm hiểu khi nào nên tắm cho mèo và cách thực hiện để bé không bị stress.',
        image: 'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?w=600&h=400&fit=crop',
        category: 'Chăm sóc mèo',
        date: '15/03/2026',
        readTime: '4 phút',
        featured: false,
    },
];

const CATEGORIES = ['Tất cả', 'Chăm sóc chó', 'Chăm sóc mèo', 'Dinh dưỡng', 'Sức khỏe', 'Tiêm phòng'];

const categoryColor: Record<string, string> = {
    'Chăm sóc chó': 'bg-blue-100 text-blue-700',
    'Chăm sóc mèo': 'bg-purple-100 text-purple-700',
    'Dinh dưỡng': 'bg-orange-100 text-orange-700',
    'Sức khỏe': 'bg-green-100 text-green-700',
    'Tiêm phòng': 'bg-red-100 text-red-700',
};

const BlogPage = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('Tất cả');

    const filtered = POSTS.filter(p => {
        const matchCat = activeCategory === 'Tất cả' || p.category === activeCategory;
        const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const featured = POSTS.find(p => p.featured);

    return (
        <div className='min-h-screen bg-background'>
            {/* Hero */}
            <div className='bg-[#448B3D] py-12 sm:py-16 px-4'>
                <div className='max-w-4xl mx-auto text-center'>
                    <h1 className='text-3xl sm:text-4xl font-bold text-white mb-3'>📰 Tin tức & Kiến thức</h1>
                    <p className='text-white/85 text-base sm:text-lg mb-6'>Chia sẻ kinh nghiệm chăm sóc vật nuôi từ các chuyên gia</p>
                    <div className='relative max-w-md mx-auto'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder='Tìm bài viết...'
                            className='pl-9 rounded-xl h-11 bg-white'
                        />
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
                {/* Category filter */}
                <div className='flex flex-wrap gap-2 mb-8'>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat
                                    ? 'bg-[#448B3D] text-white shadow-md'
                                    : 'bg-muted text-muted-foreground hover:bg-[#448B3D]/10 hover:text-[#448B3D]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Featured post */}
                {featured && activeCategory === 'Tất cả' && !search && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mb-10'
                    >
                        <Card
                            className='overflow-hidden rounded-2xl border-2 border-[#448B3D]/20 hover:border-[#448B3D] hover:shadow-xl transition-all duration-300 cursor-pointer group'
                            onClick={() => navigate(`/blog/${featured.id}`)}
                        >
                            <div className='grid md:grid-cols-2'>
                                <div className='relative overflow-hidden'>
                                    <img
                                        src={featured.image}
                                        alt={featured.title}
                                        className='w-full h-56 md:h-full object-cover group-hover:scale-105 transition-transform duration-500'
                                    />
                                    <Badge className='absolute top-3 left-3 bg-[#448B3D] text-white border-0'>⭐ Nổi bật</Badge>
                                </div>
                                <div className='p-6 sm:p-8 flex flex-col justify-center'>
                                    <Badge className={`w-fit mb-3 ${categoryColor[featured.category] ?? 'bg-gray-100 text-gray-700'}`}>
                                        <Tag className='w-3 h-3 mr-1' />{featured.category}
                                    </Badge>
                                    <h2 className='text-xl sm:text-2xl font-bold text-foreground mb-3 group-hover:text-[#448B3D] transition-colors'>
                                        {featured.title}
                                    </h2>
                                    <p className='text-muted-foreground text-sm sm:text-base leading-relaxed mb-4'>{featured.excerpt}</p>
                                    <div className='flex items-center gap-4 text-xs text-muted-foreground mb-4'>
                                        <span className='flex items-center gap-1'><Calendar className='w-3.5 h-3.5' />{featured.date}</span>
                                        <span className='flex items-center gap-1'><Clock className='w-3.5 h-3.5' />{featured.readTime} đọc</span>
                                    </div>
                                    <Button className='w-fit rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'>
                                        Đọc bài viết <ArrowRight className='w-4 h-4 ml-1' />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Posts grid */}
                {filtered.length === 0 ? (
                    <div className='text-center py-16'>
                        <p className='text-5xl mb-4'>🔍</p>
                        <p className='text-foreground font-semibold text-lg'>Không tìm thấy bài viết</p>
                    </div>
                ) : (
                    <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {filtered.filter(p => !(p.featured && activeCategory === 'Tất cả' && !search)).map((post, i) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                            >
                                <Card
                                    className='overflow-hidden rounded-2xl border-2 border-border hover:border-[#448B3D] hover:shadow-lg transition-all duration-300 cursor-pointer group h-full flex flex-col'
                                    onClick={() => navigate(`/blog/${post.id}`)}
                                >
                                    <div className='relative overflow-hidden'>
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className='w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500'
                                        />
                                        <Badge className={`absolute top-3 left-3 text-xs ${categoryColor[post.category] ?? 'bg-gray-100 text-gray-700'}`}>
                                            {post.category}
                                        </Badge>
                                    </div>
                                    <div className='p-4 flex flex-col flex-1'>
                                        <h3 className='font-bold text-base text-foreground mb-2 group-hover:text-[#448B3D] transition-colors leading-snug line-clamp-2'>
                                            {post.title}
                                        </h3>
                                        <p className='text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-3'>{post.excerpt}</p>
                                        <div className='flex items-center justify-between text-xs text-muted-foreground mt-auto'>
                                            <span className='flex items-center gap-1'><Calendar className='w-3 h-3' />{post.date}</span>
                                            <span className='flex items-center gap-1'><Clock className='w-3 h-3' />{post.readTime} đọc</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
