package com.pet_care.notification.service;

import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EmailRecipientService {
    JdbcTemplate jdbcTemplate;

    public List<String> findGoogleEmailsForNotificationUser(String notificationUserId) {
        if (!StringUtils.hasText(notificationUserId)) {
            return List.of();
        }

        try {
            if (NotificationService.ADMIN_AUDIENCE.equals(notificationUserId)) {
                return findGoogleAdminEmails();
            }
            return findGoogleUserEmail(notificationUserId);
        } catch (Exception exception) {
            log.warn("Could not resolve email recipients for {}: {}", notificationUserId, exception.getMessage());
            return List.of();
        }
    }

    private List<String> findGoogleUserEmail(String username) {
        return jdbcTemplate.queryForList("""
                SELECT email
                FROM users
                WHERE username = ?
                  AND auth_provider = 'GOOGLE'
                  AND email IS NOT NULL
                  AND email <> ''
                  AND is_active = 1
                """, String.class, username);
    }

    private List<String> findGoogleAdminEmails() {
        return jdbcTemplate.queryForList("""
                SELECT DISTINCT u.email
                FROM users u
                JOIN users_roles ur ON ur.user_id = u.id
                WHERE ur.roles_name = 'ADMIN'
                  AND u.auth_provider = 'GOOGLE'
                  AND u.email IS NOT NULL
                  AND u.email <> ''
                  AND u.is_active = 1
                """, String.class);
    }
}
