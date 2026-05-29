package com.pet_care.booking.service;

import com.pet_care.booking.dto.request.ServicePackageRequest;
import com.pet_care.booking.dto.response.ServicePackageResponse;
import com.pet_care.booking.entity.Booking;
import com.pet_care.booking.entity.ServicePackage;
import com.pet_care.booking.enums.BookingStatus;
import com.pet_care.booking.enums.ServiceCategory;
import com.pet_care.booking.exception.AppException;
import com.pet_care.booking.exception.ErrorCode;
import com.pet_care.booking.mapper.ServicePackageMapper;
import com.pet_care.booking.messaging.NotificationEventPublisher;
import com.pet_care.booking.repository.BookingRepository;
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
    BookingRepository bookingRepository;
    ServicePackageMapper servicePackageMapper;
    NotificationEventPublisher notificationEventPublisher;

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
        ServicePackage saved = servicePackageRepository.save(servicePackage);
        notifyAffectedBookings(saved);
        return servicePackageMapper.toResponse(saved);
    }

    @Transactional
    public void delete(String id) {
        ServicePackage servicePackage = getEntity(id);
        servicePackage.setActive(false);
        ServicePackage saved = servicePackageRepository.save(servicePackage);
        notifyAffectedBookings(saved);
    }

    private void notifyAffectedBookings(ServicePackage servicePackage) {
        List<Booking> affectedBookings = bookingRepository.findByServicePackageIdAndStatusNotIn(
                servicePackage.getId(),
                List.of(BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW)
        );
        affectedBookings.forEach(booking ->
                notificationEventPublisher.publishServicePackageUpdated(booking, servicePackage)
        );
    }

    ServicePackage getEntity(String id) {
        return servicePackageRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.SERVICE_PACKAGE_NOT_FOUND));
    }
}
