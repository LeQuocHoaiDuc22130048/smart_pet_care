package com.pet_care.booking.service;

import com.pet_care.booking.dto.request.ServicePackageRequest;
import com.pet_care.booking.dto.response.ServicePackageResponse;
import com.pet_care.booking.entity.ServicePackage;
import com.pet_care.booking.enums.ServiceCategory;
import com.pet_care.booking.exception.AppException;
import com.pet_care.booking.exception.ErrorCode;
import com.pet_care.booking.mapper.ServicePackageMapper;
import com.pet_care.booking.repository.ServicePackageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServicePackageService {
    ServicePackageRepository servicePackageRepository;
    ServicePackageMapper servicePackageMapper;

    public List<ServicePackageResponse> getActive(ServiceCategory category) {
        List<ServicePackage> packages = category == null
                ? servicePackageRepository.findByActiveTrue()
                : servicePackageRepository.findByCategoryAndActiveTrue(category);
        return packages.stream().map(servicePackageMapper::toResponse).toList();
    }

    public List<ServicePackageResponse> getAll() {
        return servicePackageRepository.findAll().stream()
                .map(servicePackageMapper::toResponse)
                .toList();
    }

    public ServicePackageResponse getById(String id) {
        return servicePackageMapper.toResponse(getEntity(id));
    }

    @Transactional
    public ServicePackageResponse create(ServicePackageRequest request) {
        ServicePackage servicePackage = servicePackageMapper.toEntity(request);
        return servicePackageMapper.toResponse(servicePackageRepository.save(servicePackage));
    }

    @Transactional
    public ServicePackageResponse update(String id, ServicePackageRequest request) {
        ServicePackage servicePackage = getEntity(id);
        servicePackageMapper.updateEntity(servicePackage, request);
        return servicePackageMapper.toResponse(servicePackageRepository.save(servicePackage));
    }

    @Transactional
    public void delete(String id) {
        ServicePackage servicePackage = getEntity(id);
        servicePackage.setActive(false);
        servicePackageRepository.save(servicePackage);
    }

    ServicePackage getEntity(String id) {
        return servicePackageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_PACKAGE_NOT_FOUND));
    }
}
