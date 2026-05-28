package com.pet_care.cms_marketing.controller;

import com.pet_care.cms_marketing.dto.ApiResponse;
import com.pet_care.cms_marketing.entity.Banner;
import com.pet_care.cms_marketing.entity.BlogPost;
import com.pet_care.cms_marketing.entity.MarketingCampaign;
import com.pet_care.cms_marketing.service.CmsMarketingService;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PublicCmsMarketingController {

    CmsMarketingService cmsMarketingService;

    @GetMapping("/banners")
    public ApiResponse<List<Banner>> getBanners(@RequestParam(required = false) String position) {
        return ApiResponse.<List<Banner>>builder()
                .result(cmsMarketingService.getPublishedBanners(position))
                .build();
    }

    @GetMapping("/posts")
    public ApiResponse<List<BlogPost>> getPosts() {
        return ApiResponse.<List<BlogPost>>builder()
                .result(cmsMarketingService.getPublishedPosts())
                .build();
    }

    @GetMapping("/posts/{slug}")
    public ApiResponse<BlogPost> getPost(@PathVariable String slug) {
        return ApiResponse.<BlogPost>builder()
                .result(cmsMarketingService.getPublishedPost(slug))
                .build();
    }

    @GetMapping("/campaigns/active")
    public ApiResponse<List<MarketingCampaign>> getActiveCampaigns() {
        return ApiResponse.<List<MarketingCampaign>>builder()
                .result(cmsMarketingService.getActiveCampaigns())
                .build();
    }
}
