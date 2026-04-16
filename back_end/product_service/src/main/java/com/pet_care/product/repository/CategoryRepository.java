package com.pet_care.product.repository;

import com.pet_care.product.entity.Categories;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Categories, String> {
    @Query(value = "SELECT EXISTS(SELECT 1 FROM product_category pc " +
                   "INNER JOIN products p ON pc.product_id = p.id " +
                   "WHERE pc.category_id = :categoryId)", nativeQuery = true)
    Integer existsProductByCategoryIdAsInt(@Param("categoryId") String categoryId);

    default boolean existsProductByCategoryId(String categoryId) {
        Integer result = existsProductByCategoryIdAsInt(categoryId);
        return result != null && result > 0;
    }

    boolean existsByCategoryName(String categoryName);
}
