# Product Service - Thông Tin Chi Tiết

## 📋 Tổng Quan Dự Án

**Product Service** là một microservice trong hệ thống PetCare, chịu trách nhiệm quản lý sản phẩm, danh mục, hình ảnh sản phẩm, quản lý tồn kho và xử lý sự kiện từ Order Service thông qua RabbitMQ.

- **Tên dự án**: product-service
- **Version**: 0.0.1-SNAPSHOT
- **GroupId**: com.pet_care
- **ArtifactId**: product_service
- **Java Version**: 21
- **Spring Boot Version**: 3.2.5
- **Spring Cloud Version**: 2023.0.1

---

## 🏗️ Kiến Trúc Cấu Trúc Thư Mục

```
product_service/
├── .mvn/                          # Maven wrapper configuration
├── src/
│   ├── main/
│   │   ├── java/com/pet_care/product/
│   │   │   ├── configuration/     # Spring configuration
│   │   │   ├── consumer/          # Message consumers
│   │   │   ├── controller/        # REST controllers
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   │   ├── request/       # DTO requests
│   │   │   │   └── response/      # DTO responses
│   │   │   ├── entity/            # JPA entities
│   │   │   ├── enums/             # Enumerations
│   │   │   ├── exception/         # Exception handling
│   │   │   ├── mapper/            # MapStruct mappers
│   │   │   ├── messaging/         # Event classes
│   │   │   ├── repository/        # Data repositories
│   │   │   ├── service/           # Business logic
│   │   │   └── ProductApplication.java
│   │   └── resources/
│   │       ├── application.yaml   # Configuration file
│   │       ├── static/            # Static files
│   │       └── templates/         # Template files
│   └── test/
│       └── java/com/pet_care/product/
├── target/                        # Build output
├── pom.xml                        # Maven configuration
├── mvnw, mvnw.cmd               # Maven wrapper scripts
└── HELP.md
```

---

## 📦 Dependencies (Phụ Thuộc)

### Core Spring Boot Dependencies
- **spring-boot-starter-data-jpa** - JPA/Hibernate ORM
- **spring-boot-starter-web** - REST API support
- **spring-boot-starter-validation** - Input validation
- **spring-boot-starter-test** - Testing framework
- **spring-boot-starter-oauth2-resource-server** - OAuth2 security
- **spring-boot-starter-amqp** - RabbitMQ support

### Database & ORM
- **mysql-connector-j** - MySQL database driver

### Cloud & Communication
- **spring-cloud-starter-openfeign** - Declarative HTTP client (optional)
- **spring-cloud-dependencies** - Cloud infrastructure

### File Upload & Cloud Storage
- **cloudinary-http44** (1.38.0) - Image management service

### Utilities & Libraries
- **projectlombok:lombok** (1.18.30) - Boilerplate code reduction
- **mapstruct** (1.5.5.Final) - Object mapping

### Build & Analysis
- **jacoco-maven-plugin** (0.8.12) - Code coverage
- **spotless-maven-plugin** (2.43.0) - Code formatting

---

## ⚙️ Cấu Hình (Application.yaml)

### Server Configuration
- **Port**: 8081
- **Context Path**: /pet_care_product

### Cloudinary Configuration (Image Management)
- **Cloud Name**: ${CLOUDINARY_CLOUD_NAME} (environment variable)
- **API Key**: ${CLOUDINARY_API_KEY} (environment variable)
- **API Secret**: ${CLOUDINARY_API_SECRET} (environment variable)

### File Upload Configuration
- **Max File Size**: 10MB
- **Max Request Size**: 10MB

### DateTime & Locale Configuration
- **Time Zone**: Asia/Ho_Chi_Minh
- **Date Format**: dd-MM-yyyy HH:mm:ss

### Database Configuration
- **URL**: jdbc:mysql://localhost:3306/pet_care_product
- **Driver**: com.mysql.cj.jdbc.Driver
- **Username**: root
- **Password**: root
- **Hibernate DDL Auto**: update

