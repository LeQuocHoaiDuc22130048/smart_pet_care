package com.pet_care.product.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    public String uploadImage(byte[] file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file,
                    ObjectUtils.asMap(
                            "folder", "pet_care_smart_store/products",
                            "resource_type", "image"
                    )
            );

            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            throw new RuntimeException("Upload image failed", e);
        }
    }
}
