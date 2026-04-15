package com.pet_care.cart.mapper;

import com.pet_care.cart.dto.response.CartItemResponse;
import com.pet_care.cart.dto.response.CartResponse;
import com.pet_care.cart.entity.Cart;
import com.pet_care.cart.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "subtotal", expression = "java(calcSubtotal(item))")
    CartItemResponse toCartItemResponse(CartItem item);

    default BigDecimal calcSubtotal(CartItem item) {
        if (item.getUnitPrice() == null || item.getQuantity() == null) return BigDecimal.ZERO;
        return item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    @Mapping(target = "items", source = "items")
    @Mapping(target = "totalItems", expression = "java(cart.getItems().size())")
    @Mapping(target = "totalPrice", expression = "java(calcTotal(cart))")
    CartResponse toCartResponse(Cart cart);

    default BigDecimal calcTotal(Cart cart) {
        return cart.getItems().stream()
                .map(i -> i.getUnitPrice() != null
                        ? i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
                        : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
