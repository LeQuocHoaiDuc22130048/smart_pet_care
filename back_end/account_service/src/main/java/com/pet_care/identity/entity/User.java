package com.pet_care.identity.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import com.pet_care.identity.enums.AuthProvider;
import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "username", unique = true)
    String username;

    String password;
    
    @Column(name = "email", unique = true)
    String email;
    
    String firstName;
    String lastName;
    LocalDate birthDate;
    
    @Column(name = "avatar_url")
    String avatarUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider")
    @Builder.Default
    AuthProvider authProvider = AuthProvider.LOCAL;
    
    @Column(name = "google_id")
    String googleId;
    
    @Builder.Default
    Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @ManyToMany
    Set<Role> roles;
}
