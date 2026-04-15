package com.pet_care.product.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.product.dto.ImageUploadData;
import com.pet_care.product.dto.request.ProductCreationRequest;
import com.pet_care.product.dto.request.ProductUpdateRequest;
import com.pet_care.product.dto.request.ReserveStockRequest;
import com.pet_care.product.dto.request.RollbackStockRequest;
import com.pet_care.product.dto.response.ProductResponse;
import com.pet_care.product.entity.Categories;
import com.pet_care.product.entity.InventoryLog;
import com.pet_care.product.entity.Products;
import com.pet_care.product.enums.InventoryChangeType;
import com.pet_care.product.exception.AppException;
import com.pet_care.product.exception.ErrorCode;
import com.pet_care.product.mapper.ProductMapper;
import com.pet_care.product.repository.CategoryRepository;
import com.pet_care.product.repository.InventoryLogRepository;
import com.pet_care.product.repository.ProductImageRepository;
import com.pet_care.product.repository.ProductRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductService {

    ProductMapper productMapper;
    ProductRepository productRepository;
    CategoryRepository categoryRepository;
    ImageAsyncService imageAsyncService;
    ProductImageRepository productImageRepository;
    InventoryLogRepository inventoryLogRepository;
    ObjectMapper objectMapper; // inject bean, không new mỗi request

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ProductResponse createProduct(ProductCreationRequest request, List<MultipartFile> images) throws IOException {
        if (productRepository.existsByProductName(request.getProductName()))
            throw new AppException(ErrorCode.PRODUCT_NAME_EXISTED);

        if (request.getPrimaryImageIndex() == null || request.getPrimaryImageIndex() >= images.size())
            throw new AppException(ErrorCode.PRIMARY_IMAGE_INDEX_INVALID);

        Set<Categories> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryId()));
        if (categories.isEmpty()) throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);

        Products products = productMapper.toProduct(request);
        products.setCategories(categories);

        try {
            products = productRepository.save(products);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.PRODUCT_NAME_EXISTED);
        }

        // Khởi tạo list rỗng để response không trả null cho images
        // Ảnh thực sẽ được cập nhật async sau khi upload Cloudinary xong
        products.setImages(new ArrayList<>());

        List<ImageUploadData> uploadDataList = new ArrayList<>();
        for (int i = 0; i < images.size(); i++) {
            uploadDataList.add(new ImageUploadData(
                    images.get(i).getBytes(),
                    i == request.getPrimaryImageIndex()
            ));
        }

        final Products savedProduct = products;
        final List<ImageUploadData> finalUploadList = uploadDataList;
        // Upload ảnh sau khi transaction commit để tránh upload thành công nhưng DB rollback
        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronizationAdapter() {
                    @Override
                    public void afterCommit() {
                        imageAsyncService.uploadImageAsync(savedProduct, finalUploadList);
                    }
                }
        );

        return productMapper.toProductResponse(products);
    }

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    public ProductResponse getProductById(String productId) {
        Products product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ProductResponse updateProduct(String productId, ProductUpdateRequest request, List<MultipartFile> images) throws IOException {
        Products product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (request.getProductName() != null) product.setProductName(request.getProductName());
        if (request.getDescription() != null) product.setDescription(request.getDescription());
        if (request.getPrice() != null) product.setPrice(request.getPrice());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getStatus() != null) product.setStatus(request.getStatus());

        // Cập nhật categories chỉ 1 lần (fix duplicate logic cũ)
        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            Set<Categories> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryId()));
            product.setCategories(categories);
        }

        if (images != null && !images.isEmpty()) {
            int primaryIndex = request.getPrimaryImageIndex() != null ? request.getPrimaryImageIndex() : 0;
            if (primaryIndex < 0 || primaryIndex >= images.size())
                throw new AppException(ErrorCode.PRIMARY_IMAGE_INDEX_INVALID);

            List<ImageUploadData> uploadDataList = new ArrayList<>();
            for (int i = 0; i < images.size(); i++) {
                uploadDataList.add(new ImageUploadData(images.get(i).getBytes(), i == primaryIndex));
            }

            final Products savedProduct = product;
            final List<ImageUploadData> finalList = uploadDataList;
            // Xóa ảnh cũ và upload ảnh mới SAU KHI transaction commit
            // Tránh trường hợp: xóa ảnh cũ thành công → upload mới thất bại → sản phẩm mất ảnh
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronizationAdapter() {
                        @Override
                        public void afterCommit() {
                            productImageRepository.deleteByProduct(savedProduct);
                            imageAsyncService.uploadImageAsync(savedProduct, finalList);
                        }
                    }
            );
        }

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteProduct(String productId) {
        Products product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        productRepository.delete(product);
    }

    /**
     * Trừ tồn kho khi đặt hàng.
     * Dùng PESSIMISTIC_WRITE (SELECT FOR UPDATE) để tránh oversell khi nhiều request đồng thời.
     * Ghi InventoryLog để audit trail.
     */
    @Transactional
    public void reserveStock(List<ReserveStockRequest> requests) {
        for (ReserveStockRequest request : requests) {
            Products product = productRepository.findByIdForUpdate(request.getProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            if (product.getStockQuantity() < request.getQuantity())
                throw new AppException(ErrorCode.NOT_ENOUGH_PRODUCT_STOCK);

            product.setStockQuantity(product.getStockQuantity() - request.getQuantity());
            productRepository.save(product);

            inventoryLogRepository.save(InventoryLog.builder()
                    .productId(product.getId())
                    .changeType(InventoryChangeType.OUT)
                    .quantity(request.getQuantity())
                    .reason("Stock reserved for order")
                    .build());
        }
    }

    /**
     * Hoàn trả tồn kho khi hủy đơn.
     * Ghi InventoryLog để audit trail.
     */
    @Transactional
    public void rollbackStock(List<RollbackStockRequest> requests) {
        for (RollbackStockRequest request : requests) {
            Products product = productRepository.findByIdForUpdate(request.getProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            product.setStockQuantity(product.getStockQuantity() + request.getQuantity());
            productRepository.save(product);

            inventoryLogRepository.save(InventoryLog.builder()
                    .productId(product.getId())
                    .changeType(InventoryChangeType.IN)
                    .quantity(request.getQuantity())
                    .reason("Stock rolled back due to order cancellation")
                    .build());
        }
    }
}
