package com.pet_care.notification.repository;

import com.pet_care.notification.entity.Notification;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdInOrderByCreatedAtDesc(List<String> userIds);

    List<Notification> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);

    List<Notification> findByUserIdInAndReadFalseOrderByCreatedAtDesc(List<String> userIds);

    long countByUserIdAndReadFalse(String userId);

    long countByUserIdInAndReadFalse(List<String> userIds);
}
