# 🚀 ACTION PLAN - ROADMAP TỚI PRODUCTION

## 📅 Timeline: 4-6 tuần để Production Ready

---

## PHASE 1: STABILIZATION & STANDARDIZATION (Week 1-2) 🔴

### Tuần 1: Infrastructure Setup

#### Task 1.1: Chuẩn hóa Spring Boot & Cloud Versions
**Priority:** 🔴 CRITICAL  
**Thời gian:** 2 ngày  
**File cần sửa:** Tất cả pom.xml

```xml
<!-- Cập nhật tất cả service thành version nhất quán -->
<parent>
  <version>3.2.5</version>  <!-- ← API Gateway: 3.4.9 → 3.2.5 -->
</parent>

<!-- Add Spring Cloud dependency management -->
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>2023.0.1</version>  <!-- ← Identity Service: Add this -->
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

**Checklist:**
- [ ] API Gateway pom.xml: 3.4.9 → 3.2.5, add Spring Cloud BOM
- [ ] Identity Service pom.xml: add Spring Cloud dependency management
- [ ] Verify all services use Spring Cloud 2023.0.1
- [ ] Build & test all services

---

#### Task 1.2: Create Eureka Server (Service Discovery)
**Priority:** 🔴 CRITICAL  
**Thời gian:** 1 ngày  
**Tạo:** `discovery_service/` (Spring Cloud Eureka)

```bash
# New structure
discovery_service/
├── pom.xml (spring-cloud-starter-netflix-eureka-server)
├── src/main/java/.../DiscoveryApplication.java
└── src/main/resources/application.yaml
```

**application.yaml:**
```yaml
spring:
  application:
    name: discovery-service

server:
  port: 8761

eureka:
  instance:
    hostname: localhost
  client:
    registerWithEureka: false
    fetchRegistry: false
    serviceUrl:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
  server:
    waitTimeInMsWhenSyncEmpty: 0
```

**Main class:**
```java
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryApplication {
  public static void main(String[] args) {
    SpringApplication.run(DiscoveryApplication.class, args);
  }
}
```

---

#### Task 1.3: Create Config Server
**Priority:** 🔴 CRITICAL  
**Thời gian:** 1 ngày  
**Tạo:** `config_service/`

```bash
# New structure
config_service/
├── pom.xml (spring-cloud-config-server)
├── src/main/java/.../ConfigApplication.java
├── src/main/resources/application.yaml
└── config-repo/  # Git repository hoặc local folder
    ├── api-gateway.yaml
    ├── identity-service.yaml
    ├── order-service.yaml
    ├── product-service.yaml
    └── payment-service.yaml
```

**Main class:**
```java
@SpringBootApplication
@EnableConfigServer
public class ConfigApplication {
  public static void main(String[] args) {
    SpringApplication.run(ConfigApplication.class, args);
  }
}
```

---

#### Task 1.4: Add Eureka Client + Config Client to All Services
**Priority:** 🔴 CRITICAL  
**Thời gian:** 2 ngày  
**File cần sửa:** Tất cả pom.xml + application.yaml

**Thêm dependencies:**
```xml
<!-- Eureka Client -->
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<!-- Config Client -->
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

**bootstrap.yaml (hoặc application.yaml - mỗi service):**
```yaml
spring:
  cloud:
    config:
      uri: http://config-server:8888
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        multiplier: 1.1
        max-attempts: 10

eureka:
  client:
    service-url:
      defaultZone: http://eureka-server:8761/eureka/
  instance:
    prefer-ip-address: true
```

**Checklist:**
- [ ] Add dependencies to all service pom.xml
- [ ] Create bootstrap.yaml cho mỗi service
- [ ] Update application.yaml từ Config Server
- [ ] Test service registration với Eureka
- [ ] Test config pull từ Config Server

---

#### Task 1.5: Update docker-compose.yaml
**Priority:** 🔴 CRITICAL  
**Thời gian:** 1 ngày  
**File:** docker-compose.yaml

