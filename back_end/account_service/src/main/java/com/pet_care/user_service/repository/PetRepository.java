package com.pet_care.user_service.repository;

import com.pet_care.user_service.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, String> {

    List<Pet> findByUserId(String userId);
}
