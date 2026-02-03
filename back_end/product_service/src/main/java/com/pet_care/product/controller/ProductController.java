package com.pet_care.product.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.product.dto.ApiResponse;
import com.pet_care.product.dto.request.ProductCreationRequest;
import com.pet_care.product.dto.request.ProductUpdateRequest;
import com.pet_care.product.dto.response.ProductResponse;
import com.pet_care.product.service.ProductService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {

    ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE )
    public ApiResponse<ProductResponse> createProduct(@RequestParam("request") String requestJson,
                                                      @RequestParam("images") List<MultipartFile> images) throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        ProductCreationRequest request = mapper.readValue(requestJson, ProductCreationRequest.class);
        log.info(requestJson);
        log.info(String.valueOf(images.size()));
        return ApiResponse.<ProductResponse>builder()
                .result(productService.createProduct(request, images))
                .build();
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getAllProducts() {
        return ApiResponse.<List<ProductResponse>>builder()
                .result(productService.getAllProducts())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getProductById(@PathVariable String id) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.getProductById(id))
                .build();
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProductResponse> updateProduct(@PathVariable String id, @RequestParam("request") String requestJson,
                                                      @RequestParam(value = "images", required = false) List<MultipartFile> images) throws IOException {
        ProductUpdateRequest request = new ObjectMapper().readValue(requestJson, ProductUpdateRequest.class);

        return ApiResponse.<ProductResponse>builder()
                .result(productService.updateProduct(id, request, images))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteProducts(@PathVariable String id) {
        productService.deleteProduct(id);
        return ApiResponse.<String>builder()
                .result("Products deleted successfully")
                .build();
    }
}
