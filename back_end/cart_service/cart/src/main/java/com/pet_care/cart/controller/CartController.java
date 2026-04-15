package com.pet_care.cart.controller;

import com.pet_care.cart.dto.ApiResponse;
import com.pet_care.cart.dto.request.AddToCartRequest;
import com.pet_care.cart.dto.request.UpdateCartItemRequest;
import com.pet_care.cart.dto.response.CartResponse;
import com.pet_care.cart.service.CartService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;

    /** Lấy giỏ hàng của user hiện tại */
    @GetMapping
    public ApiResponse<CartResponse> getMyCart(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.getMyCart(jwt.getSubject()))
                .build();
    }

    /** Thêm sản phẩm vào giỏ */
    @PostMapping("/items")
    public ApiResponse<CartResponse> addToCart(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid AddToCartRequest request) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.addToCart(jwt.getSubject(), request))
                .build();
    }

    /** Cập nhật số lượng item (quantity=0 để xóa) */
    @PutMapping("/items/{itemId}")
    public ApiResponse<CartResponse> updateItem(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String itemId,
            @RequestBody @Valid UpdateCartItemRequest request) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.updateCartItem(jwt.getSubject(), itemId, request))
                .build();
    }

    /** Xóa 1 item khỏi giỏ */
    @DeleteMapping("/items/{itemId}")
    public ApiResponse<CartResponse> removeItem(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String itemId) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.removeCartItem(jwt.getSubject(), itemId))
                .build();
    }

    /** Xóa toàn bộ giỏ hàng */
    @DeleteMapping
    public ApiResponse<Void> clearCart(@AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(jwt.getSubject());
        return ApiResponse.<Void>builder().message("Cart cleared").build();
    }
}
