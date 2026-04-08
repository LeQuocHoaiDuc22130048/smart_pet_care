# 🚀 GETTING STARTED - HƯỚNG DẪN BẮTÌ ĐẦU

## 📍 Bạn ở đâu?

### 🔴 Hiện tại: 45% ready
- ✅ 5/12 services tồn tại
- ❌ Thiếu infrastructure (Eureka, Config)
- ❌ Version không nhất quán
- ❌ Cannot run full system yet

### 🎯 Mục tiêu: Production Ready (100%)
- ✅ All infrastructure in place
- ✅ All services working together
- ✅ Monitoring, logging, tracing
- ✅ Tests, security, documentation

### ⏰ Timeline: 5-6 tuần

---

## 📚 DOCUMENTS TO READ (Thứ tự ưu tiên)

1. **PROJECT_READINESS_SUMMARY.md** (10 min read)
   - Executive summary
   - Hiểu rõ tình hình hiện tại

2. **COMPREHENSIVE_PROJECT_ASSESSMENT.md** (30 min read)
   - Chi tiết tất cả vấn đề
   - Giải pháp cho mỗi vấn đề
   - Best practices

3. **ACTION_PLAN_ROADMAP.md** (20 min read)
   - Concrete action steps
   - Exactly what to do, when, how long

4. **ORDER_SERVICE_DETAILED_ANALYSIS.md** (15 min read)
   - Understanding Order Service
   - Sample code improvements

5. **PRODUCT_SERVICE_DETAILED_ANALYSIS.md** (15 min read)
   - Understanding Product Service
   - Inventory management patterns

---

## 🎯 FIRST WEEK - CRITICAL TASKS

### Day 1-2: Preparation & Planning

#### Task: Read & Understand
```
❏ Read PROJECT_READINESS_SUMMARY.md
❏ Read COMPREHENSIVE_PROJECT_ASSESSMENT.md
❏ Read ACTION_PLAN_ROADMAP.md Phase 1
❏ Understand: Why we need Eureka? Why Config Server?
```

#### Task: Team Meeting
```
Agenda:
- Explain current situation (45% ready)
- Show timeline (5-6 weeks)
- Assign tasks:
  * Person A: Eureka Server development
  * Person B: Config Server development
  * Person C: pom.xml standardization
  * Person D: package rename + exception handling
  * Person E: docker-compose update
```

---

### Day 3-5: Sprint 1 Execution

#### Task 1.1: Standardize Spring Boot Versions (2 days)

**Step 1: Create working branch**
```bash
git checkout -b fix/spring-boot-standardization
```

**Step 2: Update API Gateway pom.xml**

Find:
```xml
<version>3.4.9</version>  <!-- Too new -->
```

Change to:
```xml
<version>3.2.5</version>  <!-- Match others -->
```

Also add Spring Cloud BOM:
```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>2024.0.0</version>  <!-- Change to 2023.0.1 -->
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

**Step 3: Update Identity Service pom.xml**

Add dependency management:
```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>2023.0.1</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
```

**Step 4: Test all services build**
```bash
cd api_gateway && mvn clean package
cd ../identity_service && mvn clean package
cd ../order_service && mvn clean package
cd ../product_service && mvn clean package
cd ../payment_service && mvn clean package
```

**Step 5: Git commit**
```bash
git add -A
git commit -m "chore: standardize Spring Boot to 3.2.5 and Spring Cloud to 2023.0.1"
git push origin fix/spring-boot-standardization
```

---

#### Task 1.2: Create Eureka Server (2-3 days)

**Step 1: Create new module structure**
```bash
mkdir discovery_service
cd discovery_service
mkdir -p src/main/java/com/pet_care/discovery
mkdir -p src/main/resources
mkdir -p src/test/java/com/pet_care/discovery
```

**Step 2: Create pom.xml**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.5</version>
        <relativePath/>
    </parent>

    <groupId>com.pet_care</groupId>
    <artifactId>discovery_service</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>discovery-service</name>

    <properties>
        <java.version>21</java.version>
        <spring-cloud.version>2023.0.1</spring-cloud.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

**Step 3: Create DiscoveryApplication.java**
```java
package com.pet_care.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class DiscoveryApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryApplication.class, args);
    }
}
```

**Step 4: Create application.yaml**
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

**Step 5: Create Dockerfile**
```dockerfile
FROM openjdk:21-slim
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

**Step 6: Test build**
```bash
mvn clean package
java -jar target/discovery_service-0.0.1-SNAPSHOT.jar
# Access: http://localhost:8761
```

---

#### Task 1.3: Create Config Server (2-3 days)

**Similar process to Eureka, but use:**
- Dependency: `spring-cloud-config-server`
- Annotation: `@EnableConfigServer`
- Port: 8888
- Folder: `config_repo/` with `.yaml` files

---

#### Task 1.4: Add Eureka & Config Client Dependencies (1 day)