```yaml
version: '3.8'

services:
  # === Database ===
  mysql-db:
    image: mysql:8.0
    container_name: petcare-mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: petcare
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - petcare-network

  # === Message Broker ===
  rabbitmq:
    image: rabbitmq:3-management
    container_name: petcare-rabbitmq
    hostname: rabbit-server
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
    networks:
      - petcare-network

  # === Cache ===
  redis:
    image: redis:7-alpine
    container_name: petcare-redis
    ports:
      - "6379:6379"
    networks:
      - petcare-network

  # === Service Discovery ===
  eureka-server:
    build:
      context: ./discovery_service
      dockerfile: Dockerfile
    container_name: petcare-eureka
    ports:
      - "8761:8761"
    environment:
      SPRING_PROFILES_ACTIVE: docker
    networks:
      - petcare-network
    depends_on:
      - mysql-db

  # === Config Server ===
  config-server:
    build:
      context: ./config_service
      dockerfile: Dockerfile
    container_name: petcare-config
    ports:
      - "8888:8888"
    environment:
      SPRING_PROFILES_ACTIVE: docker
    networks:
      - petcare-network
    depends_on:
      - mysql-db

  # === Microservices ===
  api-gateway:
    build:
      context: ./api_gateway
      dockerfile: Dockerfile
    container_name: petcare-gateway
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: docker
    networks:
      - petcare-network
    depends_on:
      - eureka-server
      - config-server

  identity-service:
    build:
      context: ./identity_service
      dockerfile: Dockerfile
    container_name: petcare-identity
    environment:
      SPRING_PROFILES_ACTIVE: docker
    networks:
      - petcare-network
    depends_on:
      - mysql-db
      - eureka-server
      - config-server

  order-service:
    build:
      context: ./order_service
      dockerfile: Dockerfile
    container_name: petcare-order
    environment:
      SPRING_PROFILES_ACTIVE: docker
    networks:
      - petcare-network
    depends_on:
      - mysql-db
      - rabbitmq
      - eureka-server
      - config-server

  product-service:
    build:
      context: ./product_service
      dockerfile: Dockerfile
    container_name: petcare-product
    environment:
      SPRING_PROFILES_ACTIVE: docker
    networks:
      - petcare-network
    depends_on:
      - mysql-db
      - rabbitmq
      - eureka-server
      - config-server

  payment-service:
    build:
      context: ./payment_service
      dockerfile: Dockerfile
    container_name: petcare-payment
    environment:
      SPRING_PROFILES_ACTIVE: docker
    networks:
      - petcare-network
    depends_on:
      - mysql-db
      - eureka-server
      - config-server

networks:
  petcare-network:
    driver: bridge

volumes:
  mysql_data:
```

---

### Tuần 2: Code Standardization

#### Task 2.1: Chuẩn hóa Package Naming
**Priority:** 🔴 CRITICAL  
**Thời gian:** 2 ngày  
**Thay đổi:** `com.hoaiduc.identity` → `com.pet_care.identity`

```
Hiện tại:
identity_service/src/main/java/com/hoaiduc/identity/

Cần thay thế thành:
identity_service/src/main/java/com/pet_care/identity/
```

---

#### Task 2.2: Implement Global Exception Handling (Tất cả services)
**Priority:** 🔴 CRITICAL  
**Thời gian:** 2 ngày

Tạo chung core structure cho tất cả services:

```java
// ErrorCode.java (enum)
public enum ErrorCode {
  USER_NOT_FOUND("001", "User not found"),
  PRODUCT_NOT_FOUND("002", "Product not found"),
  INSUFFICIENT_STOCK("003", "Insufficient stock"),
  INVALID_ORDER("004", "Invalid order"),
  PAYMENT_FAILED("005", "Payment failed"),
  UNAUTHORIZED("006", "Unauthorized"),
  INVALID_INPUT("007", "Invalid input");
  
  private final String code;
  private final String message;
  
  // Constructor & getters
}

// AppException.java
public class AppException extends RuntimeException {
  private final ErrorCode errorCode;
  
  public AppException(ErrorCode errorCode) {
    super(errorCode.getMessage());
    this.errorCode = errorCode;
  }
}

// ErrorResponse.java
@Data
@Builder
public class ErrorResponse {
  private String code;
  private String message;
  private Long timestamp;
  private String path;
}

// GlobalExceptionHandler.java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
  @ExceptionHandler(AppException.class)
  public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
    return ResponseEntity
      .status(HttpStatus.BAD_REQUEST)
      .body(ErrorResponse.builder()
        .code(ex.getErrorCode().getCode())
        .message(ex.getMessage())
        .timestamp(System.currentTimeMillis())
        .build());
  }
}
```

---

#### Task 2.3: Add Input Validation (Bean Validation)
**Priority:** 🟠 HIGH  
**Thời gian:** 1 ngày

