import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { searchByImage, type ImageSearchResponseData, type SuggestionCard } from '@/lib/chatApi';
import { htmlToPlainText } from '@/lib/htmlSafety';
import { AlertTriangle, CalendarDays, ImageIcon, Info, Loader2, Lock, Search, Sparkles, Stethoscope, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price: number) => price.toLocaleString('vi-VN') + 'đ';

const getProductImage = (product: SuggestionCard) =>
    product.imageUrl || '/image-removebg-preview.png';

function getPlainTextDescription(description?: string): string {
    return htmlToPlainText(description);
}

const ImageSearchPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [searchResult, setSearchResult] = useState<ImageSearchResponseData | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isAuthenticated) {
            setError('Vui lòng đăng nhập để sử dụng chức năng tìm kiếm bằng hình ảnh.');
            e.target.value = '';
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Vui lòng chọn đúng tệp hình ảnh.');
            return;
        }

        setUploadedImage(URL.createObjectURL(file));
        setUploading(true);
        setSearchResult(null);
        setError(null);

        try {
            const response = await searchByImage(file);
            setSearchResult(response.result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể phân tích ảnh lúc này.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const products = searchResult?.productSuggestions ?? searchResult?.suggestions?.filter((item) => item.type === 'product') ?? [];
    const services = searchResult?.serviceSuggestions ?? searchResult?.suggestions?.filter((item) => item.type === 'service') ?? [];
    const diseaseMatches = searchResult?.diseaseMatches ?? [];

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <div className='inline-flex items-center space-x-2 bg-gradient-to-r from-[#B490F5]/20 to-[#448B3D]/20 px-4 py-2 rounded-full border border-[#B490F5]/30 mb-4'>
                        <Sparkles className='w-4 h-4 text-[#B490F5]' />
                        <span className='text-sm font-medium text-[#B490F5]'>Tìm kiếm hình ảnh bằng AI</span>
                    </div>
                    <h1 className='text-4xl font-bold text-foreground mb-4'>Tìm kiếm bằng hình ảnh</h1>
                    <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                        Tải ảnh thú cưng, sản phẩm hoặc dấu hiệu bệnh để nhận gợi ý bệnh, sản phẩm và dịch vụ phù hợp.
                    </p>
                </div>

                <Card className='max-w-3xl mx-auto p-8 rounded-2xl mb-8'>
                    <div className='border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-[#448B3D] transition-colors'>
                        <input type='file' id='imageUpload' accept='image/*' onChange={handleFileUpload} disabled={!isAuthenticated || isLoading || uploading} className='hidden' />
                        <label htmlFor={isAuthenticated && !isLoading && !uploading ? 'imageUpload' : undefined} className={isAuthenticated && !isLoading ? 'cursor-pointer' : 'cursor-not-allowed'}>
                            <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#448B3D]/20 to-[#B490F5]/20 flex items-center justify-center'>
                                {isLoading || uploading ? (
                                    <Loader2 className='w-10 h-10 text-[#448B3D] animate-spin' />
                                ) : !isAuthenticated ? (
                                    <Lock className='w-10 h-10 text-[#448B3D]' />
                                ) : uploadedImage ? (
                                    <Search className='w-10 h-10 text-[#448B3D]' />
                                ) : (
                                    <Upload className='w-10 h-10 text-[#448B3D]' />
                                )}
                            </div>
                            <h3 className='text-xl font-semibold text-foreground mb-2'>
                                {isLoading ? 'Đang kiểm tra đăng nhập...' : !isAuthenticated ? 'Vui lòng đăng nhập' : uploading ? 'Đang phân tích ảnh...' : uploadedImage ? 'Chọn ảnh khác' : 'Tải ảnh lên'}
                            </h3>
                            <p className='text-muted-foreground mb-4'>
                                {isLoading ? 'Vui lòng chờ trong giây lát' : !isAuthenticated ? 'Bạn cần đăng nhập để sử dụng chức năng tìm kiếm bằng hình ảnh.' : uploading ? 'AI đang nhận diện nội dung và tìm sản phẩm phù hợp' : 'Kéo thả hoặc nhấn để chọn ảnh'}
                            </p>
                        </label>
                        {!isAuthenticated && !isLoading && (
                            <Button className='mt-2 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white' onClick={() => navigate('/login')}>
                                Đăng nhập ngay
                            </Button>
                        )}
                    </div>

                    {uploadedImage && (
                        <div className='mt-6'>
                            <h4 className='font-semibold text-foreground mb-3'>Ảnh đã tải lên:</h4>
                            <img src={uploadedImage} alt='Ảnh đã tải lên' className='w-full h-64 object-cover rounded-xl' />
                        </div>
                    )}
                </Card>

                {error && (
                    <div className='max-w-3xl mx-auto flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3 mb-8'>
                        <AlertTriangle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
                        <p className='text-red-700 dark:text-red-300 text-sm font-medium'>{error}</p>
                    </div>
                )}

                {searchResult && (
                    <div className='space-y-8'>
                        <Card className='max-w-4xl mx-auto p-6 rounded-2xl border-border bg-card'>
                            <div className='flex items-start gap-4'>
                                <div className='w-10 h-10 rounded-full bg-[#448B3D] text-white flex items-center justify-center shrink-0'>
                                    <Info className='w-5 h-5' />
                                </div>
                                <div className='space-y-5 min-w-0'>
                                    <div>
                                        <h2 className='text-xl font-bold text-foreground mb-2'>Nhận định từ hình ảnh</h2>
                                        <p className='text-muted-foreground leading-relaxed'>{searchResult.summary}</p>
                                    </div>

                                    <div>
                                        <h3 className='font-semibold text-foreground mb-2'>Biện pháp tham khảo</h3>
                                        <ul className='space-y-2 text-sm text-muted-foreground'>
                                            {(searchResult.careTips.length ? searchResult.careTips : ['Bạn nên chụp ảnh rõ hơn hoặc liên hệ PetCare để được tư vấn chi tiết.']).map((item) => (
                                                <li key={item} className='leading-relaxed'>• {item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    {diseaseMatches.length > 0 && (
                                        <div>
                                            <h3 className='font-semibold text-foreground mb-2'>Bệnh hoặc tình trạng nghi ngờ</h3>
                                            <div className='grid gap-3'>
                                                {diseaseMatches.map((item, index) => (
                                                    <div key={`${item.matchedLabel ?? item.name}-${index}`} className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30'>
                                                        <div className='flex items-start gap-2'>
                                                            <Stethoscope className='w-4 h-4 text-red-500 shrink-0 mt-0.5' />
                                                            <div>
                                                                <p className='font-semibold text-red-800 dark:text-red-300'>{item.name}</p>
                                                                {item.description && <p className='text-sm text-red-700 dark:text-red-300 mt-1'>{item.description}</p>}
                                                                {typeof item.confidence === 'number' && (
                                                                    <p className='text-xs text-red-600 dark:text-red-400 mt-1'>Độ khớp tham khảo: {Math.round(item.confidence * 100)}%</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {searchResult.warnings.length > 0 && (
                                        <div className='rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-950/30'>
                                            <div className='flex items-start gap-2'>
                                                <AlertTriangle className='w-4 h-4 text-orange-500 shrink-0 mt-0.5' />
                                                <div className='text-sm text-orange-800 dark:text-orange-300 space-y-1'>
                                                    {searchResult.warnings.map((warning) => (
                                                        <p key={warning}>{warning}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <p className='text-xs leading-relaxed text-muted-foreground border-t border-border pt-4'>
                                        {searchResult.disclaimer}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <div>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-2xl font-bold text-foreground'>Sản phẩm gợi ý</h2>
                                <p className='text-muted-foreground'>{products.length} kết quả</p>
                            </div>

                            {products.length > 0 ? (
                                <div className='grid md:grid-cols-3 gap-6'>
                                    {products.map((product) => (
                                        <Card key={product.id} className='group cursor-pointer overflow-hidden rounded-2xl border-border hover:shadow-xl transition-all duration-300 bg-card' onClick={() => navigate(product.link || `/products/${product.id}`)}>
                                            <div className='relative bg-muted'>
                                                <img src={getProductImage(product)} alt={product.name} className='w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500' />
                                            </div>
                                            <div className='p-5'>
                                                <h3 className='font-semibold text-foreground mb-2 line-clamp-2'>{product.name}</h3>
                                                {getPlainTextDescription(product.description) && (
                                                    <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>{getPlainTextDescription(product.description)}</p>
                                                )}
                                                <p className='text-2xl font-bold text-[#448B3D]'>{formatPrice(product.price)}</p>
                                                <Button className='w-full mt-4 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white' onClick={(event) => { event.stopPropagation(); navigate(product.link || `/products/${product.id}`); }}>
                                                    Xem sản phẩm
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className='p-8 rounded-2xl text-center'>
                                    <ImageIcon className='w-12 h-12 mx-auto mb-3 text-muted-foreground' />
                                    <h3 className='font-semibold text-foreground mb-2'>Chưa tìm thấy sản phẩm phù hợp</h3>
                                    <p className='text-muted-foreground mb-4'>Bạn có thể xem toàn bộ sản phẩm hoặc liên hệ PetCare để được tư vấn theo tình trạng cụ thể.</p>
                                    <Button className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white' onClick={() => navigate('/products')}>
                                        Xem cửa hàng
                                    </Button>
                                </Card>
                            )}
                        </div>

                        <div>
                            <div className='flex items-center justify-between mb-6'>
                                <h2 className='text-2xl font-bold text-foreground'>Dịch vụ phù hợp</h2>
                                <p className='text-muted-foreground'>{services.length} kết quả</p>
                            </div>

                            {services.length > 0 ? (
                                <div className='grid md:grid-cols-3 gap-6'>
                                    {services.map((service) => (
                                        <Card key={service.id} className='group cursor-pointer overflow-hidden rounded-2xl border-border hover:shadow-xl transition-all duration-300 bg-card' onClick={() => navigate(service.link || '/booking')}>
                                            <div className='p-5'>
                                                <div className='w-12 h-12 rounded-xl bg-[#B490F5]/20 text-[#7C55D9] flex items-center justify-center mb-4'>
                                                    <CalendarDays className='w-6 h-6' />
                                                </div>
                                                <h3 className='font-semibold text-foreground mb-2 line-clamp-2'>{service.name}</h3>
                                                {getPlainTextDescription(service.description) && (
                                                    <p className='text-sm text-muted-foreground mb-3 line-clamp-2'>{getPlainTextDescription(service.description)}</p>
                                                )}
                                                <div className='flex items-center justify-between gap-3'>
                                                    <p className='text-xl font-bold text-[#448B3D]'>{formatPrice(service.price)}</p>
                                                    {service.durationMinutes && <span className='text-xs text-muted-foreground'>{service.durationMinutes} phút</span>}
                                                </div>
                                                <Button className='w-full mt-4 rounded-xl bg-[#B490F5] hover:bg-[#9370DB] text-white' onClick={(event) => { event.stopPropagation(); navigate(service.link || '/booking'); }}>
                                                    Đặt dịch vụ
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Card className='p-8 rounded-2xl text-center'>
                                    <CalendarDays className='w-12 h-12 mx-auto mb-3 text-muted-foreground' />
                                    <h3 className='font-semibold text-foreground mb-2'>Chưa có dịch vụ phù hợp</h3>
                                    <p className='text-muted-foreground mb-4'>Bạn có thể xem danh sách dịch vụ PetCare để chọn gói phù hợp.</p>
                                    <Button className='rounded-xl bg-[#B490F5] hover:bg-[#9370DB] text-white' onClick={() => navigate('/booking')}>
                                        Xem dịch vụ
                                    </Button>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {!searchResult && !uploading && (
                    <div className='max-w-4xl mx-auto'>
                        <h2 className='text-2xl font-bold text-foreground text-center mb-8'>Cách thức hoạt động</h2>
                        <div className='grid md:grid-cols-3 gap-8'>
                            {[
                                { step: 1, color: 'from-[#448B3D] to-[#336B2D]', title: 'Tải ảnh lên', desc: 'Chọn ảnh thú cưng, thức ăn, phụ kiện hoặc sản phẩm cần tìm' },
                                { step: 2, color: 'from-[#B490F5] to-[#9370DB]', title: 'AI phân tích', desc: 'AI đưa ra nhận định và biện pháp tham khảo từ ảnh' },
                                { step: 3, color: 'from-[#FFB86F] to-[#FF9A3D]', title: 'Nhận gợi ý', desc: 'Xem bệnh nghi ngờ, sản phẩm và dịch vụ phù hợp' }
                            ].map(({ step, color, title, desc }) => (
                                <Card key={step} className='p-6 rounded-2xl text-center'>
                                    <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                                        <span className='text-white font-bold text-xl'>{step}</span>
                                    </div>
                                    <h3 className='font-semibold text-foreground mb-2'>{title}</h3>
                                    <p className='text-sm text-muted-foreground'>{desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageSearchPage;
