package com.pet_care.user_service.entity;

import com.pet_care.user_service.enums.Gender;
import com.pet_care.user_service.enums.PetSpecies;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Table(name = "pets")
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    String name;

    @Enumerated(EnumType.STRING)
    PetSpecies species;

    String breed;
    Integer age;
    Double weight;

    @Enumerated(EnumType.STRING)
    Gender gender;

    Boolean isNeutered;
    String healthNotes;
    String imageUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}
