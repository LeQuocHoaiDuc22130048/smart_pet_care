# ✅ IMPLEMENTATION CHECKLIST - PETCARE BACKEND

**Project Status:** 🔴 45% Ready → Need 5-6 weeks  
**Current Date:** April 8, 2026  
**Target Completion:** Mid-May 2026 (Production Ready)

---

## 📋 PHASE 1: STABILIZATION & STANDARDIZATION (Week 1-2)

**Goal:** Get infrastructure working so services can talk to each other

### ✅ WEEK 1: INFRASTRUCTURE & STANDARDIZATION

#### Day 1-2: Spring Boot Version Standardization
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Create feature branch: git checkout -b fix/spring-boot-standardization
□ Update api_gateway/pom.xml: Spring Boot 3.4.9 → 3.2.5
□ Update api_gateway/pom.xml: Spring Cloud 2024.0.0 → 2023.0.1
□ Add Spring Cloud BOM to api_gateway pom.xml
□ Update identity_service/pom.xml: Add Spring Cloud BOM
□ Verify all services have Spring Cloud 2023.0.1
□ Build all services: mvn clean package (test in each)
□ Git commit: "chore: standardize Spring Boot to 3.2.5"
□ Verify no compilation errors

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 2-3: Create Eureka Server (Discovery Service)
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Create directory: mkdir discovery_service
□ Create maven structure:
  □ src/main/java/com/pet_care/discovery/
  □ src/main/resources/
  □ src/test/java/
□ Create pom.xml with spring-cloud-starter-netflix-eureka-server
□ Create DiscoveryApplication.java with @EnableEurekaServer
□ Create application.yaml with Eureka configuration
□ Create Dockerfile
□ Test build: mvn clean package
□ Test run: java -jar target/discovery_service-*.jar
□ Verify Eureka dashboard: http://localhost:8761
□ Git commit: "feat: create discovery service (Eureka Server)"

Configuration File Content:
□ Port: 8761
□ registerWithEureka: false
□ fetchRegistry: false
□ waitTimeInMsWhenSyncEmpty: 0

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 3-4: Create Config Server
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Create directory: mkdir config_service
□ Create maven structure
□ Create pom.xml with spring-cloud-config-server
□ Create ConfigApplication.java with @EnableConfigServer
□ Create application.yaml with Config Server configuration
□ Create config-repo folder with:
  □ api-gateway.yaml
  □ identity-service.yaml
  □ order-service.yaml
  □ product-service.yaml
  □ payment-service.yaml
□ Create Dockerfile
□ Test build: mvn clean package
□ Test run: java -jar target/config_service-*.jar
□ Test config pull: curl http://localhost:8888/identity-service/default
□ Git commit: "feat: create config server"

Configuration Files:
□ api-gateway.yaml: API Gateway specific configs
□ identity-service.yaml: Identity service configs
□ order-service.yaml: Order service configs
□ product-service.yaml: Product service configs
□ payment-service.yaml: Payment service configs

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 4-5: Add Eureka & Config Clients to All Services
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

For Each Service (api_gateway, identity_service, order_service, product_service, payment_service):

□ Add spring-cloud-starter-netflix-eureka-client to pom.xml
□ Add spring-cloud-starter-config to pom.xml
□ Create bootstrap.yaml with:
  □ spring.cloud.config.uri: http://localhost:8888
  □ eureka.client.service-url.defaultZone: http://localhost:8761/eureka/
□ Update main application.yaml (move to config server)
□ Test build: mvn clean package
□ Test startup
□ Verify registration in Eureka: http://localhost:8761

All Services Completed:
□ api_gateway
□ identity_service
□ order_service
□ product_service
□ payment_service

Git Commit: "feat: add Eureka + Config clients to all services"

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 5-6: Update docker-compose.yaml
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Backup current docker-compose.yaml
□ Add MySQL container configuration
□ Add RabbitMQ container configuration
□ Add Redis container configuration (NEW)
□ Add Eureka Server container configuration (NEW)
□ Add Config Server container configuration (NEW)
□ Add API Gateway container configuration
□ Add Identity Service container configuration
□ Add Order Service container configuration
□ Add Product Service container configuration
□ Add Payment Service container configuration
□ Define petcare-network
□ Define mysql_data volume
□ Test: docker-compose build (all containers build)
□ Test: docker-compose up -d (all containers start)
□ Test: docker ps (verify all running)
□ Verify Eureka dashboard: http://localhost:8761
□ Verify all 5 services registered
□ Test: docker-compose down (cleanup)
□ Git commit: "chore: update docker-compose with all infrastructure"

