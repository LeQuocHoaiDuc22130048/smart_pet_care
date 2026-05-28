package com.pet_care.identity.mapper;

import org.mapstruct.Mapper;

import com.pet_care.identity.dto.request.PermissionRequest;
import com.pet_care.identity.dto.response.PermissionResponse;
import com.pet_care.identity.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
