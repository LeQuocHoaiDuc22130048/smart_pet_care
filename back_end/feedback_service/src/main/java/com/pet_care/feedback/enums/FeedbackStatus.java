package com.pet_care.feedback.enums;

/**
 * Status of feedback
 */
public enum FeedbackStatus {
    PENDING,    // Waiting for review
    APPROVED,   // Approved and visible
    REJECTED,   // Rejected (spam, inappropriate)
    HIDDEN      // Hidden by admin
}
