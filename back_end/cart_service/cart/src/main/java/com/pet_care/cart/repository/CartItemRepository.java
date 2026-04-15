package com.pet_care.cart.repository;

import com.pet_care.cart.entity.Cart;
import com.pet_care.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {

    Optional<CartItem> findByCartAndProductId(Cart cart, String productId);
}
