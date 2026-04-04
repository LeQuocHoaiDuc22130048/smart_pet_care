package com.pet_care.order_service.event;

import com.pet_care.order_service.dto.request.RollbackStockRequest;

import java.util.List;

public class StockRollbackEvent {
    String orderId;
    List<RollbackStockRequest> items;
}
