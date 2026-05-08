# 📝 Hướng dẫn tích hợp Feedback Service

## 🎯 Tổng quan

Feedback Service đã được tích hợp hoàn toàn vào frontend với các tính năng:
- ✅ Tạo đánh giá với upload ảnh (tối đa 5 ảnh)
- ✅ Xem đánh giá sản phẩm
- ✅ Thống kê đánh giá (rating distribution)
- ✅ Đánh giá đã mua hàng (verified purchase)
- ✅ Admin response
- ✅ Helpful/Not helpful voting

## 📁 Files đã tạo/cập nhật

### 1. API Layer
- **`src/lib/feedbackApi.ts`** - API client cho Feedback Service
  - Tất cả endpoints đã được implement
  - Hỗ trợ multipart/form-data cho upload ảnh
  - Type-safe với TypeScript

### 2. Context Layer
- **`src/context/FeedbackContext.tsx`** - Đã cập nhật
  - Tích hợp API thực
  - Adapter pattern để tương thích với UI hiện có
  - Loading states
  - Error handling với toast notifications

### 3. Component Layer
- **`src/components/feedback/FeedbackForm.tsx`** - Đã cập nhật
  - Thêm upload ảnh với preview
  - Validation file size (max 5MB)
  - Async submission với loading state
  
- **`src/components/feedback/RatingSummary.tsx`** - Đã cập nhật
  - Hỗ trợ stats từ API
  - Fallback về local calculation
  
- **`src/components/feedback/FeedbackCard.tsx`** - Không thay đổi
  - Đã tương thích với API response

## 🚀 Cách sử dụng

### 1. Hiển thị đánh giá sản phẩm

```tsx
import { useEffect, useState } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import RatingSummary from '@/components/feedback/RatingSummary';

function ProductReviews({ productId }: { productId: string }) {
    const { getByProduct, getProductStats, loadProductFeedbacks } = useFeedback();
    const [feedbacks, setFeedbacks] = useState([]);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Load feedbacks
        loadProductFeedbacks(productId);
        
        // Load stats
        getProductStats(productId).then(setStats);
        
        // Or get feedbacks directly
        getByProduct(productId).then(setFeedbacks);
    }, [productId]);

    return (
        <div>
            {stats && <RatingSummary stats={stats} />}
            
            <div className="space-y-4 mt-6">
                {feedbacks.map(fb => (
                    <FeedbackCard key={fb.id} feedback={fb} />
                ))}
            </div>
        </div>
    );
}
```

### 2. Form tạo đánh giá

```tsx
import FeedbackForm from '@/components/feedback/FeedbackForm';

function ProductPage({ product }) {
    return (
        <div>
            <h2>Đánh giá sản phẩm</h2>
            <FeedbackForm
                type="product"
                productId={product.id}
                productName={product.name}
                onSuccess={() => {
                    console.log('Feedback submitted!');
                    // Reload feedbacks
                }}
            />
        </div>
    );
}
```

### 3. Sử dụng API trực tiếp

```tsx
import { feedbackApi } from '@/lib/feedbackApi';

// Tạo feedback
async function createFeedback() {
    const images = [file1, file2]; // File objects
    
    const response = await feedbackApi.create({
        type: 'PRODUCT',
        productId: 'product-123',
        rating: 5,
        comment: 'Sản phẩm tuyệt vời!'
    }, images);
    
    console.log('Created:', response.result);
}

// Lấy thống kê
async function getStats() {
    const response = await feedbackApi.getProductStats('product-123');
    console.log('Stats:', response.result);
    // {
    //   totalFeedbacks: 10,
    //   averageRating: 4.5,
    //   ratingDistribution: { "5": 6, "4": 3, "3": 1 },
    //   verifiedPurchaseCount: 8
    // }
}

// Admin: Thêm response
async function addResponse() {
    await feedbackApi.addAdminResponse('feedback-id', {
        response: 'Cảm ơn bạn đã đánh giá!'
    });
}

// Admin: Cập nhật status
async function updateStatus() {
    await feedbackApi.updateStatus('feedback-id', 'APPROVED');
}
```

## 🔧 API Endpoints

### Public Endpoints (không cần auth)
- `GET /feedbacks/product/{productId}` - Lấy đánh giá sản phẩm
- `GET /feedbacks/stats/product/{productId}` - Thống kê đánh giá

