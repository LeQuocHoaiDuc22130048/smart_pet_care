# 📦 PRODUCT SERVICE - CHI TIẾT VÀ ĐÁNH GIÁ

## I. THÔNG TIN CƠ BẢN

| Tính chất | Chi tiết |
|----------|----------|
| **Tên Service** | product-service |
| **GroupId** | com.pet_care |
| **ArtifactId** | product_service |
| **Version** | 0.0.1-SNAPSHOT |
| **Java Version** | 21 |
| **Spring Boot** | 3.2.5 |
| **Spring Cloud** | 2023.0.1 |
| **Database** | MySQL 8.0 |

---

## II. CẤU TRÚC THƯ MỤC

```
product_service/
├── src/main/java/com/pet_care/product/
│   ├── configuration/          # Spring config
│   ├── consumer/               # RabbitMQ consumers (lắng nghe Order events)
│   ├── controller/             # REST endpoints
│   ├── dto/
│   │   ├── request/            # Input DTOs
│   │   └── response/           # Output DTOs
│   ├── entity/                 # JPA entities
│   ├── enums/                  # Enumerations
│   ├── exception/              # Custom exceptions
│   ├── mapper/                 # MapStruct mappers
│   ├── messaging/              # Event classes
│   ├── repository/             # JPA repositories
│   ├── service/                # Business logic
│   └── ProductApplication.java
├── src/main/resources/
│   ├── application.yaml        # Configuration
│   ├── static/
│   └── templates/
└── pom.xml
```

---

## III. 🏗️ KIẾN TRÚC HIỆN TẠI

### A. Database Schema (Dự kiến)

```sql
-- Categories
CREATE TABLE categories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products (Sản phẩm chính)
CREATE TABLE products (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description LONGTEXT,
  thumbnail_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Product Variants (SKU - Size, màu sắc, etc.)
CREATE TABLE product_variants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  sku_code VARCHAR(100) NOT NULL UNIQUE,
  attributes JSON,  -- {"size": "M", "color": "red"}
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Product Images
CREATE TABLE product_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  product_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  display_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Inventory (Tồn kho)
CREATE TABLE inventory (
  variant_id BIGINT PRIMARY KEY,
  stock_quantity INT NOT NULL DEFAULT 0,
  reserved_quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);

-- Inventory History (Lịch sử tồn kho)
CREATE TABLE inventory_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  variant_id BIGINT NOT NULL,
  quantity_change INT,
  reason VARCHAR(100),  -- 'ORDER_CREATED', 'STOCK_RETURNED', etc.
  reference_id BIGINT,  -- order_id, return_id, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id)
);
```

### B. Dependencies (pom.xml)

**Hiện tại có:**
- ✅ Spring Data JPA
- ✅ Spring Web
- ✅ MySQL Connector
- ✅ MapStruct
- ✅ Lombok
- ✅ Spring Security
- ✅ OAuth2 Resource Server

**Thiếu:**
- ❌ `spring-cloud-starter-netflix-eureka-client`
- ❌ `spring-cloud-starter-config`
- ❌ `spring-cloud-starter-amqp` (RabbitMQ)
- ❌ `io.github.resilience4j:resilience4j-spring-boot3`
- ❌ `org.springdoc:springdoc-openapi-starter-webmvc-ui`
- ❌ `io.micrometer:micrometer-registry-prometheus`

---

## IV. 🔄 LUỒNG GIAO TIẾP

### Usecase 1: Lấy danh sách sản phẩm

```
1. Client HTTP GET /api/v1/products
        ↓
2. API Gateway
        ↓
3. Product Controller
        ↓
4. Product Service
        ├─ Fetch từ DB
        └─ Return ProductResponse list
```

### Usecase 2: Listen sự kiện ORDER_CREATED từ RabbitMQ

```
1. Order Service publish EVENT: "ORDER_CREATED"
        ↓
2. RabbitMQ Event Bus
        ↓
3. Product Service Consumer (OrderCreatedConsumer)
        ├─ Extract order details
        ├─ Reserve inventory (stock_quantity - reserved_quantity)
        ├─ Update DB
        └─ Publish EVENT: "INVENTORY_RESERVED"
```

### Usecase 3: Handle ORDER_CANCELLED

```
1. Order Service publish: "ORDER_CANCELLED"
        ↓
2. RabbitMQ
        ↓
3. Product Service Consumer
        ├─ Unreserve inventory
        ├─ Update DB
        └─ Publish: "INVENTORY_RELEASED"
```

---

## V. ⚠️ CÁC VẤN ĐỀ CHÍNH

### 1. **Thiếu Inventory Reservation Logic**

Khi tạo order, cần reserve inventory. Hiện tại có vấn đề:

```java
// ❌ Problem 1: Race condition
// Thread 1 & 2 cùng check stock_quantity = 5, cùng create order 3 units
int currentStock = inventory.getStockQuantity();
if (currentStock >= requestedQty) {
  inventory.setStockQuantity(currentStock - requestedQty);  // ← Race condition
}

// ✅ Solution: Use pessimistic locking
@Lock(LockModeType.PESSIMISTIC_WRITE)
Optional<Inventory> findByVariantIdLocked(Long variantId);
```

