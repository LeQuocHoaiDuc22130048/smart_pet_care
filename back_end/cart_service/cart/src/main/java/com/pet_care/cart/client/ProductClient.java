package com.pet_care.cart.client;

import com.pet_care.cart.dto.ApiResponse;
import com.pet_care.cart.dto.response.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", url = "${services.product-service.url}")
public interface ProductClient {

    @GetMapping("/products/{id}")
    ApiResponse<ProductResponse> getProductById(@PathVariable String id);
}
