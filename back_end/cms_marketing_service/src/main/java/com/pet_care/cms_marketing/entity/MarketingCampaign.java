package com.pet_care.cms_marketing.entity;

import com.pet_care.cms_marketing.enums.ContentStatus;
import com.pet_care.cms_marketing.enums.DiscountType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "marketing_campaigns")
public class MarketingCampaign {
    @Id
    String id;

    String name;
    String description;

    @Indexed
    String couponCode;

    DiscountType discountType;
    BigDecimal discountValue;
    BigDecimal minOrderValue;
    BigDecimal maxDiscount;
    Integer usageLimit;

    LocalDateTime startAt;
    LocalDateTime endAt;

    @Builder.Default
    ContentStatus status = ContentStatus.DRAFT;

    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
    LocalDateTime updatedAt;
}
