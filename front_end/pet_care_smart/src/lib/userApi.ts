/**
 * User Service API
 * Route prefix: /pet_care_user
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export type PetSpecies =
    | 'HOUSEHOLD_PET'
    | 'EXOTIC_PET'
    | 'LIVESTOCK'
    | 'POULTRY'
    | 'AQUACULTURE';

export type PetGender = 'MALE' | 'FEMALE';

export interface UserProfile {
    userId: string;
    firstName: string;
    lastName: string;
    email?: string;
    birthday?: string;
    phone?: string;
    avatarUrl?: string;
}

export interface Pet {
    id: string;
    name: string;
    species: PetSpecies;
    breed?: string;
    age?: number;
    weight?: number;
    gender?: PetGender;
    isNeutered?: boolean;
    healthNotes?: string;
    imageUrl?: string;
}

export interface Address {
    id: string;
    recipientName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    streetDetails: string;
    isDefault: boolean;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    birthday?: string;
    phone?: string;
    avatar?: File;
}

export interface CreatePetRequest {
    name: string;
    species: PetSpecies;
    breed?: string;
    age?: number;
    weight?: number;
    gender?: PetGender;
    isNeutered?: boolean;
    healthNotes?: string;
    image?: File;
}

export interface CreateAddressRequest {
    recipientName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    streetDetails: string;
    isDefault?: boolean;
}

// ─── User Service endpoints ───────────────────────────────────────────────────
export const userApi = {
    // Profile
    getMyProfile(): Promise<ApiResponse<UserProfile>> {
        return apiRequest('/pet_care_user/profiles/me', { requireAuth: true });
    },

    getProfileById(userId: string): Promise<ApiResponse<UserProfile>> {
        return apiRequest(`/pet_care_user/profiles/${userId}`, { requireAuth: true });
    },

    updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
        const formData = new FormData();
        if (data.firstName) formData.append('firstName', data.firstName);
        if (data.lastName) formData.append('lastName', data.lastName);
        if (data.email) formData.append('email', data.email);
        if (data.birthday) formData.append('birthday', data.birthday);
        if (data.phone) formData.append('phone', data.phone);
        if (data.avatar) formData.append('avatar', data.avatar);

        return apiRequest('/pet_care_user/profiles/me', {
            method: 'PUT',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    // Pets
    getMyPets(): Promise<ApiResponse<Pet[]>> {
        return apiRequest('/pet_care_user/pets', { requireAuth: true });
    },

    getPetById(petId: string): Promise<ApiResponse<Pet>> {
        return apiRequest(`/pet_care_user/pets/${petId}`, { requireAuth: true });
    },

    createPet(data: CreatePetRequest): Promise<ApiResponse<Pet>> {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('species', data.species);
        if (data.breed) formData.append('breed', data.breed);
        if (data.age !== undefined) formData.append('age', String(data.age));
        if (data.weight !== undefined) formData.append('weight', String(data.weight));
        if (data.gender) formData.append('gender', data.gender);
        if (data.isNeutered !== undefined) formData.append('isNeutered', String(data.isNeutered));
        if (data.healthNotes) formData.append('healthNotes', data.healthNotes);
        if (data.image) formData.append('image', data.image);

        return apiRequest('/pet_care_user/pets', {
            method: 'POST',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    updatePet(petId: string, data: Partial<CreatePetRequest>): Promise<ApiResponse<Pet>> {
        const formData = new FormData();
        if (data.name) formData.append('name', data.name);
        if (data.species) formData.append('species', data.species);
        if (data.breed) formData.append('breed', data.breed);
        if (data.age !== undefined) formData.append('age', String(data.age));
        if (data.weight !== undefined) formData.append('weight', String(data.weight));
        if (data.gender) formData.append('gender', data.gender);
        if (data.isNeutered !== undefined) formData.append('isNeutered', String(data.isNeutered));
        if (data.healthNotes) formData.append('healthNotes', data.healthNotes);
        if (data.image) formData.append('image', data.image);

        return apiRequest(`/pet_care_user/pets/${petId}`, {
            method: 'PUT',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    deletePet(petId: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_user/pets/${petId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    // Addresses
    getMyAddresses(): Promise<ApiResponse<Address[]>> {
        return apiRequest('/pet_care_user/addresses', { requireAuth: true });
    },

    createAddress(data: CreateAddressRequest): Promise<ApiResponse<Address>> {
        return apiRequest('/pet_care_user/addresses', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    updateAddress(addressId: string, data: CreateAddressRequest): Promise<ApiResponse<Address>> {
        return apiRequest(`/pet_care_user/addresses/${addressId}`, {
            method: 'PUT',
            body: data,
            requireAuth: true,
        });
    },

    deleteAddress(addressId: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_user/addresses/${addressId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
