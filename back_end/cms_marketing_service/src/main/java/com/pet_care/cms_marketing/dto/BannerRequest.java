package com.pet_care.cms_marketing.dto;

import com.pet_care.cms_marketing.enums.ContentStatus;
import jakarta.validation.constraints.NotBlank;
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
public class BannerRequest {
    @NotBlank
    String title;
    String subtitle;

    @NotBlank
    String imageUrl;
    String linkUrl;

    @NotBlank
    String position;

    int sortOrder;
    ContentStatus status;
}
