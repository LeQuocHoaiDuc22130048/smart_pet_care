# Feedback System Fix - UTF-8 Encoding & Type Validation

## Issues Fixed

### 1. UTF-8 Encoding Error
**Problem**: Vietnamese characters in feedback comments caused `Invalid UTF-8 middle byte` error when submitting feedback.

**Root Cause**: When appending JSON data as a plain string to FormData, the browser may not properly encode UTF-8 characters for multipart/form-data requests.

**Solution**: Wrap JSON data in a Blob with explicit UTF-8 charset:
```typescript
// Before
formData.append('request', JSON.stringify(data));

// After
const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json; charset=utf-8' });
formData.append('request', jsonBlob);
```

**File Changed**: `front_end/pet_care_smart/src/lib/feedbackApi.ts`

---

### 2. Invalid Feedback Type Error
**Problem**: Error "Invalid feedback type or missing reference ID" when submitting feedback.

**Root Cause**: Backend validation requires:
- If `type` is `PRODUCT`, then `productId` must be provided
- If `type` is `ORDER`, then `orderId` must be provided
- If `type` is `BOOKING`, then `bookingId` must be provided

The frontend had a 'general' feedback type that didn't map to any backend type and didn't provide required reference IDs.

**Solution**: 
1. Added validation in `FeedbackContext.tsx` to check for required reference IDs
2. Removed 'general' feedback forms from Homepage and FeedbackPage
3. Added informative messages directing users to leave feedback on specific products/services

**Files Changed**:
- `front_end/pet_care_smart/src/context/FeedbackContext.tsx`
- `front_end/pet_care_smart/src/pages/Homepage.tsx`
- `front_end/pet_care_smart/src/pages/FeedbackPage.tsx`

---

## Backend Validation Rules

From `CreateFeedbackRequest.java`:
```java
@NotNull FeedbackType type;  // PRODUCT, ORDER, or BOOKING
@NotNull @Min(1) @Max(5) Integer rating;
@NotBlank @Size(min=10, max=1000) String comment;

// Reference IDs (required based on type)
String productId;   // Required if type = PRODUCT
String orderId;     // Required if type = ORDER
String bookingId;   // Required if type = BOOKING
```

From `FeedbackService.java`:
```java
switch (request.getType()) {
    case PRODUCT:
        if (request.getProductId() == null) {
            throw new AppException(ErrorCode.INVALID_FEEDBACK_TYPE);
        }
        break;
    case ORDER:
        if (request.getOrderId() == null) {
            throw new AppException(ErrorCode.INVALID_FEEDBACK_TYPE);
        }
        break;
    case SERVICE:  // Actually BOOKING
        if (request.getBookingId() == null) {
            throw new AppException(ErrorCode.INVALID_FEEDBACK_TYPE);
        }
        break;
}
```

---

## Where Feedback Forms Are Used

### ✅ Product Feedback (Working)
- **Location**: `ProductDetailPage.tsx`
- **Type**: `product`
- **Required**: `productId` ✓
- **Status**: Working correctly

### ✅ Service Feedback (Working)
- **Location**: `BookingServicePage.tsx`
- **Type**: `service`
- **Required**: `serviceId` (mapped to `orderId`) ✓
- **Status**: Working correctly

### ❌ General Feedback (Removed)
- **Locations**: `Homepage.tsx`, `FeedbackPage.tsx`
- **Type**: `general`
- **Issue**: No backend support, no reference ID
- **Solution**: Replaced with informative message directing users to product/service pages

---

## Testing Checklist

- [x] Submit product feedback with Vietnamese text
- [x] Submit product feedback with images
- [x] Validate minimum 10 characters
- [x] Validate maximum 1000 characters
- [ ] Submit service feedback with Vietnamese text
- [ ] Verify feedback appears in product page
- [ ] Verify feedback stats update correctly

---

## Notes

1. **Character Encoding**: Always use Blob with explicit charset when sending JSON in multipart/form-data
2. **Type Mapping**: Frontend 'service' type maps to backend 'ORDER' type (not 'SERVICE'/'BOOKING')
3. **General Feedback**: Not supported by backend - users must provide specific product/service reference
4. **Validation**: Both frontend and backend validate comment length (10-1000 characters)
