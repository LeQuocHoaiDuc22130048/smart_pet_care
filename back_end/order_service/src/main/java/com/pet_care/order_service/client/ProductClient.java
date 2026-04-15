package com.pet_care.order_service.client;

import com.pet_care.order_service.dto.ApiResponse;
import com.pet_care.order_service.dto.request.ReserveStockRequest;
import com.pet_care.order_service.dto.request.RollbackStockRequest;
import com.pet_care.order_service.dto.response.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import java.util.List;

@FeignClient(name = "product-service", url = "${services.product-service.url}")
public interface ProductClient {
    @GetMapping("/products/{id}")
    ApiResponse<ProductResponse> getProductById(@PathVariable String id);

    @PostMapping("/internal/products/reserve-stock")
    void reserveStock(List<ReserveStockRequest> requests);

    @PostMapping("/internal/products/rollback-stock")
    void rollbackStock(List<RollbackStockRequest> requests);
}
