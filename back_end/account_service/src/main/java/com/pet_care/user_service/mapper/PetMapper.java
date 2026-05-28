package com.pet_care.user_service.mapper;

import com.pet_care.user_service.dto.request.PetRequest;
import com.pet_care.user_service.dto.response.PetResponse;
import com.pet_care.user_service.entity.Pet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PetMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Pet toPet(PetRequest request);

    PetResponse toPetResponse(Pet pet);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updatePet(@MappingTarget Pet pet, PetRequest request);
}
