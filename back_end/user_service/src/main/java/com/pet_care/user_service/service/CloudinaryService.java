package com.pet_care.user_service.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CloudinaryService {

    Cloudinary cloudinary;


    public String uploadUserAvatar(byte[] file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file,
                    ObjectUtils.asMap(
                            "folder", "pet_care_smart_store/user_avatars",
                            "resource_type", "image"
                    )
            );
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            throw new RuntimeException("Upload user avatar failed", e);
        }
    }

    public String uploadPetImage(byte[] file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file,
                    ObjectUtils.asMap(
                            "folder", "pet_care_smart_store/pet_images",
                            "resource_type", "image"
                    )
            );
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            throw new RuntimeException("Upload pet image failed", e);
        }
    }

    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            // Log but don't throw
        }
    }
}
