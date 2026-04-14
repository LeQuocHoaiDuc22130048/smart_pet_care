package com.pet_care.user_service.service;

import com.pet_care.user_service.dto.request.UserAddressRequest;
import com.pet_care.user_service.dto.response.UserAddressResponse;
import com.pet_care.user_service.entity.UserAddress;
import com.pet_care.user_service.exception.AppException;
import com.pet_care.user_service.exception.ErrorCode;
import com.pet_care.user_service.mapper.UserAddressMapper;
import com.pet_care.user_service.repository.UserAddressRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserAddressService {

    UserAddressRepository userAddressRepository;
    UserAddressMapper userAddressMapper;

    public List<UserAddressResponse> getMyAddresses() {
        String userId = getCurrentUserId();
        return userAddressRepository.findByUserId(userId).stream()
                .map(userAddressMapper::toUserAddressResponse)
                .toList();
    }

    @Transactional
    public UserAddressResponse createAddress(UserAddressRequest request) {
        String userId = getCurrentUserId();

        // Nếu đây là địa chỉ mặc định, bỏ mặc định của địa chỉ cũ
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddress(userId);
        }

        UserAddress address = userAddressMapper.toUserAddress(request);
        address.setUserId(userId);

        return userAddressMapper.toUserAddressResponse(userAddressRepository.save(address));
    }

    @Transactional
    public UserAddressResponse updateAddress(String addressId, UserAddressRequest request) {
        String userId = getCurrentUserId();
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!address.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddress(userId);
        }

        userAddressMapper.updateUserAddress(address, request);
        return userAddressMapper.toUserAddressResponse(userAddressRepository.save(address));
    }

    public void deleteAddress(String addressId) {
        String userId = getCurrentUserId();
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!address.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        userAddressRepository.delete(address);
    }

    private void clearDefaultAddress(String userId) {
        userAddressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(addr -> {
                    addr.setIsDefault(false);
                    userAddressRepository.save(addr);
                });
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
