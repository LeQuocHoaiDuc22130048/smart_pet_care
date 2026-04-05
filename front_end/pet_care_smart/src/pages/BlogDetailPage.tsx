import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

const POSTS: Record<string, {
    title: string; category: string; date: string; readTime: string;
    image: string; content: string[];
}> = {
    '1': {
        title: 'Cách chăm sóc chó Golden Retriever đúng cách',
        category: 'Chăm sóc chó', date: '10/04/2026', readTime: '5 phút',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&h=500&fit=crop',
        content: [
            'Golden Retriever là một trong những giống chó được yêu thích nhất tại Việt Nam nhờ tính cách thân thiện, thông minh và trung thành. Tuy nhiên, để nuôi một chú Golden khỏe mạnh và hạnh phúc, bạn cần nắm rõ các yêu cầu chăm sóc đặc thù của giống chó này.',
            '## Chế độ ăn uống',
            'Golden Retriever trưởng thành cần khoảng 2-3 bữa ăn mỗi ngày với thức ăn chất lượng cao. Nên chọn thức ăn có hàm lượng protein từ 25-30%, chất béo 12-16%. Tránh cho ăn quá nhiều vì Golden dễ bị béo phì, dẫn đến các vấn đề về khớp.',
            '## Vận động và tập thể dục',
            'Golden cần ít nhất 1-2 giờ vận động mỗi ngày. Đi bộ, chạy bộ, bơi lội hoặc chơi ném bóng đều rất phù hợp. Thiếu vận động có thể khiến bé trở nên phá phách và lo lắng.',
            '## Chải lông và vệ sinh',
            'Lông Golden dày và dài cần được chải ít nhất 3-4 lần/tuần để tránh rối và rụng lông nhiều. Tắm 1-2 lần/tháng là đủ. Kiểm tra và vệ sinh tai hàng tuần để phòng ngừa viêm tai.',
            '## Lịch tiêm phòng',
            'Tiêm phòng đầy đủ theo lịch của bác sĩ thú y là bắt buộc. Các vaccine cần thiết bao gồm: Dại, Carre, Parvo, Viêm gan truyền nhiễm. Tẩy giun định kỳ 3 tháng/lần.',
        ],
    },
    '2': {
        title: 'Thức ăn nào tốt nhất cho mèo con dưới 6 tháng tuổi?',
        category: 'Dinh dưỡng', date: '05/04/2026', readTime: '4 phút',
        image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=900&h=500&fit=crop',
        content: [
            'Giai đoạn từ 0-6 tháng tuổi là thời kỳ phát triển quan trọng nhất của mèo con. Dinh dưỡng đúng trong giai đoạn này sẽ quyết định sức khỏe và sự phát triển của bé trong suốt cuộc đời.',
            '## Từ 0-4 tuần tuổi',
            'Mèo con cần bú sữa mẹ hoàn toàn. Sữa mẹ cung cấp kháng thể tự nhiên giúp bảo vệ bé khỏi bệnh tật. Nếu mèo mẹ không có sữa, dùng sữa thay thế chuyên dụng cho mèo con (không dùng sữa bò).',
            '## Từ 4-8 tuần tuổi',
            'Bắt đầu tập cho bé ăn thức ăn mềm. Trộn thức ăn ướt với sữa thay thế để tạo hỗn hợp sệt. Cho ăn 4-6 lần/ngày với lượng nhỏ.',
            '## Từ 2-6 tháng tuổi',
            'Chuyển dần sang thức ăn khô dành riêng cho mèo con (kitten food). Thức ăn kitten có hàm lượng protein và calo cao hơn thức ăn cho mèo trưởng thành. Cho ăn 3-4 lần/ngày.',
        ],
    },
};

const categoryColor: Record<string, string> = {
    'Chăm sóc chó': 'bg-blue-100 text-blue-700',
    'Chăm sóc mèo': 'bg-purple-100 text-purple-700',
    'Dinh dưỡng': 'bg-orange-100 text-orange-700',
    'Sức khỏe': 'bg-green-100 text-green-700',
    'Tiêm phòng': 'bg-red-100 text-red-700',
};

const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const post = POSTS[id ?? '1'] ?? POSTS['1'];

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Đã sao chép link bài viết!');
    };

    return (
        <div className='min-h-screen bg-background'>
            <div className='max-w-3xl mx-auto px-4 sm:px-6 py-8'>
                <Button variant='ghost' onClick={() => navigate('/blog')} className='mb-6 rounded-xl'>
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Quay lại tin tức
                </Button>

                {/* Header */}
                <Badge className={`mb-4 ${categoryColor[post.category] ?? 'bg-gray-100 text-gray-700'}`}>
                    <Tag className='w-3 h-3 mr-1' />{post.category}
                </Badge>
                <h1 className='text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight'>{post.title}</h1>
                <div className='flex items-center gap-4 text-sm text-muted-foreground mb-6'>
                    <span className='flex items-center gap-1.5'><Calendar className='w-4 h-4' />{post.date}</span>
                    <span className='flex items-center gap-1.5'><Clock className='w-4 h-4' />{post.readTime} đọc</span>
                    <button onClick={handleShare} className='flex items-center gap-1.5 hover:text-[#448B3D] transition-colors ml-auto'>
                        <Share2 className='w-4 h-4' /> Chia sẻ
                    </button>
                </div>

                {/* Cover image */}
                <img src={post.image} alt={post.title} className='w-full h-52 sm:h-72 object-cover rounded-2xl mb-8' />

                {/* Content */}
                <div className='prose prose-lg max-w-none'>
                    {post.content.map((block, i) => {
                        if (block.startsWith('## ')) {
                            return (
                                <h2 key={i} className='text-xl font-bold text-foreground mt-8 mb-3 flex items-center gap-2'>
                                    <span className='w-1 h-6 bg-[#448B3D] rounded-full inline-block' />
                                    {block.replace('## ', '')}
                                </h2>
                            );
                        }
                        return (
                            <p key={i} className='text-foreground leading-relaxed mb-4 text-base sm:text-lg'>
                                {block}
                            </p>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className='mt-10 p-6 bg-[#448B3D]/8 border border-[#448B3D]/20 rounded-2xl text-center'>
                    <p className='font-semibold text-foreground mb-3'>Cần tư vấn thêm về chăm sóc thú cưng?</p>
                    <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                        <Button onClick={() => navigate('/booking')} className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'>
                            📅 Đặt lịch khám
                        </Button>
                        <a href='tel:+84702500551'>
                            <Button variant='outline' className='rounded-xl w-full sm:w-auto'>
                                📞 Gọi tư vấn miễn phí
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetailPage;
