package com.pet_care.booking.controller;

import com.pet_care.booking.dto.request.StaffRequest;
import com.pet_care.booking.dto.response.ApiResponse;
import com.pet_care.booking.dto.response.StaffResponse;
import com.pet_care.booking.service.StaffService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/staff")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StaffController {
    StaffService staffService;

    @GetMapping
    public ApiResponse<List<StaffResponse>> getAll(@RequestParam(defaultValue = "true") boolean activeOnly) {
        return ApiResponse.<List<StaffResponse>>builder()
                .result(activeOnly ? staffService.getActive() : staffService.getAll())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<StaffResponse> getById(@PathVariable String id) {
        return ApiResponse.<StaffResponse>builder()
                .result(staffService.getById(id))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<StaffResponse> create(@RequestBody @Valid StaffRequest request) {
        return ApiResponse.<StaffResponse>builder()
                .result(staffService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<StaffResponse> update(@PathVariable String id, @RequestBody @Valid StaffRequest request) {
        return ApiResponse.<StaffResponse>builder()
                .result(staffService.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable String id) {
        staffService.delete(id);
        return ApiResponse.<String>builder().result("Staff disabled").build();
    }
}
