package com.pet_care.booking.controller;

import com.pet_care.booking.dto.request.ServicePackageRequest;
import com.pet_care.booking.dto.response.ApiResponse;
import com.pet_care.booking.dto.response.ServicePackageResponse;
import com.pet_care.booking.enums.ServiceCategory;
import com.pet_care.booking.service.ServicePackageService;
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
@RequestMapping("/service-packages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ServicePackageController {
    ServicePackageService servicePackageService;

    @GetMapping
    public ApiResponse<List<ServicePackageResponse>> getActive(@RequestParam(required = false) ServiceCategory category) {
        return ApiResponse.<List<ServicePackageResponse>>builder()
                .result(servicePackageService.getActive(category))
                .build();
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ServicePackageResponse>> getAll() {
        return ApiResponse.<List<ServicePackageResponse>>builder()
                .result(servicePackageService.getAll())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ServicePackageResponse> getById(@PathVariable String id) {
        return ApiResponse.<ServicePackageResponse>builder()
                .result(servicePackageService.getById(id))
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ServicePackageResponse> create(@RequestBody @Valid ServicePackageRequest request) {
        return ApiResponse.<ServicePackageResponse>builder()
                .result(servicePackageService.create(request))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ServicePackageResponse> update(@PathVariable String id,
                                                       @RequestBody @Valid ServicePackageRequest request) {
        return ApiResponse.<ServicePackageResponse>builder()
                .result(servicePackageService.update(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> delete(@PathVariable String id) {
        servicePackageService.delete(id);
        return ApiResponse.<String>builder().result("Service package disabled").build();
    }
}
