package com.pet_care.product.mapper;

import com.pet_care.product.dto.request.CategoryCreationRequest;
import com.pet_care.product.dto.request.CategoryUpdateRequest;
import com.pet_care.product.dto.response.CategoryResponse;
import com.pet_care.product.entity.Categories;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "categoryId", source = "categoryId")
    @Mapping(target = "categoryName", source = "categoryName")
    @Mapping(target = "description", source = "description")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    CategoryResponse toCategoryResponse(Categories category);

    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Categories toCategory(CategoryCreationRequest request);

    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateCategory(@MappingTarget Categories category, CategoryUpdateRequest request);
}
