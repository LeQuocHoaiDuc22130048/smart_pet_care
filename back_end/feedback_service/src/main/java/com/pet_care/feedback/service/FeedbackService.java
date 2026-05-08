package com.pet_care.feedback.service;

import com.pet_care.feedback.dto.request.AdminResponseRequest;
import com.pet_care.feedback.dto.request.CreateFeedbackRequest;
import com.pet_care.feedback.dto.request.UpdateFeedbackRequest;
import com.pet_care.feedback.dto.response.FeedbackResponse;
import com.pet_care.feedback.dto.response.FeedbackStatsResponse;
import com.pet_care.feedback.entity.Feedback;
import com.pet_care.feedback.enums.FeedbackStatus;
import com.pet_care.feedback.enums.FeedbackType;
import com.pet_care.feedback.exception.AppException;
import com.pet_care.feedback.exception.ErrorCode;
import com.pet_care.feedback.mapper.FeedbackMapper;
import com.pet_care.feedback.repository.FeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;
    private final CloudinaryService cloudinaryService;
    
    private static final int EDIT_TIME_LIMIT_HOURS = 24;

    /**
     * Create new feedback
     */
    public FeedbackResponse createFeedback(CreateFeedbackRequest request, List<MultipartFile> images) {
        String userId = getCurrentUserId();
        String username = getCurrentUsername();
        
        // Validate feedback type and reference ID
        validateFeedbackRequest(request);
        
        // Check if user already submitted feedback
        checkDuplicateFeedback(userId, request);
        
        // Create feedback entity
        Feedback feedback = feedbackMapper.toEntity(request);
        feedback.setUserId(userId);
        feedback.setUsername(username);
        feedback.setStatus(FeedbackStatus.APPROVED); // Auto-approve for now
        
        // Upload images if provided
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = cloudinaryService.uploadImages(images);
            feedback.setImageUrls(imageUrls);
        }
        
        // TODO: Verify purchase for product/order feedback
        feedback.setVerifiedPurchase(false);
        
        feedback = feedbackRepository.save(feedback);
        log.info("Feedback created: {}", feedback.getId());
        
        return feedbackMapper.toResponse(feedback);
    }

    /**
     * Update feedback (only by owner within 24 hours)
     */
    public FeedbackResponse updateFeedback(String feedbackId, UpdateFeedbackRequest request) {
        String userId = getCurrentUserId();
        
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_FOUND));
        
        // Check ownership
        if (!feedback.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.NOT_FEEDBACK_OWNER);
        }
        
        // Check time limit
        if (feedback.getCreatedAt().plusHours(EDIT_TIME_LIMIT_HOURS).isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.CANNOT_EDIT_FEEDBACK);
        }
        
        feedbackMapper.updateEntity(feedback, request);
        feedback = feedbackRepository.save(feedback);
        
        log.info("Feedback updated: {}", feedbackId);
        return feedbackMapper.toResponse(feedback);
    }

    /**
     * Add images to existing feedback
     */
    public FeedbackResponse addImages(String feedbackId, List<MultipartFile> images) {
        String userId = getCurrentUserId();
        
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_FOUND));
        
        if (!feedback.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.NOT_FEEDBACK_OWNER);
        }
        
        List<String> newImageUrls = cloudinaryService.uploadImages(images);
        feedback.getImageUrls().addAll(newImageUrls);
        
        feedback = feedbackRepository.save(feedback);
        log.info("Images added to feedback: {}", feedbackId);
        
        return feedbackMapper.toResponse(feedback);
    }

    /**
     * Delete feedback (only by owner)
     */
    public void deleteFeedback(String feedbackId) {
        String userId = getCurrentUserId();
        
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_FOUND));
        
        if (!feedback.getUserId().equals(userId) && !isAdmin()) {
            throw new AppException(ErrorCode.NOT_FEEDBACK_OWNER);
        }
        
        // Delete images from Cloudinary
        feedback.getImageUrls().forEach(cloudinaryService::deleteImage);
        
        feedbackRepository.delete(feedback);
        log.info("Feedback deleted: {}", feedbackId);
    }

    /**
     * Get feedback by ID
     */
    public FeedbackResponse getFeedback(String feedbackId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_FOUND));
        
        return feedbackMapper.toResponse(feedback);
    }

    /**
     * Get my feedbacks
     */
    public Page<FeedbackResponse> getMyFeedbacks(Pageable pageable) {
        String userId = getCurrentUserId();
        
        return feedbackRepository.findByUserId(userId, pageable)
                .map(feedbackMapper::toResponse);
    }

    /**
     * Get feedbacks for a product
     */
    public Page<FeedbackResponse> getProductFeedbacks(String productId, Pageable pageable) {
        return feedbackRepository.findByProductIdAndStatus(productId, FeedbackStatus.APPROVED, pageable)
                .map(feedbackMapper::toResponse);
    }

    /**
     * Get feedbacks for an order
     */
    public Page<FeedbackResponse> getOrderFeedbacks(String orderId, Pageable pageable) {
        return feedbackRepository.findByOrderIdAndStatus(orderId, FeedbackStatus.APPROVED, pageable)
                .map(feedbackMapper::toResponse);
    }

    /**
     * Get feedback statistics for a product
     */
    public FeedbackStatsResponse getProductStats(String productId) {
        List<Feedback> feedbacks = feedbackRepository.findByProductIdAndStatus(
                productId, FeedbackStatus.APPROVED);
        
        return calculateStats(feedbacks);
    }

    /**
     * Admin: Add response to feedback
     */
    public FeedbackResponse addAdminResponse(String feedbackId, AdminResponseRequest request) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_FOUND));
        
        feedback.setAdminResponse(request.getResponse());
        feedback.setAdminResponseAt(LocalDateTime.now());
        
        feedback = feedbackRepository.save(feedback);
        log.info("Admin response added to feedback: {}", feedbackId);
        
        return feedbackMapper.toResponse(feedback);
    }

    /**
     * Admin: Update feedback status
     */
    public FeedbackResponse updateStatus(String feedbackId, FeedbackStatus status) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new AppException(ErrorCode.FEEDBACK_NOT_FOUND));
        
        feedback.setStatus(status);
        feedback = feedbackRepository.save(feedback);
        
        log.info("Feedback status updated: {} -> {}", feedbackId, status);
        return feedbackMapper.toResponse(feedback);
    }

    /**
     * Admin: Get all feedbacks by status
     */
    public Page<FeedbackResponse> getFeedbacksByStatus(FeedbackStatus status, Pageable pageable) {
        return feedbackRepository.findByStatus(status, pageable)
                .map(feedbackMapper::toResponse);
    }

    // ==================== Helper Methods ====================

    private void validateFeedbackRequest(CreateFeedbackRequest request) {
        switch (request.getType()) {
            case PRODUCT:
                if (request.getProductId() == null) {
                    throw new AppException(ErrorCode.INVALID_FEEDBACK_TYPE);
                }
                break;
            case ORDER:
                if (request.getOrderId() == null) {
                    throw new AppException(ErrorCode.INVALID_FEEDBACK_TYPE);
                }
                break;
            case SERVICE:
                if (request.getBookingId() == null) {
                    throw new AppException(ErrorCode.INVALID_FEEDBACK_TYPE);
                }
                break;
            case SYSTEM:
                // No reference ID required
                break;
        }
    }

    private void checkDuplicateFeedback(String userId, CreateFeedbackRequest request) {
        boolean exists = switch (request.getType()) {
            case PRODUCT -> feedbackRepository.existsByUserIdAndProductId(userId, request.getProductId());
            case ORDER -> feedbackRepository.existsByUserIdAndOrderId(userId, request.getOrderId());
            case SERVICE -> feedbackRepository.existsByUserIdAndBookingId(userId, request.getBookingId());
            case SYSTEM -> false; // Allow multiple system feedbacks
        };
        
        if (exists) {
            throw new AppException(ErrorCode.FEEDBACK_ALREADY_EXISTS);
        }
    }

    private FeedbackStatsResponse calculateStats(List<Feedback> feedbacks) {
        if (feedbacks.isEmpty()) {
            return FeedbackStatsResponse.builder()
                    .totalFeedbacks(0L)
                    .averageRating(0.0)
                    .ratingDistribution(new HashMap<>())
                    .verifiedPurchaseCount(0L)
                    .build();
        }
        
        double averageRating = feedbacks.stream()
                .mapToInt(Feedback::getRating)
                .average()
                .orElse(0.0);
        
        Map<Integer, Long> ratingDistribution = feedbacks.stream()
                .collect(Collectors.groupingBy(Feedback::getRating, Collectors.counting()));
        
        long verifiedCount = feedbacks.stream()
                .filter(Feedback::getVerifiedPurchase)
                .count();
        
        return FeedbackStatsResponse.builder()
                .totalFeedbacks((long) feedbacks.size())
                .averageRating(Math.round(averageRating * 10.0) / 10.0)
                .ratingDistribution(ratingDistribution)
                .verifiedPurchaseCount(verifiedCount)
                .build();
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

    private boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}
