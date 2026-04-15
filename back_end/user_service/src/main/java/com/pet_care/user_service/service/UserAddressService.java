package com.pet_care.user_service.service;

import com.pet_care.user_service.dto.request.UserAddressRequest;
import com.pet_care.user_service.dto.response.UserAddressResponse;
import com.pet_care.user_service.entity.UserAddress;
import com.pet_care.user_service.exception.AppException;
import com.pet_care.user_service.exception.ErrorCode;
import com.pet_care.user_service.mapper.UserAddressMapper;
import com.pet_care.user_service.repository.UserAddressRepository;
import com.pet_care.user_service.repository.UserProfileRepository;
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
    UserProfileRepository userProfileRepository;

    public List<UserAddressResponse> getMyAddresses() {
        String userId = getMyUserId();
        return userAddressRepository.findByUserId(userId).stream()
                .map(userAddressMapper::toUserAddressResponse)
                .toList();
    }

    @Transactional
    public UserAddressResponse createAddress(UserAddressRequest request) {
        String userId = getMyUserId();

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultAddress(userId);
        }

        UserAddress address = userAddressMapper.toUserAddress(request);
        address.setUserId(userId);

        return userAddressMapper.toUserAddressResponse(userAddressRepository.save(address));
    }

    @Transactional
    public UserAddressResponse updateAddress(String addressId, UserAddressRequest request) {
        String userId = getMyUserId();
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
        String userId = getMyUserId();
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

    /** JWT sub = username → lấy userId (UUID) từ UserProfile */
    private String getMyUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_PROFILE_NOT_FOUND))
                .getId();
    }
}
