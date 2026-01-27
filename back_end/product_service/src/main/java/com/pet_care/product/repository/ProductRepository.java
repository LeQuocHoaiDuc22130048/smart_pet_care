package com.pet_care.product.repository;

import com.pet_care.product.entity.Products;
import com.pet_care.product.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Products, String> {
    List<Products> findByStatus(ProductStatus status);

    List<Products> findByCategoryId(String categoryId);
}
