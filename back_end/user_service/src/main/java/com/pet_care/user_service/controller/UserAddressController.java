package com.pet_care.user_service.controller;

import com.pet_care.user_service.dto.ApiResponse;
import com.pet_care.user_service.dto.request.UserAddressRequest;
import com.pet_care.user_service.dto.response.UserAddressResponse;
import com.pet_care.user_service.service.UserAddressService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserAddressController {

    UserAddressService userAddressService;

    @GetMapping
    public ApiResponse<List<UserAddressResponse>> getMyAddresses() {
        return ApiResponse.<List<UserAddressResponse>>builder()
                .result(userAddressService.getMyAddresses())
                .build();
    }

    @PostMapping
    public ApiResponse<UserAddressResponse> createAddress(@RequestBody UserAddressRequest request) {
        return ApiResponse.<UserAddressResponse>builder()
                .result(userAddressService.createAddress(request))
                .build();
    }

    @PutMapping("/{addressId}")
    public ApiResponse<UserAddressResponse> updateAddress(@PathVariable String addressId,
                                                           @RequestBody UserAddressRequest request) {
        return ApiResponse.<UserAddressResponse>builder()
                .result(userAddressService.updateAddress(addressId, request))
                .build();
    }

    @DeleteMapping("/{addressId}")
    public ApiResponse<String> deleteAddress(@PathVariable String addressId) {
        userAddressService.deleteAddress(addressId);
        return ApiResponse.<String>builder().result("Address deleted").build();
    }
}
