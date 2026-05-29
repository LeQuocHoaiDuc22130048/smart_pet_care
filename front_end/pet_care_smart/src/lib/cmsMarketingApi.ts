import { apiRequest } from './api';

const CMS_BASE = '/pet_care_cms_marketing';

export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type DiscountType = 'FIXED' | 'PERCENT';

export interface Banner {
    id: string;
    title: string;
    subtitle?: string;
    imageUrl: string;
    linkUrl?: string;
    position: string;
    sortOrder: number;
    status: ContentStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    summary?: string;
    content: string;
    thumbnailUrl?: string;
    category?: string;
    authorId?: string;
    status: ContentStatus;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface MarketingCampaign {
    id: string;
    name: string;
    description?: string;
    couponCode?: string;
    discountType?: DiscountType;
    discountValue?: number;
    minOrderValue?: number;
    maxDiscount?: number;
    usageLimit?: number;
    startAt?: string;
    endAt?: string;
    status: ContentStatus;
    createdAt?: string;
    updatedAt?: string;
}

export type BannerPayload = Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>;
export type BlogPostPayload = Omit<BlogPost, 'id' | 'publishedAt' | 'createdAt' | 'updatedAt'>;
export type MarketingCampaignPayload = Omit<MarketingCampaign, 'id' | 'createdAt' | 'updatedAt'>;

export const cmsMarketingApi = {
    getPublicBanners: (position?: string) => {
        const query = position ? `?position=${encodeURIComponent(position)}` : '';
        return apiRequest<Banner[]>(`${CMS_BASE}/public/banners${query}`);
    },
    getPublicPosts: () => apiRequest<BlogPost[]>(`${CMS_BASE}/public/posts`),
    getPublicPost: (slug: string) => apiRequest<BlogPost>(`${CMS_BASE}/public/posts/${slug}`),
    getActiveCampaigns: () => apiRequest<MarketingCampaign[]>(`${CMS_BASE}/public/campaigns/active`),

    getBanners: () => apiRequest<Banner[]>(`${CMS_BASE}/admin/banners`, { requireAuth: true }),
    createBanner: (body: BannerPayload) => apiRequest<Banner>(`${CMS_BASE}/admin/banners`, {
        method: 'POST',
        body,
        requireAuth: true,
    }),
    updateBanner: (id: string, body: BannerPayload) => apiRequest<Banner>(`${CMS_BASE}/admin/banners/${id}`, {
        method: 'PUT',
        body,
        requireAuth: true,
    }),
    updateBannerStatus: (id: string, status: ContentStatus) => apiRequest<Banner>(`${CMS_BASE}/admin/banners/${id}/status`, {
        method: 'PATCH',
        body: { status },
        requireAuth: true,
    }),
    deleteBanner: (id: string) => apiRequest<void>(`${CMS_BASE}/admin/banners/${id}`, {
        method: 'DELETE',
        requireAuth: true,
    }),

    getPosts: () => apiRequest<BlogPost[]>(`${CMS_BASE}/admin/posts`, { requireAuth: true }),
    createPost: (body: BlogPostPayload) => apiRequest<BlogPost>(`${CMS_BASE}/admin/posts`, {
        method: 'POST',
        body,
        requireAuth: true,
    }),
    updatePost: (id: string, body: BlogPostPayload) => apiRequest<BlogPost>(`${CMS_BASE}/admin/posts/${id}`, {
        method: 'PUT',
        body,
        requireAuth: true,
    }),
    updatePostStatus: (id: string, status: ContentStatus) => apiRequest<BlogPost>(`${CMS_BASE}/admin/posts/${id}/status`, {
        method: 'PATCH',
        body: { status },
        requireAuth: true,
    }),
    deletePost: (id: string) => apiRequest<void>(`${CMS_BASE}/admin/posts/${id}`, {
        method: 'DELETE',
        requireAuth: true,
    }),

    getCampaigns: () => apiRequest<MarketingCampaign[]>(`${CMS_BASE}/admin/campaigns`, { requireAuth: true }),
    createCampaign: (body: MarketingCampaignPayload) => apiRequest<MarketingCampaign>(`${CMS_BASE}/admin/campaigns`, {
        method: 'POST',
        body,
        requireAuth: true,
    }),
    updateCampaign: (id: string, body: MarketingCampaignPayload) => apiRequest<MarketingCampaign>(`${CMS_BASE}/admin/campaigns/${id}`, {
        method: 'PUT',
        body,
        requireAuth: true,
    }),
    updateCampaignStatus: (id: string, status: ContentStatus) => apiRequest<MarketingCampaign>(`${CMS_BASE}/admin/campaigns/${id}/status`, {
        method: 'PATCH',
        body: { status },
        requireAuth: true,
    }),
    deleteCampaign: (id: string) => apiRequest<void>(`${CMS_BASE}/admin/campaigns/${id}`, {
        method: 'DELETE',
        requireAuth: true,
    }),
};
