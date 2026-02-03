package com.pet_care.product.service;

import com.pet_care.product.dto.request.CategoryCreationRequest;
import com.pet_care.product.dto.request.CategoryUpdateRequest;
import com.pet_care.product.dto.response.CategoryResponse;
import com.pet_care.product.entity.Categories;
import com.pet_care.product.exception.AppException;
import com.pet_care.product.exception.ErrorCode;
import com.pet_care.product.mapper.CategoryMapper;
import com.pet_care.product.repository.CategoryRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryService {

    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse createCategory(CategoryCreationRequest request) {
        Categories categories = categoryMapper.toCategory(request);

        try{
            categories = categoryRepository.save(categories);
        }catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.CATEGORY_EXISTED);
        }

        return categoryMapper.toCategoryResponse(categories);
    }

    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toCategoryResponse)
                .toList();
    }

    public CategoryResponse getCategoryById(String id) {
        Categories category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        return categoryMapper.toCategoryResponse(category);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public CategoryResponse updateCategory(String id, CategoryUpdateRequest request) {
        Categories categories = categoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
        categoryMapper.updateCategory(categories, request);
        return categoryMapper.toCategoryResponse(categoryRepository.save(categories));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteCategory(String categoryId) {
        Categories categories = categoryRepository.findById(categoryId).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        if (categoryRepository.existsProductByCategoryId(categoryId)){
            throw new AppException(ErrorCode.CATEGORY_IS_USED);
        }
        categoryRepository.delete(categories);
    }
}
