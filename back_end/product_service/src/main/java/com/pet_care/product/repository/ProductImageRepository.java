package com.pet_care.product.repository;

import com.pet_care.product.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<Image, String> {
    List<Image> findByProductId(String productId);

    Image findByProductIdAndIsPrimaryTrue(String productId);
}