Services in docker-compose:
□ mysql-db (port 3306)
□ rabbitmq (port 5672, 15672)
□ redis (port 6379) [NEW]
□ eureka-server (port 8761) [NEW]
□ config-server (port 8888) [NEW]
□ api-gateway (port 8080)
□ identity-service
□ order-service
□ product-service
□ payment-service

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 6-7: Rename Packages (com.hoaiduc → com.pet_care)
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

Identity Service Package Rename:
□ Create new directory: src/main/java/com/pet_care/identity/
□ Copy all classes from com/hoaiduc/identity/ to com/pet_care/identity/
□ Update all imports: com.hoaiduc.* → com.pet_care.*
□ Update pom.xml if needed
□ Delete old directory: src/main/java/com/hoaiduc/
□ Update test classes if any
□ Test build: mvn clean package
□ Test startup
□ Git commit: "refactor: rename identity-service package to com.pet_care"

Verification:
□ No compilation errors
□ Service starts successfully
□ Can find service in logs: "Successfully registered with Eureka"

Notes:
_________________________________________________________________
_________________________________________________________________
```

### ✅ WEEK 2: VERIFICATION & TESTING

#### Day 1: Full System Build & Test
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Clean build all services: for each service, mvn clean package
□ Verify no compilation errors
□ Build docker images: docker-compose build
□ Verify all images built successfully
□ git add -A
□ git commit -m "week-1: Phase 1 complete - infrastructure ready"

Test Results:
□ api_gateway builds
□ identity_service builds
□ order_service builds
□ product_service builds
□ payment_service builds
□ discovery_service builds
□ config_service builds

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 2-3: Docker Compose Verification
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Start docker-compose: docker-compose up -d
□ Verify containers running: docker ps
□ Check Eureka dashboard: http://localhost:8761
□ Verify 5 services show "UP" status
□ Check service names match:
  □ api-gateway
  □ identity-service
  □ order-service
  □ product-service
  □ payment-service
□ Verify Config Server: curl http://localhost:8888/config-service/default
□ Test service-to-service communication
□ Test calling one service from another using service name
□ Verify logs for each service
□ docker-compose down (cleanup)

Test Results:
□ MySQL running on 3306
□ RabbitMQ running on 5672
□ Redis running on 6379
□ Eureka running on 8761
□ Config running on 8888
□ All 5 services registered

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 4-5: Code Review & Documentation
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

Code Review:
□ Review pom.xml changes in all services
□ Review bootstrap.yaml in all services
□ Review docker-compose.yaml
□ Review new services (Eureka, Config)
□ Verify no hardcoded credentials
□ Verify configurations are from Config Server

Documentation:
□ Update README with infrastructure setup
□ Document how to run locally
□ Document how to use docker-compose
□ Document service naming conventions
□ Create troubleshooting guide

Git:
□ Create pull request for Phase 1 changes
□ Get code review approval
□ Merge to main branch
□ Tag: v0.1-phase1-infrastructure

Notes:
_________________________________________________________________
_________________________________________________________________
```

---

## 📋 PHASE 2: RESILIENCE & RELIABILITY (Week 3-4)

**Goal:** Add patterns to handle failures gracefully

### ✅ WEEK 3: EXCEPTION HANDLING & VALIDATION

#### Day 1-2: Global Exception Handling (All Services)
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

For Each Service:

□ Create exception/ErrorCode.java (Enum)
□ Create exception/AppException.java (Custom Exception)
□ Create dto/ErrorResponse.java (DTO)
□ Create exception/GlobalExceptionHandler.java (@RestControllerAdvice)
□ Add ErrorCode enum values:
  □ USER_NOT_FOUND("001", "User not found")
  □ PRODUCT_NOT_FOUND("002", "Product not found")
  □ INSUFFICIENT_STOCK("003", "Insufficient stock")
  □ INVALID_ORDER("004", "Invalid order")
  □ UNAUTHORIZED("006", "Unauthorized")
  □ INVALID_INPUT("007", "Invalid input")
  □ SERVICE_UNAVAILABLE("008", "Service unavailable")
