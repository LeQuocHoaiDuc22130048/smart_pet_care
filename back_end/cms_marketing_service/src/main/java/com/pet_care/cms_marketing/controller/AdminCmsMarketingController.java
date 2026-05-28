package com.pet_care.cms_marketing.controller;

import com.pet_care.cms_marketing.dto.ApiResponse;
import com.pet_care.cms_marketing.dto.BannerRequest;
import com.pet_care.cms_marketing.dto.BlogPostRequest;
import com.pet_care.cms_marketing.dto.MarketingCampaignRequest;
import com.pet_care.cms_marketing.dto.StatusUpdateRequest;
import com.pet_care.cms_marketing.entity.Banner;
import com.pet_care.cms_marketing.entity.BlogPost;
import com.pet_care.cms_marketing.entity.MarketingCampaign;
import com.pet_care.cms_marketing.service.CmsMarketingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminCmsMarketingController {

    CmsMarketingService cmsMarketingService;

    @GetMapping("/banners")
    public ApiResponse<List<Banner>> getBanners() {
        return ApiResponse.<List<Banner>>builder()
                .result(cmsMarketingService.getAllBanners())
                .build();
    }

    @PostMapping("/banners")
    public ApiResponse<Banner> createBanner(@RequestBody @Valid BannerRequest request) {
        return ApiResponse.<Banner>builder()
                .result(cmsMarketingService.createBanner(request))
                .build();
    }

    @PutMapping("/banners/{id}")
    public ApiResponse<Banner> updateBanner(@PathVariable String id, @RequestBody @Valid BannerRequest request) {
        return ApiResponse.<Banner>builder()
                .result(cmsMarketingService.updateBanner(id, request))
                .build();
    }

    @PatchMapping("/banners/{id}/status")
    public ApiResponse<Banner> updateBannerStatus(
            @PathVariable String id,
            @RequestBody @Valid StatusUpdateRequest request
    ) {
        return ApiResponse.<Banner>builder()
                .result(cmsMarketingService.updateBannerStatus(id, request.getStatus()))
                .build();
    }

    @DeleteMapping("/banners/{id}")
    public ApiResponse<Void> deleteBanner(@PathVariable String id) {
        cmsMarketingService.deleteBanner(id);
        return ApiResponse.<Void>builder().message("Banner deleted").build();
    }

    @GetMapping("/posts")
    public ApiResponse<List<BlogPost>> getPosts() {
        return ApiResponse.<List<BlogPost>>builder()
                .result(cmsMarketingService.getAllPosts())
                .build();
    }

    @PostMapping("/posts")
    public ApiResponse<BlogPost> createPost(@RequestBody @Valid BlogPostRequest request) {
        return ApiResponse.<BlogPost>builder()
                .result(cmsMarketingService.createPost(request))
                .build();
    }

    @PutMapping("/posts/{id}")
    public ApiResponse<BlogPost> updatePost(@PathVariable String id, @RequestBody @Valid BlogPostRequest request) {
        return ApiResponse.<BlogPost>builder()
                .result(cmsMarketingService.updatePost(id, request))
                .build();
    }

    @PatchMapping("/posts/{id}/status")
    public ApiResponse<BlogPost> updatePostStatus(
            @PathVariable String id,
            @RequestBody @Valid StatusUpdateRequest request
    ) {
        return ApiResponse.<BlogPost>builder()
                .result(cmsMarketingService.updatePostStatus(id, request.getStatus()))
                .build();
    }

    @DeleteMapping("/posts/{id}")
    public ApiResponse<Void> deletePost(@PathVariable String id) {
        cmsMarketingService.deletePost(id);
        return ApiResponse.<Void>builder().message("Post deleted").build();
    }

    @GetMapping("/campaigns")
    public ApiResponse<List<MarketingCampaign>> getCampaigns() {
        return ApiResponse.<List<MarketingCampaign>>builder()
                .result(cmsMarketingService.getAllCampaigns())
                .build();
    }

    @PostMapping("/campaigns")
    public ApiResponse<MarketingCampaign> createCampaign(@RequestBody @Valid MarketingCampaignRequest request) {
        return ApiResponse.<MarketingCampaign>builder()
                .result(cmsMarketingService.createCampaign(request))
                .build();
    }

    @PutMapping("/campaigns/{id}")
    public ApiResponse<MarketingCampaign> updateCampaign(
            @PathVariable String id,
            @RequestBody @Valid MarketingCampaignRequest request
    ) {
        return ApiResponse.<MarketingCampaign>builder()
                .result(cmsMarketingService.updateCampaign(id, request))
                .build();
    }

    @PatchMapping("/campaigns/{id}/status")
    public ApiResponse<MarketingCampaign> updateCampaignStatus(
            @PathVariable String id,
            @RequestBody @Valid StatusUpdateRequest request
    ) {
        return ApiResponse.<MarketingCampaign>builder()
                .result(cmsMarketingService.updateCampaignStatus(id, request.getStatus()))
                .build();
    }

    @DeleteMapping("/campaigns/{id}")
    public ApiResponse<Void> deleteCampaign(@PathVariable String id) {
        cmsMarketingService.deleteCampaign(id);
        return ApiResponse.<Void>builder().message("Campaign deleted").build();
    }
}
