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
        {
            id: '1',
            name: 'Similar Premium Dog Food',
            price: 49.99,
            match: 95,
            image: 'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
            id: '2',
            name: 'Organic Pet Food Alternative',
            price: 44.99,
            match: 88,
            image: 'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
            id: '3',
            name: 'Premium Nutrition Pack',
            price: 54.99,
            match: 82,
            image: 'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
        }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setUploadedImage(reader.result as string);
                setUploading(true);
                // Simulate AI processing
                setTimeout(() => {
                    setSearchResults(mockResults);
                    setUploading(false);
                }, 2000);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='text-center mb-12'>
                    <div className='inline-flex items-center space-x-2 bg-gradient-to-r from-[#B490F5]/20 to-[#5B9FD8]/20 px-4 py-2 rounded-full border border-[#B490F5]/30 mb-4'>
                        <Sparkles className='w-4 h-4 text-[#B490F5]' />
                        <span className='text-sm font-medium text-[#B490F5]'>
                            AI-Powered Visual Search
                        </span>
                    </div>
                    <h1 className='text-4xl font-bold text-foreground mb-4'>
                        Find Products by Image
                    </h1>
                    <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                        Upload an image of a pet product, and our AI will find
                        similar items in our catalog
                    </p>
                </div>

                {/* Upload Section */}
                <Card className='max-w-3xl mx-auto p-8 rounded-2xl mb-12'>
                    <div className='border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-[#5B9FD8] transition-colors'>
                        <input
                            type='file'
                            id='imageUpload'
                            accept='image/*'
                            onChange={handleFileUpload}
                            className='hidden'
                        />
                        <label htmlFor='imageUpload' className='cursor-pointer'>
                            <div className='w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#5B9FD8]/20 to-[#B490F5]/20 flex items-center justify-center'>
                                {uploading ? (
                                    <Loader2 className='w-10 h-10 text-[#5B9FD8] animate-spin' />
                                ) : uploadedImage ? (
                                    <Search className='w-10 h-10 text-[#5B9FD8]' />
                                ) : (
                                    <Upload className='w-10 h-10 text-[#5B9FD8]' />
                                )}
                            </div>
                            <h3 className='text-xl font-semibold text-foreground mb-2'>
                                {uploading
                                    ? 'Processing Image...'
                                    : uploadedImage
                                      ? 'Searching...'
                                      : 'Upload an Image'}
                            </h3>
                            <p className='text-muted-foreground mb-4'>
                                {uploading
                                    ? 'Our AI is analyzing your image'
                                    : uploadedImage
                                      ? 'Finding similar products'
                                      : 'Drag and drop or click to browse'}
                            </p>
                            {!uploadedImage && (
                                <Button className='rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'>
                                    <ImageIcon className='w-4 h-4 mr-2' />
                                    Choose Image
                                </Button>
                            )}
                        </label>
                    </div>

                    {uploadedImage && (
                        <div className='mt-6'>
                            <h4 className='font-semibold text-foreground mb-3'>
                                Uploaded Image:
                            </h4>
                            <img
                                src={uploadedImage}
                                alt='Uploaded'
                                className='w-full h-64 object-cover rounded-xl'
                            />
                        </div>
                    )}
                </Card>

                {/* Results */}
                {searchResults.length > 0 && (
                    <div>
                        <div className='flex items-center justify-between mb-6'>
                            <h2 className='text-2xl font-bold text-foreground'>
                                Similar Products Found
                            </h2>
                            <p className='text-muted-foreground'>
                                {searchResults.length} matches
                            </p>
                        </div>

                        <div className='grid md:grid-cols-3 gap-6'>
                            {searchResults.map((product) => (
                                <Card
                                    key={product.id}
                                    className='group cursor-pointer overflow-hidden rounded-2xl border-border hover:shadow-xl transition-all duration-300 bg-white'
                                    onClick={() =>
                                        navigate(`/products/${product.id}`)
                                    }
                                >
                                    <div className='relative'>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className='w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500'
                                        />
                                        <div className='absolute top-3 right-3 bg-gradient-to-r from-[#7FD99E] to-[#4CAF50] text-white px-3 py-1 rounded-full text-sm font-semibold'>
                                            {product.match}% Match
                                        </div>
                                    </div>
                                    <div className='p-5'>
                                        <h3 className='font-semibold text-foreground mb-2'>
                                            {product.name}
                                        </h3>
                                        <p className='text-2xl font-bold text-[#5B9FD8]'>
                                            ${product.price}
                                        </p>
                                        <Button
                                            className='w-full mt-4 rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(
                                                    `/products/${product.id}`
                                                );
                                            }}
                                        >
                                            View Product
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* How it Works */}
                {searchResults.length === 0 && !uploading && (
                    <div className='max-w-4xl mx-auto'>
                        <h2 className='text-2xl font-bold text-foreground text-center mb-8'>
                            How It Works
                        </h2>
                        <div className='grid md:grid-cols-3 gap-8'>
                            <Card className='p-6 rounded-2xl text-center'>
                                <div className='w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#5B9FD8] to-[#3D7BA8] flex items-center justify-center'>
                                    <span className='text-white font-bold text-xl'>
                                        1
                                    </span>
                                </div>
                                <h3 className='font-semibold text-foreground mb-2'>
                                    Upload Image
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    Take a photo or upload an image of any pet
                                    product
                                </p>
                            </Card>
                            <Card className='p-6 rounded-2xl text-center'>
                                <div className='w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#B490F5] to-[#9370DB] flex items-center justify-center'>
                                    <span className='text-white font-bold text-xl'>
                                        2
                                    </span>
                                </div>
                                <h3 className='font-semibold text-foreground mb-2'>
                                    AI Analysis
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    Our AI analyzes the image to identify key
                                    features
                                </p>
                            </Card>
                            <Card className='p-6 rounded-2xl text-center'>
                                <div className='w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#FFB86F] to-[#FF9A3D] flex items-center justify-center'>
                                    <span className='text-white font-bold text-xl'>
                                        3
                                    </span>
                                </div>
                                <h3 className='font-semibold text-foreground mb-2'>
                                    Get Results
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    Instantly find similar products with match
                                    percentages
                                </p>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageSearchPage;
