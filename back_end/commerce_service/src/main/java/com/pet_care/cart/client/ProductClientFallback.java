package com.pet_care.cart.client;

import com.pet_care.cart.dto.ApiResponse;
import com.pet_care.cart.dto.response.ProductResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Fallback implementation for ProductClient when Product Service is unavailable
 */
@Slf4j
@Component("cartProductClientFallback")
public class ProductClientFallback implements ProductClient {

    @Override
    public ApiResponse<ProductResponse> getProductById(String id) {
        log.error("Fallback: Product Service is unavailable. Cannot fetch product with id: {}", id);
        // Return null or empty response instead of throwing exception
        return ApiResponse.<ProductResponse>builder()
                .code(503)
                .message("Product Service temporarily unavailable. Please try again later.")
                .result(null)
                .build();
    }
}
