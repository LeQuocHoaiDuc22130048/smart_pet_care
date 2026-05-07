package com.pet_care.booking.controller;

import com.pet_care.booking.dto.request.BookingRequest;
import com.pet_care.booking.dto.request.UpdateBookingStatusRequest;
import com.pet_care.booking.dto.response.ApiResponse;
import com.pet_care.booking.dto.response.BookingResponse;
import com.pet_care.booking.enums.BookingStatus;
import com.pet_care.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class BookingController {
    BookingService bookingService;

    @PostMapping
    public ApiResponse<BookingResponse> create(@RequestBody @Valid BookingRequest request,
                                               @RequestHeader("Authorization") String authorization) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.create(request, authorization))
                .build();
    }

    @GetMapping("/my")
    public ApiResponse<List<BookingResponse>> getMine() {
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getMyBookings())
                .build();
    }

    @GetMapping("/my/{id}")
    public ApiResponse<BookingResponse> getMineById(@PathVariable String id) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.getMineById(id))
                .build();
    }

    @PatchMapping("/my/{id}/cancel")
    public ApiResponse<BookingResponse> cancelMine(@PathVariable String id) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.cancelMine(id))
                .build();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BookingResponse>> getAll(@RequestParam(required = false) BookingStatus status) {
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getAll(status))
                .build();
    }

    @GetMapping("/admin/staff/{staffId}/schedule")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<BookingResponse>> getStaffSchedule(
            @PathVariable String staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.<List<BookingResponse>>builder()
                .result(bookingService.getStaffSchedule(staffId, date))
                .build();
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<BookingResponse> updateStatus(@PathVariable String id,
                                                     @RequestBody @Valid UpdateBookingStatusRequest request) {
        return ApiResponse.<BookingResponse>builder()
                .result(bookingService.updateStatus(id, request))
                .build();
    }
}
