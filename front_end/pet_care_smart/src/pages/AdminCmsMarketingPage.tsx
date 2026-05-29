import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Archive,
    CalendarClock,
    Eye,
    FileText,
    Image,
    Loader2,
    Megaphone,
    Pencil,
    Plus,
    RefreshCw,
    Save,
    Search,
    Trash2,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    cmsMarketingApi,
    type Banner,
    type BannerPayload,
    type BlogPost,
    type BlogPostPayload,
    type ContentStatus,
    type DiscountType,
    type MarketingCampaign,
    type MarketingCampaignPayload
} from '@/lib/cmsMarketingApi';
import { cn } from '@/lib/utils';

type CmsTab = 'banners' | 'posts' | 'campaigns';

type BannerForm = {
    title: string;
    subtitle: string;
    imageUrl: string;
    linkUrl: string;
    position: string;
    sortOrder: string;
    status: ContentStatus;
};

type PostForm = {
    title: string;
    slug: string;
    summary: string;
    content: string;
    thumbnailUrl: string;
    category: string;
    authorId: string;
    status: ContentStatus;
};

type CampaignForm = {
    name: string;
    description: string;
    couponCode: string;
    discountType: DiscountType;
    discountValue: string;
    minOrderValue: string;
    maxDiscount: string;
    usageLimit: string;
    startAt: string;
    endAt: string;
    status: ContentStatus;
};

const emptyBannerForm: BannerForm = {
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    position: 'homepage',
    sortOrder: '0',
    status: 'DRAFT'
};

const emptyPostForm: PostForm = {
    title: '',
    slug: '',
    summary: '',
    content: '',
    thumbnailUrl: '',
    category: 'Chăm sóc thú cưng',
    authorId: '',
    status: 'DRAFT'
};

const emptyCampaignForm: CampaignForm = {
    name: '',
    description: '',
    couponCode: '',
    discountType: 'PERCENT',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    startAt: '',
    endAt: '',
    status: 'DRAFT'
};

const statusMeta: Record<ContentStatus, { label: string; className: string }> = {
    DRAFT: {
        label: 'Bản nháp',
        className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
    },
    PUBLISHED: {
        label: 'Đang xuất bản',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
    },
    ARCHIVED: {
        label: 'Lưu trữ',
        className: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
    }
};

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
});

function StatusBadge({ status }: { status: ContentStatus }) {
    const meta = statusMeta[status];
    return <Badge variant='outline' className={cn('rounded-md', meta.className)}>{meta.label}</Badge>;
}

