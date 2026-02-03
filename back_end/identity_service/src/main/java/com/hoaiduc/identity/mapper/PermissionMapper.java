package com.hoaiduc.identity.mapper;

import org.mapstruct.Mapper;

import com.hoaiduc.identity.dto.request.PermissionRequest;
import com.hoaiduc.identity.dto.response.PermissionResponse;
import com.hoaiduc.identity.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
