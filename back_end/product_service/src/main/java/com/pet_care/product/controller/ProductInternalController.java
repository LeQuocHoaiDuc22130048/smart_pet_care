package com.pet_care.product.controller;

import com.pet_care.product.dto.ApiResponse;
import com.pet_care.product.dto.request.ReserveStockRequest;
import com.pet_care.product.dto.request.RollbackStockRequest;
import com.pet_care.product.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/internal/products")
public class ProductInternalController {
    ProductService productService;

    @PostMapping("/reserve-stock")
    public ApiResponse<?> reserveStock(@RequestBody List<ReserveStockRequest> requests) {
        productService.reserveStock(requests);
        return ApiResponse.builder()
                .result("Stock reserved successfully")
                .build();
    }

    @PostMapping("/rollback-stock")
    public ApiResponse<?> rollbackStock(@RequestBody List<RollbackStockRequest> requests) {
        productService.rollbackStock(requests);
        return ApiResponse.builder()
                .result("Stock rolled back successfully")
                .build();
    }
}
