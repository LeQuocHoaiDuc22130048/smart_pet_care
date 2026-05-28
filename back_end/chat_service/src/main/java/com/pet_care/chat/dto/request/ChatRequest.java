package com.pet_care.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {

    @NotBlank(message = "Message cannot be blank")
    @Size(max = 2000, message = "Message too long")
    private String message;

    /**
     * Lịch sử hội thoại trước đó (tối đa 10 tin nhắn gần nhất).
     * Frontend gửi lên để AI có context.
     */
    private List<ChatMessage> history;

    /**
     * Thông tin context của user (tùy chọn, giúp bot cá nhân hóa).
     */
    private UserContext userContext;
}
