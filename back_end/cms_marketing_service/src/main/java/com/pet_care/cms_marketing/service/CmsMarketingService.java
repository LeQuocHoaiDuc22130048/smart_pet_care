package com.pet_care.cms_marketing.service;

import com.pet_care.cms_marketing.dto.BannerRequest;
import com.pet_care.cms_marketing.dto.BlogPostRequest;
import com.pet_care.cms_marketing.dto.MarketingCampaignRequest;
import com.pet_care.cms_marketing.entity.Banner;
import com.pet_care.cms_marketing.entity.BlogPost;
import com.pet_care.cms_marketing.entity.MarketingCampaign;
import com.pet_care.cms_marketing.enums.ContentStatus;
import com.pet_care.cms_marketing.repository.BannerRepository;
import com.pet_care.cms_marketing.repository.BlogPostRepository;
import com.pet_care.cms_marketing.repository.MarketingCampaignRepository;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CmsMarketingService {

    BannerRepository bannerRepository;
    BlogPostRepository blogPostRepository;
    MarketingCampaignRepository marketingCampaignRepository;

    public List<Banner> getPublishedBanners(String position) {
        if (position == null || position.isBlank()) {
            return bannerRepository.findByStatusOrderBySortOrderAscCreatedAtDesc(ContentStatus.PUBLISHED);
        }
        return bannerRepository.findByPositionAndStatusOrderBySortOrderAscCreatedAtDesc(
                position,
                ContentStatus.PUBLISHED
        );
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public Banner createBanner(BannerRequest request) {
        Banner banner = Banner.builder().build();
        applyBannerRequest(banner, request);
        banner.setCreatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(String id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found"));
        applyBannerRequest(banner, request);
        return bannerRepository.save(banner);
    }

    public Banner updateBannerStatus(String id, ContentStatus status) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found"));
        banner.setStatus(status);
        banner.setUpdatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    public void deleteBanner(String id) {
        bannerRepository.deleteById(id);
    }

    public List<BlogPost> getPublishedPosts() {
        return blogPostRepository.findByStatusOrderByPublishedAtDescCreatedAtDesc(ContentStatus.PUBLISHED);
    }

    public BlogPost getPublishedPost(String slug) {
        return blogPostRepository.findBySlugAndStatus(slug, ContentStatus.PUBLISHED)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
    }

    public List<BlogPost> getAllPosts() {
        return blogPostRepository.findAll();
    }

    public BlogPost createPost(BlogPostRequest request) {
        BlogPost post = BlogPost.builder().build();
        applyPostRequest(post, request);
        post.setCreatedAt(LocalDateTime.now());
        return blogPostRepository.save(post);
    }

    public BlogPost updatePost(String id, BlogPostRequest request) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        applyPostRequest(post, request);
        return blogPostRepository.save(post);
    }

    public BlogPost updatePostStatus(String id, ContentStatus status) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));
        post.setStatus(status);
        if (status == ContentStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        post.setUpdatedAt(LocalDateTime.now());
        return blogPostRepository.save(post);
    }

    public void deletePost(String id) {
        blogPostRepository.deleteById(id);
    }

    public List<MarketingCampaign> getActiveCampaigns() {
        LocalDateTime now = LocalDateTime.now();
        return marketingCampaignRepository.findByStatusOrderByStartAtDescCreatedAtDesc(ContentStatus.PUBLISHED)
                .stream()
                .filter(campaign -> isActive(campaign, now))
                .toList();
    }

    public List<MarketingCampaign> getAllCampaigns() {
        return marketingCampaignRepository.findAll();
    }

    public MarketingCampaign createCampaign(MarketingCampaignRequest request) {
        MarketingCampaign campaign = MarketingCampaign.builder().build();
        applyCampaignRequest(campaign, request);
        campaign.setCreatedAt(LocalDateTime.now());
        return marketingCampaignRepository.save(campaign);
    }

    public MarketingCampaign updateCampaign(String id, MarketingCampaignRequest request) {
        MarketingCampaign campaign = marketingCampaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
        applyCampaignRequest(campaign, request);
        return marketingCampaignRepository.save(campaign);
    }

    public MarketingCampaign updateCampaignStatus(String id, ContentStatus status) {
        MarketingCampaign campaign = marketingCampaignRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Campaign not found"));
        campaign.setStatus(status);
        campaign.setUpdatedAt(LocalDateTime.now());
        return marketingCampaignRepository.save(campaign);
    }

    public void deleteCampaign(String id) {
        marketingCampaignRepository.deleteById(id);
    }

    private void applyBannerRequest(Banner banner, BannerRequest request) {
        banner.setTitle(request.getTitle());
        banner.setSubtitle(request.getSubtitle());
        banner.setImageUrl(request.getImageUrl());
        banner.setLinkUrl(request.getLinkUrl());
        banner.setPosition(request.getPosition());
        banner.setSortOrder(request.getSortOrder());
        banner.setStatus(request.getStatus() == null ? ContentStatus.DRAFT : request.getStatus());
        banner.setUpdatedAt(LocalDateTime.now());
    }

    private void applyPostRequest(BlogPost post, BlogPostRequest request) {
        post.setTitle(request.getTitle());
        post.setSlug(request.getSlug() == null || request.getSlug().isBlank()
                ? slugify(request.getTitle())
                : slugify(request.getSlug()));
        post.setSummary(request.getSummary());
        post.setContent(request.getContent());
        post.setThumbnailUrl(request.getThumbnailUrl());
        post.setCategory(request.getCategory());
        post.setAuthorId(request.getAuthorId());
        post.setStatus(request.getStatus() == null ? ContentStatus.DRAFT : request.getStatus());
        if (post.getStatus() == ContentStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(LocalDateTime.now());
        }
        post.setUpdatedAt(LocalDateTime.now());
    }

    private void applyCampaignRequest(MarketingCampaign campaign, MarketingCampaignRequest request) {
        campaign.setName(request.getName());
        campaign.setDescription(request.getDescription());
        campaign.setCouponCode(request.getCouponCode());
        campaign.setDiscountType(request.getDiscountType());
        campaign.setDiscountValue(request.getDiscountValue());
        campaign.setMinOrderValue(request.getMinOrderValue());
        campaign.setMaxDiscount(request.getMaxDiscount());
        campaign.setUsageLimit(request.getUsageLimit());
        campaign.setStartAt(request.getStartAt());
        campaign.setEndAt(request.getEndAt());
        campaign.setStatus(request.getStatus() == null ? ContentStatus.DRAFT : request.getStatus());
        campaign.setUpdatedAt(LocalDateTime.now());
    }

    private boolean isActive(MarketingCampaign campaign, LocalDateTime now) {
        boolean started = campaign.getStartAt() == null || !campaign.getStartAt().isAfter(now);
        boolean notEnded = campaign.getEndAt() == null || !campaign.getEndAt().isBefore(now);
        return started && notEnded;
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD);
        String withoutAccents = Pattern.compile("\\p{M}")
                .matcher(normalized)
                .replaceAll("");
        return withoutAccents.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
