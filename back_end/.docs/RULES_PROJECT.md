# QUY TẮC DỰ ÁN (PROJECT RULES & CONVENTIONS)
**Dự án:** Hệ thống Website Chăm Sóc Thú Cưng (Microservices Architecture)

---

## 1. NGUYÊN TẮC KIẾN TRÚC (ARCHITECTURE RULES)

* **RULE 1.1 - Độc lập Dịch vụ (Database per Service):** Mỗi microservice phải sở hữu và quản lý một cơ sở dữ liệu riêng (MySQL hoặc MongoDB). Tuyệt đối **không** chia sẻ trực tiếp database giữa các service.
* **RULE 1.2 - Không khóa ngoại xuyên DB (No Cross-DB Foreign Keys):** Khi cần liên kết dữ liệu giữa 2 service, chỉ sử dụng **Khóa ngoại logic (Logical Foreign Key)**.
    * *Đúng:* Lưu `user_id` (VARCHAR) trong bảng `orders` của Order Service.
    * *Sai:* Tạo constraint FOREIGN KEY từ DB `order_service` sang DB `identity_service`.
* **RULE 1.3 - Bảo toàn lịch sử (Data Snapshotting):** Đối với các dữ liệu giao dịch (Hóa đơn, Lịch hẹn), mọi thông tin dễ biến động theo thời gian phải được sao chép (snapshot) tại thời điểm tạo.
    * *Ví dụ:* `orders.unit_price` phải lấy giá trị hiện tại của `product_variants.price` và lưu cứng lại. Nếu sản phẩm tăng giá, hóa đơn cũ không được thay đổi.

---

## 2. TIÊU CHUẨN CODE BACKEND (JAVA SPRING BOOT)

* **RULE 2.1 - Tuân thủ Phân tầng (Strict Layered Architecture):**
    * `Controller`: Chỉ nhận Request, gọi Service, trả về Response. Tuyệt đối không viết logic tính toán ở đây.
    * `Service`: Chứa 100% nghiệp vụ (Business Logic).
    * `Repository`: Chỉ chứa các hàm thao tác với Database.
* **RULE 2.2 - Ẩn giấu Thực thể (Never leak Entities):**
    * Tuyệt đối **không** trả trực tiếp đối tượng `Entity` (ánh xạ DB) ra ngoài API (Controller).
    * Luôn phải đóng gói dữ liệu đầu vào qua `RequestDTO` và dữ liệu đầu ra qua `ResponseDTO`.
* **RULE 2.3 - Tự động hóa Ánh xạ (Auto Mapping):** * Bắt buộc sử dụng **MapStruct** (`mapper/`) để chuyển đổi qua lại giữa `Entity` và `DTO`. Không viết các vòng lặp `set/get` thủ công làm phình to code.
* **RULE 2.4 - Giảm thiểu Boilerplate:** Bắt buộc dùng **Lombok** (`@Getter`, `@Setter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Slf4j`) thay vì tự generate code tay.

---

## 3. GIAO TIẾP VÀ API (COMMUNICATION & API)

* **RULE 3.1 - RESTful API Naming:** Đặt tên endpoint theo chuẩn danh từ số nhiều, sử dụng phương thức HTTP đúng mục đích:
    * `GET /api/v1/products` (Lấy danh sách)
    * `POST /api/v1/orders` (Tạo đơn hàng mới)
    * `PUT /api/v1/users/{id}` (Cập nhật toàn bộ user)
    * `PATCH /api/v1/orders/{id}/status` (Cập nhật 1 phần - VD: trạng thái)
    * `DELETE /api/v1/pets/{id}` (Xóa thú cưng)
* **RULE 3.2 - Giao tiếp Đồng bộ vs Bất đồng bộ:**
    * Dùng **Feign Client (HTTP Sync)** cho các tác vụ Get/Read cần dữ liệu ngay (VD: Order Service gọi Product Service lấy tồn kho).
    * Dùng **RabbitMQ/Kafka (Event-Driven Async)** cho các tác vụ cập nhật trạng thái, gửi thông báo (VD: Payment Service bắn sự kiện `PAYMENT_SUCCESS`, Order Service tự động nghe và cập nhật).

---

## 4. XỬ LÝ LỖI (EXCEPTION HANDLING)

* **RULE 4.1 - Bắt lỗi tập trung (Global Exception Handler):** * Tất cả các exception ném ra từ bất kỳ tầng nào đều phải được bắt tại `@RestControllerAdvice` (tức file `GlobalExceptionHandler`).
    * Không trả về lỗi stack trace mặc định của Spring Boot (lỗi 500 kèm mã code Java) cho Client.
* **RULE 4.2 - Chuẩn hóa Response Lỗi:**
    * Mọi thông báo lỗi phải tuân theo cấu trúc định nghĩa trong enum `ErrorCode` (gồm Mã số lỗi tĩnh và Thông điệp).
    * Sử dụng thống nhất custom exception: `throw new AppException(ErrorCode.USER_NOT_FOUND)`.

---

## 5. BẢO MẬT & PHÂN QUYỀN (SECURITY)

* **RULE 5.1 - Token-based Auth (JWT):** * API Gateway hoặc `CustomJwtDecoder` chịu trách nhiệm giải mã token. Nếu token bị nằm trong bảng `invalidated_tokens` (đã đăng xuất), phải từ chối truy cập ngay lập tức.
* **RULE 5.2 - Ủy quyền theo vai trò (RBAC):**
    * Sử dụng annotation method-level security (`@PreAuthorize("hasRole('ADMIN')")` hoặc `@PreAuthorize("hasAuthority('CREATE_PRODUCT')")`) ở tầng Controller hoặc Service để bảo vệ các endpoint nhạy cảm.

---

## 6. QUẢN LÝ VERSION & DEPLOYMENT

* **RULE 6.1 - Containerization:** Mọi microservice phải có một `Dockerfile` chuẩn để đóng gói thành image.
* **RULE 6.2 - Centralized Config:** Sử dụng Config Service để nạp biến môi trường. Tuyệt đối không hard-code các thông tin nhạy cảm (DB Password, Secret Key) thẳng vào code.