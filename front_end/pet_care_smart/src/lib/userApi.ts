/**
 * User Service API
 * Route prefix: /pet_care_user
 * DTOs: UserProfileUpdateRequest, PetRequest, UserAddressRequest
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Enums (khớp với backend enums) ──────────────────────────────────────────
export type PetSpecies =
    | 'HOUSEHOLD_PET'
    | 'EXOTIC_PET'
    | 'LIVESTOCK'
    | 'POULTRY'
    | 'AQUACULTURE';

export type Gender = 'MALE' | 'FEMALE';

// ─── Response types ───────────────────────────────────────────────────────────
// Backend dùng @JsonProperty nên trả về snake_case
export interface UserProfile {
    id: string;
    username?: string;
    // Backend trả về "first_name" / "last_name" / "avatar_url"
    first_name?: string;
    last_name?: string;
    // Alias camelCase để tương thích (một số endpoint có thể trả camelCase)
    firstName?: string;
    lastName?: string;
    email?: string;
    birthday?: string;      // LocalDate → "yyyy-MM-dd"
    phone?: string;
    avatar_url?: string;
    avatarUrl?: string;
}

export interface Pet {
    id: string;
    name: string;
    species: PetSpecies;
    breed?: string;
    age?: number;
    weight?: number;
    gender?: Gender;
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

// ─── Request types (khớp DTO backend) ────────────────────────────────────────

/**
 * UserProfileUpdateRequest — multipart/form-data
 * Fields: firstName, lastName, email, birthday (yyyy-MM-dd), phone, avatar (File)
 * Backend dùng @JsonAlias("first_name") nên cả camelCase và snake_case đều được
 */
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    birthday?: string;      // "yyyy-MM-dd"
    phone?: string;
    avatar?: File;
}

/**
 * PetRequest — multipart/form-data
 * Fields: name, species, breed, age, weight, gender, isNeutered, healthNotes, image
 */
export interface PetRequest {
    name: string;
    species: PetSpecies;
    breed?: string;
    age?: number;
    weight?: number;
    gender?: Gender;
    isNeutered?: boolean;
    healthNotes?: string;
    image?: File;
}

/**
 * UserAddressRequest — application/json
 * Backend dùng @JsonProperty nên phải gửi đúng tên field camelCase
 * (Spring Jackson tự map camelCase → snake_case qua @JsonProperty)
 */
export interface AddressRequest {
    recipientName: string;  // @JsonProperty("recipient_name")
    phone: string;
    province: string;
    district: string;
    ward: string;
    streetDetails: string;  // @JsonProperty("street_details")
    isDefault?: boolean;    // @JsonProperty("is_default")
}

// ─── User Service endpoints ───────────────────────────────────────────────────
export const userApi = {
    // ── Profile ───────────────────────────────────────────────────────────────

    /** GET /pet_care_user/profiles/me */
    getMyProfile(): Promise<ApiResponse<UserProfile>> {
        return apiRequest('/pet_care_user/profiles/me', { requireAuth: true });
    },

    /** GET /pet_care_user/profiles/{userId} */
    getProfileById(userId: string): Promise<ApiResponse<UserProfile>> {
        return apiRequest(`/pet_care_user/profiles/${userId}`, { requireAuth: true });
    },

    /**
     * PUT /pet_care_user/profiles/me/avatar — Upload avatar đồng bộ.
     * Trả về profile với avatar_url đã lưu DB, không dùng @Async.
     */
    updateAvatar(avatar: File): Promise<ApiResponse<UserProfile>> {
        const formData = new FormData();
        formData.append('avatar', avatar);
        return apiRequest('/pet_care_user/profiles/me/avatar', {
            method: 'PUT',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    /**
     * PUT /pet_care_user/profiles/me — UserProfileUpdateRequest (multipart/form-data)
     * Gửi dưới dạng FormData để hỗ trợ upload avatar
     */
    updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
        const formData = new FormData();
        if (data.firstName !== undefined) formData.append('firstName', data.firstName);
        if (data.lastName !== undefined) formData.append('lastName', data.lastName);
        if (data.email !== undefined) formData.append('email', data.email);
        if (data.birthday !== undefined) formData.append('birthday', data.birthday);
        if (data.phone !== undefined) formData.append('phone', data.phone);
        if (data.avatar) formData.append('avatar', data.avatar);

        return apiRequest('/pet_care_user/profiles/me', {
            method: 'PUT',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    // ── Pets ──────────────────────────────────────────────────────────────────

    /** GET /pet_care_user/pets */
    getMyPets(): Promise<ApiResponse<Pet[]>> {
        return apiRequest('/pet_care_user/pets', { requireAuth: true });
    },

    /** GET /pet_care_user/pets/{petId} */
    getPetById(petId: string): Promise<ApiResponse<Pet>> {
        return apiRequest(`/pet_care_user/pets/${petId}`, { requireAuth: true });
    },

    /**
     * POST /pet_care_user/pets — PetRequest (multipart/form-data)
     */
    createPet(data: PetRequest): Promise<ApiResponse<Pet>> {
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

    /**
     * PUT /pet_care_user/pets/{petId} — PetRequest (multipart/form-data)
     */
    updatePet(petId: string, data: Partial<PetRequest>): Promise<ApiResponse<Pet>> {
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

    /** DELETE /pet_care_user/pets/{petId} */
    deletePet(petId: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_user/pets/${petId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    // ── Addresses ─────────────────────────────────────────────────────────────

    /** GET /pet_care_user/addresses */
    getMyAddresses(): Promise<ApiResponse<Address[]>> {
        return apiRequest('/pet_care_user/addresses', { requireAuth: true });
    },

    /**
     * POST /pet_care_user/addresses — UserAddressRequest (application/json)
     * Gửi camelCase, Jackson tự map qua @JsonProperty
     */
    createAddress(data: AddressRequest): Promise<ApiResponse<Address>> {
        return apiRequest('/pet_care_user/addresses', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /** PUT /pet_care_user/addresses/{addressId} — UserAddressRequest */
    updateAddress(addressId: string, data: AddressRequest): Promise<ApiResponse<Address>> {
        return apiRequest(`/pet_care_user/addresses/${addressId}`, {
            method: 'PUT',
            body: data,
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_user/addresses/{addressId} */
    deleteAddress(addressId: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_user/addresses/${addressId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