Ví dụ cho Order Service:
```java
@Data
public class CreateOrderRequest {
  @NotNull
  @NotEmpty(message = "Items cannot be empty")
  private List<OrderItemRequest> items;
  
  @NotBlank
  private String shippingMethod;
}

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {
  @PostMapping
  public ResponseEntity<OrderResponse> createOrder(
    @Valid @RequestBody CreateOrderRequest request  // ← @Valid
  ) {
    // ...
  }
}
```

---

#### Task 2.4: Add Eureka Client Config to API Gateway
**Priority:** 🟠 HIGH  
**Thời gian:** 1 ngày

API Gateway `application.yaml`:
```yaml
spring:
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true  # ← Auto-route to registered services
          lower-case-service-id: true
      routes:
        - id: identity-service
          uri: lb://identity-service  # lb = load balanced
          predicates:
            - Path=/api/v1/auth/**
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/v1/orders/**
        # ... more routes
```

---

## PHASE 2: RESILIENCE & RELIABILITY (Week 3-4) 🟠

### Task 3.1: Add Circuit Breaker (Resilience4j)
**Priority:** 🟠 HIGH  
**Thời gian:** 2 ngày

**Thêm dependency:**
```xml
<dependency>
  <groupId>io.github.resilience4j</groupId>
  <artifactId>resilience4j-spring-boot3</artifactId>
  <version>2.0.2</version>
</dependency>

<dependency>
  <groupId>io.github.resilience4j</groupId>
  <artifactId>resilience4j-feign</artifactId>
  <version>2.0.2</version>
</dependency>
```

**Config (application.yaml):**
```yaml
resilience4j:
  circuitbreaker:
    instances:
      productService:
        registerHealthIndicator: true
        slidingWindowSize: 10
        minimumNumberOfCalls: 5
        permittedNumberOfCallsInHalfOpenState: 3
        automaticTransitionFromOpenToHalfOpenEnabled: true
        waitDurationInOpenState: 5s
        failureRateThreshold: 50
        slowCallRateThreshold: 100
        slowCallDurationThreshold: 2s
  
  retry:
    instances:
      productService:
        maxAttempts: 3
        waitDuration: 100
```

**Feign Client Config:**
```java
@FeignClient(name = "product-service", configuration = ProductFeignConfig.class)
public interface ProductServiceClient {
  @GetMapping("/api/v1/products/{id}")
  ProductResponse getProduct(@PathVariable Long id);
}

@Configuration
public class ProductFeignConfig {
  @Bean
  public Retryer retryer() {
    return new Retryer.Default(100, 1000, 3);
  }
  
  @Bean
  @CircuitBreaker(name = "productService", fallbackMethod = "fallback")
  public ResponseInterceptor responseInterceptor() {
    return template -> {};
  }
}
```

---

### Task 3.2: Add RabbitMQ Consumer Configuration
**Priority:** 🟠 HIGH  
**Thời gian:** 2 ngày

**Product Service - Consumer:**
```java
@Configuration
@RequiredArgsConstructor
public class RabbitMQConfig {
  // Declare queue, exchange, binding
  @Bean
  public Queue orderCreatedQueue() {
    return new Queue("order-created-queue", true);
  }
  
  @Bean
  public DirectExchange orderExchange() {
    return new DirectExchange("order-exchange", true, false);
  }
  
  @Bean
  public Binding orderBinding() {
    return BindingBuilder.bind(orderCreatedQueue())
      .to(orderExchange())
      .with("order.created");
  }
  
  // Dead Letter Queue
  @Bean
  public Queue orderCreatedDLQ() {
    return new Queue("order-created-dlq", true);
  }
  
  @Bean
  public DirectExchange orderDLXExchange() {
    return new DirectExchange("order-dlx-exchange", true, false);
  }
  
  @Bean
  public Binding orderDLXBinding() {
    return BindingBuilder.bind(orderCreatedDLQ())
      .to(orderDLXExchange())
      .with("order.created");
  }
}

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCreatedConsumer {
  private final InventoryService inventoryService;
  
  @RabbitListener(queues = "order-created-queue")
  @Transactional
  public void handleOrderCreated(OrderCreatedEvent event) {
    try {
      inventoryService.reserveInventory(event);
      log.info("Order processed: {}", event.getOrderId());
    } catch (Exception ex) {
      log.error("Error processing order", ex);
      throw ex;  // Retry by RabbitMQ
    }
  }
}
```

---