□ Implement GlobalExceptionHandler
□ Add endpoints to ControllerAdvice for:
  □ AppException
  □ MethodArgumentNotValidException
  □ HttpMessageNotReadableException
  □ Generic Exception

All Services:
□ api_gateway
□ identity_service
□ order_service
□ product_service
□ payment_service

Git Commit: "feat: implement global exception handling"

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 2-3: Input Validation (Bean Validation)
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

For Each Service:

□ Add spring-boot-starter-validation to pom.xml (if not present)
□ Update all RequestDTO classes with @Valid annotations:
  □ @NotNull
  □ @NotBlank
  □ @NotEmpty
  □ @Email
  □ @Min/@Max
  □ @Size
  □ @Pattern (for regex)
□ Update all Controller methods with @Valid @RequestBody
□ Create custom validators if needed
□ Test validation:
  □ Send invalid input
  □ Verify 400 Bad Request response
  □ Verify error message is descriptive

All Services:
□ api_gateway
□ identity_service
□ order_service
□ product_service
□ payment_service

Git Commit: "feat: add input validation to all services"

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 4-5: Circuit Breaker Implementation
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

Resilience4j Setup (Order & Product Services):

□ Add resilience4j dependencies to pom.xml:
  □ resilience4j-spring-boot3
  □ resilience4j-feign
□ Add Feign Client configuration
□ Implement circuit breaker:
  □ Sliding window size: 10
  □ Failure rate threshold: 50%
  □ Wait duration in open: 5s
□ Implement retry:
  □ Max attempts: 3
  □ Wait duration: 100ms
□ Add fallback methods
□ Test circuit breaker:
  □ Call service while healthy → should succeed
  □ Simulate service failure → should open circuit
  □ Verify fallback is called
  □ Service recovers → circuit closes

Services:
□ order_service (calls product-service)
□ product_service (if calling other services)

Configuration:
□ application.yaml: resilience4j config
□ FeignConfig.java: retry, timeout, error decoder

Git Commit: "feat: add circuit breaker pattern with Resilience4j"

Notes:
_________________________________________________________________
_________________________________________________________________
```

### ✅ WEEK 4: MESSAGING & PERSISTENCE

#### Day 1-2: RabbitMQ Consumer Configuration
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

Product Service (Event Consumer):

□ Add spring-cloud-starter-amqp to pom.xml
□ Create configuration/RabbitMQConfig.java:
  □ Declare order-created-queue
  □ Declare order-exchange
  □ Bind queue to exchange
  □ Declare DLQ (Dead Letter Queue)
□ Create consumer/OrderCreatedConsumer.java:
  □ @RabbitListener(queues = "order-created-queue")
  □ Implement handleOrderCreated method
  □ Add error handling
  □ Add transaction support (@Transactional)
□ Create messaging/OrderCreatedEvent.java (Event POJO)

Order Service (Event Producer):

□ Add RabbitTemplate bean
□ Create messaging/OrderCreatedEvent.java
□ Emit event when order created:
  □ rabbitTemplate.convertAndSend()
  □ Include order details in event
  □ Handle exceptions

Testing:
□ Order Service: Create order
□ Verify event published to RabbitMQ
□ Product Service: Receive event
□ Verify inventory updated
□ Check rabbitmq management console

Git Commit: "feat: add RabbitMQ consumer for order events"

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 2-3: Database Migration Tool (Liquibase)
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

Each Service with Database:

□ Add liquibase-core to pom.xml
□ Create db/changelog/db.changelog-master.yaml
□ Create initial schema migration:
  □ 001-create-users-table.yaml (if applicable)
  □ 002-create-orders-table.yaml (if applicable)
  □ etc.
□ Add application.yaml configuration:
  □ spring.liquibase.change-log: classpath:db/changelog/db.changelog-master.yaml
□ Test:
  □ Start service with fresh database
  □ Verify tables created
  □ Verify data loaded
  □ Run migration again - should be idempotent
□ Create rollback scripts (optional)

Services:
□ identity_service
□ order_service
□ product_service
□ payment_service

Git Commit: "feat: add Liquibase database migration"

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 4-5: Distributed Tracing Setup
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

Add Sleuth + Zipkin:

□ Add dependencies to all services:
  □ spring-cloud-starter-sleuth
  □ spring-cloud-sleuth-zipkin
□ Update docker-compose.yaml:
  □ Add Zipkin service (port 9411)
□ Add application.yaml configuration:
  □ spring.zipkin.base-url: http://zipkin:9411
  □ spring.sleuth.sampler.probability: 1.0 (for testing)
□ Test:
  □ Make request through API Gateway
  □ Call propagates to other services
  □ Check Zipkin dashboard: http://localhost:9411
  □ Verify trace shows all service calls
□ Set sampling rate appropriately for production

All Services:
□ api_gateway
□ identity_service
□ order_service
□ product_service
□ payment_service

Git Commit: "feat: add distributed tracing with Sleuth + Zipkin"

Notes:
_________________________________________________________________
_________________________________________________________________
```

