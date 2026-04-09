package com.pet_care.product.messaging;

import com.pet_care.product.dto.request.RollbackStockRequest;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StockRollbackEvent {
    String orderId;
    List<RollbackStockRequest> items;
}
