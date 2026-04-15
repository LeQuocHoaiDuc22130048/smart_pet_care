package com.pet_care.order_service.repository;

import com.pet_care.order_service.entity.Orders;
import com.pet_care.order_service.enums.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Orders, String> {

    // Fetch items cùng lúc để tránh LazyInitializationException
    @EntityGraph(attributePaths = {"items"})
    List<Orders> findByUserId(String userId);

    @EntityGraph(attributePaths = {"items"})
    Optional<Orders> findById(String id);

    @EntityGraph(attributePaths = {"items"})
    Optional<Orders> findFirstByUserIdAndStatusIn(String userId, List<OrderStatus> statuses);
}