---

## 📋 PHASE 3: PRODUCTION READINESS (Week 5)

**Goal:** Make system production-grade

### ✅ WEEK 5: MONITORING & SECURITY

#### Day 1: API Documentation (Swagger)
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

All Services:

□ Add springdoc-openapi-starter-webmvc-ui to pom.xml
□ Add @OpenAPIDefinition to main Application class
□ Add @Operation annotations to endpoints
□ Add @Schema annotations to DTOs
□ Configure application.yaml:
  □ springdoc.api-docs.path: /v3/api-docs
  □ springdoc.swagger-ui.path: /swagger-ui.html
□ Test:
  □ Start each service
  □ Access Swagger UI: http://localhost:PORT/swagger-ui.html
  □ Verify all endpoints visible
  □ Verify request/response schemas correct

Services:
□ api_gateway (port 8080)
□ identity_service
□ order_service
□ product_service
□ payment_service

Git Commit: "feat: add API documentation with Springdoc OpenAPI"

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 2: Monitoring Setup (Prometheus + Grafana)
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Add spring-boot-starter-actuator to all services
□ Add micrometer-registry-prometheus to all services
□ Configure application.yaml:
  □ management.endpoints.web.exposure.include: "*"
  □ management.endpoint.health.show-details: always
□ Update docker-compose.yaml:
  □ Add Prometheus service
  □ Add Grafana service
□ Create prometheus.yml configuration
□ Create Grafana dashboard (or use default)
□ Test:
  □ Access metrics: http://localhost:PORT/actuator/prometheus
  □ Prometheus scrapes metrics: http://localhost:9090
  □ Grafana dashboard: http://localhost:3000 (default: admin/admin)
  □ Verify service metrics visible

Services:
□ api_gateway
□ identity_service
□ order_service
□ product_service
□ payment_service

Containers:
□ prometheus (port 9090)
□ grafana (port 3000)

Git Commit: "feat: add monitoring with Prometheus + Grafana"

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 3-4: Security Hardening
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

CORS Configuration:

□ Update API Gateway with CORS filter:
  □ Allowed origins: http://localhost:3000 (frontend)
  □ Allowed methods: GET, POST, PUT, DELETE, OPTIONS
  □ Allowed headers: *
  □ Allow credentials: true

HTTPS/SSL:

□ Generate self-signed certificate (development):
  □ keytool -genkey -alias tomcat -keyalg RSA -keystore keystore.p12 -keysize 2048
□ Add to application.yaml:
  □ server.ssl.key-store: classpath:keystore.p12
  □ server.ssl.key-store-password: password
  □ server.ssl.key-store-type: PKCS12
  □ server.ssl.key-alias: tomcat

Rate Limiting:

□ Configure in API Gateway:
  □ Add spring-cloud-gateway rate limiter
  □ 100 requests per minute per IP
  □ Return 429 if exceeded

Input Validation:

□ Already implemented in Phase 2
□ Verify all inputs validated
□ Add sanitization if needed

SQL Injection Prevention:

□ Use parameterized queries (JPA handles this)
□ Verify no string concatenation in SQL
□ Use @Query with :parameter syntax

Testing:
□ Send CORS requests from different origin
□ Test rate limiting
□ Test HTTPS connection
□ Test invalid input handling

Git Commit: "feat: implement security hardening (CORS, HTTPS, rate limiting)"

