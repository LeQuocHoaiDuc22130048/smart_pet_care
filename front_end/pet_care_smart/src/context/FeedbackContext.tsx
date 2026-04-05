import { createContext, useContext, useState, type ReactNode } from 'react';

export type FeedbackType = 'general' | 'product' | 'service';

export interface Feedback {
    id: string;
    type: FeedbackType;
    rating: number;           // 1-5
    title: string;
    content: string;
    authorName: string;
    authorAvatar?: string;
    date: string;
    // product-specific
    productId?: string;
    productName?: string;
    // service-specific
    serviceId?: string;
    serviceName?: string;
    // extra
    helpful: number;          // số lượt "hữu ích"
    verified: boolean;
}

interface FeedbackContextType {
    feedbacks: Feedback[];
    addFeedback: (fb: Omit<Feedback, 'id' | 'date' | 'helpful'>) => void;
    markHelpful: (id: string) => void;
    getByProduct: (productId: string) => Feedback[];
    getByService: (serviceId: string) => Feedback[];
    getGeneral: () => Feedback[];
    avgRating: (items: Feedback[]) => number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK: Feedback[] = [
    // General
    {
        id: 'g1', type: 'general', rating: 5,
        title: 'Dịch vụ tuyệt vời, giao hàng nhanh!',
        content: 'Tôi đặt hàng lúc sáng, chiều đã nhận được. Sản phẩm đóng gói cẩn thận, chất lượng đúng như mô tả. Sẽ tiếp tục ủng hộ PetCare!',
        authorName: 'Bác Nguyễn Văn Hùng', date: '10/04/2026', helpful: 12, verified: true,
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hung',
    },
    {
        id: 'g2', type: 'general', rating: 4,
        title: 'Giá cả hợp lý, nhân viên tư vấn nhiệt tình',
        content: 'Gọi điện hỏi về thức ăn cho chó, nhân viên tư vấn rất tận tình và hiểu biết. Giá cả phải chăng so với các nơi khác.',
        authorName: 'Chị Trần Thị Mai', date: '08/04/2026', helpful: 8, verified: true,
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mai',
    },
    {
        id: 'g3', type: 'general', rating: 5,
        title: 'Ứng dụng dễ dùng, đặt hàng tiện lợi',
        content: 'Tìm kiếm bằng ảnh rất hay, tôi chụp ảnh túi thức ăn cũ là tìm được ngay sản phẩm tương tự. Rất tiện cho người không biết tên sản phẩm.',
        authorName: 'Anh Lê Minh Tuấn', date: '05/04/2026', helpful: 15, verified: false,
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tuan',
    },
    // Product
    {
        id: 'p1', type: 'product', rating: 5, productId: '1', productName: 'Thức ăn chó hữu cơ cao cấp',
        title: 'Chó nhà tôi rất thích!',
        content: 'Mua về cho chú Golden ăn thử, bé ăn hết sạch không bỏ thừa. Lông bóng mượt hơn sau 2 tuần dùng. Sẽ mua lại.',
        authorName: 'Chị Phạm Lan', date: '09/04/2026', helpful: 6, verified: true,
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lan',
    },
    {
        id: 'p2', type: 'product', rating: 4, productId: '1', productName: 'Thức ăn chó hữu cơ cao cấp',
        title: 'Chất lượng tốt, giá hơi cao',
        content: 'Thành phần tốt, chó ăn ngon. Chỉ tiếc giá hơi cao so với các loại thông thường nhưng bù lại chất lượng xứng đáng.',
        authorName: 'Anh Hoàng Nam', date: '07/04/2026', helpful: 3, verified: true,
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nam',
    },
    {
        id: 'p3', type: 'product', rating: 5, productId: '4', productName: 'Giường thú cưng chỉnh hình',
        title: 'Chú chó già nhà tôi ngủ ngon hơn nhiều',
        content: 'Chó nhà tôi 10 tuổi, bị đau khớp. Từ khi dùng giường này bé ngủ sâu hơn, ít kêu đau hơn. Rất hài lòng!',
        authorName: 'Bà Nguyễn Thị Hoa', date: '03/04/2026', helpful: 9, verified: true,
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hoa',
    },
    // Service
    {
        id: 's1', type: 'service', rating: 5, serviceId: 'spa', serviceName: 'Tắm & Cắt lông',
        title: 'Bác sĩ đến đúng giờ, tay nghề cao',
        content: 'Đặt lịch tắm cho bé Poodle, nhân viên đến đúng giờ, nhẹ nhàng với bé. Sau khi tắm bé thơm tho, lông xù đẹp. Sẽ đặt lại tháng sau.',
        authorName: 'Chị Vũ Thị Hằng', date: '11/04/2026', helpful: 7, verified: true,
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hang',
    },
    {
        id: 's2', type: 'service', rating: 5, serviceId: 'health', serviceName: 'Khám sức khỏe',
        title: 'Bác sĩ tận tâm, giải thích rõ ràng',
        content: 'Bác sĩ khám rất kỹ, giải thích từng vấn đề sức khỏe của bé mèo. Kê đơn thuốc hợp lý, giá cả minh bạch. Rất tin tưởng.',
        authorName: 'Anh Đỗ Văn Minh', date: '06/04/2026', helpful: 11, verified: true,
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh',
    },
];

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>(MOCK);

    const addFeedback = (fb: Omit<Feedback, 'id' | 'date' | 'helpful'>) => {
        const newFb: Feedback = {
            ...fb,
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('vi-VN'),
            helpful: 0,
        };
        setFeedbacks(prev => [newFb, ...prev]);
    };

    const markHelpful = (id: string) => {
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, helpful: f.helpful + 1 } : f));
    };

    const getByProduct = (productId: string) =>
        feedbacks.filter(f => f.type === 'product' && f.productId === productId);

    const getByService = (serviceId: string) =>
        feedbacks.filter(f => f.type === 'service' && f.serviceId === serviceId);

    const getGeneral = () => feedbacks.filter(f => f.type === 'general');

    const avgRating = (items: Feedback[]) =>
        items.length === 0 ? 0 : Math.round((items.reduce((s, f) => s + f.rating, 0) / items.length) * 10) / 10;

    return (
        <FeedbackContext.Provider value={{ feedbacks, addFeedback, markHelpful, getByProduct, getByService, getGeneral, avgRating }}>
            {children}
        </FeedbackContext.Provider>
    );
}

export function useFeedback() {
    const ctx = useContext(FeedbackContext);
    if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider');
    return ctx;
}
