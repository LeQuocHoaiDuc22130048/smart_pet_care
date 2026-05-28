package com.pet_care.cms_marketing.repository;

import com.pet_care.cms_marketing.entity.BlogPost;
import com.pet_care.cms_marketing.enums.ContentStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BlogPostRepository extends MongoRepository<BlogPost, String> {
    Optional<BlogPost> findBySlug(String slug);

    Optional<BlogPost> findBySlugAndStatus(String slug, ContentStatus status);

    List<BlogPost> findByStatusOrderByPublishedAtDescCreatedAtDesc(ContentStatus status);
}
