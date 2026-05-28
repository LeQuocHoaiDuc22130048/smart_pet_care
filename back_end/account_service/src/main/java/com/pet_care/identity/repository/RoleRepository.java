package com.pet_care.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pet_care.identity.entity.Role;

public interface RoleRepository extends JpaRepository<Role, String> {}
