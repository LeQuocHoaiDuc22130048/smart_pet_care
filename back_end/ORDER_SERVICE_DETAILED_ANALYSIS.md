# 📦 ORDER SERVICE - CHI TIẾT VÀ ĐÁNH GIÁ

## I. THÔNG TIN CƠ BẢN

| Tính chất | Chi tiết |
|----------|----------|
| **Tên Service** | order-service |
| **GroupId** | com.pet_care |
| **ArtifactId** | order_service |
| **Version** | 0.0.1-SNAPSHOT |
| **Java Version** | 21 |
| **Spring Boot** | 3.2.5 |
| **Spring Cloud** | 2023.0.1 |
| **Database** | MySQL 8.0 |

---

## II. CẤU TRÚC THƯ MỤC

```
order_service/
├── src/main/java/com/pet_care/order_service/
│   ├── client/                 # Feign clients gọi sang services khác
│   ├── configuration/          # Spring config (Security, WebClient, etc.)
│   ├── consumer/               # RabbitMQ consumers (lắng nghe events)
│   ├── controller/             # REST endpoints
│   ├── dto/
│   │   ├── request/            # Input DTOs
│   │   └── response/           # Output DTOs
│   ├── entity/                 # JPA entities (ánh xạ DB table)
│   ├── enums/                  # Enumerations
│   ├── exception/              # Custom exceptions
│   ├── mapper/                 # MapStruct mappers (Entity ↔ DTO)
│   ├── messaging/              # Event classes
│   ├── repository/             # JPA repositories
│   ├── service/                # Business logic
│   └── OrderServiceApplication.java
├── src/main/resources/
│   └── application.yaml        # Configuration
├── rabbitmq_data/              # Local RabbitMQ data
├── pom.xml
└── mvnw / mvnw.cmd
```

---

## III. 🏗️ KIẾN TRÚC HIỆN TẠI

### A. Database Schema (Dự kiến)

```sql
-- Orders
CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255),
  sub_total DECIMAL(10, 2),
  shipping_fee DECIMAL(10, 2),
  voucher_code VARCHAR(100),
  discount_amount DECIMAL(10, 2),
  final_amount DECIMAL(10, 2),
  shipping_name VARCHAR(255),
  shipping_phone VARCHAR(20),
  shipping_full_address TEXT,
  shipping_method VARCHAR(50),
  tracking_number VARCHAR(100),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order Items (chi tiết sản phẩm)
CREATE TABLE order_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL FOREIGN KEY,
  variant_id BIGINT,
  quantity INT,
  unit_price DECIMAL(10, 2),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Order Status History
CREATE TABLE order_status_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL,
  status VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Payments
CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL UNIQUE,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### B. Dependencies (pom.xml)

**Hiện tại có:**
- ✅ Spring Data JPA
- ✅ Spring Web
- ✅ MySQL Connector
- ✅ MapStruct
- ✅ Lombok
- ✅ Cloudinary (Image upload)
- ✅ Spring Cloud OpenFeign (Feign Client)
- ✅ Spring Security
- ✅ OAuth2 Resource Server

**Thiếu:**
- ❌ `spring-cloud-starter-netflix-eureka-client` (Service Discovery)
- ❌ `spring-cloud-starter-config` (Centralized Config)
- ❌ `spring-cloud-starter-amqp` (RabbitMQ)
- ❌ `io.github.resilience4j:resilience4j-spring-boot3` (Circuit Breaker)
- ❌ `org.springdoc:springdoc-openapi-starter-webmvc-ui` (Swagger)
- ❌ `io.micrometer:micrometer-registry-prometheus` (Monitoring)

---

## IV. 🔄 LUỒNG GIAO TIẾP

### Usecase: Tạo đơn hàng (Create Order)

```
1. Client HTTP POST /api/v1/orders
        ↓
2. API Gateway
        ↓
3. Order Controller (validate JWT)
        ↓
4. Order Service (Business Logic)
        ├─ Check user exists → Feign call User Service
        ├─ Check product stock → Feign call Product Service
        ├─ Create order in DB
        ├─ Publish EVENT: "ORDER_CREATED"
        └─ Return OrderResponse
        ↓
