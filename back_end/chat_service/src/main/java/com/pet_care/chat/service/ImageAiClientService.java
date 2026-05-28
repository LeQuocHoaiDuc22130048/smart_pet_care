package com.pet_care.chat.service;

import com.pet_care.chat.dto.response.ImageAiSearchResponse;
import com.pet_care.chat.dto.response.ImageAiSearchResult;
import com.pet_care.chat.dto.response.ImageAiAnalysisResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageAiClientService {

    private final RestTemplate restTemplate;

    @Value("${services.image-ai.url:http://image-ai-service:8090}")
    private String imageAiServiceUrl;

    public List<ImageAiSearchResult> searchSimilarProducts(MultipartFile image, int topK) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("topK", String.valueOf(topK));
            HttpHeaders imageHeaders = new HttpHeaders();
            imageHeaders.setContentType(MediaType.parseMediaType(
                    image.getContentType() == null ? MediaType.IMAGE_JPEG_VALUE : image.getContentType()
            ));
            body.add("image", new HttpEntity<>(new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename() == null ? "image.jpg" : image.getOriginalFilename();
                }
            }, imageHeaders));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ResponseEntity<ImageAiSearchResponse> response = restTemplate.exchange(
                    imageAiServiceUrl + "/image-ai/search",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    ImageAiSearchResponse.class
            );

            ImageAiSearchResponse result = response.getBody();
            return result == null || result.getResults() == null ? List.of() : result.getResults();
        } catch (Exception e) {
            log.warn("Image AI similarity search unavailable: {}", e.getMessage());
            return List.of();
        }
    }

    public Optional<ImageAiAnalysisResponse> analyzeImage(MultipartFile image) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            HttpHeaders imageHeaders = new HttpHeaders();
            imageHeaders.setContentType(MediaType.parseMediaType(
                    image.getContentType() == null ? MediaType.IMAGE_JPEG_VALUE : image.getContentType()
            ));
            body.add("image", new HttpEntity<>(new ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename() == null ? "image.jpg" : image.getOriginalFilename();
                }
            }, imageHeaders));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            ResponseEntity<ImageAiAnalysisResponse> response = restTemplate.exchange(
                    imageAiServiceUrl + "/image-ai/analyze",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    ImageAiAnalysisResponse.class
            );
            return Optional.ofNullable(response.getBody());
        } catch (Exception e) {
            log.warn("Image AI fallback analysis unavailable: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
