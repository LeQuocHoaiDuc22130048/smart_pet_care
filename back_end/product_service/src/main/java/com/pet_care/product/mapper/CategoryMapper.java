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
    CategoryResponse toCategoryResponse(Categories category);

    Categories toCategory(CategoryCreationRequest request);

    @Mapping(target = "createdAt", ignore = true)
    void updateCategory(@MappingTarget Categories category, CategoryUpdateRequest request);


}
