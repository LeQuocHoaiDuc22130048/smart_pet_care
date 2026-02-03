package com.pet_care.product.service;

import com.pet_care.product.dto.ImageUploadData;
import com.pet_care.product.entity.Image;
import com.pet_care.product.entity.Products;
import com.pet_care.product.repository.ProductImageRepository;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImageAsyncService {
    CloudinaryService cloudinaryService;
    ProductImageRepository productImageRepository;

    @Async
    public void uploadImageAsync(
            Products products,
            List<ImageUploadData> images
    ) {
        log.info("Starting async image upload for product id: {}", products.getId());

        List<Image> imageEntities = new ArrayList<>();

        for(ImageUploadData imageUploadData: images) {
            String url = cloudinaryService.uploadImage(imageUploadData.getImageBytes());

            imageEntities.add(
                    Image.builder()
                            .product(products)
                            .imageUrl(url)
                            .isPrimary(imageUploadData.isPrimary())
                            .build()
            );
        }

        productImageRepository.saveAll(imageEntities);

        log.info("Completed async image upload for product id: {}", products.getId());
    }
}
