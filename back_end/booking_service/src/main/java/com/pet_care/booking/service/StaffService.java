package com.pet_care.booking.service;

import com.pet_care.booking.dto.request.StaffRequest;
import com.pet_care.booking.dto.response.StaffResponse;
import com.pet_care.booking.entity.Staff;
import com.pet_care.booking.exception.AppException;
import com.pet_care.booking.exception.ErrorCode;
import com.pet_care.booking.mapper.StaffMapper;
import com.pet_care.booking.repository.StaffRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StaffService {
    StaffRepository staffRepository;
    StaffMapper staffMapper;

    public List<StaffResponse> getActive() {
        return staffRepository.findByActiveTrue().stream()
                .map(staffMapper::toResponse)
                .toList();
    }

    public List<StaffResponse> getAll() {
        return staffRepository.findAll().stream()
                .map(staffMapper::toResponse)
                .toList();
    }

    public StaffResponse getById(String id) {
        return staffMapper.toResponse(getEntity(id));
    }

    @Transactional
    public StaffResponse create(StaffRequest request) {
        Staff staff = staffMapper.toEntity(request);
        return staffMapper.toResponse(staffRepository.save(staff));
    }

    @Transactional
    public StaffResponse update(String id, StaffRequest request) {
        Staff staff = getEntity(id);
        staffMapper.updateEntity(staff, request);
        return staffMapper.toResponse(staffRepository.save(staff));
    }

    @Transactional
    public void delete(String id) {
        Staff staff = getEntity(id);
        staff.setActive(false);
        staffRepository.save(staff);
    }

    Staff getEntity(String id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));
    }

    Staff getEntityForBooking(String id) {
        return staffRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new AppException(ErrorCode.STAFF_NOT_FOUND));
    }
}
