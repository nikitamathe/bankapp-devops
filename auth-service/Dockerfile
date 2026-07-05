# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

# Install Maven (Alpine package — much lighter than downloading a tarball)
RUN apk add --no-cache maven

WORKDIR /app

# Copy POM first so dependency layer is cached separately from source
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build (skip tests — they run in CI, not during image build)
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

# Add a non-root user for security
RUN addgroup -S banking && adduser -S banking -G banking

WORKDIR /app

# Copy only the fat JAR from the build stage
COPY --from=builder /app/target/*.jar app.jar

# Switch to non-root
USER banking

EXPOSE 8081

# Use exec form so PID 1 gets signals properly.
# -XX:+UseContainerSupport: respect Docker CPU/memory limits
# -XX:MaxRAMPercentage=75: use up to 75% of container memory for heap
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
