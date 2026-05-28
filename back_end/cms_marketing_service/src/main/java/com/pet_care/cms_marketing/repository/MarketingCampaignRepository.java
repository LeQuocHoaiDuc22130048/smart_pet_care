package com.pet_care.cms_marketing.repository;

import com.pet_care.cms_marketing.entity.MarketingCampaign;
import com.pet_care.cms_marketing.enums.ContentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MarketingCampaignRepository extends MongoRepository<MarketingCampaign, String> {
    Optional<MarketingCampaign> findByCouponCode(String couponCode);

    List<MarketingCampaign> findByStatusOrderByStartAtDescCreatedAtDesc(ContentStatus status);
}
