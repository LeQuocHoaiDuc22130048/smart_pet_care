package com.pet_care.booking.service;

import com.pet_care.booking.client.PetResponse;
import com.pet_care.booking.client.UserServiceClient;
import com.pet_care.booking.dto.request.BookingRequest;
import com.pet_care.booking.dto.request.UpdateBookingStatusRequest;
import com.pet_care.booking.dto.response.BookingResponse;
import com.pet_care.booking.dto.response.ApiResponse;
import com.pet_care.booking.entity.Booking;
import com.pet_care.booking.entity.ServicePackage;
import com.pet_care.booking.entity.Staff;
import com.pet_care.booking.enums.BookingStatus;
import com.pet_care.booking.exception.AppException;
import com.pet_care.booking.exception.ErrorCode;
import com.pet_care.booking.mapper.BookingMapper;
import com.pet_care.booking.repository.BookingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.EnumSet;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingService {
    BookingRepository bookingRepository;
    ServicePackageService servicePackageService;
    StaffService staffService;
    BookingMapper bookingMapper;
    UserServiceClient userServiceClient;

    @Transactional
    public BookingResponse create(BookingRequest request, String authorization) {
        validateAppointmentTime(request.getAppointmentDate(), request.getAppointmentTime());

        ServicePackage servicePackage = servicePackageService.getEntity(request.getServicePackageId());
        if (!Boolean.TRUE.equals(servicePackage.getActive())) {
            throw new AppException(ErrorCode.SERVICE_PACKAGE_NOT_FOUND);
        }

        Staff staff = staffService.getEntity(request.getStaffId());
        if (!Boolean.TRUE.equals(staff.getActive())) {
            throw new AppException(ErrorCode.STAFF_NOT_FOUND);
        }

        if (!bookingRepository.findConflictingBookings(
                staff.getId(), request.getAppointmentDate(), request.getAppointmentTime()).isEmpty()) {
            throw new AppException(ErrorCode.STAFF_NOT_AVAILABLE);
        }

        PetResponse pet = getPet(request.getPetId(), authorization);
        String userId = getCurrentUsername();

        Booking booking = Booking.builder()
                .userId(userId)
                .petId(pet.getId())
                .petName(pet.getName())
                .servicePackage(servicePackage)
                .staff(staff)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status(BookingStatus.PENDING)
                .totalPrice(servicePackage.getPrice())
                .notes(request.getNotes())
                .build();

        Booking saved = bookingRepository.save(booking);
        log.info("Created booking {} for pet {}", saved.getId(), pet.getId());
        return bookingMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        String userId = getCurrentUsername();
        return bookingRepository.findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(userId).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getMineById(String id) {
        Booking booking = getEntity(id);
        if (!booking.getUserId().equals(getCurrentUsername())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return bookingMapper.toResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAll(BookingStatus status) {
        List<Booking> bookings = status == null ? bookingRepository.findAll() : bookingRepository.findByStatus(status);
        return bookings.stream().map(bookingMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getStaffSchedule(String staffId, LocalDate date) {
        return bookingRepository.findByStaffIdAndAppointmentDate(staffId, date).stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Transactional
    public BookingResponse cancelMine(String id) {
        Booking booking = getEntity(id);
        if (!booking.getUserId().equals(getCurrentUsername())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if (isTerminal(booking.getStatus())) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_TERMINAL);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateStatus(String id, UpdateBookingStatusRequest request) {
        Booking booking = getEntity(id);
        if (isTerminal(booking.getStatus())) {
            throw new AppException(ErrorCode.BOOKING_ALREADY_TERMINAL);
        }
        if (!isAllowedNextStatus(booking.getStatus(), request.getStatus())) {
            throw new AppException(ErrorCode.INVALID_STATUS_TRANSITION);
        }
        booking.setStatus(request.getStatus());
        booking.setAdminNotes(request.getAdminNotes());
        if (request.getStatus() == BookingStatus.COMPLETED) {
            booking.setCompletedAt(LocalDateTime.now());
        }
        if (request.getStatus() == BookingStatus.CANCELLED || request.getStatus() == BookingStatus.NO_SHOW) {
            booking.setCancelledAt(LocalDateTime.now());
        }
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    private PetResponse getPet(String petId, String authorization) {
        try {
            ApiResponse<PetResponse> response = userServiceClient.getPetById(petId, authorization);
            if (response == null || response.getResult() == null) {
                throw new AppException(ErrorCode.PET_NOT_FOUND);
            }
            return response.getResult();
        } catch (AppException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("Could not verify pet {} from user service: {}", petId, exception.getMessage());
            throw new AppException(ErrorCode.SERVICE_UNAVAILABLE);
        }
    }

    private void validateAppointmentTime(LocalDate date, LocalTime time) {
        if (date.atTime(time).isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.INVALID_BOOKING_TIME);
        }
    }

    private Booking getEntity(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
    }

    private boolean isTerminal(BookingStatus status) {
        return status == BookingStatus.COMPLETED
                || status == BookingStatus.CANCELLED
                || status == BookingStatus.NO_SHOW;
    }

    private boolean isAllowedNextStatus(BookingStatus current, BookingStatus next) {
        return switch (current) {
            case PENDING -> EnumSet.of(BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW).contains(next);
            case CONFIRMED -> EnumSet.of(BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED, BookingStatus.NO_SHOW).contains(next);
            case IN_PROGRESS -> EnumSet.of(BookingStatus.COMPLETED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW).contains(next);
            case COMPLETED, CANCELLED, NO_SHOW -> false;
        };
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }
}
