package com.pet_care.booking.repository;

import com.pet_care.booking.entity.Booking;
import com.pet_care.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(String userId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByStaffIdAndAppointmentDate(String staffId, LocalDate appointmentDate);

    @Query("""
            select b from Booking b
            where b.staff.id = :staffId
              and b.appointmentDate = :appointmentDate
              and b.appointmentTime = :appointmentTime
              and b.status in ('PENDING', 'CONFIRMED', 'IN_PROGRESS')
            """)
    List<Booking> findConflictingBookings(@Param("staffId") String staffId,
                                           @Param("appointmentDate") LocalDate appointmentDate,
                                           @Param("appointmentTime") LocalTime appointmentTime);
}
