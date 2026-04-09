---
name: scaffold-crud-module
description: Generates the standard 5-layer Spring Boot folder structure and base files for a new entity. Use when asked to create a new CRUD flow, module, or entity for a microservice. It strictly enforces the project's DTO and MapStruct architectural rules.
---

To scaffold a new CRUD module, use the following commands to create the required directories and files based on the project's strict layered architecture.

```bash
# Set your module name (e.g., banner, pet, appointment)
MODULE_NAME="<module_name>"
CAPITALIZED_MODULE=$(tr '[:lower:]' '[:upper:]' <<< ${MODULE_NAME:0:1})${MODULE_NAME:1}

# Create standard layered directories
mkdir -p src/main/java/com/petshop/service/entity
mkdir -p src/main/java/com/petshop/service/dto/request
mkdir -p src/main/java/com/petshop/service/dto/response
mkdir -p src/main/java/com/petshop/service/mapper
mkdir -p src/main/java/com/petshop/service/repository
mkdir -p src/main/java/com/petshop/service/service
mkdir -p src/main/java/com/petshop/service/controller

# Create base files
touch src/main/java/com/petshop/service/entity/${CAPITALIZED_MODULE}Entity.java
touch src/main/java/com/petshop/service/dto/request/${CAPITALIZED_MODULE}RequestDTO.java
touch src/main/java/com/petshop/service/dto/response/${CAPITALIZED_MODULE}ResponseDTO.java
touch src/main/java/com/petshop/service/mapper/${CAPITALIZED_MODULE}Mapper.java
touch src/main/java/com/petshop/service/repository/${CAPITALIZED_MODULE}Repository.java
touch src/main/java/com/petshop/service/service/${CAPITALIZED_MODULE}Service.java
touch src/main/java/com/petshop/service/controller/${CAPITALIZED_MODULE}Controller.java

echo "Scaffolded 7 files for ${CAPITALIZED_MODULE} module. Remember to use @Mapper(componentModel = \"spring\") and never leak the Entity in the Controller."