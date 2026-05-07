package com.pet_care.booking.client;

import com.pet_care.booking.dto.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "user-service", url = "${services.user-service.url}")
public interface UserServiceClient {
    @GetMapping("/pets/{petId}")
    ApiResponse<PetResponse> getPetById(@PathVariable String petId,
                                         @RequestHeader("Authorization") String authorization);
}
