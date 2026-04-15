package com.pet_care.product.mapper;

import com.pet_care.product.dto.request.ProductCreationRequest;
import com.pet_care.product.dto.response.ImageResponse;
import com.pet_care.product.dto.response.ProductResponse;
import com.pet_care.product.entity.Image;
import com.pet_care.product.entity.Products;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "category", source = "categories")
    @Mapping(target = "images", source = "images")
    ProductResponse toProductResponse(Products product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Products toProduct(ProductCreationRequest request);

    @Mapping(target = "imageUrl", source = "imageUrl")
    @Mapping(target = "isPrimary", source = "isPrimary")
    ImageResponse toImageResponse(Image image);
}
