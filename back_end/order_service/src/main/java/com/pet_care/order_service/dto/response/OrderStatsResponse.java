package com.pet_care.order_service.dto.response;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatsResponse {
    long total;
    Map<String, Long> byStatus;
}