### User Endpoints (cần auth)
- `POST /feedbacks` - Tạo đánh giá mới (multipart/form-data)
- `PUT /feedbacks/{id}` - Cập nhật đánh giá
- `DELETE /feedbacks/{id}` - Xóa đánh giá
- `GET /feedbacks/my` - Lấy đánh giá của mình
- `POST /feedbacks/{id}/images` - Thêm ảnh vào đánh giá

### Admin Endpoints (cần role ADMIN)
- `POST /feedbacks/{id}/response` - Thêm phản hồi admin
- `PATCH /feedbacks/{id}/status` - Cập nhật trạng thái
- `GET /feedbacks/admin/status/{status}` - Lấy theo trạng thái

## 📊 Data Types

### FeedbackType
```typescript
type FeedbackType = 'PRODUCT' | 'ORDER' | 'BOOKING';
```

### FeedbackStatus
```typescript
type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
```

### Feedback Response
```typescript
interface Feedback {
    id: string;
    userId: string;
    username: string;
    type: FeedbackType;
    productId?: string;
    orderId?: string;
    rating: number;              // 1-5
    comment: string;
    imageUrls: string[];
    status: FeedbackStatus;
    adminResponse?: string;
    verifiedPurchase: boolean;
    helpfulCount: number;
    createdAt: string;
    updatedAt: string;
}
```

### Feedback Stats
```typescript
interface FeedbackStats {
    totalFeedbacks: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;  // {"5": 10, "4": 5}
    verifiedPurchaseCount: number;
}
```

## ⚠️ Lưu ý quan trọng

### 1. Upload ảnh
- Tối đa 5 ảnh mỗi feedback
- Kích thước tối đa: 5MB/ảnh
- Format: JPG, PNG
- Sử dụng multipart/form-data

### 2. Authentication
- Hầu hết endpoints yêu cầu JWT token
- Token được tự động thêm vào header nếu `requireAuth: true`
- Public endpoints: stats và product feedbacks

### 3. Error Handling
- Tất cả errors được handle trong context
- Toast notifications tự động hiển thị
- Fallback về mock data nếu API fail

### 4. Performance
- Feedbacks được cache trong context
- Chỉ load khi cần thiết
- Pagination support (page, size)

## 🎨 UI Components

### FeedbackForm
Props:
- `type`: 'product' | 'service' | 'general'
- `productId?`: string
- `productName?`: string
- `serviceId?`: string
- `serviceName?`: string
- `onSuccess?`: () => void

Features:
- Star rating với hover effect
- Text input với validation
- Image upload với preview
- Loading state
- Auto-fill user info nếu đã login

### FeedbackCard
Props:
- `feedback`: Feedback object

Features:
- User avatar
- Verified badge
- Star rating display
- Image gallery
- Admin response
- Helpful button

### RatingSummary
Props:
- `feedbacks?`: Feedback[]
- `avgRating?`: number
- `stats?`: FeedbackStats

Features:
- Average rating display
- Star distribution bars
- Total count
- Responsive design

## 🔄 Migration từ Mock Data

Context đã được thiết kế để tương thích ngược:
1. Mock data vẫn hoạt động như cũ
2. API calls được thêm vào song song
3. Adapter pattern convert API response sang UI format
4. Fallback về mock data nếu API fail

## 🧪 Testing

### Test API endpoints
```bash
# Login để lấy token
curl -X POST http://localhost:8888/api/v1/pet_care_identity/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Tạo feedback
curl -X POST http://localhost:8888/api/v1/pet_care_feedback/feedbacks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'request={"type":"PRODUCT","productId":"test-123","rating":5,"comment":"Great!"}' \
  -F 'images=@image1.jpg'

# Lấy stats
curl http://localhost:8888/api/v1/pet_care_feedback/feedbacks/stats/product/test-123
```

## 📝 TODO / Future Enhancements

- [ ] Helpful/Not helpful voting API integration
- [ ] Image lightbox/gallery view
- [ ] Feedback filtering (by rating, verified, etc.)
- [ ] Infinite scroll pagination
- [ ] Real-time updates với WebSocket
- [ ] Report inappropriate feedback
- [ ] Edit feedback with image management

## 🆘 Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra token có hợp lệ không
- Đảm bảo `requireAuth: true` được set đúng

### Upload ảnh fail
- Kiểm tra file size < 5MB
- Kiểm tra format (JPG, PNG only)
- Kiểm tra backend có nhận multipart/form-data

### Feedbacks không hiển thị
- Kiểm tra productId có đúng không
- Xem console log để debug API calls
- Kiểm tra backend service đang chạy

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Backend logs: `docker-compose logs feedback-service`
2. Browser console
3. Network tab trong DevTools
4. API response format
