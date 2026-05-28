package com.pet_care.user_service.enums;

import lombok.Getter;

@Getter
public enum PetSpecies {
    LIVESTOCK("Gia súc chăn nuôi"),
    POULTRY("Gia cầm"),
    AQUACULTURE("Thủy hải sản"),
    HOUSEHOLD_PET("Thú cưng trong nhà"),
    EXOTIC_PET("Thú cưng độc lạ");

    private final String displayName;

    PetSpecies(String displayName) {
        this.displayName = displayName;
    }

}
