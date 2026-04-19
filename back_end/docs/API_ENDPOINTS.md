# 📡 PetCareSmart — API Endpoints

**Base URL:** `http://localhost:8888/api/v1`

> **✅ Public** — không cần token
> **🔐 JWT** — cần `Authorization: Bearer <token>`
> **👑 ADMIN** — cần token + role `ADMIN`

---

## 🔐 Identity Service
**Route prefix:** `/api/v1/pet_care_identity` → `localhost:8080`

### Authentication
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/pet_care_identity/users` | Đăng ký tài khoản | ✅ Public |
| `POST` | `/pet_care_identity/auth/token` | Đăng nhập → JWT | ✅ Public |
| `POST` | `/pet_care_identity/auth/google` | Đăng nhập bằng Google → JWT | ✅ Public |
| `POST` | `/pet_care_identity/auth/introspect` | Kiểm tra token hợp lệ | ✅ Public |
| `POST` | `/pet_care_identity/auth/log-out` | Đăng xuất (vô hiệu hóa token) | ✅ Public |
| `POST` | `/pet_care_identity/auth/refresh` | Làm mới token | ✅ Public |

**Body đăng ký:**
```json
{
  "username": "user01",
  "password": "12345678",
  "firstName": "Nguyen",
  "lastName": "Van A",
  "birthDate": "2000-01-15"
}
```

**Body đăng nhập:**
```json
{
  "username": "user01",
  "password": "12345678"
}
```

**Body đăng nhập Google:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6...",
  "accessToken": "ya29.a0AfH6SMBx...",
  "refreshToken": "1//0gHZ9K8..."
}
```

**Response đăng nhập:**
```json
{
  "code": 1000,
  "message": null,
  "result": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "authenticated": true
  }
}
```

### User Management
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/pet_care_identity/users/myInfo` | Thông tin user hiện tại | 🔐 JWT |
| `GET` | `/pet_care_identity/users/{id}` | Lấy user theo ID | 🔐 JWT |
| `PUT` | `/pet_care_identity/users/{id}` | Cập nhật user | 🔐 JWT |
| `GET` | `/pet_care_identity/users` | Danh sách tất cả user | 👑 ADMIN |
| `DELETE` | `/pet_care_identity/users/{id}` | Xóa user | 👑 ADMIN |

### Role & Permission
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/pet_care_identity/roles` | Danh sách role | 👑 ADMIN |
| `POST` | `/pet_care_identity/roles` | Tạo role mới | 👑 ADMIN |
| `DELETE` | `/pet_care_identity/roles/{role}` | Xóa role | 👑 ADMIN |
| `GET` | `/pet_care_identity/permissions` | Danh sách permission | 👑 ADMIN |
| `POST` | `/pet_care_identity/permissions` | Tạo permission mới | 👑 ADMIN |
| `DELETE` | `/pet_care_identity/permissions/{permission}` | Xóa permission | 👑 ADMIN |

---

## 👤 User Service
**Route prefix:** `/api/v1/pet_care_user` → `localhost:8082`

### Profile
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/pet_care_user/profiles/me` | Lấy profile của mình | 🔐 JWT |
| `GET` | `/pet_care_user/profiles/{userId}` | Lấy profile theo ID | 🔐 JWT |
| `PUT` | `/pet_care_user/profiles/me` | Cập nhật profile + avatar | 🔐 JWT |

**Body cập nhật profile** (`multipart/form-data`):
```
firstName    : string
lastName     : string
email        : string
birthday     : date (yyyy-MM-dd)
phone        : string
avatar       : file (image)
```

### Pets
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/pet_care_user/pets` | Danh sách thú cưng của mình | 🔐 JWT |
| `GET` | `/pet_care_user/pets/{petId}` | Chi tiết thú cưng | 🔐 JWT |
| `POST` | `/pet_care_user/pets` | Thêm thú cưng | 🔐 JWT |
| `PUT` | `/pet_care_user/pets/{petId}` | Cập nhật thú cưng | 🔐 JWT |
| `DELETE` | `/pet_care_user/pets/{petId}` | Xóa thú cưng | 🔐 JWT |

**Body thêm/cập nhật thú cưng** (`multipart/form-data`):
```
name         : string
species      : HOUSEHOLD_PET | EXOTIC_PET | LIVESTOCK | POULTRY | AQUACULTURE
breed        : string
age          : integer
weight       : double
gender       : MALE | FEMALE
isNeutered   : boolean
healthNotes  : string
image        : file (image)
```

