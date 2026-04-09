# 💳 Payment Service - Hướng Dẫn Sử Dụng

## 📌 Giới Thiệu

Payment Service quản lý toàn bộ quy trình thanh toán trong hệ thống PetCare, từ tạo giao dịch cho đến xử lý callback từ payment gateway.

## 🏗️ Kiến Trúc

```
Client → API Gateway → Payment Service → Payment Gateway
                    ↓
                RabbitMQ → Order Service (update order status)
                    ↓
                Notification Service (send email)
```

## 🔌 API Endpoints

### 1. Tạo Thanh Toán Mới
```http
POST /api/v1/pet_care_payment/payments
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>

{
  "orderId": "ORD-123456",
  "amount": 99.99,
  "paymentMethod": "VNPAY",
  "description": "Payment for order"
}

Response:
{
  "code": 1000,
  "result": {
    "id": 1,
    "transactionId": "TXN-1712656000000-abc12345",
    "orderId": "ORD-123456",
    "userId": "USER-123",
    "amount": 99.99,
    "paymentMethod": "VNPAY",
    "status": "PENDING",
    "createdAt": "2026-04-09T12:26:40.000000"
  }
}
```

### 2. Lấy URL Thanh Toán
```http
GET /api/v1/pet_care_payment/payments/{transactionId}/payment-url?returnUrl=http://localhost:3000/payment-callback
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "code": 1000,
  "result": "https://mock-payment-gateway.local/pay?txnId=TXN-xxx&amount=99.99"
}
```

### 3. Callback từ Payment Gateway
```http
PUT /api/v1/pet_care_payment/payments/callback
Content-Type: application/json

{
  "transactionId": "TXN-1712656000000-abc12345",
  "status": "SUCCESS",
  "referenceCode": "VNP123456789",
  "message": "Payment successful"
}

Response:
{
  "code": 1000,
  "result": {
    "id": 1,
    "transactionId": "TXN-xxx",
    "status": "SUCCESS",
    ...
  }
}
```

### 4. Xem Chi Tiết Thanh Toán
```http
GET /api/v1/pet_care_payment/payments/{transactionId}
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "code": 1000,
  "result": {
    "id": 1,
    "transactionId": "TXN-xxx",
    "orderId": "ORD-123456",
    "amount": 99.99,
    "status": "SUCCESS",
    ...
  }
}
```

### 5. Xem Payment theo Order
```http
GET /api/v1/pet_care_payment/payments/order/{orderId}
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "code": 1000,
  "result": { ... }
}
```

### 6. Xem Payment của User Hiện Tại
```http
GET /api/v1/pet_care_payment/payments/user/my-payments
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "code": 1000,
  "result": [
    { ... },
    { ... }
  ]
}
```

### 7. Hoàn Tiền
```http
POST /api/v1/pet_care_payment/payments/{transactionId}/refund
Authorization: Bearer <JWT_TOKEN>

Response:
{
  "code": 1000,
  "result": {
    "status": "REFUNDED",
    ...
  }
}
```

## 🔄 Luồng Xử Lý Thanh Toán

### Luồng Thành Công (Happy Path):
```
1. Frontend → Create Payment
   ↓
2. Payment Service → Generate transactionId, save as PENDING
   ↓
3. Frontend → Get Payment URL
   ↓
4. Payment Service → Call MockPaymentGateway (in dev) / VNPay (in prod)
   ↓
5. User → Perform payment on gateway
   ↓
6. Payment Gateway → Callback to /payments/callback
   ↓
7. Payment Service:
   - Verify signature
   - Update status to SUCCESS
   - Publish PaymentResultEvent
   ↓
8. RabbitMQ → Order Service
   ↓
9. Order Service → Update Order.status = CONFIRMED
   ↓
10. RabbitMQ → Notification Service
   ↓
11. Notification Service → Send confirmation email to customer
```

### Luồng Thất Bại:
```
1-5. [Same as above]
   ↓
6. Payment Gateway → Callback with status = FAILED
   ↓
7. Payment Service:
   - Update status to FAILED
   - Publish PaymentFailedEvent
   ↓
8. RabbitMQ → Order Service
   ↓
9. Order Service:
   - Update Order.status = PAYMENT_FAILED
   - Rollback reserved stock
   ↓
10. RabbitMQ → Notification Service
   ↓
11. Notification Service → Send failure notification to customer
```

## 💾 Payment Status Lifecycle

```
PENDING
  ↓
[PAYMENT GATEWAY]
  ↓
SUCCESS → [Order: CONFIRMED] → [Notification: sent]
  ↓
FAILED → [Order: PAYMENT_FAILED] → [Stock: rollback]
  ↓
REFUNDED (if customer requests)
```

## 🔐 Security

### Authentication
- Tất cả endpoints (trừ callback) yêu cầu **JWT Token**
- Token được verify qua Identity Service
- JWT được đặt trong header: `Authorization: Bearer <token>`

