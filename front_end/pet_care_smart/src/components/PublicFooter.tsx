import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Twitter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PublicFooter = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className='bg-white border-t border-border mt-auto'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                    {/* Brand */}
                    <div className='space-y-4'>
                        <div className='flex items-center space-x-2'>
                            <div className='w-10 h-10 rounded-xl  flex items-center justify-center'>
                                <span className='text-white font-bold text-xl'>
                                    <img
                                        src='../../public/image-removebg-preview.png'
                                        alt='Logo'
                                    />
                                </span>
                            </div>
                            <div className='flex flex-col'>
                                <span className='font-bold text-lg text-foreground'>
                                    PetCareSmart
                                </span>
                            </div>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                            Your trusted partner in pet care. We provide the
                            best products and services for your furry friends.
                        </p>
                        <div className='flex space-x-3'>
                            <a
                                href='#'
                                className='text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                            >
                                <Facebook className='w-5 h-5' />
                            </a>
                            <a
                                href='#'
                                className='text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                            >
                                <Twitter className='w-5 h-5' />
                            </a>
                            <a
                                href='#'
                                className='text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                            >
                                <Instagram className='w-5 h-5' />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className='font-semibold text-foreground mb-4'>
                            Quick Links
                        </h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link
                                    to='/products'
                                    className='text-sm text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                                >
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/booking'
                                    className='text-sm text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                                >
                                    Services
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/image-search'
                                    className='text-sm text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                                >
                                    AI Search
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/dashboard'
                                    className='text-sm text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                                >
                                    Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className='font-semibold text-foreground mb-4'>
                            Services
                        </h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link
                                    to='/booking'
                                    className='text-sm text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                                >
                                    Pet Spa
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/booking'
                                    className='text-sm text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                                >
                                    Health Checkup
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/booking'
                                    className='text-sm text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                                >
                                    Vaccination
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/booking'
                                    className='text-sm text-muted-foreground hover:text-[#5B9FD8] transition-colors'
                                >
                                    Grooming
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className='font-semibold text-foreground mb-4'>
                            Contact Us
                        </h3>
                        <ul className='space-y-3'>
                            <li className='flex items-start space-x-2 text-sm text-muted-foreground'>
                                <MapPin className='w-4 h-4 mt-0.5 flex-shrink-0' />
                                <span>
                                    154 BacHai, Ward 10, TanBinh District,
                                    HoChiMinh City
                                </span>
                            </li>
                            <li className='flex items-center space-x-2 text-sm text-muted-foreground'>
                                <Phone className='w-4 h-4 flex-shrink-0' />
                                <span>(+84) 702 500 551</span>
                            </li>
                            <li className='flex items-center space-x-2 text-sm text-muted-foreground'>
                                <Mail className='w-4 h-4 flex-shrink-0' />
                                <span>22130048@st.hcmuaf.edu.vn</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className='mt-8 pt-8 border-t border-border'>
                    <p className='text-center text-sm text-muted-foreground'>
                        © {currentYear} PetCareSmart. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
