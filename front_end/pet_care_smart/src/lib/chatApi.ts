/**
 * Chat API Client — PetCareSmart
 * Gemini trả về JSON structured: { text, suggestions }
 * Frontend render card có ảnh + link cho sản phẩm/dịch vụ.
 */

import { apiRequest } from './api';
import type { ApiResponse } from './api';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface UserContext {
    userName?: string;
    petNames?: string[];
    totalOrders?: number;
    lastOrderStatus?: string;
}

export interface ChatRequestPayload {
    message: string;
    history?: ChatMessage[];
    userContext?: UserContext;
}

/** Card gợi ý sản phẩm hoặc dịch vụ */
export interface SuggestionCard {
    type: 'product' | 'service';
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    link: string;           // route để navigate
    description?: string;
    durationMinutes?: number; // chỉ cho service
}

export interface DiseaseMatch {
    name: string;
    description?: string;
    matchedLabel?: string;
    confidence?: number;
}

/** Kết quả parse từ Gemini */
export interface BotReply {
    text: string;
    suggestions?: SuggestionCard[];
}

export interface ChatResponseData {
    reply: string;          // raw text (dùng cho history)
    parsed: BotReply;       // structured để render
}

export interface ImageSearchResponseData {
    summary: string;
    observations: string[];
    careTips: string[];
    warnings: string[];
    searchKeywords: string[];
    diseaseMatches?: DiseaseMatch[];
    productSuggestions?: SuggestionCard[];
    serviceSuggestions?: SuggestionCard[];
    disclaimer: string;
    suggestions: SuggestionCard[];
}

export async function sendChatMessage(
    payload: ChatRequestPayload
): Promise<ApiResponse<ChatResponseData>> {
    return apiRequest<ChatResponseData>('/pet_care_chat/chat/message', {
        method: 'POST',
        body: payload,
    });
}

export async function searchByImage(
    image: File
): Promise<ApiResponse<ImageSearchResponseData>> {
    const formData = new FormData();
    formData.append('image', image);

    return apiRequest<ImageSearchResponseData>('/pet_care_chat/chat/image-search', {
        method: 'POST',
        body: formData,
        isFormData: true,
        requireAuth: true,
    });
}
