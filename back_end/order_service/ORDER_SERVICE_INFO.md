# Order Service - Thông Tin Chi Tiết

## 📋 Tổng Quan Dự Án

**Order Service** là một microservice trong hệ thống PetCare, chịu trách nhiệm quản lý đơn hàng, xử lý thanh toán và giao tiếp với các dịch vụ khác thông qua RabbitMQ và Feign Client.

- **Tên dự án**: order-service
- **Version**: 0.0.1-SNAPSHOT
- **GroupId**: com.pet_care
- **ArtifactId**: order_service
- **Java Version**: 21
- **Spring Boot Version**: 3.2.5
- **Spring Cloud Version**: 2023.0.1

---

## 🏗️ Kiến Trúc Cấu Trúc Thư Mục

```
order_service/
├── .mvn/                          # Maven wrapper configuration
├── src/
│   ├── main/
│   │   ├── java/com/pet_care/order_service/
│   │   │   ├── client/            # Feign clients
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
│   │   │   ├── repository/        # Data repository
│   │   │   ├── service/           # Business logic
│   │   │   └── OrderServiceApplication.java
│   │   └── resources/
│   │       └── application.yaml   # Configuration file
│   └── test/
│       ├── java/com/pet_care/order_service/
│       └── resources/
├── target/                        # Build output
├── rabbitmq_data/                # RabbitMQ data storage
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
- **spring-cloud-starter-openfeign** - Declarative HTTP client
- **spring-cloud-dependencies** - Cloud infrastructure

### Utilities & Libraries
- **projectlombok:lombok** (1.18.30) - Boilerplate code reduction
- **mapstruct** (1.5.5.Final) - Object mapping
- **cloudinary-http44** (1.38.0) - Image management

### Additional
- **product_service** (0.0.1-SNAPSHOT) - Product service dependency
- **jacoco-maven-plugin** (0.8.12) - Code coverage
- **spotless-maven-plugin** (2.43.0) - Code formatting

---

## ⚙️ Cấu Hình (Application.yaml)

### Server Configuration
- **Port**: 8083
- **Context Path**: /pet_care_order

### Database Configuration
- **URL**: jdbc:mysql://localhost:3306/pet_care_order
- **Driver**: com.mysql.cj.jdbc.Driver
- **Username**: root
- **Password**: root
- **Hibernate DDL Auto**: update

### RabbitMQ Configuration
- **Host**: localhost
- **Port**: 5672
- **Username**: guest
- **Password**: guest
- **Exchange**: order.exchange
- **Routing Key**: order.created
- **Queue**: order.created.queue

### Security & OAuth2
- **Issuer URI**: http://localhost:8080/pet_care_identity

### Logging
- Spring Web debug logging enabled
- Multipart request logging enabled
- DispatcherServlet debug logging enabled

### Feign Client Configuration
- **Connection Timeout**: 5000ms
- **Read Timeout**: 5000ms
- **Logger Level**: full

---

## 🔧 Các Module & Component Chính

### 1. **Controller Layer** (`controller/`)
- **OrderController.java**
  - `POST /orders` - Tạo đơn hàng mới
  - `POST /orders/payment-status` - Cập nhật trạng thái thanh toán
  - Sử dụng JWT authentication (@AuthenticationPrincipal)

### 2. **Service Layer** (`service/`)
- **OrderService.java** - Xử lý logic kinh doanh chính
  - Tạo đơn hàng
  - Cập nhật trạng thái thanh toán
  - Kiểm tra stock

### 3. **Entity (JPA)** (`entity/`)
- **Orders.java** - Entity chính cho đơn hàng
- **OrderItem.java** - Entity cho các mục trong đơn hàng

### 4. **Repository** (`repository/`)
- **OrderRepository.java** - Data access layer cho Orders

### 5. **DTO (Data Transfer Objects)** (`dto/`)

#### Request DTOs (`dto/request/`)
- **CreateOrderRequest.java** - Yêu cầu tạo đơn hàng
- **OrderItemRequest.java** - Thông tin mục hàng
- **PaymentRequest.java** - Thông tin thanh toán
- **ReserveStockRequest.java** - Yêu cầu dự trữ kho
- **RollbackStockRequest.java** - Yêu cầu hoàn lại kho

#### Response DTOs (`dto/response/`)
- **OrderResponse.java** - Phản hồi đơn hàng
- **OrderItemResponse.java** - Phản hồi mục hàng
- **ProductResponse.java** - Thông tin sản phẩm

#### Shared DTOs
- **ApiResponse.java** - Wrapper cho API responses

### 6. **Configuration** (`configuration/`)
- **SecurityConfig.java** - Spring Security configuration
- **CustomJwtDecoder.java** - Custom JWT decoder
- **JwtAuthenticationEntryPoint.java** - JWT exception handling
- **RabbitMQConfig.java** - RabbitMQ configuration

### 7. **Exception Handling** (`exception/`)
- **AppException.java** - Custom exception class
- **ErrorCode.java** - Error codes enumeration
- **GlobalExceptionHandler.java** - Global exception handler

### 8. **Message & Event Driven** (`messaging/`, `consumer/`)

#### Events (`messaging/`)
- **BaseEvent.java** - Base event class
- **OrderCreatedEvent.java** - Event khi đơn hàng được tạo
- **OrderItemEvent.java** - Event cho mục hàng
- **PaymentResultEvent.java** - Event kết quả thanh toán
- **StockReserveEvent.java** - Event dự trữ kho
- **StockRollbackEvent.java** - Event hoàn lại kho

#### Consumers (`consumer/`)
- **PaymentEventConsumer.java** - Xử lý sự kiện thanh toán
- **StockEventConsumer.java** - Xử lý sự kiện kho
- **OrderEventPublisher.java** - Phát hành sự kiện đơn hàng

### 9. **Mapper (MapStruct)** (`mapper/`)
- **OrderMapper.java** - Ánh xạ Order entity ↔ DTO
- **OrderItemMapper.java** - Ánh xạ OrderItem entity ↔ DTO

### 10. **Client (Feign)** (`client/`)
- **ProductClient.java** - Giao tiếp với Product Service

### 11. **Enums** (`enums/`)
- **OrderStatus.java** - Trạng thái của đơn hàng

---

## 🔄 Luồng Hoạt Động Chính

### 1. **Tạo Đơn Hàng** (Create Order)
```
POST /pet_care_order/orders
├── OrderController.createOrder()
├── Extract userId from JWT token
├── OrderService.createOrder()
│   ├── Validate request
│   ├── Create Orders entity
│   ├── Create OrderItems
│   ├── Reserve stock via ProductClient
│   ├── Save to database
│   └── Publish OrderCreatedEvent via RabbitMQ
└── Return OrderResponse
```

### 2. **Cập Nhật Trạng Thái Thanh Toán**
```
POST /pet_care_order/orders/payment-status
├── OrderController.updatePaymentStatus()
├── OrderService.updatePaymentStatus()
│   ├── Update order status in database
│   └── Publish PaymentResultEvent via RabbitMQ
└── Return success response
```

### 3. **Xử Lý Sự Kiện từ Payment Service**
```
RabbitMQ Queue: payment.result.queue
├── PaymentEventConsumer.handlePaymentResult()
├── Process payment status
├── Update order payment status
└── Publish OrderStatusUpdatedEvent
```

### 4. **Xử Lý Sự Kiện từ Stock Service**
```
RabbitMQ Queue: stock.reserve.queue
├── StockEventConsumer.handleStockReserved()
├── Confirm stock reservation
├── Update order status
└── Publish event
```

---

## 🔐 Security & Authentication

- **OAuth2 Resource Server** - Bảo vệ các endpoint
- **JWT Token** - Từ Authorization header
- **Custom JWT Decoder** - Từ Identity Service (issuer-uri)
- **JwtAuthenticationEntryPoint** - Xử lý JWT errors

---

## 📨 Message Queuing (RabbitMQ)

### Exchanges
- **order.exchange** - Exchange cho sự kiện đơn hàng

### Queues & Routing Keys
| Event | Queue | Routing Key | Consumer |
|-------|-------|-------------|----------|
| Payment Result | payment.result.queue | payment.result | PaymentEventConsumer |
| Stock Reserved | stock.reserve.queue | stock.reserved | StockEventConsumer |
| Order Created | order.created.queue | order.created | (published by OrderService) |

---

## 🛠️ Build Tools & Plugins

### Maven Plugins
1. **spring-boot-maven-plugin** - Spring Boot packaging
2. **maven-compiler-plugin** - Java compilation (v3.11.0)
   - Annotation processors: Lombok, MapStruct
3. **jacoco-maven-plugin** - Code coverage analysis (v0.8.12)
4. **spotless-maven-plugin** - Code formatting (v2.43.0)
   - Palantir Java Format
   - Remove unused imports
   - Trim trailing whitespace

---

## 📝 Key Features

✅ **Microservice Architecture** - Standalone service tích hợp với ecosystem
✅ **Event-Driven** - Sử dụng RabbitMQ cho asynchronous communication
✅ **OAuth2 Security** - JWT token authentication
✅ **RESTful API** - Chuẩn REST endpoints
✅ **ORM (JPA/Hibernate)** - Database abstraction
✅ **MapStruct** - Type-safe object mapping
✅ **Feign Client** - Declarative HTTP client
✅ **Error Handling** - Global exception handling
✅ **Code Quality** - Code formatting & coverage analysis
✅ **Logging** - Debug logging enabled

---

## 🚀 Cách Chạy

### Prerequisites
- Java 21
- Maven 3.9+
- MySQL 8.0+
- RabbitMQ
- Identity Service (port 8080)

### Build & Run
```bash
# Build project
mvn clean install

