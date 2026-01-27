package com.pet_care.product.controller;


import com.pet_care.product.dto.ApiResponse;
import com.pet_care.product.dto.request.CategoryCreationRequest;
import com.pet_care.product.dto.response.CategoryResponse;
import com.pet_care.product.service.CategoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {

    CategoryService categoryService;

    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(@RequestBody @Valid CategoryCreationRequest request) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.createCategory(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getCategories() {
        return ApiResponse.<List<CategoryResponse>>builder()
                .result(categoryService.getCategories())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getCategoryById(@PathVariable String id) {
        return ApiResponse.<CategoryResponse>builder()
                .result(categoryService.getCategoryById(id))
                .build();
    }


}
