# KIẾN TRÚC TỔNG QUAN HỆ THỐNG WEBSITE CHĂM SÓC THÚ CƯNG

## 1. Tổng Quan Hệ Thống (System Overview)
Dự án được xây dựng dựa trên kiến trúc **Microservices (Dịch vụ vi mô)** kết hợp với mô hình **Event-Driven (Hướng sự kiện)**. Hệ thống chia nhỏ các nghiệp vụ phức tạp thành các dịch vụ độc lập, giúp dễ dàng mở rộng, bảo trì và tích hợp các công nghệ đa dạng (như AI/Machine Learning) mà không ảnh hưởng đến luồng giao dịch cốt lõi.

---

## 2. Nền Tảng Công Nghệ (Tech Stack)

### 2.1. Backend (Các Core Services)
* **Ngôn ngữ:** Java 21
* **Framework:** Spring Boot 3.x, Spring Cloud (Gateway, Netflix Eureka, Config)
* **Security:** Spring Security, OAuth2 Resource Server (JWT)
* **Thư viện hỗ trợ:** Lombok (giảm boilerplate code), MapStruct (Auto-mapping Entity ↔ DTO)
* **Database Relational:** MySQL (tương tác qua Spring Data JPA)
* **Database NoSQL:** MongoDB (Spring Data MongoDB)

### 2.2. Lớp Trí Tuệ Nhân Tạo (AI Service Layer)
* **Ngôn ngữ:** Python 3
* **Framework:** Flask / FastAPI
* **Database:** Vector Database (Milvus / Pinecone) cho tìm kiếm hình ảnh
* **Mô hình:** CNN (Image Retrieval), NLP (Chatbot)

### 2.3. Hạ Tầng & Giao Tiếp (Infrastructure & Communication)
* **Message Broker:** RabbitMQ hoặc Apache Kafka (xử lý bất đồng bộ, gửi thông báo)
* **Containerization:** Docker & Docker Compose
* **Frontend:** ReactJS (hoặc Next.js)

---

## 3. Cấu Trúc Các Microservices (System Components)

Hệ thống được chia thành 3 nhóm Service chính:

### Nhóm 1: Infrastructure Services (Hạ tầng cơ sở)
* **API Gateway (Spring Cloud Gateway):** Cổng vào duy nhất của hệ thống, xử lý định tuyến (routing), CORS và kiểm tra tính hợp lệ sơ bộ của JWT.
* **Discovery Service (Eureka Server):** Quản lý danh bạ (Registry) của các service, giúp các service tìm thấy nhau mà không cần hard-code IP/Port.
* **Config Service:** Lưu trữ và cung cấp file cấu hình (`application.yml`) tập trung cho mọi dịch vụ.

### Nhóm 2: Business Core Services (Nghiệp vụ cốt lõi - Java)
* **Identity Service (MySQL):** Quản lý đăng nhập, cấp phát và thu hồi JWT (Logout), phân quyền Role/Permission (RBAC).
* **User Service (MySQL):** Quản lý hồ sơ mở rộng (Profile), sổ địa chỉ (tính phí ship) và danh sách thú cưng (Pet Profile).
* **Product & Inventory Service (MySQL):** Quản lý danh mục, thư viện ảnh, biến thể sản phẩm (SKU) và kiểm soát số lượng tồn kho vật lý.
* **Order & Payment Service (MySQL):** Xử lý giỏ hàng, đặt hàng (lưu trữ dạng Snapshot), mã giảm giá và tích hợp cổng thanh toán (VNPay/MoMo).
* **Booking Service (MySQL):** Quản lý gói dịch vụ chăm sóc, nhân viên (staff) và lịch hẹn (Appointments).
* **CMS & Marketing Service (MySQL):** Quản lý Blog kiến thức và Banner quảng cáo trên giao diện.
* **Feedback Service (MongoDB):** Quản lý đánh giá đa hình (cho Cả hệ thống, Sản phẩm và Dịch vụ) kết hợp lưu trữ hình ảnh linh hoạt.
* **Notification Service:** Lắng nghe sự kiện từ Message Broker để gửi Email (Xác nhận đơn hàng, Nhắc lịch hẹn, Cảnh báo bảo mật).

### Nhóm 3: AI Services (Trí tuệ nhân tạo - Python)
* **AI Service (VectorDB/MongoDB):** Chịu trách nhiệm nhận diện hình ảnh, huấn luyện Chatbot và gợi ý sản phẩm (Recommendation Engine).

