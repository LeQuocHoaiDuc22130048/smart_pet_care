package com.pet_care.cms_marketing.repository;

import com.pet_care.cms_marketing.entity.Banner;
import com.pet_care.cms_marketing.enums.ContentStatus;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BannerRepository extends MongoRepository<Banner, String> {
    List<Banner> findByStatusOrderBySortOrderAscCreatedAtDesc(ContentStatus status);

    List<Banner> findByPositionAndStatusOrderBySortOrderAscCreatedAtDesc(String position, ContentStatus status);
}
