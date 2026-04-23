# 🌟 Feedback Service

Service quản lý đánh giá và phản hồi cho hệ thống PetCareSmart.

## 📋 Tính Năng

### User Features
- ⭐ Đánh giá sản phẩm (1-5 sao + comment + hình ảnh)
- 📝 Đánh giá đơn hàng
- 🏥 Đánh giá dịch vụ booking
- 💬 Phản hồi chung về hệ thống
- ✏️ Chỉnh sửa đánh giá trong 24 giờ
- 🖼️ Upload tối đa 5 hình ảnh/đánh giá
- 📊 Xem thống kê đánh giá sản phẩm

### Admin Features
- 💬 Trả lời đánh giá của khách hàng
- ✅ Duyệt/từ chối đánh giá
- 🔒 Ẩn đánh giá không phù hợp
- 📈 Quản lý tất cả đánh giá theo trạng thái

## 🛠️ Tech Stack

- **Framework:** Spring Boot 3.5.6
- **Database:** MongoDB 7.0
- **Image Storage:** Cloudinary
- **Security:** OAuth2 Resource Server (JWT)
- **Message Queue:** RabbitMQ
- **Java Version:** 21

## 📦 Database Schema

### Feedback Collection (MongoDB)
```javascript
{
  _id: ObjectId,
  userId: String,
  username: String,
  type: "PRODUCT" | "ORDER" | "SERVICE" | "SYSTEM",
  productId: String,      // For PRODUCT type
  orderId: String,        // For ORDER type
  bookingId: String,      // For SERVICE type
  rating: Number (1-5),
  comment: String,
  imageUrls: [String],
  status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN",
  adminResponse: String,
  adminResponseAt: DateTime,
  helpfulCount: Number,
  notHelpfulCount: Number,
  verifiedPurchase: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

## 🚀 API Endpoints

### User Endpoints

#### Create Feedback
```http
POST /feedbacks
Content-Type: multipart/form-data
Authorization: Bearer <token>

request: {
  "type": "PRODUCT",
  "productId": "uuid",
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}
images: [file1.jpg, file2.jpg]
```

#### Update Feedback
```http
PUT /feedbacks/{feedbackId}
Authorization: Bearer <token>

{
  "rating": 4,
  "comment": "Updated comment"
}
```

#### Get My Feedbacks
```http
GET /feedbacks/my?page=0&size=10
Authorization: Bearer <token>
```

#### Get Product Feedbacks (Public)
```http
GET /feedbacks/product/{productId}?page=0&size=10
```

#### Get Product Statistics (Public)
```http
GET /feedbacks/stats/product/{productId}

Response:
{
  "totalFeedbacks": 150,
  "averageRating": 4.5,
  "ratingDistribution": {
    "5": 80,
    "4": 50,
    "3": 15,
    "2": 3,
    "1": 2
  },
  "verifiedPurchaseCount": 120
}
```

### Admin Endpoints

#### Add Admin Response
```http
POST /feedbacks/{feedbackId}/response
Authorization: Bearer <admin-token>

{
  "response": "Cảm ơn bạn đã đánh giá!"
}
```

#### Update Status
```http
PATCH /feedbacks/{feedbackId}/status?status=APPROVED
Authorization: Bearer <admin-token>
```

#### Get Feedbacks by Status
```http
GET /feedbacks/admin/status/PENDING?page=0&size=10
Authorization: Bearer <admin-token>
```

## 🔧 Configuration

### Environment Variables
```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/pet_care_feedback

# JWT
JWT_SIGNER_KEY=your_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672

# Service URLs
ORDER_SERVICE_URL=http://localhost:8083/pet_care_order
PRODUCT_SERVICE_URL=http://localhost:8081/pet_care_product
```

## 🏃 Running the Service

### Local Development
```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Run service
mvn spring-boot:run
```

### Docker
```bash
# Build image
docker build -t petcare-feedback .

# Run container
docker run -p 8088:8088 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/pet_care_feedback \
  -e JWT_SIGNER_KEY=your_key \
  petcare-feedback
```

### Docker Compose
```bash
cd back_end
docker-compose up -d feedback-service
```

## 📝 Business Rules

1. **Duplicate Prevention:** User chỉ được đánh giá 1 lần cho mỗi sản phẩm/đơn hàng/booking
2. **Edit Time Limit:** Chỉ được chỉnh sửa trong 24 giờ sau khi tạo
3. **Image Limits:** 
   - Tối đa 5 ảnh/đánh giá
   - Kích thước tối đa: 5MB/ảnh
   - Format: JPG, PNG
4. **Auto-Approval:** Đánh giá tự động được duyệt (có thể thay đổi thành PENDING)
5. **Verified Purchase:** Tự động đánh dấu nếu user đã mua sản phẩm

## 🔐 Security

- JWT authentication required for all endpoints except public views
- Admin role required for moderation endpoints
- Image upload validation (size, format)
- XSS protection in comments

## 📊 Monitoring

Service logs are available at:
```bash
docker-compose logs -f feedback-service
```

## 🧪 Testing

```bash
# Run tests
mvn test

# Run with coverage
mvn test jacoco:report
```

## 📈 Future Enhancements

- [ ] Helpful/Not Helpful voting system
- [ ] Report inappropriate feedback
- [ ] AI-powered sentiment analysis
- [ ] Automatic spam detection
- [ ] Email notifications for admin responses
- [ ] Verified purchase badge integration with Order Service
- [ ] Image moderation using AI

## 🤝 Integration Points

- **Order Service:** Verify completed orders for product reviews
- **Product Service:** Validate product existence
- **Identity Service:** JWT validation
- **Cloudinary:** Image storage
- **RabbitMQ:** Event publishing (future)

## 📞 Support

Port: `8088`  
Context Path: `/pet_care_feedback`  
Health Check: `http://localhost:8088/pet_care_feedback/actuator/health`
