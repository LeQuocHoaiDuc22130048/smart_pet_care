package com.pet_care.user_service.mapper;

import com.pet_care.user_service.dto.request.UserAddressRequest;
import com.pet_care.user_service.dto.response.UserAddressResponse;
import com.pet_care.user_service.entity.UserAddress;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserAddressMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    UserAddress toUserAddress(UserAddressRequest request);

    UserAddressResponse toUserAddressResponse(UserAddress address);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    void updateUserAddress(@MappingTarget UserAddress address, UserAddressRequest request);
}