---

## 4. Kiến Trúc Mã Nguồn Mỗi Service (Codebase Architecture)

Mọi service viết bằng Spring Boot đều tuân thủ kiến trúc phân tầng (Layered Architecture) tiêu chuẩn giống như `identity_service`:

* **`configuration/`**: Chứa các file cấu hình bảo mật (`SecurityConfig`), xử lý Token (`CustomJwtDecoder`), và cấu hình Bean.
* **`controller/`**: (Lớp API) Nhận request từ Client/API Gateway, kiểm tra đầu vào và chuyển tiếp cho tầng Service.
* **`service/`**: Nơi chứa 100% logic nghiệp vụ cốt lõi (Business Logic).
* **`repository/`**: Lớp tương tác với Cơ sở dữ liệu (Kế thừa `JpaRepository` hoặc `MongoRepository`).
* **`entity/`**: Các class map trực tiếp với các Table/Collection trong DB.
* **`dto/`**: Data Transfer Object, chia làm `request/` (payload client gửi lên) và `response/` (dữ liệu trả về), giúp ẩn giấu cấu trúc DB thực.
* **`mapper/`**: Giao diện dùng **MapStruct** để tự động chuyển đổi qua lại giữa `Entity` và `DTO`.
* **`exception/`**: Cấu trúc xử lý lỗi tập trung, bao gồm `AppException`, `ErrorCode` (Enum quản lý mã lỗi) và `GlobalExceptionHandler` (bắt và trả về chuẩn JSON thống nhất cho mọi lỗi).

---

## 5. Luồng Giao Tiếp (Communication Flow)

Hệ thống kết hợp cả 2 hình thức giao tiếp để tối ưu hiệu năng:

1. **Giao tiếp Đồng bộ (Synchronous - RESTful API/Feign Client):** Dùng cho các nghiệp vụ yêu cầu dữ liệu ngay lập tức.
    * *Ví dụ:* Order Service gọi sang Product Service để kiểm tra giá và tồn kho trước khi cho phép tạo hóa đơn.

2. **Giao tiếp Bất đồng bộ (Asynchronous - Message Queue):** Dùng để tách rời sự phụ thuộc, tránh nghẽn mạng.
    * *Ví dụ:* Khi Thanh toán thành công, Payment Service đẩy sự kiện `PAYMENT_SUCCESS` vào RabbitMQ. Order Service lắng nghe để đổi trạng thái đơn, đồng thời Notification Service lắng nghe để gửi Email cho khách.

---

## 6. Sơ Đồ Kiến Trúc Hệ Thống (System Architecture Diagram)

```mermaid
graph TD
    %% CLIENTS
    Client(Web/Mobile App - ReactJS)
    
    %% API GATEWAY
    Client -- "HTTPS / REST" --> APIGateway[API GATEWAY<br/>Spring Cloud Gateway]
    
    %% INFRASTRUCTURE
    APIGateway <.-> Eureka((Discovery Service<br/>Eureka))
    ConfigService((Config Service)) -. "Provide config" .-> APIGateway
    
    %% CORE MICROSERVICES
    subgraph "Core Business Services (Java/Spring Boot)"
        Identity[Identity Service]
        User[User Service]
        Product[Product & Inventory Service]
        Order[Order & Payment Service]
        Booking[Booking Service]
        CMS[CMS & Marketing Service]
        Feedback[Feedback Service<br/>(MongoDB)]
    end
    
    APIGateway --> Identity
    APIGateway --> User
    APIGateway --> Product
    APIGateway --> Order
    APIGateway --> Booking
    APIGateway --> CMS
    APIGateway --> Feedback
    
    %% AI SERVICE
    subgraph "AI Layer (Python)"
        AI[AI Service<br/>CNN/NLP/RAG]
    end
    APIGateway --> AI
    
    %% MESSAGE BROKER & NOTIFICATION
    Broker{{MESSAGE BROKER<br/>RabbitMQ / Kafka}}
    Order -->|Event| Broker
    Booking -->|Event| Broker
    Identity -->|Event| Broker
    
    Notif[Notification Service]
    Broker -->|Consume| Notif
    Notif -->|Send Email| MailServer((External Mail Server))
    
    %% INTERNAL COMMUNICATION (FEIGN CLIENT)
    Order -. "Check stock/price" .-> Product
    Booking -. "Verify Pet" .-> User
    Feedback -. "Verify Order/Booking" .-> Order