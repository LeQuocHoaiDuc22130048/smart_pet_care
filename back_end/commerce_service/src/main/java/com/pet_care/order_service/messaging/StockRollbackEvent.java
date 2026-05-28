package com.pet_care.order_service.messaging;

import com.pet_care.order_service.dto.request.RollbackStockRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockRollbackEvent {
    String orderId;
    List<RollbackStockRequest> items;
}
