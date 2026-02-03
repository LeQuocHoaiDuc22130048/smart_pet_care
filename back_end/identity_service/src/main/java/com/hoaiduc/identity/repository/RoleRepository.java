package com.hoaiduc.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hoaiduc.identity.entity.Role;

public interface RoleRepository extends JpaRepository<Role, String> {}
