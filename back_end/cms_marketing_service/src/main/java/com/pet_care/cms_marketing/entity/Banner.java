package com.pet_care.cms_marketing.entity;

import com.pet_care.cms_marketing.enums.ContentStatus;
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
@Document(collection = "banners")
public class Banner {
    @Id
    String id;

    String title;
    String subtitle;
    String imageUrl;
    String linkUrl;

    @Indexed
    String position;

    @Builder.Default
    int sortOrder = 0;

    @Builder.Default
    ContentStatus status = ContentStatus.DRAFT;

    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
    LocalDateTime updatedAt;
}
