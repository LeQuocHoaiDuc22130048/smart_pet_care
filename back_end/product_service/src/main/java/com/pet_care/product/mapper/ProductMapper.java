package com.pet_care.product.mapper;

import com.pet_care.product.dto.request.ProductCreationRequest;
import com.pet_care.product.dto.response.ProductResponse;
import com.pet_care.product.entity.Products;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "category", source = "categories")
    ProductResponse toProductResponse(Products product);

    Products toProduct(ProductCreationRequest request);

}
