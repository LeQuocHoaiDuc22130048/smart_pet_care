# 🐾 Kiến Trúc Cơ Sở Dữ Liệu - Hệ Thống PetCareSmart

Tài liệu này mô tả chi tiết kiến trúc cơ sở dữ liệu cho hệ thống Website Chăm Sóc Thú Cưng, được thiết kế theo kiến trúc **Microservices** (Database per Service) nhằm đảm bảo tính mở rộng và độc lập giữa các dịch vụ.

---

## 1. Identity Service (MySQL)
*Trách nhiệm: Xác thực, phân quyền (RBAC) và quản lý phiên đăng nhập (JWT).*

- **`users`**: `id` (UUID, PK), `username` (UK), `password`, `is_active`, `created_at`.
- **`roles`**: `name` (VARCHAR, PK), `description`.
- **`permissions`**: `name` (VARCHAR, PK), `description` (Ví dụ: `product:create`, `order:view`).
- **`user_roles`**: `user_id` (FK), `role_name` (FK).
- **`role_permissions`**: `role_name` (FK), `permission_name` (FK).
- **`invalidated_tokens`**: `id` (JTI), `expiry_time` (Dùng để vô hiệu hóa JWT khi người dùng logout).

---

## 2. User Service (MySQL)
*Trách nhiệm: Quản lý thông tin hồ sơ khách hàng, sổ địa chỉ và thú cưng.*

- **`user_profiles`**: `id` (PK_FK -> Identity.users), `full_name`, `email`, `phone`, `avatar_url`, `updated_at`.
- **`user_addresses`**: `id` (BIGINT, PK), `user_id`, `recipient_name`, `phone`, `province`, `district`, `ward`, `street_detail`, `is_default`.
- **`pets`**: `id` (BIGINT, PK), `user_id`, `name`, `species`, `breed`, `age`, `weight`, `gender`, `health_notes`, `image_url`.

---

## 3. Product & Inventory Service (MySQL)
*Trách nhiệm: Quản lý danh mục, thương hiệu, biến thể sản phẩm (SKU) và tồn kho.*

- **`categories`**: `id` (PK), `name`, `slug`, `parent_id` (Để làm menu đa cấp).
- **`brands`**: `id` (PK), `name`, `slug`, `logo_url`, `active`.
- **`products`**: `id` (PK), `category_id` (FK), `brand_id` (FK), `name`, `slug`, `description`, `thumbnail_url`, `status`.
- **`product_variants`**: `id` (PK), `product_id` (FK), `sku_code` (UK), `attributes` (JSON - Lưu RAM, CPU, Màu sắc...), `price`.
- **`inventory`**: `variant_id` (PK_FK), `stock_quantity`, `low_stock_threshold`.
- **`inventory_logs`**: `id`, `variant_id`, `change_amount`, `reason` (IMPORT, ORDER, RETURN), `created_at`.

---

## 4. Cart Service (MySQL)
*Trách nhiệm: Quản lý giỏ hàng của khách hàng (Đồng bộ đa thiết bị).*

- **`carts`**: `id` (PK), `user_id` (UK), `created_at`, `updated_at`.
- **`cart_items`**: `id` (PK), `cart_id` (FK), `variant_id`, `quantity`, `added_at`.

---

## 5. Promotion Service (MySQL)
*Trách nhiệm: Quản lý mã giảm giá, chiến dịch Flash Sale.*

- **`coupons`**: `id` (PK), `code` (UK), `description`, `discount_type` (FIXED/PERCENT), `discount_value`, `min_order_value`, `max_discount`, `start_date`, `end_date`, `usage_limit`.
- **`coupon_usages`**: `id`, `coupon_id`, `user_id`, `order_id`, `applied_at`.

---

## 6. Order & Payment Service (MySQL)
*Trách nhiệm: Quản lý đơn hàng, quy trình thanh toán và lịch sử giao dịch.*

- **`orders`**: `id` (PK), `user_id`, `total_amount`, `final_amount`, `shipping_full_address` (Snapshot), `status` (PENDING, PAID, SHIPPED, CANCELLED), `tracking_number`.
- **`order_items`**: `id`, `order_id` (FK), `variant_id`, `quantity`, `unit_price` (Snapshot giá tại thời điểm mua).
- **`payments`**: `id`, `order_id` (FK), `method` (VNPAY, MOMO, COD), `transaction_id`, `amount`, `status`, `paid_at`.
- **`order_status_history`**: `id`, `order_id` (FK), `status`, `note`, `created_at`.

---

## 7. Booking Service (MySQL)
*Trách nhiệm: Quản lý lịch hẹn dịch vụ Spa, khách sạn thú cưng.*

- **`pet_services`**: `id` (PK), `name`, `description`, `duration_minutes`, `price`, `active`.
- **`staffs`**: `id` (PK), `full_name`, `specialty`, `is_active`.
- **`appointments`**: `id` (PK), `user_id`, `pet_id`, `service_id`, `staff_id`, `appointment_date`, `slot_time`, `status`, `total_price` (Snapshot).

---

## 8. CMS & Marketing Service (MySQL)
*Trách nhiệm: Quản lý Banner quảng cáo và Blog kiến thức.*

- **`banners`**: `id`, `title`, `image_url`, `link_url`, `position`, `sort_order`, `status`.
- **`posts`**: `id`, `author_id`, `category_id`, `title`, `slug`, `content` (LONGTEXT), `status`, `published_at`.

---

## 9. Feedback Service (MongoDB)
*Trách nhiệm: Quản lý đánh giá không định dạng cho cả sản phẩm và dịch vụ.*

- **Collection `feedbacks`**:
  ```json
  {
    "_id": "ObjectId",
    "user_id": "Long",
    "target_type": "String (PRODUCT | SERVICE)",
    "target_id": "Long",
    "reference_id": "Long (order_id | appointment_id)",
    "rating": "Int (1-5)",
    "comment": "String",
    "images": ["url1", "url2"],
    "created_at": "ISODate"
  }