### Addresses
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/pet_care_user/addresses` | Danh sách địa chỉ | 🔐 JWT |
| `POST` | `/pet_care_user/addresses` | Thêm địa chỉ mới | 🔐 JWT |
| `PUT` | `/pet_care_user/addresses/{addressId}` | Cập nhật địa chỉ | 🔐 JWT |
| `DELETE` | `/pet_care_user/addresses/{addressId}` | Xóa địa chỉ | 🔐 JWT |

**Body thêm/cập nhật địa chỉ** (`application/json`):
```json
{
  "recipientName": "Nguyen Van A",
  "phone": "0901234567",
  "province": "Hồ Chí Minh",
  "district": "Quận 1",
  "ward": "Phường Bến Nghé",
  "streetDetails": "123 Lê Lợi",
  "isDefault": true
}
```

---

## 📦 Product Service
**Route prefix:** `/api/v1/pet_care_product` → `localhost:8081`

### Products
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/pet_care_product/products` | Danh sách tất cả sản phẩm | ✅ Public |
| `GET` | `/pet_care_product/products/{id}` | Chi tiết sản phẩm | ✅ Public |
| `POST` | `/pet_care_product/products` | Tạo sản phẩm mới | 👑 ADMIN |
| `PUT` | `/pet_care_product/products/{id}` | Cập nhật sản phẩm | 👑 ADMIN |
| `DELETE` | `/pet_care_product/products/{id}` | Xóa sản phẩm | 👑 ADMIN |

**Body tạo/cập nhật sản phẩm** (`multipart/form-data`):
```
request  : string (JSON — xem bên dưới)
images   : file[] (ít nhất 1 ảnh khi tạo mới)
```

**Nội dung JSON trong field `request`:**
```json
{
  "productName": "Thức ăn Royal Canin",
  "description": "Mô tả sản phẩm",
  "price": 250000,
  "stockQuantity": 100,
  "categoryId": ["<uuid-category>"],
  "primaryImageIndex": 0,
  "status": "ACTIVE"
}
```

`status`: `ACTIVE` | `INACTIVE` | `OUT_OF_STOCK`

### Categories
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/pet_care_product/categories` | Danh sách danh mục | ✅ Public |
| `GET` | `/pet_care_product/categories/{id}` | Chi tiết danh mục | ✅ Public |
| `POST` | `/pet_care_product/categories` | Tạo danh mục mới | 👑 ADMIN |
| `PUT` | `/pet_care_product/categories/{id}` | Cập nhật danh mục | 👑 ADMIN |
| `DELETE` | `/pet_care_product/categories/{id}` | Xóa danh mục | 👑 ADMIN |

**Body tạo/cập nhật danh mục** (`application/json`):
```json
{
  "categoryName": "Thức ăn thú cưng",
  "description": "Các loại thức ăn cho chó, mèo"
}
```

---

## 🛒 Cart Service
**Route prefix:** `/api/v1/pet_care_cart` → `localhost:8085`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/pet_care_cart/cart` | Lấy giỏ hàng (tự tạo nếu chưa có) | 🔐 JWT |
| `POST` | `/pet_care_cart/cart/items` | Thêm sản phẩm vào giỏ | 🔐 JWT |
| `PUT` | `/pet_care_cart/cart/items/{itemId}` | Cập nhật số lượng (0 = xóa item) | 🔐 JWT |
| `DELETE` | `/pet_care_cart/cart/items/{itemId}` | Xóa 1 item khỏi giỏ | 🔐 JWT |
| `DELETE` | `/pet_care_cart/cart` | Xóa toàn bộ giỏ hàng | 🔐 JWT |

**Body thêm vào giỏ** (`application/json`):
```json
{
  "productId": "<uuid-product>",
  "quantity": 2
}
```

**Body cập nhật số lượng** (`application/json`):
```json
{
  "quantity": 5
}
```

---

## 📋 Order Service
**Route prefix:** `/api/v1/pet_care_order` → `localhost:8083`

### User Endpoints
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/pet_care_order/orders` | Tạo/cập nhật đơn hàng PENDING | 🔐 JWT |
| `GET` | `/pet_care_order/orders/my` | Danh sách đơn hàng của mình | 🔐 JWT |
| `GET` | `/pet_care_order/orders/{orderId}` | Chi tiết đơn hàng | 🔐 JWT |
| `DELETE` | `/pet_care_order/orders/{orderId}` | Hủy đơn hàng | 🔐 JWT |
| `POST` | `/pet_care_order/orders/payment-status` | Cập nhật trạng thái thanh toán | 🔐 JWT |

**Body tạo đơn hàng** (`application/json`):
```json
{
  "items": [
    { "productId": "<uuid-product>", "quantity": 2 },
    { "productId": "<uuid-product-2>", "quantity": 1 }
  ]
}
```

**Body cập nhật payment status** (`application/json`):
```json
{
  "orderId": "<uuid-order>",
  "status": "PAID"
}
```

`status`: `PAID` | `FAILED`

### Admin Endpoints
| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/pet_care_order/admin/orders` | Tất cả đơn hàng | 👑 ADMIN |
| `GET` | `/pet_care_order/admin/orders?status=PENDING` | Lọc theo trạng thái | 👑 ADMIN |
| `GET` | `/pet_care_order/admin/orders/stats` | Thống kê đơn theo trạng thái | 👑 ADMIN |
| `GET` | `/pet_care_order/admin/orders/{orderId}` | Chi tiết bất kỳ đơn hàng | 👑 ADMIN |
| `GET` | `/pet_care_order/admin/orders/user/{userId}` | Đơn hàng của 1 user | 👑 ADMIN |
| `PATCH` | `/pet_care_order/admin/orders/{orderId}/status` | Cập nhật trạng thái thủ công | 👑 ADMIN |
| `DELETE` | `/pet_care_order/admin/orders/{orderId}` | Hủy đơn + rollback tồn kho | 👑 ADMIN |

