package com.pet_care.product.repository;

import com.pet_care.product.entity.Categories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Categories, String> {
    boolean existsProductByCategoryId(String categoryId);
}
