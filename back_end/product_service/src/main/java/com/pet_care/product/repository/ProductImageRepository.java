package com.pet_care.product.repository;

import com.pet_care.product.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<Image, String> {
    List<Image> findByProductId(String productId);

    Image findByProductIdAndIsPrimaryTrue(String productId);
}
