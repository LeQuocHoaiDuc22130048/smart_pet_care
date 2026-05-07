package com.pet_care.booking.repository;

import com.pet_care.booking.entity.ServicePackage;
import com.pet_care.booking.enums.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServicePackageRepository extends JpaRepository<ServicePackage, String> {
    List<ServicePackage> findByActiveTrue();
    List<ServicePackage> findByCategoryAndActiveTrue(ServiceCategory category);
}
