package com.pet_care.cart.repository;

import com.pet_care.cart.entity.Cart;
import com.pet_care.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {

    Optional<CartItem> findByCartAndProductId(Cart cart, String productId);

    // Tìm item theo id và cartId trong 1 query — tránh LazyInitializationException
    @Query("SELECT i FROM CartItem i WHERE i.id = :itemId AND i.cart.id = :cartId")
    Optional<CartItem> findByIdAndCartId(@Param("itemId") String itemId,
                                         @Param("cartId") String cartId);
}
