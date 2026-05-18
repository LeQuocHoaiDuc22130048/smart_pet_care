package com.pet_care.chat.controller;

import com.pet_care.chat.dto.request.ChatRequest;
import com.pet_care.chat.dto.response.ApiResponse;
import com.pet_care.chat.dto.response.ChatResponse;
import com.pet_care.chat.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final GeminiService geminiService;

    /**
     * POST /api/v1/pet_care_chat/chat/message
     * Body: { message, history?, userContext? }
     */
    @PostMapping("/message")
    public ApiResponse<ChatResponse> sendMessage(@Valid @RequestBody ChatRequest request) {
        log.debug("Chat request: {}", request.getMessage());
        return ApiResponse.<ChatResponse>builder()
                .code(200)
                .result(geminiService.chat(request))
                .build();
    }
}
