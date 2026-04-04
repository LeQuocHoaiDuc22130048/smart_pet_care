import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ImageIcon, Loader2, Search, Sparkles, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ImageSearchPage = () => {
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const mockResults = [
        { id: '1', name: 'Thức ăn chó cao cấp tương tự', price: 49.99, match: 95, image: 'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080' },
        { id: '2', name: 'Thức ăn thú cưng hữu cơ', price: 44.99, match: 88, image: 'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
        { id: '3', name: 'Gói dinh dưỡng cao cấp', price: 54.99, match: 82, image: 'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080' }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setUploadedImage(reader.result as string);
                setUploading(true);
                setTimeout(() => { setSearchResults(mockResults); setUploading(false); }, 2000);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <div className='inline-flex items-center space-x-2 bg-gradient-to-r from-[#B490F5]/20 to-[#448B3D]/20 px-4 py-2 rounded-full border border-[#B490F5]/30 mb-4'>
                        <Sparkles className='w-4 h-4 text-[#B490F5]' />
                        <span className='text-sm font-medium text-[#B490F5]'>Tìm kiếm hình ảnh bằng AI</span>
                    </div>
                    <h1 className='text-4xl font-bold text-foreground mb-4'>Tìm sản phẩm bằng hình ảnh</h1>
                    <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                        Tải ảnh sản phẩm thú cưng lên và AI của chúng tôi sẽ tìm các sản phẩm tương tự trong danh mục
                    </p>
                </div>

                <Card className='max-w-3xl mx-auto p-8 rounded-2xl mb-12'>
                    <div className='border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-[#448B3D] transition-colors'>
                        <input type='file' id='imageUpload' accept='image/*' onChange={handleFileUpload} className='hidden' />
                        <label htmlFor='imageUpload' className='cursor-pointer'>
                            <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#448B3D]/20 to-[#B490F5]/20 flex items-center justify-center'>
                                {uploading ? (
                                    <Loader2 className='w-10 h-10 text-[#448B3D] animate-spin' />
                                ) : uploadedImage ? (
                                    <Search className='w-10 h-10 text-[#448B3D]' />
                                ) : (
                                    <Upload className='w-10 h-10 text-[#448B3D]' />
                                )}
                            </div>
                            <h3 className='text-xl font-semibold text-foreground mb-2'>
                                {uploading ? 'Đang xử lý ảnh...' : uploadedImage ? 'Đang tìm kiếm...' : 'Tải ảnh lên'}
                            </h3>
                            <p className='text-muted-foreground mb-4'>
                                {uploading ? 'AI đang phân tích hình ảnh của bạn' : uploadedImage ? 'Đang tìm sản phẩm tương tự' : 'Kéo thả hoặc nhấn để chọn ảnh'}
                            </p>
                            {!uploadedImage && (
                                <Button className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'>
                                    <ImageIcon className='w-4 h-4 mr-2' />
                                    Chọn ảnh
                                </Button>
                            )}
                        </label>
                    </div>

                    {uploadedImage && (
                        <div className='mt-6'>
                            <h4 className='font-semibold text-foreground mb-3'>Ảnh đã tải lên:</h4>
                            <img src={uploadedImage} alt='Uploaded' className='w-full h-64 object-cover rounded-xl' />
                        </div>
                    )}
                </Card>

                {searchResults.length > 0 && (
                    <div>
                        <div className='flex items-center justify-between mb-6'>
                            <h2 className='text-2xl font-bold text-foreground'>Sản phẩm tương tự</h2>
                            <p className='text-muted-foreground'>{searchResults.length} kết quả</p>
                        </div>
                        <div className='grid md:grid-cols-3 gap-6'>
                            {searchResults.map((product) => (
                                <Card key={product.id} className='group cursor-pointer overflow-hidden rounded-2xl border-border hover:shadow-xl transition-all duration-300 bg-card' onClick={() => navigate(`/products/${product.id}`)}>
                                    <div className='relative'>
                                        <img src={product.image} alt={product.name} className='w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500' />
                                        <div className='absolute top-3 right-3 bg-gradient-to-r from-[#7FD99E] to-[#4CAF50] text-white px-3 py-1 rounded-full text-sm font-semibold'>
                                            {product.match}% Phù hợp
                                        </div>
                                    </div>
                                    <div className='p-5'>
                                        <h3 className='font-semibold text-foreground mb-2'>{product.name}</h3>
                                        <p className='text-2xl font-bold text-[#448B3D]'>${product.price}</p>
                                        <Button className='w-full mt-4 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white' onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}>
                                            Xem sản phẩm
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {searchResults.length === 0 && !uploading && (
                    <div className='max-w-4xl mx-auto'>
                        <h2 className='text-2xl font-bold text-foreground text-center mb-8'>Cách thức hoạt động</h2>
                        <div className='grid md:grid-cols-3 gap-8'>
                            {[
                                { step: 1, color: 'from-[#448B3D] to-[#336B2D]', title: 'Tải ảnh lên', desc: 'Chụp hoặc tải ảnh bất kỳ sản phẩm thú cưng nào' },
                                { step: 2, color: 'from-[#B490F5] to-[#9370DB]', title: 'AI phân tích', desc: 'AI của chúng tôi phân tích hình ảnh để nhận diện đặc điểm' },
                                { step: 3, color: 'from-[#FFB86F] to-[#FF9A3D]', title: 'Nhận kết quả', desc: 'Tìm ngay các sản phẩm tương tự với tỷ lệ phù hợp' }
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