function formatDate(value?: string) {
    if (!value) return 'Chưa đặt';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

function toSlug(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function toDateTimeInput(value?: string) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value.slice(0, 16);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function optionalText(value: string) {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
}

function optionalNumber(value: string) {
    const trimmed = value.trim();
    return trimmed ? Number(trimmed) : undefined;
}

function matchesSearch(values: Array<string | number | undefined>, query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return values.some((value) => String(value ?? '').toLowerCase().includes(normalized));
}

const AdminCmsMarketingPage = () => {
    const [activeTab, setActiveTab] = useState<CmsTab>('banners');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [banners, setBanners] = useState<Banner[]>([]);
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);

    const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

    const [bannerForm, setBannerForm] = useState<BannerForm>(emptyBannerForm);
    const [postForm, setPostForm] = useState<PostForm>(emptyPostForm);
    const [campaignForm, setCampaignForm] = useState<CampaignForm>(emptyCampaignForm);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [bannerRes, postRes, campaignRes] = await Promise.all([
                cmsMarketingApi.getBanners(),
                cmsMarketingApi.getPosts(),
                cmsMarketingApi.getCampaigns()
            ]);
            setBanners(bannerRes.result ?? []);
            setPosts(postRes.result ?? []);
            setCampaigns(campaignRes.result ?? []);
        } catch (error) {
            console.error('Error loading CMS data:', error);
            toast.error('Không thể tải dữ liệu CMS & Marketing');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const stats = useMemo(() => {
        const published = [
            ...banners.map((item) => item.status),
            ...posts.map((item) => item.status),
            ...campaigns.map((item) => item.status)
        ].filter((status) => status === 'PUBLISHED').length;

        return [
            { label: 'Banner', value: banners.length, icon: Image },
            { label: 'Bài viết', value: posts.length, icon: FileText },
            { label: 'Chiến dịch', value: campaigns.length, icon: Megaphone },
            { label: 'Đang hiển thị', value: published, icon: Eye }
        ];
    }, [banners, posts, campaigns]);

    const filteredBanners = useMemo(
        () => banners.filter((item) => matchesSearch([item.title, item.subtitle, item.position, item.status], search)),
        [banners, search]
    );

    const filteredPosts = useMemo(
        () => posts.filter((item) => matchesSearch([item.title, item.slug, item.summary, item.category, item.status], search)),
        [posts, search]
    );

    const filteredCampaigns = useMemo(
        () => campaigns.filter((item) => matchesSearch([item.name, item.description, item.couponCode, item.status], search)),
        [campaigns, search]
    );

    const resetBannerForm = () => {
        setEditingBannerId(null);
        setBannerForm(emptyBannerForm);
    };

    const resetPostForm = () => {
        setEditingPostId(null);
        setPostForm(emptyPostForm);
    };

    const resetCampaignForm = () => {
        setEditingCampaignId(null);
        setCampaignForm(emptyCampaignForm);
    };

    const editBanner = (banner: Banner) => {
        setActiveTab('banners');
        setEditingBannerId(banner.id);
        setBannerForm({
            title: banner.title,
            subtitle: banner.subtitle ?? '',
            imageUrl: banner.imageUrl,
            linkUrl: banner.linkUrl ?? '',
            position: banner.position,
            sortOrder: String(banner.sortOrder ?? 0),
            status: banner.status
        });
    };

    const editPost = (post: BlogPost) => {
        setActiveTab('posts');
        setEditingPostId(post.id);
        setPostForm({
            title: post.title,
            slug: post.slug,
            summary: post.summary ?? '',
            content: post.content,
            thumbnailUrl: post.thumbnailUrl ?? '',
            category: post.category ?? '',
            authorId: post.authorId ?? '',
            status: post.status
        });
    };

    const editCampaign = (campaign: MarketingCampaign) => {
        setActiveTab('campaigns');
        setEditingCampaignId(campaign.id);
        setCampaignForm({
            name: campaign.name,
            description: campaign.description ?? '',
            couponCode: campaign.couponCode ?? '',
            discountType: campaign.discountType ?? 'PERCENT',
            discountValue: String(campaign.discountValue ?? ''),
            minOrderValue: String(campaign.minOrderValue ?? ''),
            maxDiscount: String(campaign.maxDiscount ?? ''),
            usageLimit: String(campaign.usageLimit ?? ''),
            startAt: toDateTimeInput(campaign.startAt),
            endAt: toDateTimeInput(campaign.endAt),
            status: campaign.status
        });
    };

    const saveBanner = async () => {
        if (!bannerForm.title.trim() || !bannerForm.imageUrl.trim() || !bannerForm.position.trim()) {
            toast.error('Vui lòng nhập tiêu đề, ảnh và vị trí banner');
            return;
        }

        const payload: BannerPayload = {
            title: bannerForm.title.trim(),
            subtitle: optionalText(bannerForm.subtitle),
            imageUrl: bannerForm.imageUrl.trim(),
            linkUrl: optionalText(bannerForm.linkUrl),
            position: bannerForm.position.trim(),
            sortOrder: Number(bannerForm.sortOrder || 0),
            status: bannerForm.status
        };

        setSaving(true);
        try {
            if (editingBannerId) {
                await cmsMarketingApi.updateBanner(editingBannerId, payload);
                toast.success('Đã cập nhật banner');
            } else {
                await cmsMarketingApi.createBanner(payload);
                toast.success('Đã tạo banner');
            }
            resetBannerForm();
            await loadData();
        } catch (error) {
            console.error('Error saving banner:', error);
            toast.error('Không thể lưu banner');
        } finally {
            setSaving(false);
        }
    };

    const savePost = async () => {
        if (!postForm.title.trim() || !postForm.content.trim()) {
            toast.error('Vui lòng nhập tiêu đề và nội dung bài viết');
            return;
        }

        const payload: BlogPostPayload = {
            title: postForm.title.trim(),
            slug: postForm.slug.trim() || toSlug(postForm.title),
            summary: optionalText(postForm.summary),
            content: postForm.content.trim(),
            thumbnailUrl: optionalText(postForm.thumbnailUrl),
            category: optionalText(postForm.category),
            authorId: optionalText(postForm.authorId),
            status: postForm.status
        };

        setSaving(true);
        try {
            if (editingPostId) {
                await cmsMarketingApi.updatePost(editingPostId, payload);
                toast.success('Đã cập nhật bài viết');
            } else {
                await cmsMarketingApi.createPost(payload);
                toast.success('Đã tạo bài viết');
            }
            resetPostForm();
            await loadData();
        } catch (error) {
            console.error('Error saving post:', error);
            toast.error('Không thể lưu bài viết');
        } finally {
            setSaving(false);
        }
    };

    const saveCampaign = async () => {
        if (!campaignForm.name.trim()) {
            toast.error('Vui lòng nhập tên chiến dịch');
            return;
        }

        const payload: MarketingCampaignPayload = {
            name: campaignForm.name.trim(),
            description: optionalText(campaignForm.description),
            couponCode: optionalText(campaignForm.couponCode),
            discountType: campaignForm.discountType,
            discountValue: optionalNumber(campaignForm.discountValue),
            minOrderValue: optionalNumber(campaignForm.minOrderValue),
            maxDiscount: optionalNumber(campaignForm.maxDiscount),
            usageLimit: optionalNumber(campaignForm.usageLimit),
            startAt: optionalText(campaignForm.startAt),
            endAt: optionalText(campaignForm.endAt),
            status: campaignForm.status
        };

        setSaving(true);
        try {
            if (editingCampaignId) {
                await cmsMarketingApi.updateCampaign(editingCampaignId, payload);
                toast.success('Đã cập nhật chiến dịch');
            } else {
                await cmsMarketingApi.createCampaign(payload);
                toast.success('Đã tạo chiến dịch');
            }
            resetCampaignForm();
            await loadData();
        } catch (error) {
            console.error('Error saving campaign:', error);
            toast.error('Không thể lưu chiến dịch');
        } finally {
            setSaving(false);
        }
    };

    const changeBannerStatus = async (id: string, status: ContentStatus) => {
        try {
            await cmsMarketingApi.updateBannerStatus(id, status);
            toast.success('Đã cập nhật trạng thái banner');
            await loadData();
        } catch (error) {
            console.error('Error updating banner status:', error);
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const changePostStatus = async (id: string, status: ContentStatus) => {
        try {
            await cmsMarketingApi.updatePostStatus(id, status);
            toast.success('Đã cập nhật trạng thái bài viết');
            await loadData();
        } catch (error) {
            console.error('Error updating post status:', error);
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const changeCampaignStatus = async (id: string, status: ContentStatus) => {
        try {
            await cmsMarketingApi.updateCampaignStatus(id, status);
            toast.success('Đã cập nhật trạng thái chiến dịch');
            await loadData();
        } catch (error) {
            console.error('Error updating campaign status:', error);
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const deleteBanner = async (banner: Banner) => {
        if (!window.confirm(`Xóa banner "${banner.title}"?`)) return;
        try {
            await cmsMarketingApi.deleteBanner(banner.id);
            toast.success('Đã xóa banner');
            await loadData();
        } catch (error) {
            console.error('Error deleting banner:', error);
            toast.error('Không thể xóa banner');
        }
    };

    const deletePost = async (post: BlogPost) => {
        if (!window.confirm(`Xóa bài viết "${post.title}"?`)) return;
        try {
            await cmsMarketingApi.deletePost(post.id);
            toast.success('Đã xóa bài viết');
            await loadData();
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Không thể xóa bài viết');
        }
    };

    const deleteCampaign = async (campaign: MarketingCampaign) => {
        if (!window.confirm(`Xóa chiến dịch "${campaign.name}"?`)) return;
        try {
            await cmsMarketingApi.deleteCampaign(campaign.id);
            toast.success('Đã xóa chiến dịch');
            await loadData();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            toast.error('Không thể xóa chiến dịch');
        }
    };

    return (
        <div className='space-y-6'>
            <div className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
                <div>
                    <div className='flex items-center gap-2 text-sm font-medium text-[#448B3D]'>
                        <Megaphone className='w-4 h-4' />
                        CMS & Marketing
                    </div>
                    <h1 className='mt-2 text-2xl sm:text-3xl font-bold tracking-tight'>Quản lý nội dung hiển thị</h1>
                    <p className='mt-1 text-sm text-muted-foreground'>
                        Điều phối banner, bài viết và mã khuyến mãi cho giao diện khách hàng.
                    </p>
                </div>
                <div className='flex flex-col sm:flex-row gap-2'>
                    <div className='relative min-w-0 sm:w-80'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder='Tìm theo tên, trạng thái, mã...'
                            className='pl-9 h-10'
                        />
                    </div>
                    <Button variant='outline' onClick={() => void loadData()} disabled={loading}>
                        {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <RefreshCw className='w-4 h-4' />}
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
                {stats.map((item) => (
                    <Card key={item.label} className='rounded-lg'>
                        <CardContent className='p-5 flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground'>{item.label}</p>
                                <p className='text-2xl font-bold'>{item.value}</p>
                            </div>
                            <div className='w-10 h-10 rounded-lg bg-[#448B3D]/10 text-[#448B3D] flex items-center justify-center'>
                                <item.icon className='w-5 h-5' />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CmsTab)} className='gap-4'>
                <TabsList className='w-full sm:w-fit h-auto flex-wrap justify-start'>
                    <TabsTrigger value='banners'><Image className='w-4 h-4' /> Banner</TabsTrigger>
                    <TabsTrigger value='posts'><FileText className='w-4 h-4' /> Bài viết</TabsTrigger>
                    <TabsTrigger value='campaigns'><Megaphone className='w-4 h-4' /> Chiến dịch</TabsTrigger>
                </TabsList>

                <TabsContent value='banners'>
                    <div className='grid grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)] gap-4'>
                        <Card className='rounded-lg'>
                            <CardHeader>
                                <CardTitle className='text-lg'>{editingBannerId ? 'Sửa banner' : 'Tạo banner'}</CardTitle>
                                <CardDescription>Nội dung ảnh hiển thị tại trang chủ hoặc khu vực quảng bá.</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='banner-title'>Tiêu đề</Label>
                                    <Input id='banner-title' value={bannerForm.title} onChange={(event) => setBannerForm({ ...bannerForm, title: event.target.value })} />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='banner-subtitle'>Mô tả ngắn</Label>
                                    <Input id='banner-subtitle' value={bannerForm.subtitle} onChange={(event) => setBannerForm({ ...bannerForm, subtitle: event.target.value })} />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='banner-image'>URL ảnh</Label>
                                    <Input id='banner-image' value={bannerForm.imageUrl} onChange={(event) => setBannerForm({ ...bannerForm, imageUrl: event.target.value })} />
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='banner-position'>Vị trí</Label>
                                        <Input id='banner-position' value={bannerForm.position} onChange={(event) => setBannerForm({ ...bannerForm, position: event.target.value })} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='banner-sort'>Thứ tự</Label>
                                        <Input id='banner-sort' type='number' value={bannerForm.sortOrder} onChange={(event) => setBannerForm({ ...bannerForm, sortOrder: event.target.value })} />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='banner-link'>URL điều hướng</Label>
                                    <Input id='banner-link' value={bannerForm.linkUrl} onChange={(event) => setBannerForm({ ...bannerForm, linkUrl: event.target.value })} />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Trạng thái</Label>
                                    <Select value={bannerForm.status} onValueChange={(value) => setBannerForm({ ...bannerForm, status: value as ContentStatus })}>
                                        <SelectTrigger className='w-full'><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='DRAFT'>Bản nháp</SelectItem>
                                            <SelectItem value='PUBLISHED'>Đang xuất bản</SelectItem>
                                            <SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex gap-2'>
                                    <Button className='bg-[#448B3D] hover:bg-[#336B2D]' onClick={() => void saveBanner()} disabled={saving}>
                                        {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                                        Lưu
                                    </Button>
                                    {editingBannerId && (
                                        <Button variant='outline' onClick={resetBannerForm}><X className='w-4 h-4' /> Hủy</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='rounded-lg'>
                            <CardHeader>
                                <CardTitle className='text-lg'>Danh sách banner</CardTitle>
                                <CardDescription>{filteredBanners.length} mục phù hợp</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <LoadingState />
                                ) : filteredBanners.length === 0 ? (
                                    <EmptyState label='Chưa có banner' />
                                ) : (
                                    <div className='space-y-3'>
                                        {filteredBanners.map((banner) => (
                                            <div key={banner.id} className='flex flex-col lg:flex-row gap-4 rounded-lg border p-4'>
                                                <div className='w-full lg:w-48 aspect-video rounded-md overflow-hidden bg-muted shrink-0'>
                                                    {banner.imageUrl ? (
                                                        <img src={banner.imageUrl} alt={banner.title} className='w-full h-full object-cover' />
                                                    ) : (
                                                        <div className='w-full h-full flex items-center justify-center text-muted-foreground'><Image className='w-6 h-6' /></div>
                                                    )}
                                                </div>
                                                <div className='min-w-0 flex-1'>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <h3 className='font-semibold truncate'>{banner.title}</h3>
                                                        <StatusBadge status={banner.status} />
                                                    </div>
                                                    <p className='mt-1 text-sm text-muted-foreground line-clamp-2'>{banner.subtitle || 'Không có mô tả'}</p>
                                                    <div className='mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground'>
                                                        <span className='rounded-md bg-muted px-2 py-1'>Vị trí: {banner.position}</span>
                                                        <span className='rounded-md bg-muted px-2 py-1'>Thứ tự: {banner.sortOrder}</span>
                                                        <span className='rounded-md bg-muted px-2 py-1'>Cập nhật: {formatDate(banner.updatedAt ?? banner.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <RowActions
                                                    status={banner.status}
                                                    onEdit={() => editBanner(banner)}
                                                    onStatus={(status) => void changeBannerStatus(banner.id, status)}
                                                    onDelete={() => void deleteBanner(banner)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='posts'>
                    <div className='grid grid-cols-1 xl:grid-cols-[460px_minmax(0,1fr)] gap-4'>
                        <Card className='rounded-lg'>
                            <CardHeader>
                                <CardTitle className='text-lg'>{editingPostId ? 'Sửa bài viết' : 'Tạo bài viết'}</CardTitle>
                                <CardDescription>Bài viết kiến thức hiển thị ở khu vực blog.</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='post-title'>Tiêu đề</Label>
                                    <Input
                                        id='post-title'
                                        value={postForm.title}
                                        onChange={(event) => setPostForm({
                                            ...postForm,
                                            title: event.target.value,
                                            slug: postForm.slug ? postForm.slug : toSlug(event.target.value)
                                        })}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='post-slug'>Slug</Label>
                                    <Input id='post-slug' value={postForm.slug} onChange={(event) => setPostForm({ ...postForm, slug: toSlug(event.target.value) })} />
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='post-category'>Danh mục</Label>
                                        <Input id='post-category' value={postForm.category} onChange={(event) => setPostForm({ ...postForm, category: event.target.value })} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='post-author'>Tác giả</Label>
                                        <Input id='post-author' value={postForm.authorId} onChange={(event) => setPostForm({ ...postForm, authorId: event.target.value })} />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='post-thumbnail'>URL ảnh đại diện</Label>
                                    <Input id='post-thumbnail' value={postForm.thumbnailUrl} onChange={(event) => setPostForm({ ...postForm, thumbnailUrl: event.target.value })} />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='post-summary'>Tóm tắt</Label>
                                    <Textarea id='post-summary' value={postForm.summary} onChange={(event) => setPostForm({ ...postForm, summary: event.target.value })} className='min-h-20' />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='post-content'>Nội dung</Label>
                                    <Textarea id='post-content' value={postForm.content} onChange={(event) => setPostForm({ ...postForm, content: event.target.value })} className='min-h-40' />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Trạng thái</Label>
                                    <Select value={postForm.status} onValueChange={(value) => setPostForm({ ...postForm, status: value as ContentStatus })}>
                                        <SelectTrigger className='w-full'><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='DRAFT'>Bản nháp</SelectItem>
                                            <SelectItem value='PUBLISHED'>Đang xuất bản</SelectItem>
                                            <SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex gap-2'>
                                    <Button className='bg-[#448B3D] hover:bg-[#336B2D]' onClick={() => void savePost()} disabled={saving}>
                                        {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                                        Lưu
                                    </Button>
                                    {editingPostId && (
                                        <Button variant='outline' onClick={resetPostForm}><X className='w-4 h-4' /> Hủy</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='rounded-lg'>
                            <CardHeader>
                                <CardTitle className='text-lg'>Danh sách bài viết</CardTitle>
                                <CardDescription>{filteredPosts.length} mục phù hợp</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <LoadingState />
                                ) : filteredPosts.length === 0 ? (
                                    <EmptyState label='Chưa có bài viết' />
                                ) : (
                                    <div className='space-y-3'>
                                        {filteredPosts.map((post) => (
                                            <div key={post.id} className='flex flex-col lg:flex-row gap-4 rounded-lg border p-4'>
                                                <div className='w-full lg:w-40 aspect-video rounded-md overflow-hidden bg-muted shrink-0'>
                                                    {post.thumbnailUrl ? (
                                                        <img src={post.thumbnailUrl} alt={post.title} className='w-full h-full object-cover' />
                                                    ) : (
                                                        <div className='w-full h-full flex items-center justify-center text-muted-foreground'><FileText className='w-6 h-6' /></div>
                                                    )}
                                                </div>
                                                <div className='min-w-0 flex-1'>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <h3 className='font-semibold truncate'>{post.title}</h3>
                                                        <StatusBadge status={post.status} />
                                                    </div>
                                                    <p className='mt-1 text-sm text-muted-foreground line-clamp-2'>{post.summary || post.content}</p>
                                                    <div className='mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground'>
                                                        <span className='rounded-md bg-muted px-2 py-1'>/{post.slug}</span>
                                                        {post.category && <span className='rounded-md bg-muted px-2 py-1'>{post.category}</span>}
                                                        <span className='rounded-md bg-muted px-2 py-1'>Xuất bản: {formatDate(post.publishedAt)}</span>
                                                    </div>
                                                </div>
                                                <RowActions
                                                    status={post.status}
                                                    onEdit={() => editPost(post)}
                                                    onStatus={(status) => void changePostStatus(post.id, status)}
                                                    onDelete={() => void deletePost(post)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='campaigns'>
                    <div className='grid grid-cols-1 xl:grid-cols-[460px_minmax(0,1fr)] gap-4'>
                        <Card className='rounded-lg'>
                            <CardHeader>
                                <CardTitle className='text-lg'>{editingCampaignId ? 'Sửa chiến dịch' : 'Tạo chiến dịch'}</CardTitle>
                                <CardDescription>Thiết lập mã giảm giá và thời gian áp dụng.</CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='campaign-name'>Tên chiến dịch</Label>
                                    <Input id='campaign-name' value={campaignForm.name} onChange={(event) => setCampaignForm({ ...campaignForm, name: event.target.value })} />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='campaign-description'>Mô tả</Label>
                                    <Textarea id='campaign-description' value={campaignForm.description} onChange={(event) => setCampaignForm({ ...campaignForm, description: event.target.value })} className='min-h-20' />
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='campaign-code'>Mã coupon</Label>
                                        <Input id='campaign-code' value={campaignForm.couponCode} onChange={(event) => setCampaignForm({ ...campaignForm, couponCode: event.target.value.toUpperCase() })} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Loại giảm</Label>
                                        <Select value={campaignForm.discountType} onValueChange={(value) => setCampaignForm({ ...campaignForm, discountType: value as DiscountType })}>
                                            <SelectTrigger className='w-full'><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='PERCENT'>Phần trăm</SelectItem>
                                                <SelectItem value='FIXED'>Số tiền</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='campaign-value'>Giá trị giảm</Label>
                                        <Input id='campaign-value' type='number' min='0' value={campaignForm.discountValue} onChange={(event) => setCampaignForm({ ...campaignForm, discountValue: event.target.value })} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='campaign-limit'>Lượt dùng</Label>
                                        <Input id='campaign-limit' type='number' min='0' value={campaignForm.usageLimit} onChange={(event) => setCampaignForm({ ...campaignForm, usageLimit: event.target.value })} />
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='campaign-min'>Đơn tối thiểu</Label>
                                        <Input id='campaign-min' type='number' min='0' value={campaignForm.minOrderValue} onChange={(event) => setCampaignForm({ ...campaignForm, minOrderValue: event.target.value })} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='campaign-max'>Giảm tối đa</Label>
                                        <Input id='campaign-max' type='number' min='0' value={campaignForm.maxDiscount} onChange={(event) => setCampaignForm({ ...campaignForm, maxDiscount: event.target.value })} />
                                    </div>
                                </div>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='campaign-start'>Bắt đầu</Label>
                                        <Input id='campaign-start' type='datetime-local' value={campaignForm.startAt} onChange={(event) => setCampaignForm({ ...campaignForm, startAt: event.target.value })} />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='campaign-end'>Kết thúc</Label>
                                        <Input id='campaign-end' type='datetime-local' value={campaignForm.endAt} onChange={(event) => setCampaignForm({ ...campaignForm, endAt: event.target.value })} />
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Trạng thái</Label>
                                    <Select value={campaignForm.status} onValueChange={(value) => setCampaignForm({ ...campaignForm, status: value as ContentStatus })}>
                                        <SelectTrigger className='w-full'><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='DRAFT'>Bản nháp</SelectItem>
                                            <SelectItem value='PUBLISHED'>Đang xuất bản</SelectItem>
                                            <SelectItem value='ARCHIVED'>Lưu trữ</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='flex gap-2'>
                                    <Button className='bg-[#448B3D] hover:bg-[#336B2D]' onClick={() => void saveCampaign()} disabled={saving}>
                                        {saving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                                        Lưu
                                    </Button>
                                    {editingCampaignId && (
                                        <Button variant='outline' onClick={resetCampaignForm}><X className='w-4 h-4' /> Hủy</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='rounded-lg'>
                            <CardHeader>
                                <CardTitle className='text-lg'>Danh sách chiến dịch</CardTitle>
                                <CardDescription>{filteredCampaigns.length} mục phù hợp</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <LoadingState />
                                ) : filteredCampaigns.length === 0 ? (
                                    <EmptyState label='Chưa có chiến dịch' />
                                ) : (
                                    <div className='space-y-3'>
                                        {filteredCampaigns.map((campaign) => (
                                            <div key={campaign.id} className='flex flex-col lg:flex-row gap-4 rounded-lg border p-4'>
                                                <div className='min-w-0 flex-1'>
                                                    <div className='flex flex-wrap items-center gap-2'>
                                                        <h3 className='font-semibold truncate'>{campaign.name}</h3>
                                                        <StatusBadge status={campaign.status} />
                                                        {campaign.couponCode && <Badge variant='outline' className='rounded-md'>{campaign.couponCode}</Badge>}
                                                    </div>
                                                    <p className='mt-1 text-sm text-muted-foreground line-clamp-2'>{campaign.description || 'Không có mô tả'}</p>
                                                    <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 text-xs text-muted-foreground'>
                                                        <span className='rounded-md bg-muted px-2 py-1'>
                                                            Giảm: {campaign.discountType === 'PERCENT' ? `${campaign.discountValue ?? 0}%` : currencyFormatter.format(campaign.discountValue ?? 0)}
                                                        </span>
                                                        <span className='rounded-md bg-muted px-2 py-1'>Đơn tối thiểu: {currencyFormatter.format(campaign.minOrderValue ?? 0)}</span>
                                                        <span className='rounded-md bg-muted px-2 py-1'>Lượt dùng: {campaign.usageLimit ?? 'Không giới hạn'}</span>
                                                        <span className='rounded-md bg-muted px-2 py-1 flex items-center gap-1'>
                                                            <CalendarClock className='w-3 h-3' /> {formatDate(campaign.startAt)} - {formatDate(campaign.endAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <RowActions
                                                    status={campaign.status}
                                                    onEdit={() => editCampaign(campaign)}
                                                    onStatus={(status) => void changeCampaignStatus(campaign.id, status)}
                                                    onDelete={() => void deleteCampaign(campaign)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

function RowActions({
    status,
    onEdit,
    onStatus,
    onDelete
}: {
    status: ContentStatus;
    onEdit: () => void;
    onStatus: (status: ContentStatus) => void;
    onDelete: () => void;
}) {
    return (
        <div className='flex lg:flex-col gap-2 lg:w-36'>
            <Button variant='outline' size='sm' onClick={onEdit} className='flex-1 lg:flex-none'>
                <Pencil className='w-4 h-4' />
                Sửa
            </Button>
            {status !== 'PUBLISHED' && (
                <Button variant='outline' size='sm' onClick={() => onStatus('PUBLISHED')} className='flex-1 lg:flex-none'>
                    <Eye className='w-4 h-4' />
                    Xuất bản
                </Button>
            )}
            {status !== 'ARCHIVED' && (
                <Button variant='outline' size='sm' onClick={() => onStatus('ARCHIVED')} className='flex-1 lg:flex-none'>
                    <Archive className='w-4 h-4' />
                    Lưu trữ
                </Button>
            )}
            <Button variant='destructive' size='sm' onClick={onDelete} className='flex-1 lg:flex-none'>
                <Trash2 className='w-4 h-4' />
                Xóa
            </Button>
        </div>
    );
}

function LoadingState() {
    return (
        <div className='h-48 flex items-center justify-center text-muted-foreground'>
            <Loader2 className='w-5 h-5 animate-spin mr-2' />
            Đang tải dữ liệu...
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className='h-48 flex flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground'>
            <Plus className='w-6 h-6 mb-2' />
            <p className='text-sm'>{label}</p>
        </div>
    );
}

export default AdminCmsMarketingPage;
