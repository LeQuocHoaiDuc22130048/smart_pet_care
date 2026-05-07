package com.pet_care.booking.repository;

import com.pet_care.booking.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StaffRepository extends JpaRepository<Staff, String> {
    List<Staff> findByActiveTrue();
}