**Body cập nhật trạng thái (ADMIN)** (`application/json`):
```json
{
  "status": "CONFIRMED",
  "note": "Đã xác nhận giao hàng"
}
```

**OrderStatus values:**
```
PENDING        → Đang chờ xử lý
RESERVED       → Đã giữ tồn kho
PAYMENT_PENDING→ Đang chờ thanh toán
PAID           → Đã thanh toán
CONFIRMED      → Đã xác nhận
FAILED         → Thất bại
PAYMENT_FAILED → Thanh toán thất bại
CANCELLED      → Đã hủy
```

---

## 💳 Payment Service
**Route prefix:** `/api/v1/pet_care_payment` → `localhost:8084`

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/pet_care_payment/payments` | Tạo giao dịch thanh toán | 🔐 JWT |
| `GET` | `/pet_care_payment/payments/{transactionId}` | Chi tiết giao dịch | 🔐 JWT |
| `GET` | `/pet_care_payment/payments/{transactionId}/payment-url` | Lấy URL redirect thanh toán | 🔐 JWT |
| `GET` | `/pet_care_payment/payments/order/{orderId}` | Giao dịch theo order ID | 🔐 JWT |
| `GET` | `/pet_care_payment/payments/user/my-payments` | Tất cả giao dịch của mình | 🔐 JWT |
| `POST` | `/pet_care_payment/payments/{transactionId}/refund` | Hoàn tiền | 🔐 JWT |
| `POST` | `/pet_care_payment/payments/callback` | Callback từ payment gateway | ✅ Public |
| `GET` | `/pet_care_payment/payments/vnpay-callback` | VNPay redirect callback | ✅ Public |

**Body tạo thanh toán** (`application/json`):
```json
{
  "orderId": "<uuid-order>",
  "amount": 250000,
  "paymentMethod": "CASH_ON_DELIVERY",
  "description": "Thanh toán đơn hàng #123"
}
```

`paymentMethod`: `VNPAY` | `MOMO` | `BANK_TRANSFER` | `CASH_ON_DELIVERY`

---

## 📊 Response Format

Tất cả response đều theo chuẩn:

```json
{
  "code": 1000,
  "message": null,
  "result": { ... }
}
```

**Mã lỗi phổ biến:**

| Code | Ý nghĩa | HTTP Status |
|------|---------|-------------|
| `1000` | Thành công | 200 |
| `1006` | Chưa xác thực (thiếu/sai token) | 401 |
| `1007` | Không có quyền | 403 |
| `3001` | Đơn hàng không tìm thấy | 404 |
| `3003` | Đơn hàng đã ở trạng thái cuối | 400 |
| `5001` | Giỏ hàng không tìm thấy | 404 |
| `5002` | Item trong giỏ không tìm thấy | 404 |
| `5004` | Sản phẩm hết hàng | 400 |
| `9999` | Lỗi hệ thống | 500 |

---

## 🔄 Luồng nghiệp vụ chính

### Luồng đặt hàng
```
1. POST /auth/token                    → Lấy JWT
2. GET  /products                      → Xem sản phẩm
3. POST /cart/items                    → Thêm vào giỏ
4. POST /orders                        → Đặt hàng (PENDING)
   └─ Tự động: stock.reserve → RESERVED
   └─ Tự động: payment.create → CONFIRMED (MockGateway)
5. GET  /orders/my                     → Kiểm tra trạng thái
6. GET  /payments/order/{orderId}      → Xem thông tin thanh toán
```

### Luồng quản lý sản phẩm (Admin)
```
1. POST /auth/token (admin)            → Lấy admin JWT
2. POST /categories                    → Tạo danh mục
3. POST /products (multipart)          → Tạo sản phẩm
4. PATCH /admin/orders/{id}/status     → Xác nhận đơn hàng
```
