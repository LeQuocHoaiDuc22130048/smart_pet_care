package com.hoaiduc.identity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hoaiduc.identity.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    boolean existsByUsername(String username);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByUsername(String username);
}