5. RabbitMQ Event Bus
        ├─ Product Service listens → Reserve inventory
        ├─ Notification Service listens → Send email
        └─ Payment Service listens → Prepare payment
```

### Khả năng có vấn đề:
- ⚠️ Nếu Product Service down → Feign call fail → Order không tạo được
- ⚠️ Nếu RabbitMQ down → EVENT không được publish
- ⚠️ Nếu message processing fail → Không có retry mechanism

---

## V. ⚠️ CÁC VẤN ĐỀ CHÍNH

### 1. **Thiếu Eureka Client Registration**
```yaml
# application.yaml chưa có
eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka
```
**Ảnh hưởng:** Service không thể tự động register với Eureka

### 2. **Thiếu Config Server Client**
```yaml
# application.yaml chưa có
spring:
  cloud:
    config:
      uri: http://config-server:8888
```
**Ảnh hưởng:** Config phải hard-code, khó quản lý

### 3. **Feign Client Không Có Retry & Circuit Breaker**

Ví dụ ProductServiceClient cần:
```java
@FeignClient(
  name = "product-service",
  url = "${product-service.url}",
  configuration = FeignConfig.class  // ← Cần add
)
```

**Configuration cần có:**
```java
@Configuration
public class FeignConfig {
  @Bean
  public Retryer retryer() {
    return new Retryer.Default(100, 1000, 3);  // Retry 3 lần
  }
  
  @Bean
  public ErrorDecoder errorDecoder() {
    return new FeignErrorDecoder();
  }
}
```

### 4. **RabbitMQ Queue/Exchange Không Được Declare Rõ Ràng**

Cần có:
```java
@Configuration
public class RabbitMQConfig {
  // Queues
  @Bean
  public Queue orderCreatedQueue() {
    return new Queue("order-created-queue", true);
  }
  
  // Exchanges
  @Bean
  public DirectExchange orderExchange() {
    return new DirectExchange("order-exchange", true, false);
  }
  
  // Bindings
  @Bean
  public Binding orderBinding() {
    return BindingBuilder.bind(orderCreatedQueue())
      .to(orderExchange())
      .with("order.created");
  }
}
```

### 5. **Global Exception Handler Không Rõ**

Cần có:
```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
    return ResponseEntity
      .status(HttpStatus.NOT_FOUND)
      .body(ErrorResponse.builder()
        .code(ErrorCode.RESOURCE_NOT_FOUND.getCode())
        .message(ex.getMessage())
        .build());
  }
}
```

### 6. **Không Có Input Validation**

Controllers cần:
```java
@PostMapping
public ResponseEntity<OrderResponse> createOrder(
  @Valid @RequestBody CreateOrderRequest request,  // ← @Valid
  Authentication auth
) {
  // ...
}
```

Request DTO cần:
```java
@Data
public class CreateOrderRequest {
  @NotNull
  @NotEmpty(message = "Items cannot be empty")
  private List<OrderItemRequest> items;
  
  @NotBlank
  private String shippingMethod;
}
```

### 7. **Snapshot Data Pattern Chưa Clear**

Khi tạo order, cần lưu snapshot:
```java
// ❌ Wrong - Using reference
ordersItem.setPrice(product.getPrice());  // Price có thể change