### RabbitMQ Configuration
- **Host**: localhost
- **Port**: 5672
- **Username**: guest
- **Password**: guest
- **Listener Acknowledgment Mode**: auto
- **Retry Enabled**: true
- **Max Retry Attempts**: 3

### Logging Configuration
- Spring Web debug logging enabled
- Multipart request logging enabled
- DispatcherServlet debug logging enabled

---

## 🔧 Các Module & Component Chính

### 1. **Controller Layer** (`controller/`)

#### ProductController.java
- `GET /products` - Lấy danh sách sản phẩm (có phân trang)
- `GET /products/{id}` - Lấy chi tiết sản phẩm
- `GET /products/category/{categoryId}` - Lấy sản phẩm theo danh mục
- `POST /products` - Tạo sản phẩm mới
- `PUT /products/{id}` - Cập nhật sản phẩm
- `DELETE /products/{id}` - Xóa sản phẩm
- `POST /products/{id}/images` - Upload hình ảnh cho sản phẩm
- `DELETE /products/{id}/images/{imageId}` - Xóa hình ảnh sản phẩm

#### CategoryController.java
- `GET /categories` - Lấy danh sách danh mục
- `GET /categories/{id}` - Lấy chi tiết danh mục
- `POST /categories` - Tạo danh mục mới
- `PUT /categories/{id}` - Cập nhật danh mục
- `DELETE /categories/{id}` - Xóa danh mục

#### ProductInternalController.java
- `POST /internal/reserve-stock` - Dự trữ kho (internal API cho Order Service)
- `POST /internal/rollback-stock` - Hoàn lại kho (internal API)
- `POST /internal/products/{id}` - Lấy thông tin sản phẩm (internal)

### 2. **Service Layer** (`service/`)

#### ProductService.java
- Quản lý CRUD sản phẩm
- Kiểm tra và cập nhật tồn kho
- Publish sự kiện stock reserve/rollback
- Xử lý hình ảnh sản phẩm

#### CategoryService.java
- Quản lý CRUD danh mục
- Kiểm tra danh mục tồn tại

#### CloudinaryService.java
- Upload hình ảnh lên Cloudinary
- Xóa hình ảnh từ Cloudinary
- Quản lý URL hình ảnh

#### ImageAsyncService.java
- Xử lý upload hình ảnh bất đồng bộ (@Async)
- Tối ưu hóa hiệu suất xử lý
- Xử lý cleanup hình ảnh

### 3. **Entity (JPA)** (`entity/`)

#### Products.java
- id (PK)
- name
- description
- price
- stock_quantity
- status (ACTIVE, INACTIVE, DISCONTINUED)
- category_id (FK)
- created_by
- created_at
- updated_at

#### Categories.java
- id (PK)
- name
- description
- created_at
- updated_at

#### Image.java
- id (PK)
- product_id (FK)
- image_url
- public_id (Cloudinary ID)
- is_primary
- created_at

#### InventoryLog.java
- id (PK)
- product_id (FK)
- change_type (RESERVE, RELEASE, PURCHASE)
- quantity_changed
- reason
- created_at

### 4. **Repository** (`repository/`)
- **ProductRepository.java** - Data access cho Products
- **CategoryRepository.java** - Data access cho Categories
- **ProductImageRepository.java** - Data access cho Images
- **InventoryLogRepository.java** - Data access cho Inventory Logs

### 5. **DTO (Data Transfer Objects)** (`dto/`)

#### Request DTOs (`dto/request/`)
- **ProductCreationRequest.java** - Tạo sản phẩm mới
- **ProductUpdateRequest.java** - Cập nhật sản phẩm
- **CategoryCreationRequest.java** - Tạo danh mục
- **CategoryUpdateRequest.java** - Cập nhật danh mục
- **ReserveStockRequest.java** - Dự trữ kho
- **RollbackStockRequest.java** - Hoàn lại kho

#### Response DTOs (`dto/response/`)
- **ProductResponse.java** - Phản hồi sản phẩm
- **CategoryResponse.java** - Phản hồi danh mục
- **CategoryResponseCreateProduct.java** - Danh mục khi tạo sản phẩm
- **ImageResponse.java** - Phản hồi hình ảnh

