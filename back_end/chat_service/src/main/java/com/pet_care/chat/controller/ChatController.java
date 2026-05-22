package com.pet_care.chat.controller;

import com.pet_care.chat.dto.request.ChatRequest;
import com.pet_care.chat.dto.response.ApiResponse;
import com.pet_care.chat.dto.response.ChatResponse;
import com.pet_care.chat.dto.response.ImageSearchResponse;
import com.pet_care.chat.service.ImageSearchService;
import com.pet_care.chat.service.GeminiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {

    private final GeminiService geminiService;
    private final ImageSearchService imageSearchService;

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

    /**
     * POST /api/v1/pet_care_chat/chat/image-search
     * Multipart field: image
     */
    @PostMapping(value = "/image-search", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ImageSearchResponse> searchByImage(@RequestPart("image") MultipartFile image) {
        return ApiResponse.<ImageSearchResponse>builder()
                .code(200)
                .result(imageSearchService.searchByImage(image))
                .build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleBadRequest(IllegalArgumentException exception) {
        return ApiResponse.<Void>builder()
                .code(400)
                .message(exception.getMessage())
                .build();
    }
}
