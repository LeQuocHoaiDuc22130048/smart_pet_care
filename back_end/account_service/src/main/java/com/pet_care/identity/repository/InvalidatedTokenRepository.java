package com.pet_care.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pet_care.identity.entity.InvalidedToken;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidedToken, String> {}
