package com.pet_care.product.service;

import com.pet_care.product.dto.ImageUploadData;
import com.pet_care.product.dto.request.ProductCreationRequest;
import com.pet_care.product.dto.request.ProductUpdateRequest;
import com.pet_care.product.dto.response.ProductResponse;
import com.pet_care.product.entity.Categories;
import com.pet_care.product.entity.Products;
import com.pet_care.product.exception.AppException;
import com.pet_care.product.exception.ErrorCode;
import com.pet_care.product.mapper.ProductMapper;
import com.pet_care.product.repository.CategoryRepository;
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
import org.springframework.web.bind.annotation.PutMapping;
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

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ProductResponse createProduct(ProductCreationRequest request, List<MultipartFile> images) throws IOException {
        Products products = productMapper.toProduct(request);

        Set<Categories> categories = new HashSet<>(categoryRepository.findAllById(request.getCategoryId()));

        if (categories.isEmpty()) throw new RuntimeException("Categories not found");

        if (request.getPrimaryImageIndex() >= images.size())
            throw new RuntimeException("Primary image index out of bounds");

        products.setCategories(categories);

        try {
            products = productRepository.save(products);
        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.PRODUCT_NAME_EXISTED);
        }

        List<ImageUploadData> uploadDataList = new ArrayList<>();

        for (int i = 0; i < images.size(); i++) {
            uploadDataList.add(
                    new ImageUploadData(
                            images.get(i).getBytes(),
                            i == request.getPrimaryImageIndex()
                    )
            );
        }

        imageAsyncService.uploadImageAsync(
                products,
                uploadDataList
        );

        return productMapper.toProductResponse(products);
    }

    public List<ProductResponse> getAllProducts() {
        List<Products> products = productRepository.findAll();
        return products.stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    public ProductResponse getProductById(String productId) {
        Products product = productRepository.findById(productId).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }


    //    UPDATE PRODUCT STARTS HERE
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ProductResponse updateProduct(
            String productId,
            ProductUpdateRequest request,
            List<MultipartFile> images
    ) throws IOException {

        Products product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        updateProductFields(product, request);

        updateProductCategories(product, request);

        boolean hasNewImages = images != null && !images.isEmpty();


        if (hasNewImages) {
            processProductImages(product, request, images);
        }

        return productMapper.toProductResponse(productRepository.save(product));
    }

    private void processProductImages(Products product, ProductUpdateRequest request, List<MultipartFile> images) throws IOException {
        int primaryImageIndex = request.getPrimaryImageIndex() != null
                ? request.getPrimaryImageIndex()
                : 0;

        if (primaryImageIndex < 0 || primaryImageIndex >= images.size()) {
            throw new AppException(ErrorCode.PRIMARY_IMAGE_INDEX_INVALID);
        }

        productImageRepository.deleteByProduct(product);

        List<ImageUploadData> uploadDataList = new ArrayList<>();
        for (int i = 0; i < images.size(); i++) {
            uploadDataList.add(
                    new ImageUploadData(
                            images.get(i).getBytes(),
                            i == primaryImageIndex
                    )
            );
        }

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronizationAdapter() {
                    @Override
                    public void afterCommit() {
                        imageAsyncService.uploadImageAsync(product, uploadDataList);
                    }
                }
        );
    }

    private void updateProductCategories(Products product, ProductUpdateRequest request) {
        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            Set<Categories> categories = new HashSet<>(
                    categoryRepository.findAllById(request.getCategoryId())
            );
            product.setCategories(categories);
        }
    }


    private void updateProductFields(Products product, ProductUpdateRequest request) {
        if (request.getProductName() != null) {
            product.setProductName(request.getProductName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getStockQuantity() != null) {
            product.setStockQuantity(request.getStockQuantity());
        }
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        if (request.getCategoryId() != null) {
            product.setCategories(
                    new HashSet<>(categoryRepository.findAllById(request.getCategoryId()))
            );
        }
    }

//    UPDATE PRODUCT ENDS HERE

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteProduct(String productId) {
        Products product = productRepository.findById(productId).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productRepository.delete(product);
    }
}