#### Shared DTOs
- **ApiResponse.java** - Wrapper cho API responses
- **ImageUploadData.java** - Thông tin upload hình ảnh

### 6. **Configuration** (`configuration/`)

#### SecurityConfig.java
- Spring Security configuration
- JWT authentication setup
- Endpoint authorization

#### CustomJwtDecoder.java
- Custom JWT decoder implementation
- Token validation logic

#### JwtAuthenticationEntryPoint.java
- JWT exception handling
- Error response formatting

#### RabbitConfig.java
- Queue declarations
- Exchange declarations
- Binding configuration

#### CloudinaryConfig.java
- Cloudinary SDK initialization
- Credentials configuration

### 7. **Exception Handling** (`exception/`)
- **AppException.java** - Custom exception class
- **ErrorCode.java** - Error codes enumeration
- **GlobalExceptionHandler.java** - Global exception handler (@RestControllerAdvice)

### 8. **Message & Event Driven** (`messaging/`, `consumer/`)

#### Events (`messaging/`)
- **BaseEvent.java** - Base event class
- **StockReserveEvent.java** - Event yêu cầu dự trữ kho
- **StockReservedEvent.java** - Event xác nhận dự trữ thành công
- **StockRollbackEvent.java** - Event hoàn lại kho
- **StockFailedEvent.java** - Event dự trữ thất bại
- **EventPublisher.java** - Publisher cho events

#### Consumers (`consumer/`)
- **ProductEventConsumer.java**
  - Xử lý StockReserveEvent từ Order Service
  - Xác nhận stock hoặc publish failure event
  - Retry logic khi thất bại

### 9. **Mapper (MapStruct)** (`mapper/`)
- **ProductMapper.java** - Ánh xạ Product entity ↔ DTO
- **CategoryMapper.java** - Ánh xạ Category entity ↔ DTO

### 10. **Enums** (`enums/`)
- **ProductStatus.java** - ACTIVE, INACTIVE, DISCONTINUED
- **InventoryChangeType.java** - RESERVE, RELEASE, PURCHASE

---

## 🔄 Luồng Hoạt Động Chính

### 1. **Tạo Sản Phẩm**
```
POST /pet_care_product/products
├── ProductController.createProduct()
├── ProductService.createProduct()
│   ├── Validate request
│   ├── Create Products entity
│   ├── Save to database
│   └── Return ProductResponse
└── HTTP 201 Created
```

### 2. **Upload Hình Ảnh Sản Phẩm**
```
POST /pet_care_product/products/{id}/images
├── ProductController.uploadImages()
├── CloudinaryService.uploadImages() (async)
│   ├── Upload to Cloudinary
│   ├── Create Image entity
│   └── Save to database
├── ImageAsyncService.processAsync()
└── HTTP 200 OK
```

### 3. **Dự Trữ Kho từ Order Service**
```
POST /pet_care_product/internal/reserve-stock
├── ProductInternalController.reserveStock()
├── ProductService.reserveStock()
│   ├── Check stock availability
│   ├── Update stock quantity
│   ├── Create InventoryLog
│   ├── Publish StockReservedEvent
│   └── Return success
├── ProductEventConsumer.handleStockReservedEvent()
└── Emit to RabbitMQ: product.stock.reserved
```

### 4. **Hoàn Lại Kho (Rollback)**
```
POST /pet_care_product/internal/rollback-stock
├── ProductInternalController.rollbackStock()
├── ProductService.rollbackStock()
│   ├── Restore stock quantity
│   ├── Create InventoryLog (RELEASE)
│   ├── Publish StockRollbackEvent
│   └── Return success
└── Notify Order Service via RabbitMQ
```

### 5. **Lấy Danh Sách Sản Phẩm (Phân Trang)**
```
GET /pet_care_product/products?page=0&size=20&category=1
├── ProductController.getProducts()
├── ProductService.getProducts()
│   ├── Query database with pagination
│   ├── Include category information
│   └── Return page of ProductResponse
└── HTTP 200 OK
```

---

## 🔐 Security & Authentication

