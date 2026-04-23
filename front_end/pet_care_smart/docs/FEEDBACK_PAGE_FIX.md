# Feedback Page Fix - Display User's Feedbacks

## Issue
FeedbackPage (route `/feedback`) was showing empty list because:
1. It was using `feedbacks` state from FeedbackContext
2. This state only contains feedbacks from currently viewed product
3. There's no "get all feedbacks" endpoint in backend
4. Page was designed to show "all feedbacks" but had no data

## Root Cause Analysis

### Backend Endpoints Available
- `GET /feedbacks/my` - Get current user's feedbacks ✅
- `GET /feedbacks/product/{id}` - Get product feedbacks ✅
- `GET /feedbacks/order/{id}` - Get order feedbacks ✅
- ❌ No endpoint for "get all feedbacks from all users"

### Frontend State
- `feedbacks` state in FeedbackContext only contains:
  - Feedbacks loaded by `loadProductFeedbacks(productId)`
  - Only populated when viewing a product detail page
  - Empty when navigating directly to `/feedback`

## Solution

Changed FeedbackPage from "All Feedbacks" to "My Feedbacks":

### 1. Load User's Feedbacks
```typescript
useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadMyFeedbacks = async () => {
        const response = await feedbackApi.getMyFeedbacks(0, 100);
        setFeedbacks(response.result.content);
    };
    
    loadMyFeedbacks();
}, [isAuthenticated]);
```

### 2. Show Login Required
If user not authenticated:
```typescript
if (!isAuthenticated) {
    return (
        <Card>
            <p>Vui lòng đăng nhập</p>
            <p>Đăng nhập để xem đánh giá của bạn</p>
        </Card>
    );
}
```

### 3. Show Loading State
While fetching feedbacks:
```typescript
if (loading) {
    return (
        <div>
            <Spinner />
            <p>Đang tải đánh giá...</p>
        </div>
    );
}
```

### 4. Update UI Text
- Title: "Đánh giá & Nhận xét" → "Đánh giá của tôi"
- Subtitle: "Ý kiến của bà con..." → "Quản lý tất cả đánh giá của bạn"
- Header: "Tất cả đánh giá" → "Đánh giá của tôi"

### 5. Remove "Tổng thể" Filter
- Removed "Tổng thể" filter (general feedback not supported)
- Kept "Tất cả", "Sản phẩm", "Dịch vụ"

## Changes Made

### Files Modified
- `front_end/pet_care_smart/src/pages/FeedbackPage.tsx`

### New Imports
```typescript
import { useAuth } from '@/context/AuthContext';
import { feedbackApi } from '@/lib/feedbackApi';
import { toast } from 'sonner';
import { motion } from 'motion/react';
```

### New State
```typescript
const [feedbacks, setFeedbacks] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
```

### New Logic
1. Check authentication status
2. Load user's feedbacks from API
3. Show appropriate UI based on state
4. Filter and sort feedbacks

## User Experience

### Before
- Page showed empty list
- No explanation why empty
- Confusing for users

### After
- Shows user's own feedbacks
- Clear message if not logged in
- Loading state while fetching
- Proper error handling

## API Endpoint Used

### GET /feedbacks/my
```
GET /api/v1/pet_care_feedback/feedbacks/my?page=0&size=100
Authorization: Bearer {token}

Response:
{
    "result": {
        "content": [
            {
                "id": "feedback-id",
                "type": "PRODUCT",
                "productId": "product-id",
                "rating": 5,
                "comment": "Great product!",
                "imageUrls": ["url1", "url2"],
                "username": "user123",
                "createdAt": "2026-04-23T...",
                "helpfulCount": 10,
                "verifiedPurchase": true
            }
        ],
        "totalElements": 5,
        "totalPages": 1
    }
}
```

## Data Transformation

API response → UI format:
```typescript
{
    id: f.id,
    type: f.type === 'PRODUCT' ? 'product' : 'service',
    rating: f.rating,
    title: '',
    content: f.comment,
    authorName: f.username,
    date: new Date(f.createdAt).toLocaleDateString('vi-VN'),
    productId: f.productId,
    helpful: f.helpfulCount,
    verified: f.verifiedPurchase,
    imageUrls: f.imageUrls,
}
```

## Features

### Filters
- **Tất cả**: Show all feedbacks
- **Sản phẩm**: Show only product feedbacks
- **Dịch vụ**: Show only service feedbacks
- **Star filters**: Filter by rating (1-5 stars)

### Sorting
- **Mới nhất**: Sort by date (newest first)
- **Hữu ích nhất**: Sort by helpful count
- **Đánh giá cao**: Sort by rating (highest first)
- **Đánh giá thấp**: Sort by rating (lowest first)

### Display
- Rating summary at top
- Feedback cards with images
- Empty state if no feedbacks
- Responsive layout

## Future Enhancements

### 1. Pagination
Currently loads 100 feedbacks at once. Could add pagination:
```typescript
const [page, setPage] = useState(0);
const loadMore = () => setPage(p => p + 1);
```

### 2. Edit/Delete
Add ability to edit or delete own feedbacks:
```typescript
<Button onClick={() => handleEdit(feedback.id)}>Edit</Button>
<Button onClick={() => handleDelete(feedback.id)}>Delete</Button>
```

### 3. Filter by Date Range
Add date range picker:
```typescript
<DateRangePicker onChange={handleDateChange} />
```

### 4. Search
Add search functionality:
```typescript
<Input 
    placeholder="Tìm kiếm đánh giá..." 
    onChange={handleSearch}
/>
```

### 5. Export
Allow users to export their feedbacks:
```typescript
<Button onClick={exportToCSV}>Export CSV</Button>
```

## Testing Checklist

- [ ] Page loads without errors
- [ ] Shows login message when not authenticated
- [ ] Shows loading state while fetching
- [ ] Displays user's feedbacks correctly
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Star filters work correctly
- [ ] Images display correctly
- [ ] Rating summary shows correct data
- [ ] Empty state shows when no feedbacks
- [ ] Error handling works
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

## Known Limitations

1. **No Real-time Updates**: Feedbacks don't update automatically when new feedback is added elsewhere
2. **No Pagination**: Loads all feedbacks at once (max 100)
3. **No Edit/Delete**: Can't edit or delete feedbacks from this page
4. **No Search**: Can't search through feedbacks
5. **No Export**: Can't export feedbacks

## Migration Notes

If you need to show "all feedbacks from all users":
1. Backend needs new endpoint: `GET /feedbacks/all` (admin only)
2. Add admin check in frontend
3. Update FeedbackPage to use new endpoint
4. Consider pagination for large datasets

## Related Documentation

- `FEEDBACK_INTEGRATION.md` - API integration guide
- `FEEDBACK_FIX.md` - Previous fixes
- `FEEDBACK_IMAGES.md` - Image handling
