package com.pet_care.user_service.mapper;

import com.pet_care.user_service.dto.response.UserProfileResponse;
import com.pet_care.user_service.entity.UserProfile;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserProfileMapper {
    UserProfileResponse toUserProfileResponse(UserProfile userProfile);
}