- **OAuth2 Resource Server** - Bảo vệ các endpoint public
- **JWT Token** - Từ Authorization header
- **Custom JWT Decoder** - Từ Identity Service
- **Internal Endpoints** - `/internal/*` có thể không yêu cầu auth (cấu hình riêng)
- **JwtAuthenticationEntryPoint** - Xử lý JWT errors

---

## 📨 Message Queuing (RabbitMQ)

### Exchanges
- **product.exchange** - Exchange cho sự kiện sản phẩm
- **order.exchange** - Exchange từ Order Service

### Queues & Routing Keys
| Event | Queue | Routing Key | Consumer/Publisher |
|-------|-------|-------------|-------------------|
| Stock Reserve Request | product.stock.reserve.queue | product.stock.reserve | ProductEventConsumer |
| Stock Reserved | product.stock.reserved.queue | product.stock.reserved | (published by ProductService) |
| Stock Failed | product.stock.failed.queue | product.stock.failed | (published by ProductService) |
| Stock Rollback | product.stock.rollback.queue | product.stock.rollback | (published by ProductService) |
| Order Created | order.created.queue | order.created | (from Order Service) |

---

## 🏗️ Async Processing

- **@EnableAsync** - Enabled trên ProductApplication
- **ImageAsyncService** - Xử lý upload hình ảnh bất đồng bộ
- **RabbitMQ Listener** - Xử lý sự kiện bất đồng bộ
- **ThreadPoolExecutor** - Configurable thread pool

---

## 🛠️ Build Tools & Plugins

### Maven Plugins
1. **spring-boot-maven-plugin** - Spring Boot packaging
2. **maven-compiler-plugin** (v3.11.0) - Java compilation
   - Annotation processors: Lombok, MapStruct
3. **jacoco-maven-plugin** (v0.8.12) - Code coverage analysis
4. **spotless-maven-plugin** (v2.43.0) - Code formatting
   - Palantir Java Format
   - Remove unused imports
   - Trim trailing whitespace

---

## 🎨 Tính Năng Chính

✅ **Microservice Architecture** - Standalone service với integration points
✅ **Product Management** - CRUD operations cho sản phẩm
✅ **Category Management** - Quản lý danh mục sản phẩm
✅ **Image Management** - Upload/delete hình ảnh via Cloudinary
✅ **Inventory Tracking** - Quản lý tồn kho với logs
✅ **Stock Reservation** - Dự trữ kho cho đơn hàng
✅ **Event-Driven** - RabbitMQ integration
✅ **Async Processing** - @Async image processing
✅ **OAuth2 Security** - JWT token authentication
✅ **RESTful API** - Chuẩn REST endpoints
✅ **Pagination** - Hỗ trợ phân trang
✅ **Error Handling** - Global exception handling
✅ **Code Quality** - Code formatting & coverage analysis
✅ **Logging** - Debug logging enabled

---

## 📊 Database Schema

### Tables

#### products
- id (PK, Long)
- name (String, NOT NULL)
- description (Text)
- price (BigDecimal, NOT NULL)
- stock_quantity (Integer, NOT NULL)
- status (Enum: ACTIVE, INACTIVE, DISCONTINUED)
- category_id (FK to categories)
- created_by (Long)
- created_at (Timestamp)
- updated_at (Timestamp)

#### categories
- id (PK, Long)
- name (String, NOT NULL, UNIQUE)
- description (Text)
- created_at (Timestamp)
- updated_at (Timestamp)

#### images
- id (PK, Long)
- product_id (FK to products, NOT NULL)
- image_url (String, NOT NULL)
- public_id (String) - Cloudinary public ID
- is_primary (Boolean, default false)
- created_at (Timestamp)

#### inventory_logs
- id (PK, Long)
- product_id (FK to products, NOT NULL)
- change_type (Enum: RESERVE, RELEASE, PURCHASE)
- quantity_changed (Integer, NOT NULL)
- reason (String)
- created_at (Timestamp)

---

## 🔗 Integration Points