Notes:
_________________________________________________________________
_________________________________________________________________
```

#### Day 5: Comprehensive Testing
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

Unit Tests:

□ Test service layer:
  □ Happy path tests
  □ Error case tests
  □ Edge case tests
□ Target: 70%+ code coverage
□ Use Mockito for mocking dependencies

Integration Tests:

□ Test service + database:
  □ Use TestContainers for database
  □ Test repository layer
  □ Test service with real database

Contract Tests:

□ Test Feign clients:
  □ Mock provider service
  □ Verify request format
  □ Verify response handling

Services to Test:
□ identity_service (50+ test cases)
□ order_service (100+ test cases)
□ product_service (100+ test cases)
□ payment_service (50+ test cases)

Coverage Target:
□ Service layer: 80%+
□ Controller layer: 50%+
□ Repository layer: 60%+
□ Overall: 70%+

Tools:
□ JUnit 5
□ Mockito
□ TestContainers
□ AssertJ

Git Commit: "feat: add comprehensive unit and integration tests"

Notes:
_________________________________________________________________
_________________________________________________________________
```

---

## 📋 PHASE 4: NEW SERVICES (Week 6+)

**Goal:** Create missing critical services

### ✅ Create User Service
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Create new Spring Boot project: user_service
□ Implement entities:
  □ UserProfile
  □ UserAddress
  □ Pet
□ Implement repositories
□ Implement services
□ Implement controllers
□ Add to docker-compose.yaml
□ Add to Eureka client config
□ Create database migrations
□ Add tests

Estimated Time: 3-5 days

Notes:
_________________________________________________________________
_________________________________________________________________
```

### ✅ Create Notification Service
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Create new Spring Boot project: notification_service
□ Implement email sending capability
□ Implement SMS sending capability (optional)
□ Add RabbitMQ consumer:
  □ Listen to order.created
  □ Listen to payment.success
  □ etc.
□ Send notifications accordingly
□ Add to docker-compose.yaml
□ Add to Eureka client config
□ Add tests

Estimated Time: 3-5 days

Notes:
_________________________________________________________________
_________________________________________________________________
```

### ✅ Create Booking Service
```
Assigned to: ________________
Start Date: ________________
End Date: ________________

□ Create new Spring Boot project: booking_service
□ Implement entities:
  □ PetService
  □ Staff
  □ Appointment
□ Implement booking logic
□ Implement calendar/availability
□ Add RabbitMQ event publishing
□ Add to docker-compose.yaml
□ Add to Eureka client config
□ Add tests

Estimated Time: 5-7 days

Notes:
_________________________________________________________________
_________________________________________________________________
```

---

## 📊 OVERALL PROGRESS TRACKING

### Week 1-2: Stabilization
```
Date Started: ________________
Date Completed: ________________
Tasks Completed: _____ / 10
Status: □ On Track  □ Behind  □ Ahead
Issues: _________________________________________________________________
Next Steps: _________________________________________________________________
```

### Week 3-4: Resilience
```
Date Started: ________________
Date Completed: ________________
Tasks Completed: _____ / 8
Status: □ On Track  □ Behind  □ Ahead
Issues: _________________________________________________________________
Next Steps: _________________________________________________________________
```

### Week 5: Production
```
Date Started: ________________
Date Completed: ________________
Tasks Completed: _____ / 5
Status: □ On Track  □ Behind  □ Ahead
Issues: _________________________________________________________________
Next Steps: _________________________________________________________________
```

### Week 6+: New Services
```
Date Started: ________________
Estimated Completion: ________________
Tasks Completed: _____ / 3
Status: □ On Track  □ Behind  □ Ahead
Issues: _________________________________________________________________
Next Steps: _________________________________________________________________
```

---

## 🎯 FINAL SIGN-OFF

### Week 5 Completion Verification

```
Date: ________________
Verified By: ________________

PHASE 1 COMPLETE: □ YES  □ NO
□ All services standardized
□ Eureka Server running
□ Config Server running
□ docker-compose working
□ Packages renamed

PHASE 2 COMPLETE: □ YES  □ NO
□ Exception handling implemented
□ Input validation added
□ Circuit breaker working
□ RabbitMQ consumers configured
□ Database migrations working
□ Distributed tracing enabled

PHASE 3 COMPLETE: □ YES  □ NO
□ API documentation generated
□ Monitoring set up
□ Security hardened
□ Tests written
□ All systems verified

READY FOR PRODUCTION: □ YES  □ NO

Sign-off Date: ________________
```

---

**Prepared by:** ________________  
**Team:** ________________  
**Project Manager:** ________________

---

**Good luck! 🚀**

*Use this checklist to track your progress and ensure nothing is missed.*


