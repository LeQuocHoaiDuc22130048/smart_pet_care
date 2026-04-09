package com.pet_care.identity.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.pet_care.identity.dto.request.UserCreationRequest;
import com.pet_care.identity.dto.request.UserUpdateRequest;
import com.pet_care.identity.dto.response.UserResponse;
import com.pet_care.identity.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);

    @Mapping(target = "roles", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
