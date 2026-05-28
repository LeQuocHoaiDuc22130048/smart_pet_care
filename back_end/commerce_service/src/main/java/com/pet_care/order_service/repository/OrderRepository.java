package com.pet_care.order_service.repository;

import com.pet_care.order_service.entity.Orders;
import com.pet_care.order_service.enums.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Orders, String> {

    @EntityGraph(attributePaths = {"items"})
    List<Orders> findByUserId(String userId);

    @EntityGraph(attributePaths = {"items"})
    Optional<Orders> findById(String id);

    @EntityGraph(attributePaths = {"items"})
    Optional<Orders> findFirstByUserIdAndStatusIn(String userId, List<OrderStatus> statuses);

    // Admin: lấy tất cả đơn hàng
    @EntityGraph(attributePaths = {"items"})
    List<Orders> findAll();

    // Admin: lọc theo status
    @EntityGraph(attributePaths = {"items"})
    List<Orders> findByStatus(OrderStatus status);

    // Admin: lọc theo userId + status
    @EntityGraph(attributePaths = {"items"})
    List<Orders> findByUserIdAndStatus(String userId, OrderStatus status);

    // Admin: đếm theo status
    long countByStatus(OrderStatus status);
}
