package com.pet_care.booking.mapper;

import com.pet_care.booking.dto.request.StaffRequest;
import com.pet_care.booking.dto.response.StaffResponse;
import com.pet_care.booking.entity.Staff;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface StaffMapper {
    Staff toEntity(StaffRequest request);
    StaffResponse toResponse(Staff staff);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget Staff staff, StaffRequest request);
}
