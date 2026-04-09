# Kiến Trúc Cơ Sở Dữ Liệu Hoàn Chỉnh - Hệ Thống Chăm Sóc Thú Cưng

Tài liệu này mô tả chi tiết kiến trúc cơ sở dữ liệu cho hệ thống Website Chăm Sóc Thú Cưng dựa trên kiến trúc **Microservices** (Database per Service).

---

## 1. Identity Service Database (MySQL)
Chịu trách nhiệm xác thực, phân quyền và quản lý phiên đăng nhập (JWT).

* **`users`**: `id` (VARCHAR/UUID, PK), `username` (UK), `password`, `first_name`, `last_name`, `birth_date`, `is_active`.
* **`roles`**: `name` (VARCHAR, PK), `description`
* **`permissions`**: `name` (VARCHAR, PK), `description`
* **`user_roles`**: `user_id` (FK), `role_name` (FK)
* **`role_permissions`**: `role_name` (FK), `permission_name` (FK)
* **`invalidated_tokens`**: `id` (VARCHAR, PK - JTI), `expiry_time`

## 2. User Service Database (MySQL)
Quản lý hồ sơ cá nhân, sổ địa chỉ và thú cưng.

* **`user_profiles`**: `id` (VARCHAR, PK_FK -> Identity), `phone`, `avatar_url`
* **`user_addresses`** (Sổ địa chỉ): `id` (BIGINT, PK), `user_id` (Logical FK), `recipient_name`, `phone`, `province`, `district`, `ward`, `street_detail`, `is_default`
* **`pets`** (Hồ sơ thú cưng): `id` (BIGINT, PK), `user_id` (Logical FK), `name`, `species`, `breed`, `age`, `weight`, `gender`, `is_neutered`, `health_notes`, `image_url`

## 3. Product & Inventory Service Database (MySQL)
Quản lý danh mục, biến thể sản phẩm (SKU) và tồn kho.

* **`categories`**: `id` (BIGINT, PK), `name`, `description`
* **`products`**: `id` (BIGINT, PK), `category_id` (FK), `name`, `description`, `thumbnail_url`, `status`
* **`product_variants`** (Phân loại/SKU): `id` (BIGINT, PK), `product_id` (FK), `sku_code` (UK), `attributes` (JSON), `price`, `image_url`
* **`product_images`**: `id` (PK), `product_id` (FK), `image_url`, `display_order`
* **`inventory`**: `variant_id` (BIGINT, PK_FK), `stock_quantity`, `reserved_quantity`

## 4. Order & Payment Service Database (MySQL)
Quản lý Hóa đơn, giao dịch và lịch sử vận chuyển (Snapshot Data).

* **`orders`**: `id` (BIGINT, PK), `user_id` (Logical FK), `sub_total`, `shipping_fee`, `voucher_code`, `discount_amount`, `final_amount`, `shipping_name`, `shipping_phone`, `shipping_full_address` (Snapshot), `shipping_method`, `tracking_number`, `status`, `created_at`
* **`order_items`**: `id` (PK), `order_id` (FK), `variant_id` (Logical FK -> SKU), `quantity`, `unit_price` (Snapshot)
* **`order_status_history`** (Timeline đơn hàng): `id` (PK), `order_id` (FK), `status`, `description`, `created_at`
* **`payments`**: `id` (PK), `order_id` (FK), `payment_method`, `transaction_id`, `status`

## 5. Booking Service Database (MySQL)
Quản lý các gói dịch vụ, nhân sự và lịch hẹn chăm sóc thú cưng.

* **`pet_services`**: `id` (BIGINT, PK), `name`, `description`, `duration_minutes` (Thời lượng phân slot), `price`, `status`
* **`staffs`**: `id` (BIGINT, PK), `full_name`, `specialty`, `is_active`
* **`appointments`**: `id` (BIGINT, PK), `user_id` (Logical FK), `pet_id` (Logical FK), `service_id` (FK), `staff_id` (FK), `appointment_date`, `start_time`, `end_time`, `status`, `total_price` (Snapshot), `payment_status`

## 6. CMS & Marketing Service Database (MySQL) - [MỚI CẬP NHẬT]
Quản lý nội dung hiển thị trên giao diện (Banners) và Blog kiến thức thú cưng.

* **`banners`** (Quản lý hình ảnh quảng cáo/sự kiện):
  * `id` (BIGINT, PK)
  * `title` (VARCHAR): *Tên chiến dịch (VD: Khuyến mãi Hè 2026)*
  * `image_url` (VARCHAR): *Đường dẫn ảnh*
  * `link_url` (VARCHAR): *Đường dẫn khi click vào (VD: /products/category/thuc-an)*
  * `position` (VARCHAR): *Vị trí đặt (VD: HOME_TOP_SLIDER, BLOG_SIDEBAR, PRODUCT_BOTTOM)*
  * `display_order` (INT): *Thứ tự hiển thị*
  * `status` (VARCHAR): *ACTIVE / INACTIVE*
  * `start_date` (DATETIME): *Ngày bắt đầu chạy quảng cáo*
  * `end_date` (DATETIME): *Ngày kết thúc (Hệ thống tự ẩn banner khi hết hạn)*
* **`blog_categories`**: `id` (PK), `name`, `slug`
* **`posts`**: `id` (PK), `author_id` (Logical FK), `category_id` (FK), `title`, `slug`, `thumbnail_url`, `content` (LONGTEXT), `status`, `published_at`
* **`tags`**: `id` (PK), `name`, `slug`
* **`post_tags`**: `post_id` (FK), `tag_id` (FK)

## 7. Feedback Service Database (MongoDB)
Quản lý đánh giá đa hình (Polymorphic) cho cả Hệ thống, Sản phẩm và Dịch vụ.

* **Collection `feedbacks`**:
  ```json
  {
    "_id": "ObjectId",
    "user_id": "String (Logical FK -> users.id)",
    "feedback_type": "String (OVERALL | PRODUCT | SERVICE)",
    "target_id": "Long (Logical FK -> product_id hoặc service_id)",
    "reference_id": "Long (Logical FK -> order_id hoặc appointment_id để xác thực)",
    "rating": "Int (1-5)",
    "comment": "String",
    "images": ["url1", "url2"],
    "created_at": "ISODate"
  }