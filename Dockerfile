FROM --platform=linux/amd64 maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY pom.xml ./pom.xml
COPY backend/pom.xml backend/pom.xml
COPY backend/src backend/src
RUN mvn -B -f backend/pom.xml -DskipTests package

FROM --platform=linux/amd64 eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /workspace/backend/target/teampulse-java-0.1.0-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
