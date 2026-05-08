package com.pet_care.booking.mapper;

import com.pet_care.booking.dto.request.ServicePackageRequest;
import com.pet_care.booking.dto.response.ServicePackageResponse;
import com.pet_care.booking.entity.ServicePackage;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface ServicePackageMapper {
    ServicePackage toEntity(ServicePackageRequest request);
    ServicePackageResponse toResponse(ServicePackage servicePackage);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget ServicePackage servicePackage, ServicePackageRequest request);
}
