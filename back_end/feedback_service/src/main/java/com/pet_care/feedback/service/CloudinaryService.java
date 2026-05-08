package com.pet_care.feedback.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.pet_care.feedback.exception.AppException;
import com.pet_care.feedback.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;
    
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_FORMATS = List.of("jpg", "jpeg", "png");

    /**
     * Upload single image to Cloudinary
     */
    public String uploadImage(MultipartFile file) {
        validateImage(file);
        
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "pet_care/feedbacks",
                            "resource_type", "image"
                    ));
            
            String imageUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully: {}", imageUrl);
            return imageUrl;
            
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new AppException(ErrorCode.IMAGE_UPLOAD_FAILED);
        }
    }

    /**
     * Upload multiple images
     */
    public List<String> uploadImages(List<MultipartFile> files) {
        List<String> imageUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            String imageUrl = uploadImage(file);
            imageUrls.add(imageUrl);
        }
        
        return imageUrls;
    }

    /**
     * Delete image from Cloudinary
     */
    public void deleteImage(String imageUrl) {
        try {
            String publicId = extractPublicId(imageUrl);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image deleted successfully: {}", publicId);
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary", e);
        }
    }

    /**
     * Validate image file
     */
    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FORMAT);
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.IMAGE_TOO_LARGE);
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FORMAT);
        }
        
        String extension = getFileExtension(file.getOriginalFilename());
        if (!ALLOWED_FORMATS.contains(extension.toLowerCase())) {
            throw new AppException(ErrorCode.INVALID_IMAGE_FORMAT);
        }
    }

    /**
     * Extract public ID from Cloudinary URL
     */
    private String extractPublicId(String imageUrl) {
        String[] parts = imageUrl.split("/");
        String fileNameWithExtension = parts[parts.length - 1];
        return "pet_care/feedbacks/" + fileNameWithExtension.split("\\.")[0];
    }

    /**
     * Get file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
}