# Run service
mvn spring-boot:run
```

### Docker (nếu có Dockerfile)
```bash
docker-compose up -d order_service
```

---

## 📊 Database Schema

### Tables
- **orders** - Lưu trữ thông tin đơn hàng
  - id (PK)
  - user_id
  - status
  - created_at
  - updated_at
  - ...

- **order_items** - Lưu trữ các mục trong đơn hàng
  - id (PK)
  - order_id (FK)
  - product_id
  - quantity
  - price
  - ...

---

## 🔗 Integration Points

### Internal Services
- **Product Service** - Kiểm tra và dự trữ kho (Feign client)
- **Payment Service** - Xử lý thanh toán (RabbitMQ events)
- **Identity Service** - JWT validation (OAuth2)

---

## 📚 API Endpoints

### Order Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /pet_care_order/orders | Tạo đơn hàng | JWT |
| POST | /pet_care_order/orders/payment-status | Cập nhật trạng thái TT | No |

---

## 🐛 Testing

- **Spring Boot Test** - Unit & Integration testing
- **JaCoCo** - Code coverage metrics

---

## 📄 Configuration Files

- **pom.xml** - Maven dependencies & build configuration
- **application.yaml** - Spring Boot application properties
- **docker-compose.yaml** - Docker orchestration (root level)

---

## 🎯 Trạng Thái Project

- Status: In Development (0.0.1-SNAPSHOT)
- Supported Java: 21
- Framework: Spring Boot 3.2.5
- Architecture: Microservices with Event Sourcing

---

**Last Updated**: 2026-03-27

