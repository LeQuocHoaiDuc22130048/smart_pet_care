package com.pet_care.order_service.client;

import com.pet_care.order_service.dto.ApiResponse;
import com.pet_care.order_service.dto.request.ReserveStockRequest;
import com.pet_care.order_service.dto.request.RollbackStockRequest;
import com.pet_care.order_service.dto.response.ProductResponse;
import com.pet_care.order_service.exception.AppException;
import com.pet_care.order_service.exception.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Fallback implementation for ProductClient when Product Service is unavailable
 */
@Slf4j
@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public ApiResponse<ProductResponse> getProductById(String id) {
        log.error("Fallback: Product Service is unavailable. Cannot fetch product with id: {}", id);
        throw new AppException(ErrorCode.SERVICE_UNAVAILABLE);
    }

    @Override
    public void reserveStock(List<ReserveStockRequest> requests) {
        log.error("Fallback: Product Service is unavailable. Cannot reserve stock for requests: {}", requests);
        throw new AppException(ErrorCode.SERVICE_UNAVAILABLE);
    }

    @Override
    public void rollbackStock(List<RollbackStockRequest> requests) {
        log.error("Fallback: Product Service is unavailable. Cannot rollback stock for requests: {}", requests);
        throw new AppException(ErrorCode.SERVICE_UNAVAILABLE);
    }
}
