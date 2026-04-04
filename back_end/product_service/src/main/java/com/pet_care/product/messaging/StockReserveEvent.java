package com.pet_care.product.event;

import com.pet_care.order_service.dto.request.ReserveStockRequest;
import lombok.Data;

import java.util.List;

@Data
public class StockReserveEvent {
    String orderId;
    List<ReserveStockRequest> items;
}
