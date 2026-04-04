import type { Product, Service, Testimonial, Order } from '../types';

export const products: Product[] = [
  { id: 1,  name: "Royal Canin Adult Dog Food",    category: "food",        price: 320000, rating: 4.8, reviews: 124, image: "https://placehold.co/300x300/fde68a/92400e?text=Dog+Food",    badge: "Best Seller", description: "Premium dry food for adult dogs. Balanced nutrition with vitamins and minerals for optimal health." },
  { id: 2,  name: "Whiskas Cat Food Tuna",          category: "food",        price: 85000,  rating: 4.5, reviews: 89,  image: "https://placehold.co/300x300/bfdbfe/1e40af?text=Cat+Food",    badge: "Sale",        description: "Delicious tuna flavored wet food for cats. Rich in protein and omega-3 fatty acids." },
  { id: 3,  name: "Pet Grooming Brush Set",         category: "accessories", price: 150000, rating: 4.7, reviews: 56,  image: "https://placehold.co/300x300/bbf7d0/166534?text=Brush+Set",   badge: null,          description: "Professional grooming brush set for dogs and cats. Removes loose fur and prevents matting." },
  { id: 4,  name: "Cozy Pet Bed (Medium)",          category: "accessories", price: 450000, rating: 4.9, reviews: 203, image: "https://placehold.co/300x300/fecaca/991b1b?text=Pet+Bed",      badge: "Top Rated",   description: "Ultra-soft orthopedic pet bed. Machine washable cover with non-slip bottom." },
  { id: 5,  name: "Vitamin C Supplement for Pets",  category: "healthcare",  price: 120000, rating: 4.6, reviews: 45,  image: "https://placehold.co/300x300/e9d5ff/6b21a8?text=Vitamins",    badge: null,          description: "Daily vitamin supplement to boost immunity and overall health for dogs and cats." },
  { id: 6,  name: "Interactive Feather Toy",        category: "accessories", price: 65000,  rating: 4.4, reviews: 78,  image: "https://placehold.co/300x300/fed7aa/9a3412?text=Cat+Toy",     badge: "New",         description: "Stimulating feather wand toy to keep your cat active and entertained for hours." },
  { id: 7,  name: "Pedigree Puppy Food",            category: "food",        price: 180000, rating: 4.3, reviews: 67,  image: "https://placehold.co/300x300/fde68a/92400e?text=Puppy+Food",  badge: null,          description: "Specially formulated for puppies. Supports brain development and strong bones." },
  { id: 8,  name: "Anti-Flea Shampoo",              category: "healthcare",  price: 95000,  rating: 4.5, reviews: 112, image: "https://placehold.co/300x300/bae6fd/0c4a6e?text=Shampoo",     badge: "Sale",        description: "Gentle yet effective anti-flea shampoo. Safe for dogs and cats over 3 months." },
  { id: 9,  name: "Stainless Steel Food Bowl Set",  category: "accessories", price: 110000, rating: 4.7, reviews: 91,  image: "https://placehold.co/300x300/d1fae5/065f46?text=Bowl+Set",    badge: null,          description: "Durable stainless steel bowls. Dishwasher safe, non-slip base, set of 2." },
  { id: 10, name: "Dental Chew Sticks",             category: "healthcare",  price: 75000,  rating: 4.6, reviews: 134, image: "https://placehold.co/300x300/fef3c7/92400e?text=Dental+Chew", badge: "Best Seller", description: "Reduces tartar and freshens breath. Made with natural ingredients, no artificial colors." },
  { id: 11, name: "Cat Litter Premium",             category: "accessories", price: 130000, rating: 4.4, reviews: 88,  image: "https://placehold.co/300x300/e0e7ff/3730a3?text=Cat+Litter",  badge: null,          description: "Clumping cat litter with odor control. Low dust formula, 99.9% dust free." },
  { id: 12, name: "Omega-3 Fish Oil Drops",         category: "healthcare",  price: 145000, rating: 4.8, reviews: 59,  image: "https://placehold.co/300x300/fce7f3/9d174d?text=Fish+Oil",    badge: "New",         description: "Pure fish oil supplement for shiny coat and healthy joints. Easy dropper application." },
];

