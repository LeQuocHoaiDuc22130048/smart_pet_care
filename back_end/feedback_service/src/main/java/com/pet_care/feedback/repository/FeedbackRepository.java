package com.pet_care.feedback.repository;

import com.pet_care.feedback.entity.Feedback;
import com.pet_care.feedback.enums.FeedbackStatus;
import com.pet_care.feedback.enums.FeedbackType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    
    // Find by user
    Page<Feedback> findByUserId(String userId, Pageable pageable);
    
    // Find by product
    Page<Feedback> findByProductIdAndStatus(String productId, FeedbackStatus status, Pageable pageable);
    
    // Find by order
    Page<Feedback> findByOrderIdAndStatus(String orderId, FeedbackStatus status, Pageable pageable);
    
    // Find by booking
    Page<Feedback> findByBookingIdAndStatus(String bookingId, FeedbackStatus status, Pageable pageable);
    
    // Find by type
    Page<Feedback> findByTypeAndStatus(FeedbackType type, FeedbackStatus status, Pageable pageable);
    
    // Check if user already reviewed
    boolean existsByUserIdAndProductId(String userId, String productId);
    boolean existsByUserIdAndOrderId(String userId, String orderId);
    boolean existsByUserIdAndBookingId(String userId, String bookingId);
    
    // Find by user and reference
    Optional<Feedback> findByUserIdAndProductId(String userId, String productId);
    Optional<Feedback> findByUserIdAndOrderId(String userId, String orderId);
    Optional<Feedback> findByUserIdAndBookingId(String userId, String bookingId);
    
    // Statistics
    List<Feedback> findByProductIdAndStatus(String productId, FeedbackStatus status);
    List<Feedback> findByOrderIdAndStatus(String orderId, FeedbackStatus status);
    
    // Admin queries
    Page<Feedback> findByStatus(FeedbackStatus status, Pageable pageable);
    long countByStatus(FeedbackStatus status);
}
