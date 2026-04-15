package com.pet_care.product.repository;

import com.pet_care.product.entity.Products;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Products, String> {

    boolean existsByProductName(String productName);

    /**
     * SELECT ... FOR UPDATE — dùng cho reserveStock/rollbackStock
     * để tránh race condition (oversell) khi nhiều request đồng thời.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Products p WHERE p.id = :id")
    Optional<Products> findByIdForUpdate(@Param("id") String id);
}
