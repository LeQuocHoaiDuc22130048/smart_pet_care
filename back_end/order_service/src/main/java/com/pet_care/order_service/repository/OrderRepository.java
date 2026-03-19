package com.pet_care.order_service.repository;

import com.pet_care.order_service.entity.Orders;
import com.pet_care.order_service.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Orders, String> {
    List<Orders> findByUserId(String userId);

    Optional<Orders> findFirstByUserIdAndStatusIn(String userId, List<OrderStatus> statuses);
}
