FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY .mvn/ .mvn
COPY mvnw .
COPY pom.xml .
COPY src ./src

RUN ./mvnw clean package -DskipTests && cp target/*.jar app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
