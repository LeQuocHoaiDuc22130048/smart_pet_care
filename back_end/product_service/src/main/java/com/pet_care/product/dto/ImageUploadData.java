package com.pet_care.product.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageUploadData {
    byte[] imageBytes;
    boolean isPrimary;
}