### 2. **Không Có Two-Phase Inventory**

Dự án cần:
```java
// Phase 1: RESERVED (khi order tạo)
inventory.reservedQuantity += orderItem.quantity

// Phase 2: CONFIRMED (khi payment success)
inventory.stockQuantity -= inventory.reservedQuantity
inventory.reservedQuantity = 0

// Nếu order cancel:
inventory.reservedQuantity -= orderItem.quantity
```

### 3. **RabbitMQ Consumer Không Robust**

Cần:
```java
@RabbitListener(queues = "order-created-queue")
@Transactional
public void handleOrderCreated(OrderCreatedEvent event) {
  try {
    // Process inventory reservation
    reserveInventory(event);
  } catch (Exception ex) {
    log.error("Failed to process order: {}", ex);
    // ← Message sẽ được retry hoặc đưa vào DLQ
    throw ex;  // Ném lại để RabbitMQ retry
  }
}
```

### 4. **Không Có Endpoint để Check Stock**

Cần thêm:
```java
@GetMapping("/api/v1/inventory/variants/{variantId}")
public ResponseEntity<InventoryResponse> checkInventory(
  @PathVariable Long variantId
) {
  Inventory inventory = inventoryRepository.findByVariantId(variantId);
  return ResponseEntity.ok(InventoryResponse.builder()
    .variantId(variantId)
    .availableQuantity(inventory.getStockQuantity() - inventory.getReservedQuantity())
    .build());
}
```

### 5. **Không Có Inventory History Tracking**

Cần implement:
```java
@Entity
public class InventoryHistory {
  private Long id;
  private Long variantId;
  private Integer quantityChange;
  private String reason;  // 'ORDER_CREATED', 'PAYMENT_SUCCESS', etc.
  private Long referenceId;  // order_id
  private LocalDateTime createdAt;
}

// Mỗi khi update inventory, log history
```

### 6. **Không Có Pagination cho danh sách sản phẩm**

Cần:
```java
@GetMapping("/api/v1/products")
public ResponseEntity<Page<ProductResponse>> getProducts(
  @RequestParam(defaultValue = "0") int page,
  @RequestParam(defaultValue = "20") int size,
  @RequestParam(defaultValue = "id") String sortBy
) {
  Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
  Page<Product> products = productRepository.findAll(pageable);
  return ResponseEntity.ok(products.map(ProductMapper::toResponse));
}
```

### 7. **Không Có Image Management**

Cần implement:
```java
@PostMapping("/{productId}/images")
public ResponseEntity<void> uploadImages(
  @PathVariable Long productId,
  @RequestParam("files") MultipartFile[] files
) {
  // Upload lên Cloudinary (hoặc AWS S3)
  // Lưu URLs vào DB
}
```

### 8. **Search & Filter Function Không Rõ**

Cần:
```java
// Search by name, filter by category, price range, etc.
@GetMapping("/api/v1/products/search")
public ResponseEntity<Page<ProductResponse>> search(
  @RequestParam(required = false) String keyword,
  @RequestParam(required = false) Long categoryId,
  @RequestParam(required = false) BigDecimal minPrice,
  @RequestParam(required = false) BigDecimal maxPrice
) {
  // Custom query with specifications
}
```

---

## VI. 📋 CHECKLIST - CẦN LÀM GÌ TIẾP

### **PRIORITY 1: Critical** 🔴

- [ ] Implement **Pessimistic Locking** cho inventory reservation
- [ ] Add **Two-Phase Inventory** (reserved + confirmed)
- [ ] Implement **Inventory History Tracking**
- [ ] Create **RabbitMQ Consumer** with error handling & retry
- [ ] Add **Eureka Client** & **Config Server** support
- [ ] Create **Inventory Check Endpoint** (`GET /api/v1/inventory/{variantId}`)
- [ ] Implement **Global Exception Handler**

### **PRIORITY 2: High** 🟠

- [ ] Add **Pagination & Sorting** for product list
- [ ] Implement **Product Search & Filter** functionality
- [ ] Add **Image Management** (upload, delete)
- [ ] Implement **Dead Letter Queue** handling
- [ ] Add **Request Validation** (Bean Validation)
- [ ] Create **Product Category Filter**

### **PRIORITY 3: Medium** 🟡

- [ ] Add **API Documentation** (Swagger)
- [ ] Add **Database Migration** (Liquibase/Flyway)
- [ ] Implement **Unit Tests** (Service layer)
- [ ] Implement **Integration Tests** (RabbitMQ + DB)
- [ ] Add **Prometheus Metrics**
- [ ] Add **Distributed Tracing**
- [ ] Performance optimization (indexing, caching)

### **PRIORITY 4: Low** 🔵

- [ ] Add Redis caching for product list
- [ ] Implement **Product Reviews Aggregation**
- [ ] Add **Trending Products** API
- [ ] Implement **Bulk Price Update**

