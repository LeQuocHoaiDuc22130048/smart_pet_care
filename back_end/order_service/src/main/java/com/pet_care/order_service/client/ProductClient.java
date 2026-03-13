package com.pet_care.order_service.client;

import com.pet_care.order_service.dto.ApiResponse;
import com.pet_care.order_service.dto.response.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", url = "http://localhost:8081/pet_care_product")
public interface ProductClient {
    @GetMapping("/products/{id}")
    ApiResponse<ProductResponse> getProductById(@PathVariable String id);
}
