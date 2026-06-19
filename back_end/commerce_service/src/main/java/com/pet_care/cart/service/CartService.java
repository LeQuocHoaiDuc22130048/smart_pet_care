package com.pet_care.cart.service;

import com.pet_care.cart.client.ProductClient;
import com.pet_care.cart.dto.request.AddToCartRequest;
import com.pet_care.cart.dto.request.UpdateCartItemRequest;
import com.pet_care.cart.dto.response.CartResponse;
import com.pet_care.cart.dto.response.ImageResponse;
import com.pet_care.cart.dto.response.ProductResponse;
import com.pet_care.cart.entity.Cart;
import com.pet_care.cart.entity.CartItem;
import com.pet_care.cart.exception.AppException;
import com.pet_care.cart.exception.ErrorCode;
import com.pet_care.cart.mapper.CartMapper;
import com.pet_care.cart.repository.CartItemRepository;
import com.pet_care.cart.repository.CartRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartService {

    CartRepository cartRepository;
    CartItemRepository cartItemRepository;
    CartMapper cartMapper;
    ProductClient productClient;

    /**
     * Lấy giỏ hàng của user hiện tại.
     * Tự tạo mới nếu chưa có.
     */
    @Transactional
    public CartResponse getMyCart(String userId) {
        Cart cart = getOrCreateCart(userId);
        refreshMissingImageSnapshots(cart);
        return cartMapper.toCartResponse(cart);
    }

    /**
     * Thêm sản phẩm vào giỏ hàng.
     * Nếu sản phẩm đã có → cộng thêm số lượng.
     * Snapshot tên và giá tại thời điểm thêm.
     */
    @Transactional
    public CartResponse addToCart(String userId, AddToCartRequest request) {
        // Validate product từ product_service
        ProductResponse product = fetchProduct(request.getProductId());

        Cart cart = getOrCreateCart(userId);

        cartItemRepository.findByCartAndProductId(cart, request.getProductId())
                .ifPresentOrElse(
                        existing -> {
                            // Sản phẩm đã có → cộng thêm số lượng
                            int newQty = existing.getQuantity() + request.getQuantity();
                            validateStock(product, newQty);
                            existing.setQuantity(newQty);
                            // Cập nhật snapshot mới nhất
                            existing.setUnitPrice(product.getPrice());
                            existing.setProductName(product.getProductName());
                            existing.setImageUrl(getPrimaryImageUrl(product));
                            cartItemRepository.save(existing);
                        },
                        () -> {
                            // Sản phẩm chưa có → tạo mới
                            validateStock(product, request.getQuantity());
                            CartItem item = CartItem.builder()
                                    .cart(cart)
                                    .productId(product.getId())
                                    .productName(product.getProductName())
                                    .imageUrl(getPrimaryImageUrl(product))
                                    .unitPrice(product.getPrice())
                                    .quantity(request.getQuantity())
                                    .build();
                            cart.getItems().add(item);
                        }
                );

        Cart saved = cartRepository.save(cart);
        return cartMapper.toCartResponse(saved);
    }

    /**
     * Cập nhật số lượng item trong giỏ.
     * quantity = 0 → xóa item khỏi giỏ.
     */
    @Transactional
    public CartResponse updateCartItem(String userId, String itemId, UpdateCartItemRequest request) {
        Cart cart = getCartByUser(userId);

        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (request.getQuantity() == 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            ProductResponse product = fetchProduct(item.getProductId());
            validateStock(product, request.getQuantity());
            item.setQuantity(request.getQuantity());
            item.setUnitPrice(product.getPrice());
            item.setProductName(product.getProductName());
            item.setImageUrl(getPrimaryImageUrl(product));
            cartItemRepository.save(item);
        }

        Cart saved = cartRepository.save(cart);
        return cartMapper.toCartResponse(saved);
    }

    @Transactional
    public CartResponse removeCartItem(String userId, String itemId) {
        Cart cart = getCartByUser(userId);

        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cart.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        Cart saved = cartRepository.save(cart);
        return cartMapper.toCartResponse(saved);
    }

    /**
     * Xóa toàn bộ giỏ hàng (dùng sau khi đặt hàng thành công).
     */
    @Transactional
    public void clearCart(String userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().clear();
            cartRepository.save(cart);
            log.info("Cleared cart for user: {}", userId);
        });
    }

    // --- Private helpers ---

    private Cart getOrCreateCart(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(
                        Cart.builder().userId(userId).build()
                ));
    }

    private Cart getCartByUser(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_NOT_FOUND));
    }

    private ProductResponse fetchProduct(String productId) {
        try {
            ProductResponse product = productClient.getProductById(productId).getResult();
            if (product == null) throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
            // Chỉ block khi hết hàng hoàn toàn
            if ("OUT_OF_STOCK".equals(product.getStatus())) {
                throw new AppException(ErrorCode.PRODUCT_OUT_OF_STOCK);
            }
            return product;
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to fetch product {}: {}", productId, e.getMessage());
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
    }

    private void validateStock(ProductResponse product, int requestedQty) {
        // Chỉ validate khi product có thông tin stock rõ ràng
        if (product.getStockQuantity() != null
                && product.getStockQuantity() > 0
                && product.getStockQuantity() < requestedQty) {
            throw new AppException(ErrorCode.QUANTITY_EXCEEDS_STOCK);
        }
    }

    private void refreshMissingImageSnapshots(Cart cart) {
        cart.getItems().stream()
                .filter(item -> item.getImageUrl() == null || item.getImageUrl().isBlank())
                .forEach(item -> {
                    try {
                        ProductResponse product = fetchProduct(item.getProductId());
                        item.setProductName(product.getProductName());
                        item.setUnitPrice(product.getPrice());
                        item.setImageUrl(getPrimaryImageUrl(product));
                    } catch (AppException e) {
                        log.warn("Cannot refresh cart item image for product {}: {}", item.getProductId(), e.getMessage());
                    }
                });
    }

    private String getPrimaryImageUrl(ProductResponse product) {
        if (product.getImages() == null || product.getImages().isEmpty()) {
            return null;
        }

        return product.getImages().stream()
                .filter(image -> Boolean.TRUE.equals(image.getIsPrimary()))
                .findFirst()
                .or(() -> product.getImages().stream().findFirst())
                .map(ImageResponse::getImageUrl)
                .orElse(null);
    }
}