**For each service pom.xml, add:**

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-config</artifactId>
</dependency>
```

**Create bootstrap.yaml for each service:**

```yaml
spring:
  application:
    name: identity-service  # Change per service
  cloud:
    config:
      uri: http://localhost:8888
      fail-fast: true
      retry:
        initial-interval: 1000
        max-interval: 2000
        multiplier: 1.1
        max-attempts: 10

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
```

---

#### Task 1.5: Update docker-compose.yaml (1 day)

**Replace entire file with version that includes:**
- MySQL
- RabbitMQ
- Redis (NEW)
- Eureka Server (NEW)
- Config Server (NEW)

(See full content in ACTION_PLAN_ROADMAP.md)

---

#### Task 1.6: Rename Package com.hoaiduc → com.pet_care (1 day)

**In Identity Service:**

```bash
# Step 1: Move files
mkdir -p src/main/java/com/pet_care/identity
cp -r src/main/java/com/hoaiduc/identity/* src/main/java/com/pet_care/identity/
rm -rf src/main/java/com/hoaiduc

# Step 2: Update all imports in Java files
# Find & Replace: com.hoaiduc → com.pet_care

# Step 3: Update pom.xml if needed
```

---

### Day 6-7: Testing & Verification

```
❏ Test all services build successfully
❏ Start Eureka Server manually
❏ Start Config Server manually
❏ Start one service, verify it registers in Eureka
❏ Start second service, verify both services see each other
❏ docker-compose up -d mysql-db rabbitmq eureka-server config-server
❏ Verify all containers running
❏ Git commit all changes
```

---

## 📋 WEEK 2-3: PRIORITY 2 TASKS

### Global Exception Handling (2-3 days)

```bash
# For each service, create:
src/main/java/com/pet_care/{service}/exception/
  ├── ErrorCode.java (enum)
  ├── AppException.java
  ├── ErrorResponse.java (DTO)
  └── GlobalExceptionHandler.java (@RestControllerAdvice)
```

---

### Implement RabbitMQ Configuration (2-3 days)

**Product Service:**
```java
// consumer/OrderCreatedConsumer.java
// configuration/RabbitMQConfig.java
// See ORDER_SERVICE_DETAILED_ANALYSIS.md for details
```

---

### Add Input Validation (1-2 days)

```java
// Update all DTO classes with @Valid, @NotNull, @NotBlank, etc.
// Update all Controller methods with @Valid @RequestBody
```

---

## 📊 TRACKING PROGRESS

### Checklist to Copy to Your Project Management Tool

```
WEEK 1: STABILIZATION
□ Spring Boot version standardization
□ Create Eureka Server
□ Create Config Server
□ Add Eureka + Config clients to all services
□ Update docker-compose.yaml
□ Rename com.hoaiduc → com.pet_care
□ All services build & run successfully

WEEK 2-3: RESILIENCE
□ Global exception handling (all services)
□ Input validation (all services)
□ Circuit breaker pattern
□ RabbitMQ consumer configuration
□ Database migration tool (Liquibase)

WEEK 4-5: PRODUCTION READINESS
□ API documentation (Swagger)
□ Monitoring setup (Prometheus)
□ Security hardening
□ Comprehensive testing
□ Create missing services (User, Notification)

WEEK 6: FINAL
□ Load testing
□ Performance optimization
□ Documentation complete
□ CI/CD setup
```

---

## 🆘 IF YOU GET STUCK

### Eureka Server Won't Start?
```
Check:
1. Port 8761 not in use: netstat -ano | findstr :8761
2. Java 21 installed: java -version
3. Maven works: mvn -v
4. Check logs for specific error
```

### Config Server Can't Connect to Git?
```
Use local folder instead of git repo
config:
  server:
    native:
      search-locations: file:./config-repo
```

### Services Can't Find Each Other?
```
Check:
1. Eureka dashboard: http://localhost:8761
2. Services show "UP" status?
3. Check logs: "Successfully registered with Eureka"
4. Service name matches in application.yaml
```

---

## 💡 BEST PRACTICES WHILE IMPLEMENTING

1. **Git commits frequently**
   ```bash
   git commit -m "feat: add Eureka client to identity service"
   ```

2. **Test each component separately**
   ```bash
   mvn test  # Unit tests
   mvn verify  # Integration tests
   ```

3. **Document as you go**
   - Update README files
   - Add comments to complex code
   - Create deployment guide

4. **Share progress with team**
   - Daily standup (15 min)
   - Weekly demo
   - Update roadmap

5. **Keep backups**
   - Push to git frequently
   - Don't rely on local changes

---

## 🎯 SUCCESS CRITERIA FOR WEEK 1

By end of Week 1, you should have:

✅ All services build successfully  
✅ Eureka Server running on port 8761  
✅ Config Server running on port 8888  
✅ All 5 services register with Eureka  
✅ docker-compose up brings all services online  
✅ Can call between services using service names (not hard-coded IPs)  
✅ All code committed to git  

---

## 📞 QUESTIONS TO ASK

Before starting implementation:

1. **Do we have a Git repository?** → Push all changes
2. **Can we use local file for Config Server?** → Easier than git setup
3. **Is team ready to start?** → Divide tasks
4. **Do we have Docker installed?** → Test docker-compose
5. **Any existing API Gateway routing rules?** → Update accordingly

---

## 🚀 YOU'RE READY TO START!

1. ✅ You understand the problems (45% ready)
2. ✅ You have the roadmap (5-6 weeks)
3. ✅ You have concrete tasks (week-by-week)
4. ✅ You have sample code (see ACTION_PLAN_ROADMAP.md)
5. ✅ You know success criteria

**Next action:** Pick Task 1.1 (Spring Boot standardization) and start TODAY.

---

**Good luck! 🎉**

**Questions? Read:**
- COMPREHENSIVE_PROJECT_ASSESSMENT.md (detailed analysis)
- ACTION_PLAN_ROADMAP.md (implementation details)
- README.md in individual services (once created)

---

*Prepared by: GitHub Copilot*  
*Date: April 8, 2026*


