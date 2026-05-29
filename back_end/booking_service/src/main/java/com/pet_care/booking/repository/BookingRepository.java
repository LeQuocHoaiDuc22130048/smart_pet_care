package com.pet_care.booking.repository;

import com.pet_care.booking.entity.Booking;
import com.pet_care.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(String userId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByStaffIdAndAppointmentDate(String staffId, LocalDate appointmentDate);
    List<Booking> findByServicePackageIdAndStatusNotIn(String servicePackageId, List<BookingStatus> statuses);
}
