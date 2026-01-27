package com.hoaiduc.identity.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.hoaiduc.identity.dto.request.RoleRequest;
import com.hoaiduc.identity.dto.response.RoleResponse;
import com.hoaiduc.identity.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
