package com.pet_care.feedback.controller;

import com.pet_care.feedback.dto.request.AdminResponseRequest;
import com.pet_care.feedback.dto.request.CreateFeedbackRequest;
import com.pet_care.feedback.dto.request.UpdateFeedbackRequest;
import com.pet_care.feedback.dto.response.ApiResponse;
import com.pet_care.feedback.dto.response.FeedbackResponse;
import com.pet_care.feedback.dto.response.FeedbackStatsResponse;
import com.pet_care.feedback.enums.FeedbackStatus;
import com.pet_care.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    /**
     * Create new feedback with optional images
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FeedbackResponse> createFeedback(
            @RequestPart("request") @Valid CreateFeedbackRequest request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        
        log.info("Creating feedback: type={}, rating={}", request.getType(), request.getRating());
        FeedbackResponse response = feedbackService.createFeedback(request, images);
        
        return ApiResponse.<FeedbackResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Update feedback
     */
    @PutMapping("/{feedbackId}")
    public ApiResponse<FeedbackResponse> updateFeedback(
            @PathVariable String feedbackId,
            @RequestBody @Valid UpdateFeedbackRequest request) {
        
        log.info("Updating feedback: {}", feedbackId);
        FeedbackResponse response = feedbackService.updateFeedback(feedbackId, request);
        
        return ApiResponse.<FeedbackResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Add images to existing feedback
     */
    @PostMapping(value = "/{feedbackId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<FeedbackResponse> addImages(
            @PathVariable String feedbackId,
            @RequestPart("images") List<MultipartFile> images) {
        
        log.info("Adding images to feedback: {}", feedbackId);
        FeedbackResponse response = feedbackService.addImages(feedbackId, images);
        
        return ApiResponse.<FeedbackResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Delete feedback
     */
    @DeleteMapping("/{feedbackId}")
    public ApiResponse<Void> deleteFeedback(@PathVariable String feedbackId) {
        log.info("Deleting feedback: {}", feedbackId);
        feedbackService.deleteFeedback(feedbackId);
        
        return ApiResponse.<Void>builder()
                .message("Feedback deleted successfully")
                .build();
    }

    /**
     * Get feedback by ID
     */
    @GetMapping("/{feedbackId}")
    public ApiResponse<FeedbackResponse> getFeedback(@PathVariable String feedbackId) {
        FeedbackResponse response = feedbackService.getFeedback(feedbackId);
        
        return ApiResponse.<FeedbackResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Get my feedbacks
     */
    @GetMapping("/my")
    public ApiResponse<Page<FeedbackResponse>> getMyFeedbacks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FeedbackResponse> response = feedbackService.getMyFeedbacks(pageable);
        
        return ApiResponse.<Page<FeedbackResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Get feedbacks for a product (PUBLIC)
     */
    @GetMapping("/product/{productId}")
    public ApiResponse<Page<FeedbackResponse>> getProductFeedbacks(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FeedbackResponse> response = feedbackService.getProductFeedbacks(productId, pageable);
        
        return ApiResponse.<Page<FeedbackResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Get feedbacks for an order
     */
    @GetMapping("/order/{orderId}")
    public ApiResponse<Page<FeedbackResponse>> getOrderFeedbacks(
            @PathVariable String orderId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FeedbackResponse> response = feedbackService.getOrderFeedbacks(orderId, pageable);
        
        return ApiResponse.<Page<FeedbackResponse>>builder()
                .result(response)
                .build();
    }

    /**
     * Get product statistics (PUBLIC)
     */
    @GetMapping("/stats/product/{productId}")
    public ApiResponse<FeedbackStatsResponse> getProductStats(@PathVariable String productId) {
        FeedbackStatsResponse response = feedbackService.getProductStats(productId);
        
        return ApiResponse.<FeedbackStatsResponse>builder()
                .result(response)
                .build();
    }

    // ==================== ADMIN ENDPOINTS ====================

    /**
     * Admin: Add response to feedback
     */
    @PostMapping("/{feedbackId}/response")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FeedbackResponse> addAdminResponse(
            @PathVariable String feedbackId,
            @RequestBody @Valid AdminResponseRequest request) {
        
        log.info("Admin adding response to feedback: {}", feedbackId);
        FeedbackResponse response = feedbackService.addAdminResponse(feedbackId, request);
        
        return ApiResponse.<FeedbackResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Admin: Update feedback status
     */
    @PatchMapping("/{feedbackId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<FeedbackResponse> updateStatus(
            @PathVariable String feedbackId,
            @RequestParam FeedbackStatus status) {
        
        log.info("Admin updating feedback status: {} -> {}", feedbackId, status);
        FeedbackResponse response = feedbackService.updateStatus(feedbackId, status);
        
        return ApiResponse.<FeedbackResponse>builder()
                .result(response)
                .build();
    }

    /**
     * Admin: Get feedbacks by status
     */
    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<FeedbackResponse>> getFeedbacksByStatus(
            @PathVariable FeedbackStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FeedbackResponse> response = feedbackService.getFeedbacksByStatus(status, pageable);
        
        return ApiResponse.<Page<FeedbackResponse>>builder()
                .result(response)
                .build();
    }
}
