package com.pet_care.user_service.repository;

import com.pet_care.user_service.entity.UserAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserAddressRepository extends JpaRepository<UserAddress, String> {

    List<UserAddress> findByUserId(String userId);

    Optional<UserAddress> findByUserIdAndIsDefaultTrue(String userId);
}
