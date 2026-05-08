package com.pet_care.chat.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Một tin nhắn trong lịch sử hội thoại.
 * role: "user" hoặc "model"
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String role;   // "user" | "model"
    private String text;
}
