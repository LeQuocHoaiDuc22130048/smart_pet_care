# Homepage Feedback Display Fix

## Problem
The Homepage feedback section was showing empty because:
1. It was using `getGeneral()` which returns empty array (general feedbacks were removed)
2. The `feedbacks` state from FeedbackContext only contains feedbacks from currently viewed product
3. No feedbacks were being loaded on Homepage mount

## Solution
Changed Homepage to load and display user's own feedbacks (similar to FeedbackPage):

### Changes Made

1. **Added imports**:
   - `AnimatePresence` from motion/react (for slider animation)
   - `Feedback` type from FeedbackContext
   - `feedbackApi` from lib/feedbackApi
   - `toast` from sonner
   - `useAuth` hook

2. **Added local state**:
   ```typescript
   const [homepageFeedbacks, setHomepageFeedbacks] = useState<Feedback[]>([]);
   const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
   ```

3. **Added useEffect to load feedbacks**:
   - Loads user's feedbacks via `feedbackApi.getMyFeedbacks(0, 10)`
   - Converts API response to UI format
   - Only loads if user is authenticated
   - Clears feedbacks if user logs out

4. **Updated feedback slider**:
   - Uses `homepageFeedbacks` instead of `getGeneral()`
   - Shows loading state while fetching
   - Shows login prompt if not authenticated
   - Shows empty state with call-to-action if no feedbacks
   - Displays feedbacks with slider animation if available

5. **Updated rating stats**:
   - Uses `homepageFeedbacks` instead of `feedbacks` from context
   - Shows "X đánh giá của bạn" instead of "X đánh giá từ khách hàng"
   - Only shows bar chart if user is logged in and has feedbacks

## User Experience

### Not Logged In
- Shows lock icon 🔒
- Message: "Đăng nhập để xem đánh giá của bạn"
- Button: "Đăng nhập ngay" → navigates to /login

### Logged In - No Feedbacks
- Shows chat icon 💬
- Message: "Bạn chưa có đánh giá nào. Hãy là người đầu tiên!"
- Button: "Mua sắm và đánh giá" → navigates to /products

### Logged In - Has Feedbacks
- Shows rating stats (average, distribution)
- Displays feedback slider with auto-rotation (5 seconds)
- Shows up to 3 feedbacks at once (1 featured + 2 in grid)
- Dots navigation for manual control

## Files Modified
- `front_end/pet_care_smart/src/pages/Homepage.tsx`

## Testing
1. Visit homepage without login → should show login prompt
2. Login with account that has no feedbacks → should show empty state
3. Login with account that has feedbacks → should show feedbacks with slider
4. Check that slider auto-rotates every 5 seconds
5. Click dots to manually navigate feedbacks

## Notes
- Homepage now shows **user's own feedbacks** (not all feedbacks from system)
- This is consistent with FeedbackPage behavior
- Backend has no "get all feedbacks" endpoint for public display
- If you need to show featured/public feedbacks, backend needs new endpoint