### Internal APIs
- **POST /internal/reserve-stock** - Order Service gọi để dự trữ kho
- **POST /internal/rollback-stock** - Order Service gọi để hoàn lại kho
- **POST /internal/products/{id}** - Lấy thông tin sản phẩm nội bộ

### External Services
- **Cloudinary** - Image hosting & management
- **Identity Service** - JWT validation (port 8080)
- **Order Service** - Nhận yêu cầu dự trữ kho

### Event Communication
- **RabbitMQ** - Asynchronous message broker
  - Publish: StockReservedEvent, StockFailedEvent, StockRollbackEvent
  - Consume: StockReserveEvent (từ Order Service)

---

## 📚 API Endpoints

### Product Endpoints
| Method | Path | Description | Auth | Internal |
|--------|------|-------------|------|----------|
| GET | /pet_care_product/products | Lấy danh sách (phân trang) | ✅ | ❌ |
| GET | /pet_care_product/products/{id} | Lấy chi tiết sản phẩm | ✅ | ❌ |
| POST | /pet_care_product/products | Tạo sản phẩm | ✅ | ❌ |
| PUT | /pet_care_product/products/{id} | Cập nhật sản phẩm | ✅ | ❌ |
| DELETE | /pet_care_product/products/{id} | Xóa sản phẩm | ✅ | ❌ |
| POST | /pet_care_product/products/{id}/images | Upload hình ảnh | ✅ | ❌ |
| DELETE | /pet_care_product/products/{id}/images/{imageId} | Xóa hình ảnh | ✅ | ❌ |

### Category Endpoints
| Method | Path | Description | Auth | Internal |
|--------|------|-------------|------|----------|
| GET | /pet_care_product/categories | Lấy danh sách danh mục | ✅ | ❌ |
| GET | /pet_care_product/categories/{id} | Lấy chi tiết danh mục | ✅ | ❌ |
| POST | /pet_care_product/categories | Tạo danh mục | ✅ | ❌ |
| PUT | /pet_care_product/categories/{id} | Cập nhật danh mục | ✅ | ❌ |
| DELETE | /pet_care_product/categories/{id} | Xóa danh mục | ✅ | ❌ |

### Internal Endpoints (Service-to-Service)
| Method | Path | Description | Auth | Consumer |
|--------|------|-------------|------|----------|
| POST | /pet_care_product/internal/reserve-stock | Dự trữ kho | ❌ | Order Service |
| POST | /pet_care_product/internal/rollback-stock | Hoàn lại kho | ❌ | Order Service |
| POST | /pet_care_product/internal/products/{id} | Lấy info sản phẩm | ❌ | Order Service |

---

## 🐛 Testing

- **Spring Boot Test** - Unit & Integration testing
- **JaCoCo** - Code coverage metrics
- **MockMvc** - HTTP layer testing

---

## 🌍 Environment Configuration

### Cloudinary Environment Variables (Required)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🎯 Trạng Thái Project

- **Status**: In Development (0.0.1-SNAPSHOT)
- **Supported Java**: 21
- **Framework**: Spring Boot 3.2.5
- **Architecture**: Microservices with Event Sourcing
- **Async Processing**: Enabled (@EnableAsync)

---

## 📈 Performance Considerations

- **Image Upload**: Async processing để không block request
- **Database**: Lazy loading relationships để optimize queries
- **RabbitMQ Retry**: Automatic retry với exponential backoff
- **Pagination**: Always use pagination cho list endpoints
- **Cloudinary**: CDN delivery cho hình ảnh

---

## 🔒 Best Practices Implemented

✅ **Separation of Concerns** - Clear separation giữa layers
✅ **DTO Pattern** - No direct entity exposure
✅ **MapStruct** - Type-safe object mapping
✅ **Global Exception Handling** - Centralized error management
✅ **Async Processing** - Non-blocking I/O operations
✅ **Event-Driven** - Loose coupling giữa services
✅ **JWT Security** - Stateless authentication
✅ **Logging** - Comprehensive logging
✅ **Code Formatting** - Spotless automatic formatting
✅ **Code Coverage** - JaCoCo integration

---

**Last Updated**: March 27, 2026

