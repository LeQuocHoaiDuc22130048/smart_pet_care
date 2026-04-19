# Stage 1: Build
FROM maven:3.9.11-amazoncorretto-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime (use JRE instead of JDK)
FROM amazoncorretto:21.0.4
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create non-root user for security (Amazon Linux uses adduser)
RUN yum install -y shadow-utils && \
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app && \
    yum clean all
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]