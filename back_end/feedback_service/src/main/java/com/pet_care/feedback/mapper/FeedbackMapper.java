package com.pet_care.feedback.mapper;

import com.pet_care.feedback.dto.request.CreateFeedbackRequest;
import com.pet_care.feedback.dto.request.UpdateFeedbackRequest;
import com.pet_care.feedback.dto.response.FeedbackResponse;
import com.pet_care.feedback.entity.Feedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "imageUrls", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "adminResponse", ignore = true)
    @Mapping(target = "adminResponseAt", ignore = true)
    @Mapping(target = "helpfulCount", ignore = true)
    @Mapping(target = "notHelpfulCount", ignore = true)
    @Mapping(target = "verifiedPurchase", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Feedback toEntity(CreateFeedbackRequest request);
    
    FeedbackResponse toResponse(Feedback feedback);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "type", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "bookingId", ignore = true)
    @Mapping(target = "imageUrls", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "adminResponse", ignore = true)
    @Mapping(target = "adminResponseAt", ignore = true)
    @Mapping(target = "helpfulCount", ignore = true)
    @Mapping(target = "notHelpfulCount", ignore = true)
    @Mapping(target = "verifiedPurchase", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Feedback feedback, UpdateFeedbackRequest request);
}