// ✅ Correct - Copy current value vào order_items.unit_price
ordersItem.setUnitPrice(productVariant.getPrice());  // Snapshot at this moment
```

---

## VI. 📋 CHECKLIST - CẦN LÀM GÌ TIẾP

### **PRIORITY 1: Critical** 🔴

- [ ] Add `spring-cloud-starter-config` dependency
- [ ] Add `spring-cloud-starter-netflix-eureka-client` dependency
- [ ] Update `application.yaml` với Eureka client config
- [ ] Create `Feign Client Config` với retry & timeout
- [ ] Implement `Global Exception Handler`
- [ ] Add `Spring Cloud Stream + RabbitMQ` consumer configuration
- [ ] Explicit declare RabbitMQ queues/exchanges in config

### **PRIORITY 2: High** 🟠

- [ ] Add `Resilience4j` circuit breaker
- [ ] Implement `Input Validation` (Bean Validation)
- [ ] Add `OpenAPI/Swagger` documentation
- [ ] Create `Database Migration Scripts` (Liquibase/Flyway)
- [ ] Test Feign Client error scenarios
- [ ] Implement `Dead Letter Queue` handling for failed messages

### **PRIORITY 3: Medium** 🟡

- [ ] Add `Prometheus metrics` (Micrometer)
- [ ] Add `Distributed Tracing` (Spring Cloud Sleuth)
- [ ] Implement `Unit Tests` (Service layer)
- [ ] Implement `Integration Tests` (with TestContainers)
- [ ] Add `Request/Response logging` middleware
- [ ] Performance optimization (indexing, caching)

---

## VII. 📝 SAMPLE CODE - ORDER SERVICE IMPROVEMENTS

### File: `FeignProductServiceClient.java`

```java
@FeignClient(
  name = "product-service",
  url = "${product-service.base-url}",
  configuration = ProductServiceFeignConfig.class
)
public interface ProductServiceClient {
  @GetMapping("/api/v1/products/{id}")
  ProductResponse getProduct(@PathVariable Long id);
  
  @GetMapping("/api/v1/inventory/{variantId}")
  InventoryResponse checkInventory(@PathVariable Long variantId);
}
```

### File: `ProductServiceFeignConfig.java`

```java
@Configuration
@Slf4j
public class ProductServiceFeignConfig {
  @Bean
  public Retryer retryer() {
    return new Retryer.Default(100, 1000, 3);
  }
  
  @Bean
  public ErrorDecoder errorDecoder() {
    return (methodKey, response) -> {
      if (response.status() == 404) {
        throw new ResourceNotFoundException("Product not found");
      }
      throw new ServiceUnavailableException("Product service unavailable");
    };
  }
  
  @Bean
  public RequestInterceptor requestInterceptor() {
    return template -> {
      template.header("X-Request-ID", UUID.randomUUID().toString());
    };
  }
}
```

### File: `OrderServiceImpl.java`

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {
  private final OrderRepository orderRepository;
  private final ProductServiceClient productServiceClient;
  private final RabbitTemplate rabbitTemplate;
  
  @Transactional
  public OrderResponse createOrder(CreateOrderRequest request) {
    try {
      // 1. Validate user & product
      validateOrder(request);
      
      // 2. Create order entity
      Order order = Order.builder()
        .userId(getCurrentUserId())
        .status(OrderStatus.PENDING)
        .items(createOrderItems(request.getItems()))
        .build();
      
      // 3. Save to DB
      Order savedOrder = orderRepository.save(order);
      
      // 4. Publish event
      rabbitTemplate.convertAndSend(
        "order-exchange", 
        "order.created", 
        new OrderCreatedEvent(savedOrder.getId())
      );
      
      return OrderMapper.toResponse(savedOrder);
    } catch (FeignException ex) {
      log.error("Feign client error: {}", ex.getMessage());
      throw new ServiceUnavailableException("Cannot create order, external service unavailable");
    }
  }
  
  private void validateOrder(CreateOrderRequest request) {
    // Check product stock
    request.getItems().forEach(item -> {
      try {
        InventoryResponse inventory = productServiceClient.checkInventory(item.getVariantId());
        if (inventory.getAvailableQuantity() < item.getQuantity()) {
          throw new InsufficientStockException("Not enough stock");
        }
      } catch (FeignException ex) {
        throw new ServiceUnavailableException("Cannot validate inventory");
      }
    });
  }
}
```

---

## VIII. 🎯 KIẾN NGHỊ

1. **Ngay lập tức:** Thêm Eureka & Config client
2. **Tuần này:** Implement Feign retry & circuit breaker
3. **Tuần sau:** Input validation + Global exception handling
4. **Sau 2 tuần:** Monitoring & tracing

---

**Cập nhật:** April 8, 2026


