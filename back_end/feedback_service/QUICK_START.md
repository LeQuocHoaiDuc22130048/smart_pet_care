# 🚀 Quick Start - Feedback Service

## Bước 1: Cài đặt MongoDB

```bash
# Sử dụng Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Hoặc cài đặt MongoDB Community Edition
# https://www.mongodb.com/try/download/community
```

## Bước 2: Cấu hình Environment

Tạo file `.env` trong thư mục `feedback_service`:

```bash
MONGODB_URI=mongodb://localhost:27017/pet_care_feedback
JWT_SIGNER_KEY=your_jwt_secret_key_from_identity_service
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Bước 3: Build & Run

### Option 1: Maven
```bash
cd back_end/feedback_service
mvn clean install
mvn spring-boot:run
```

### Option 2: Docker
```bash
cd back_end/feedback_service
docker build -t petcare-feedback .
docker run -p 8088:8088 --env-file .env petcare-feedback
```

### Option 3: Docker Compose (Recommended)
```bash
cd back_end
docker-compose up -d feedback-service
```

## Bước 4: Kiểm tra Service

```bash
# Health check
curl http://localhost:8088/pet_care_feedback/actuator/health

# Hoặc truy cập MongoDB
mongosh mongodb://localhost:27017/pet_care_feedback
```

## Bước 5: Test API

### 1. Đăng nhập để lấy JWT Token
```bash
curl -X POST http://localhost:8888/api/v1/pet_care_identity/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user01",
    "password": "12345678"
  }'
```

### 2. Tạo đánh giá sản phẩm
```bash
curl -X POST http://localhost:8888/api/v1/pet_care_feedback/feedbacks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F 'request={
    "type": "PRODUCT",
    "productId": "product-uuid-here",
    "rating": 5,
    "comment": "Sản phẩm rất tốt, chất lượng cao!"
  };type=application/json' \
  -F 'images=@/path/to/image1.jpg' \
  -F 'images=@/path/to/image2.jpg'
```

### 3. Xem đánh giá sản phẩm (Public - không cần token)
```bash
curl http://localhost:8888/api/v1/pet_care_feedback/feedbacks/product/PRODUCT_ID?page=0&size=10
```

### 4. Xem thống kê đánh giá (Public)
```bash
curl http://localhost:8888/api/v1/pet_care_feedback/feedbacks/stats/product/PRODUCT_ID
```

### 5. Xem đánh giá của mình
```bash
curl http://localhost:8888/api/v1/pet_care_feedback/feedbacks/my?page=0&size=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 MongoDB Queries

```javascript
// Kết nối MongoDB
mongosh mongodb://localhost:27017/pet_care_feedback

// Xem tất cả feedbacks
db.feedbacks.find().pretty()

// Đếm số lượng feedback theo rating
db.feedbacks.aggregate([
  { $group: { _id: "$rating", count: { $sum: 1 } } },
  { $sort: { _id: -1 } }
])

// Tìm feedback của một sản phẩm
db.feedbacks.find({ productId: "your-product-id" }).pretty()

// Tính rating trung bình của sản phẩm
db.feedbacks.aggregate([
  { $match: { productId: "your-product-id", status: "APPROVED" } },
  { $group: { _id: null, avgRating: { $avg: "$rating" } } }
])

// Xóa tất cả feedbacks (test only)
db.feedbacks.deleteMany({})
```

## 🔧 Troubleshooting

### Lỗi: Cannot connect to MongoDB
```bash
# Kiểm tra MongoDB đang chạy
docker ps | grep mongodb

# Xem logs
docker logs mongodb

# Restart MongoDB
docker restart mongodb
```

### Lỗi: Image upload failed
- Kiểm tra Cloudinary credentials trong `.env`
- Đảm bảo file size < 5MB
- Chỉ chấp nhận JPG, PNG

### Lỗi: JWT validation failed
- Đảm bảo `JWT_SIGNER_KEY` giống với Identity Service
- Token phải còn hạn (chưa expire)

## 📝 Notes

- Service chạy trên port `8088`
- Context path: `/pet_care_feedback`
- MongoDB database: `pet_care_feedback`
- Collection: `feedbacks`
- Tự động tạo indexes khi khởi động

## 🎯 Next Steps

1. Tích hợp với Product Service để verify sản phẩm
2. Tích hợp với Order Service để verify purchase
3. Thêm email notification khi có admin response
4. Implement helpful/not helpful voting
5. Thêm AI moderation cho spam detection
