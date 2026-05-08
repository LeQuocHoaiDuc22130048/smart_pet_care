# Feedback Images Feature

## Overview
Users can now upload images when submitting feedback. Images are stored on Cloudinary and displayed in the feedback cards.

## Features

### 1. Image Upload in Feedback Form
- **Location**: `FeedbackForm.tsx`
- **Max Images**: 5 images per feedback
- **Max Size**: 5MB per image
- **Formats**: JPG, JPEG, PNG
- **Preview**: Shows image previews before submission
- **Remove**: Can remove images before submission

### 2. Image Display in Feedback Card
- **Location**: `FeedbackCard.tsx`
- **Layout**: Responsive grid (2-4 columns based on screen size)
- **Hover Effect**: Scale animation on hover
- **Click to Zoom**: Opens full-size image in modal
- **Modal**: Full-screen overlay with close button

## Implementation Details

### Frontend

#### FeedbackForm.tsx
```typescript
// Image state
const [images, setImages] = useState<File[]>([]);
const [imagePreviews, setImagePreviews] = useState<string[]>([]);

// Validation
- Max 5 images
- Max 5MB per image
- Only JPG, JPEG, PNG formats

// Upload
- Images sent as multipart/form-data
- Field name: "images"
```

#### FeedbackCard.tsx
```typescript
// Display images in grid
{f.imageUrls && f.imageUrls.length > 0 && (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2'>
        {f.imageUrls.map((url, idx) => (
            <img src={url} alt={`Feedback image ${idx + 1}`} />
        ))}
    </div>
)}

// Modal for full-size view
- Click image to open modal
- Click outside or X button to close
- Prevents body scroll when open
```

#### FeedbackContext.tsx
```typescript
// Feedback interface includes imageUrls
interface Feedback {
    imageUrls?: string[];  // Array of Cloudinary URLs
}

// Adapter converts API response
function adaptApiFeedback(apiFeedback: ApiFeedback): Feedback {
    return {
        imageUrls: apiFeedback.imageUrls,
        // ... other fields
    };
}
```

### Backend

#### CloudinaryService.java
```java
// Upload single image
public String uploadImage(MultipartFile file) {
    // Validates: size, format, content type
    // Uploads to: pet_care/feedbacks folder
    // Returns: secure_url from Cloudinary
}

// Upload multiple images
public List<String> uploadImages(List<MultipartFile> files) {
    // Uploads each file sequentially
    // Returns list of URLs
}
```

#### FeedbackController.java
```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ApiResponse<FeedbackResponse> createFeedback(
    @RequestPart("request") CreateFeedbackRequest request,
    @RequestPart(value = "images", required = false) List<MultipartFile> images
) {
    // Images are optional
    // Uploaded to Cloudinary
    // URLs stored in MongoDB
}
```

#### Cloudinary Configuration
```yaml
cloudinary:
  cloud-name: ${CLOUDINARY_CLOUD_NAME}
  api-key: ${CLOUDINARY_API_KEY}
  api-secret: ${CLOUDINARY_API_SECRET}
```

## Image Storage

### Cloudinary
- **Folder**: `pet_care/feedbacks/`
- **Format**: Original format preserved
- **URL**: Secure HTTPS URLs
- **CDN**: Automatic CDN delivery
- **Optimization**: Automatic format optimization

### MongoDB
- **Collection**: `feedbacks`
- **Field**: `imageUrls` (Array of Strings)
- **Example**:
```json
{
    "_id": "feedback123",
    "imageUrls": [
        "https://res.cloudinary.com/dwgy7eahq/image/upload/v1234567890/pet_care/feedbacks/abc123.jpg",
        "https://res.cloudinary.com/dwgy7eahq/image/upload/v1234567890/pet_care/feedbacks/def456.jpg"
    ]
}
```

## Validation Rules

### Frontend Validation
1. **File Count**: Maximum 5 images
2. **File Size**: Maximum 5MB per image
3. **File Type**: Only image files (checked by input accept attribute)
4. **Format**: JPG, JPEG, PNG (checked by file extension)

### Backend Validation
1. **File Empty**: Rejects empty files
2. **File Size**: Maximum 5MB (5 * 1024 * 1024 bytes)
3. **Content Type**: Must start with "image/"
4. **Format**: Only jpg, jpeg, png extensions allowed

## Error Handling

### Frontend Errors
- "Chỉ được tải lên tối đa 5 ảnh" - Too many images
- "Kích thước ảnh không được vượt quá 5MB" - File too large
- Toast notification on upload failure

### Backend Errors
- `INVALID_IMAGE_FORMAT` (6006) - Invalid format or empty file
- `IMAGE_TOO_LARGE` (6007) - File exceeds 5MB
- `IMAGE_UPLOAD_FAILED` (6008) - Cloudinary upload failed

## UI/UX Features

### Image Preview
- Shows thumbnails before submission
- Remove button on hover
- Grid layout (3 columns)

### Image Display
- Responsive grid (2-4 columns)
- Aspect ratio maintained (square)
- Lazy loading for performance
- Hover scale effect

### Image Modal
- Full-screen overlay
- Black semi-transparent background
- Close button (top-right)
- Click outside to close
- Prevents event bubbling

## Performance Considerations

1. **Lazy Loading**: Images use `loading='lazy'` attribute
2. **CDN**: Cloudinary provides automatic CDN
3. **Optimization**: Cloudinary auto-optimizes images
4. **Sequential Upload**: Images uploaded one by one (could be parallelized)

## Future Enhancements

1. **Image Compression**: Compress images before upload
2. **Parallel Upload**: Upload multiple images simultaneously
3. **Progress Indicator**: Show upload progress
4. **Image Carousel**: Navigate between images in modal
5. **Thumbnail Generation**: Generate thumbnails for faster loading
6. **Image Editing**: Crop, rotate, filter before upload
7. **Drag & Drop**: Drag and drop image upload
8. **Paste from Clipboard**: Paste images directly

## Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images (up to 5)
- [ ] Try to upload more than 5 images (should show error)
- [ ] Try to upload file larger than 5MB (should show error)
- [ ] Try to upload non-image file (should be blocked by input)
- [ ] Remove image before submission
- [ ] Submit feedback with images
- [ ] View feedback with images
- [ ] Click image to open modal
- [ ] Close modal by clicking X
- [ ] Close modal by clicking outside
- [ ] Check images display correctly on mobile
- [ ] Check images display correctly on tablet
- [ ] Check images display correctly on desktop
