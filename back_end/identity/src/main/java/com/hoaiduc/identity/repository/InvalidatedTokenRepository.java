package com.hoaiduc.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hoaiduc.identity.entity.InvalidedToken;

@Repository
public interface InvalidatedTokenRepository extends JpaRepository<InvalidedToken, String> {}
