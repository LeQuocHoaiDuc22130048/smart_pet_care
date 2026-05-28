package com.pet_care.booking.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.pet_care.booking.client.PetResponse;
import com.pet_care.booking.client.UserServiceClient;
import com.pet_care.booking.dto.request.BookingRequest;
import com.pet_care.booking.dto.request.UpdateBookingStatusRequest;
import com.pet_care.booking.dto.response.ApiResponse;
import com.pet_care.booking.dto.response.BookingResponse;
import com.pet_care.booking.entity.Booking;
import com.pet_care.booking.entity.ServicePackage;
import com.pet_care.booking.entity.Staff;
import com.pet_care.booking.enums.BookingStatus;
import com.pet_care.booking.exception.AppException;
import com.pet_care.booking.exception.ErrorCode;
import com.pet_care.booking.mapper.BookingMapper;
import com.pet_care.booking.repository.BookingRepository;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    BookingRepository bookingRepository;

    @Mock
    ServicePackageService servicePackageService;

    @Mock
    StaffService staffService;

    @Mock
    BookingMapper bookingMapper;

    @Mock
    UserServiceClient userServiceClient;

    @InjectMocks
    BookingService bookingService;

    private final LocalDate bookingDate = LocalDate.now().plusDays(2);
    private ServicePackage servicePackage;
    private Staff staff;
    private PetResponse pet;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken("alice", null));
        servicePackage = ServicePackage.builder()
                .id("package-1")
                .name("Spa")
                .price(new BigDecimal("180000"))
                .durationMinutes(90)
                .active(true)
                .build();
        staff = Staff.builder().id("staff-1").name("Minh Anh").active(true).build();
        pet = PetResponse.builder().id("pet-1").name("Milo").build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void create_validRequest_savesPendingBookingAtPackagePrice() {
        BookingRequest request = requestAt(LocalTime.of(8, 0));
        stubBookableResources(request);
        when(bookingRepository.findByStaffIdAndAppointmentDate("staff-1", bookingDate)).thenReturn(List.of());
        when(userServiceClient.getPetById("pet-1", "Bearer token"))
                .thenReturn(ApiResponse.<PetResponse>builder().result(pet).build());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        BookingResponse response = BookingResponse.builder().id("booking-1").build();
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(response);

        assertThat(bookingService.create(request, "Bearer token")).isSameAs(response);

        ArgumentCaptor<Booking> savedBooking = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(savedBooking.capture());
        assertThat(savedBooking.getValue().getUserId()).isEqualTo("alice");
        assertThat(savedBooking.getValue().getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(savedBooking.getValue().getTotalPrice()).isEqualByComparingTo("180000");
    }

    @Test
    void create_overlapsExistingAppointment_rejectsBooking() {
        BookingRequest request = requestAt(LocalTime.of(8, 30));
        stubBookableResources(request);
        Booking existing = existingBooking(LocalTime.of(8, 0), BookingStatus.CONFIRMED);
        when(bookingRepository.findByStaffIdAndAppointmentDate("staff-1", bookingDate))
                .thenReturn(List.of(existing));

        assertThatThrownBy(() -> bookingService.create(request, "Bearer token"))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.STAFF_NOT_AVAILABLE));

        verify(userServiceClient, never()).getPetById(any(), any());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void create_startsWhenPreviousAppointmentEnds_allowsBooking() {
        BookingRequest request = requestAt(LocalTime.of(9, 30));
        stubBookableResources(request);
        when(bookingRepository.findByStaffIdAndAppointmentDate("staff-1", bookingDate))
                .thenReturn(List.of(existingBooking(LocalTime.of(8, 0), BookingStatus.CONFIRMED)));
        when(userServiceClient.getPetById("pet-1", "Bearer token"))
                .thenReturn(ApiResponse.<PetResponse>builder().result(pet).build());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(BookingResponse.builder().build());

        bookingService.create(request, "Bearer token");

        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void create_cancelledAppointmentAtSameTime_allowsBooking() {
        BookingRequest request = requestAt(LocalTime.of(8, 0));
        stubBookableResources(request);
        when(bookingRepository.findByStaffIdAndAppointmentDate("staff-1", bookingDate))
                .thenReturn(List.of(existingBooking(LocalTime.of(8, 0), BookingStatus.CANCELLED)));
        when(userServiceClient.getPetById("pet-1", "Bearer token"))
                .thenReturn(ApiResponse.<PetResponse>builder().result(pet).build());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(BookingResponse.builder().build());

        bookingService.create(request, "Bearer token");

        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void create_inactiveServicePackage_returnsNotFound() {
        BookingRequest request = requestAt(LocalTime.of(8, 0));
        servicePackage.setActive(false);
        when(servicePackageService.getEntity("package-1")).thenReturn(servicePackage);

        assertThatThrownBy(() -> bookingService.create(request, "Bearer token"))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.SERVICE_PACKAGE_NOT_FOUND));

        verify(staffService, never()).getEntityForBooking(any());
    }

    @Test
    void create_inactiveStaff_returnsNotFound() {
        BookingRequest request = requestAt(LocalTime.of(8, 0));
        staff.setActive(false);
        stubBookableResources(request);

        assertThatThrownBy(() -> bookingService.create(request, "Bearer token"))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.STAFF_NOT_FOUND));

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void create_missingPet_returnsPetNotFound() {
        BookingRequest request = requestAt(LocalTime.of(8, 0));
        stubBookableResources(request);
        when(bookingRepository.findByStaffIdAndAppointmentDate("staff-1", bookingDate)).thenReturn(List.of());
        when(userServiceClient.getPetById("pet-1", "Bearer token"))
                .thenReturn(ApiResponse.<PetResponse>builder().build());

        assertThatThrownBy(() -> bookingService.create(request, "Bearer token"))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.PET_NOT_FOUND));
    }

    @Test
    void create_userServiceUnavailable_returnsDependencyError() {
        BookingRequest request = requestAt(LocalTime.of(8, 0));
        stubBookableResources(request);
        when(bookingRepository.findByStaffIdAndAppointmentDate("staff-1", bookingDate)).thenReturn(List.of());
        when(userServiceClient.getPetById("pet-1", "Bearer token")).thenThrow(new RuntimeException("down"));

        assertThatThrownBy(() -> bookingService.create(request, "Bearer token"))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.SERVICE_UNAVAILABLE));
    }

    @Test
    void cancelMine_ownedActiveBooking_setsCancelledStatus() {
        Booking booking = existingBooking(LocalTime.of(8, 0), BookingStatus.CONFIRMED);
        booking.setUserId("alice");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(bookingMapper.toResponse(booking)).thenReturn(BookingResponse.builder().status(BookingStatus.CANCELLED).build());

        BookingResponse response = bookingService.cancelMine("booking-1");

        assertThat(response.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(booking.getCancelledAt()).isNotNull();
    }

    @Test
    void cancelMine_otherUsersBooking_returnsUnauthorized() {
        Booking booking = existingBooking(LocalTime.of(8, 0), BookingStatus.PENDING);
        booking.setUserId("bob");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelMine("booking-1"))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.UNAUTHORIZED));
    }

    @Test
    void cancelMine_completedBooking_returnsAlreadyTerminal() {
        Booking booking = existingBooking(LocalTime.of(8, 0), BookingStatus.COMPLETED);
        booking.setUserId("alice");
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));

        assertThatThrownBy(() -> bookingService.cancelMine("booking-1"))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.BOOKING_ALREADY_TERMINAL));
    }

    @Test
    void updateStatus_pendingToCompleted_rejectsInvalidTransition() {
        Booking booking = existingBooking(LocalTime.of(8, 0), BookingStatus.PENDING);
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));
        UpdateBookingStatusRequest request = UpdateBookingStatusRequest.builder()
                .status(BookingStatus.COMPLETED)
                .build();

        assertThatThrownBy(() -> bookingService.updateStatus("booking-1", request))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.getErrorCode()).isEqualTo(ErrorCode.INVALID_STATUS_TRANSITION));
    }

    @Test
    void updateStatus_inProgressToCompleted_recordsCompletionTime() {
        Booking booking = existingBooking(LocalTime.of(8, 0), BookingStatus.IN_PROGRESS);
        when(bookingRepository.findById("booking-1")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(bookingMapper.toResponse(booking)).thenReturn(BookingResponse.builder().status(BookingStatus.COMPLETED).build());

        bookingService.updateStatus("booking-1", UpdateBookingStatusRequest.builder()
                .status(BookingStatus.COMPLETED)
                .adminNotes("done")
                .build());

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.COMPLETED);
        assertThat(booking.getCompletedAt()).isNotNull();
        assertThat(booking.getAdminNotes()).isEqualTo("done");
    }

    private BookingRequest requestAt(LocalTime time) {
        return BookingRequest.builder()
                .petId("pet-1")
                .servicePackageId("package-1")
                .staffId("staff-1")
                .appointmentDate(bookingDate)
                .appointmentTime(time)
                .build();
    }

    private void stubBookableResources(BookingRequest request) {
        when(servicePackageService.getEntity(request.getServicePackageId())).thenReturn(servicePackage);
        when(staffService.getEntityForBooking(request.getStaffId())).thenReturn(staff);
    }

    private Booking existingBooking(LocalTime time, BookingStatus status) {
        return Booking.builder()
                .id("booking-1")
                .servicePackage(servicePackage)
                .staff(staff)
                .appointmentDate(bookingDate)
                .appointmentTime(time)
                .status(status)
                .build();
    }
}
