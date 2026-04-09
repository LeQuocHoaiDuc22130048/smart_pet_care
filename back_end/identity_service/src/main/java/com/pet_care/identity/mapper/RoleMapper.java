package com.pet_care.identity.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.pet_care.identity.dto.request.RoleRequest;
import com.pet_care.identity.dto.response.RoleResponse;
import com.pet_care.identity.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);
}