### Callback Security (TODO)
- Callback từ gateway cần verify signature để đảm bảo từ gateway thực
- Implement callback signature verification

### Data Validation
- Tất cả request fields được validate với Jakarta Validation
- Amount phải > 0
- Payment Method phải hợp lệ

## 🎯 Payment Methods

Hỗ trợ:
- **VNPAY** - Vietnam Payment Gateway
- **MOMO** - Mobile Money Vietnam
- **BANK_TRANSFER** - Direct bank transfer
- **CASH_ON_DELIVERY** - COD (không qua service này)

## 🗄️ Database Schema

```sql
-- Payments Table
CREATE TABLE payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,  -- Unique ID
    order_id VARCHAR(255) NOT NULL,              -- Logical FK
    user_id VARCHAR(255) NOT NULL,               -- Logical FK
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL ENUM('VNPAY', 'MOMO', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'),
    status VARCHAR(20) NOT NULL ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'),
    description VARCHAR(500),
    reference_code VARCHAR(255),                 -- Gateway reference (e.g., VNPay txn ID)
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

## 📨 Events Published

### PaymentResultEvent (SUCCESS)
```json
{
  "transactionId": "TXN-xxx",
  "orderId": "ORD-123456",
  "userId": "USER-123",
  "amount": 99.99,
  "status": "SUCCESS",
  "message": "Payment successful",
  "timestamp": "2026-04-09T12:26:40"
}
```
**Published to:** `payment.exchange` with key `payment.success`

### PaymentFailedEvent (FAILED)
```json
{
  "transactionId": "TXN-xxx",
  "orderId": "ORD-123456",
  "userId": "USER-123",
  "reason": "Payment failed",
  "timestamp": "2026-04-09T12:26:40"
}
```
**Published to:** `payment.exchange` with key `payment.failed`

## 🧪 Testing Locally

### 1. Setup RabbitMQ
```bash
# Using Docker
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=guest \
  -e RABBITMQ_DEFAULT_PASS=guest \
  rabbitmq:3.13-management
```

### 2. Setup MySQL
```bash
# Database for payment service
CREATE DATABASE pet_care_payment;
USE pet_care_payment;
```

### 3. Start Services
```bash
# Terminal 1: Identity Service
cd identity_service
mvn spring-boot:run

# Terminal 2: Payment Service
cd payment_service
mvn spring-boot:run

# Terminal 3: Order Service
cd order_service
mvn spring-boot:run

# Terminal 4: API Gateway
cd api_gateway
mvn spring-boot:run
```

### 4. Test with cURL

```bash
# Step 1: Login to get JWT
curl -X POST http://localhost:8888/api/v1/pet_care_identity/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}' \
  | jq .result.token

# Save token
TOKEN="<JWT_TOKEN_HERE>"

# Step 2: Create Payment
curl -X POST http://localhost:8888/api/v1/pet_care_payment/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "orderId": "ORD-123",
    "amount": 99.99,
    "paymentMethod": "VNPAY"
  }' | jq

# Step 3: Get Payment URL
TXN_ID="<transaction_id_from_step_2>"
curl -X GET "http://localhost:8888/api/v1/pet_care_payment/payments/$TXN_ID/payment-url" \
  -H "Authorization: Bearer $TOKEN" | jq

# Step 4: Simulate Payment Callback (from gateway)
curl -X PUT http://localhost:8888/api/v1/pet_care_payment/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "'$TXN_ID'",
    "status": "SUCCESS",
    "referenceCode": "VNP123456789"
  }' | jq

# Step 5: Check if Order was updated (should be CONFIRMED)
curl -X GET "http://localhost:8888/api/v1/pet_care_order/orders/ORD-123" \
  -H "Authorization: Bearer $TOKEN" | jq '.result.status'
```

## 🐛 Troubleshooting

### Issue: Payment not found (404)
```
Solution: Ensure transaction ID is correct and payment was created first
```

### Issue: UNAUTHORIZED (401)
```
Solution: Ensure JWT token is valid and not expired. Re-login if needed
```

### Issue: RabbitMQ connection failed
```
Solution: Verify RabbitMQ is running on localhost:5672
```

### Issue: Order status not updating after payment
```
Solution: Check if PaymentEventConsumer is receiving message from RabbitMQ
Debug: Check order service logs for consumer processing
```

## 📚 Related Services

- **Identity Service**: User authentication & JWT token generation
- **Order Service**: Order management & status updates
- **Notification Service**: Email notifications (TODO)
- **Product Service**: Stock management

## 🔗 Integration Checklist

- [ ] PaymentService compiled successfully
- [ ] Payment APIs accessible via API Gateway
- [ ] RabbitMQ messaging working
- [ ] Order Service receiving payment events
- [ ] Order status updating correctly
- [ ] Payment callbacks working (test with mock gateway)
- [ ] Real gateway integration (VNPay/MoMo) implemented
- [ ] Notification Service emails sent
- [ ] End-to-end payment flow tested

---

**Last Updated:** 09/04/2026
**Version:** 1.0