---

## VII. 📝 SAMPLE CODE - PRODUCT SERVICE IMPROVEMENTS

### File: `Inventory.java` (Entity)

```java
@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventory {
  @Id
  private Long variantId;
  
  @Column(nullable = false)
  private Integer stockQuantity = 0;
  
  @Column(nullable = false)
  private Integer reservedQuantity = 0;
  
  @UpdateTimestamp
  private LocalDateTime updatedAt;
  
  // Helper methods
  public Integer getAvailableQuantity() {
    return stockQuantity - reservedQuantity;
  }
  
  public boolean canReserve(Integer quantity) {
    return getAvailableQuantity() >= quantity;
  }
}
```

### File: `InventoryService.java`

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {
  private final InventoryRepository inventoryRepository;
  private final InventoryHistoryRepository historyRepository;
  
  @Transactional
  public void reserveInventory(Long variantId, Integer quantity) {
    // Pessimistic locking
    Inventory inventory = inventoryRepository
      .findByVariantIdForUpdate(variantId)
      .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
    
    if (!inventory.canReserve(quantity)) {
      throw new InsufficientStockException("Not enough stock");
    }
    
    // Reserve
    inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
    inventoryRepository.save(inventory);
    
    // Log history
    InventoryHistory history = InventoryHistory.builder()
      .variantId(variantId)
      .quantityChange(-quantity)
      .reason("ORDER_CREATED")
      .build();
    historyRepository.save(history);
    
    log.info("Inventory reserved: variant={}, qty={}", variantId, quantity);
  }
  
  @Transactional
  public void confirmReservation(Long variantId, Integer quantity) {
    Inventory inventory = inventoryRepository.findByVariantId(variantId)
      .orElseThrow(() -> new ResourceNotFoundException("Inventory not found"));
    
    // Move from reserved to confirmed
    inventory.setStockQuantity(inventory.getStockQuantity() - quantity);
    inventory.setReservedQuantity(inventory.getReservedQuantity() - quantity);
    inventoryRepository.save(inventory);
    
    log.info("Reservation confirmed: variant={}, qty={}", variantId, quantity);
  }
}
```

### File: `OrderCreatedConsumer.java`

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCreatedConsumer {
  private final InventoryService inventoryService;
  private final RabbitTemplate rabbitTemplate;
  
  @RabbitListener(queues = "order-created-queue")
  @Transactional
  public void handleOrderCreated(OrderCreatedEvent event) {
    try {
      log.info("Processing order created event: {}", event.getOrderId());
      
      event.getOrderItems().forEach(item -> {
        inventoryService.reserveInventory(
          item.getVariantId(), 
          item.getQuantity()
        );
      });
      
      // Publish success event
      rabbitTemplate.convertAndSend(
        "order-exchange",
        "inventory.reserved",
        new InventoryReservedEvent(event.getOrderId())
      );
      
      log.info("Order processed successfully: {}", event.getOrderId());
    } catch (Exception ex) {
      log.error("Failed to process order: {}", event.getOrderId(), ex);
      throw new RuntimeException(ex);  // RabbitMQ will retry
    }
  }
}
```

### File: `InventoryRepository.java`

```java
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
  Optional<Inventory> findByVariantId(Long variantId);
  
  @Lock(LockModeType.PESSIMISTIC_WRITE)  // ← Pessimistic locking
  @Query("SELECT i FROM Inventory i WHERE i.variantId = :variantId")
  Optional<Inventory> findByVariantIdForUpdate(@Param("variantId") Long variantId);
}
```

### File: `ProductController.java`

```java
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
  private final ProductService productService;
  private final InventoryService inventoryService;
  
  @GetMapping
  public ResponseEntity<Page<ProductResponse>> getProducts(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(required = false) Long categoryId
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
    Page<ProductResponse> products = productService.getProducts(categoryId, pageable);
    return ResponseEntity.ok(products);
  }
  
  @GetMapping("/search")
  public ResponseEntity<Page<ProductResponse>> search(
    @RequestParam String keyword,
    @RequestParam(required = false) Long categoryId,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
  ) {
    Pageable pageable = PageRequest.of(page, size);
    Page<ProductResponse> products = productService.search(keyword, categoryId, pageable);
    return ResponseEntity.ok(products);
  }
  
  @GetMapping("/variants/{variantId}/inventory")
  public ResponseEntity<InventoryResponse> checkInventory(
    @PathVariable Long variantId
  ) {
    InventoryResponse response = inventoryService.getInventory(variantId);
    return ResponseEntity.ok(response);
  }
}
```

---

## VIII. 🎯 KIẾN NGHỊ

1. **Ngay lập tức:** Implement inventory locking & two-phase system
2. **Tuần này:** Create RabbitMQ consumer với error handling
3. **Tuần sau:** Add search, filter, pagination
4. **Sau 2 tuần:** Monitoring & tracing

---

**Cập nhật:** April 8, 2026


