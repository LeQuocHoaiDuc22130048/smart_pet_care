package com.pet_care.user_service.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageUploadData {
    byte[] image;
    String type; // "avatar" or "pet_image"
}
