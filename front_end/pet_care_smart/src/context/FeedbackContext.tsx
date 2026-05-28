import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { feedbackApi, type Feedback as ApiFeedback, type FeedbackStats, type CreateFeedbackRequest } from '@/lib/feedbackApi';
import { toast } from 'sonner';

export type FeedbackType = 'general' | 'product' | 'service';

// Adapter interface for UI compatibility
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
    // API fields
    imageUrls?: string[];
    status?: string;
    adminResponse?: string;
}

// Convert API feedback to UI feedback
function adaptApiFeedback(apiFeedback: ApiFeedback): Feedback {
    return {
        id: apiFeedback.id,
        type: apiFeedback.type === 'PRODUCT' ? 'product' : apiFeedback.type === 'ORDER' ? 'service' : 'general',
        rating: apiFeedback.rating,
        title: '', // API không có title, có thể dùng comment đầu
        content: apiFeedback.comment,
        authorName: apiFeedback.username,
        authorAvatar: undefined,
        date: new Date(apiFeedback.createdAt).toLocaleDateString('vi-VN'),
        productId: apiFeedback.productId,
        productName: undefined,
        serviceId: apiFeedback.orderId,
        serviceName: undefined,
        helpful: apiFeedback.helpfulCount,
        verified: apiFeedback.verifiedPurchase,
        imageUrls: apiFeedback.imageUrls,
        status: apiFeedback.status,
        adminResponse: apiFeedback.adminResponse,
    };
}

interface FeedbackContextType {
    feedbacks: Feedback[];
    loading: boolean;
    addFeedback: (fb: Omit<Feedback, 'id' | 'date' | 'helpful'>, images?: File[]) => Promise<void>;
    markHelpful: (id: string) => void;
    getByProduct: (productId: string) => Promise<Feedback[]>;
    getByService: (serviceId: string) => Feedback[];
    getGeneral: () => Feedback[];
    avgRating: (items: Feedback[]) => number;
    getProductStats: (productId: string) => Promise<FeedbackStats | null>;
    loadProductFeedbacks: (productId: string) => Promise<void>;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(false);

    // Add feedback with API integration
    const addFeedback = async (fb: Omit<Feedback, 'id' | 'date' | 'helpful'>, images?: File[]) => {
        try {
            setLoading(true);

            // Validate that we have the required reference ID based on type
            if (fb.type === 'product' && !fb.productId) {
                toast.error('Thiếu thông tin sản phẩm để đánh giá');
                throw new Error('Product ID is required for product feedback');
            }
            if (fb.type === 'service' && !fb.serviceId) {
                toast.error('Thiếu thông tin dịch vụ để đánh giá');
                throw new Error('Service ID is required for service feedback');
            }
            if (fb.type === 'general') {
                toast.error('Loại đánh giá "general" không được hỗ trợ. Vui lòng chọn sản phẩm hoặc dịch vụ cụ thể.');
                throw new Error('General feedback type is not supported by the backend');
            }

            // Prepare API request
            const request: CreateFeedbackRequest = {
                type: fb.type === 'product' ? 'PRODUCT' : 'ORDER',
                rating: fb.rating,
                comment: fb.content,
            };

            if (fb.type === 'product' && fb.productId) {
                request.productId = fb.productId;
            }
            if (fb.type === 'service' && fb.serviceId) {
                request.orderId = fb.serviceId;
            }

            // Call API
            const response = await feedbackApi.create(request, images);

            // Add to local state
            const newFb = adaptApiFeedback(response.result);
            setFeedbacks(prev => [newFb, ...prev]);

            toast.success('Đánh giá của bạn đã được gửi thành công!');
        } catch (error) {
            console.error('Error adding feedback:', error);
            if (error instanceof Error && error.message.includes('not supported')) {
                // Already showed toast above
            } else {
                toast.error('Không thể gửi đánh giá. Vui lòng thử lại!');
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const markHelpful = (id: string) => {
        setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, helpful: f.helpful + 1 } : f));
    };

    // Load product feedbacks from API
    const loadProductFeedbacks = useCallback(async (productId: string) => {
        try {
            setLoading(true);
            const response = await feedbackApi.getProductFeedbacks(productId, 0, 50, false);
            const apiFeedbacks = response.result.content.map(adaptApiFeedback);

            // Replace feedbacks (only show API data, no merge)
            setFeedbacks(apiFeedbacks);
        } catch (error) {
            console.error('Error loading product feedbacks:', error);
            toast.error('Không thể tải đánh giá');
            setFeedbacks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const getByProduct = async (productId: string): Promise<Feedback[]> => {
        try {
            const response = await feedbackApi.getProductFeedbacks(productId, 0, 50, false);
            return response.result.content.map(adaptApiFeedback);
        } catch (error) {
            console.error('Error getting product feedbacks:', error);
            toast.error('Không thể tải đánh giá');
            return [];
        }
    };

    const getByService = (serviceId: string) =>
        feedbacks.filter(f => f.type === 'service' && f.serviceId === serviceId);

    const getGeneral = () => feedbacks.filter(f => f.type === 'general');

    const avgRating = (items: Feedback[]) =>
        items.length === 0 ? 0 : Math.round((items.reduce((s, f) => s + f.rating, 0) / items.length) * 10) / 10;

    const getProductStats = async (productId: string): Promise<FeedbackStats | null> => {
        try {
            const response = await feedbackApi.getProductStats(productId, false);
            return response.result;
        } catch (error) {
            console.error('Error getting product stats:', error);
            return null;
        }
    };

    return (
        <FeedbackContext.Provider value={{
            feedbacks,
            loading,
            addFeedback,
            markHelpful,
            getByProduct,
            getByService,
            getGeneral,
            avgRating,
            getProductStats,
            loadProductFeedbacks,
        }}>
            {children}
        </FeedbackContext.Provider>
    );
}

export function useFeedback() {
    const ctx = useContext(FeedbackContext);
    if (!ctx) throw new Error('useFeedback must be used within FeedbackProvider');
    return ctx;
}
