package com.pet_care.cms_marketing.dto;

import com.pet_care.cms_marketing.enums.ContentStatus;
import com.pet_care.cms_marketing.enums.DiscountType;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MarketingCampaignRequest {
    @NotBlank
    String name;
    String description;
    String couponCode;
    DiscountType discountType;
    BigDecimal discountValue;
    BigDecimal minOrderValue;
    BigDecimal maxDiscount;
    Integer usageLimit;
    LocalDateTime startAt;
    LocalDateTime endAt;
    ContentStatus status;
}