### Task 3.3: Add Database Migration Tool (Liquibase)
**Priority:** 🟠 HIGH  
**Thời gian:** 1 ngày

**Thêm dependency:**
```xml
<dependency>
  <groupId>org.liquibase</groupId>
  <artifactId>liquibase-core</artifactId>
</dependency>
```

**Config:**
```yaml
spring:
  liquibase:
    change-log: classpath:db/changelog/db.changelog-master.yaml
```

**Migration file: db/changelog/001-initial-schema.yaml**
```yaml
databaseChangeLog:
  - changeSet:
      id: 001-create-orders-table
      author: admin
      changes:
        - createTable:
            tableName: orders
            columns:
              - column:
                  name: id
                  type: BIGINT
                  autoIncrement: true
                  constraints:
                    primaryKey: true
              # ... more columns
```

---

### Task 3.4: Add Distributed Tracing (Spring Cloud Sleuth + Zipkin)
**Priority:** 🟠 HIGH  
**Thời gian:** 1 ngày

**Thêm dependencies:**
```xml
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>

<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-sleuth-zipkin</artifactId>
</dependency>
```

**docker-compose.yaml - Thêm Zipkin:**
```yaml
zipkin:
  image: openzipkin/zipkin:latest
  container_name: petcare-zipkin
  ports:
    - "9411:9411"
  networks:
    - petcare-network
```

---

## PHASE 3: PRODUCTION READINESS (Week 5) 🟢

### Task 4.1: Add API Documentation (Swagger)
**Priority:** 🟢 MEDIUM  
**Thời gian:** 1 ngày

```xml
<dependency>
  <groupId>org.springdoc</groupId>
  <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
  <version>2.0.2</version>
</dependency>
```

**application.yaml:**
```yaml
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
```

**Access:** http://localhost:8080/swagger-ui.html

---

### Task 4.2: Add Monitoring (Prometheus + Micrometer)
**Priority:** 🟢 MEDIUM  
**Thời gian:** 1 ngày

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

<dependency>
  <groupId>io.micrometer</groupId>
  <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

**docker-compose.yaml - Thêm Prometheus & Grafana:**
```yaml
prometheus:
  image: prom/prometheus:latest
  container_name: petcare-prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  networks:
    - petcare-network

grafana:
  image: grafana/grafana:latest
  container_name: petcare-grafana
  ports:
    - "3000:3000"
  networks:
    - petcare-network
```

---

### Task 4.3: Security Hardening
**Priority:** 🟢 MEDIUM  
**Thời gian:** 2 ngày

1. **CORS Configuration**
2. **SSL/HTTPS Setup**
3. **Input Validation (already done)**
4. **Rate Limiting**

---

### Task 4.4: Comprehensive Testing
**Priority:** 🟢 MEDIUM  
**Thời gian:** 3 ngày

- Unit Tests (Service layer)
- Integration Tests (RabbitMQ + DB)
- Contract Tests (Feign clients)
- Load Testing

---

## PHASE 4: MISSING SERVICES (Week 6+) 🔵

### Priority Services to Create:

1. **User Service** - Quản lý user profile, addresses, pets
2. **Notification Service** - Gửi email, SMS
3. **Booking Service** - Quản lý appointments & services
4. **Feedback Service** - Reviews & ratings (MongoDB)
5. **CMS Service** - Blog & banners

---

## 📊 SUMMARY TABLE

| Phase | Tasks | Timeline | Priority |
|-------|-------|----------|----------|
| **1: Stabilization** | Spring Boot standardization, Eureka, Config, docker-compose, package naming, exception handling | Week 1-2 | 🔴 CRITICAL |
| **2: Resilience** | Circuit breaker, RabbitMQ config, Liquibase, Sleuth+Zipkin | Week 3-4 | 🟠 HIGH |
| **3: Production** | Swagger, Prometheus, Security, Testing | Week 5 | 🟢 MEDIUM |
| **4: Missing Services** | User, Notification, Booking, Feedback, CMS | Week 6+ | 🔵 LOW |

---

## 🎯 DELIVERABLES

- ✅ Chuẩn hóa Infrastructure (Eureka, Config, docker-compose)
- ✅ Consistent error handling & validation
- ✅ Circuit breaker & retry logic
- ✅ Monitoring & tracing
- ✅ API documentation
- ✅ Complete unit & integration tests
- ✅ Ready for production deployment

---

**Prepared by:** GitHub Copilot  
**Date:** April 8, 2026


