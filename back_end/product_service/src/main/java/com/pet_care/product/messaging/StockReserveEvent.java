package com.pet_care.product.messaging;

import com.pet_care.product.dto.request.ReserveStockRequest;
import lombok.Data;

import java.util.List;

@Data
public class StockReserveEvent {
    String orderId;
    List<ReserveStockRequest> items;
}