export const services: Service[] = [
  { id: 1, name: "Full Grooming Package",    icon: "✂️", price: 250000, duration: "2-3 hours",  description: "Bath, blow dry, haircut, nail trim, ear cleaning, and cologne spray.",                                    rating: 4.9, reviews: 312 },
  { id: 2, name: "Basic Bath & Brush",       icon: "🛁", price: 120000, duration: "1-1.5 hours", description: "Shampoo, conditioner, blow dry, and brush out. Perfect for regular maintenance.",                        rating: 4.7, reviews: 198 },
  { id: 3, name: "Veterinary Consultation",  icon: "🩺", price: 200000, duration: "30-45 min",   description: "General health check-up with our certified veterinarians. Includes basic diagnosis.",                    rating: 4.8, reviews: 445 },
  { id: 4, name: "Vaccination Package",      icon: "💉", price: 350000, duration: "20-30 min",   description: "Core vaccines for dogs and cats. Includes health certificate and vaccination record.",                    rating: 4.9, reviews: 267 },
  { id: 5, name: "Dental Cleaning",          icon: "🦷", price: 300000, duration: "1-2 hours",   description: "Professional dental scaling and polishing under sedation. Prevents periodontal disease.",                 rating: 4.6, reviews: 89  },
  { id: 6, name: "Pet Hotel (per night)",    icon: "🏨", price: 180000, duration: "24 hours",    description: "Safe and comfortable overnight stay. Includes meals, playtime, and daily updates.",                       rating: 4.8, reviews: 156 },
];

export const testimonials: Testimonial[] = [
  { id: 1, name: "Nguyễn Thị Lan",  avatar: "https://placehold.co/60x60/fde68a/92400e?text=NL", rating: 5, comment: "Dịch vụ tuyệt vời! Chú chó của tôi rất thích được chăm sóc ở đây. Nhân viên rất thân thiện và chuyên nghiệp.", pet: "Golden Retriever - Max" },
  { id: 2, name: "Trần Văn Minh",   avatar: "https://placehold.co/60x60/bfdbfe/1e40af?text=TM", rating: 5, comment: "Sản phẩm chất lượng cao, giao hàng nhanh. Mèo nhà tôi rất thích thức ăn mới. Sẽ tiếp tục ủng hộ!",          pet: "Persian Cat - Luna"    },
  { id: 3, name: "Phạm Thu Hương",  avatar: "https://placehold.co/60x60/bbf7d0/166534?text=PH", rating: 4, comment: "AI chatbot rất hữu ích khi tôi cần tư vấn về sức khỏe thú cưng lúc nửa đêm. Tiện lợi và chính xác!",         pet: "Shih Tzu - Bông"       },
  { id: 4, name: "Lê Quốc Bảo",    avatar: "https://placehold.co/60x60/fecaca/991b1b?text=LB", rating: 5, comment: "Đặt lịch khám rất dễ dàng. Bác sĩ thú y rất tận tâm và giải thích rõ ràng về tình trạng sức khỏe của thú cưng.", pet: "Corgi - Pudding"       },
];

export const chatbotResponses: Record<string, string> = {
  "xin chào":  "Xin chào! Tôi là PetBot 🐾 Tôi có thể giúp bạn tư vấn về chăm sóc thú cưng, sản phẩm, và dịch vụ. Bạn cần hỗ trợ gì?",
  "hello":     "Hello! I'm PetBot 🐾 I can help you with pet care advice, products, and services. What do you need?",
  "thức ăn":   "Để chọn thức ăn phù hợp, bạn cần xem xét: tuổi, cân nặng, và tình trạng sức khỏe của thú cưng. Bạn đang nuôi loại thú cưng nào?",
  "food":      "To choose the right food, consider your pet's age, weight, and health condition. What type of pet do you have?",
  "tiêm phòng":"Lịch tiêm phòng cơ bản cho chó: 6-8 tuần (Parvo, Distemper), 12 tuần (Rabies). Bạn muốn đặt lịch tiêm phòng không?",
  "vaccine":   "Basic vaccination schedule for dogs: 6-8 weeks (Parvo, Distemper), 12 weeks (Rabies). Would you like to book a vaccination appointment?",
  "grooming":  "Chúng tôi có các gói grooming từ 120,000đ. Tần suất grooming phụ thuộc vào giống chó: lông dài cần 4-6 tuần/lần, lông ngắn 8-12 tuần/lần.",
  "default":   "Cảm ơn bạn đã liên hệ! 🐾 Tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi về: thức ăn, tiêm phòng, grooming, hoặc các dịch vụ khác.",
};

export const orderHistory: Order[] = [
  { id: "ORD-001", date: "2026-03-15", status: "Delivered",  total: 405000, items: [{ name: "Royal Canin Adult Dog Food", qty: 1, price: 320000 }, { name: "Dental Chew Sticks", qty: 1, price: 75000 }] },
  { id: "ORD-002", date: "2026-03-28", status: "Processing", total: 215000, items: [{ name: "Anti-Flea Shampoo", qty: 1, price: 95000 }, { name: "Interactive Feather Toy", qty: 1, price: 65000 }, { name: "Vitamin C Supplement", qty: 1, price: 55000 }] },
  { id: "ORD-003", date: "2026-04-01", status: "Shipped",    total: 450000, items: [{ name: "Cozy Pet Bed (Medium)", qty: 1, price: 450000 }] },
];
