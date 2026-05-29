package com.pet_care.notification.service;

import com.pet_care.notification.entity.Notification;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailNotificationService {
    final JavaMailSender mailSender;
    final EmailRecipientService emailRecipientService;

    @Value("${app.mail.enabled:false}")
    boolean mailEnabled;

    @Value("${app.mail.from:}")
    String mailFrom;

    public void sendIfEligible(Notification notification) {
        if (!mailEnabled || notification == null) {
            return;
        }

        List<String> recipients = emailRecipientService.findGoogleEmailsForNotificationUser(notification.getUserId());
        if (recipients.isEmpty()) {
            return;
        }

        for (String recipient : recipients) {
            send(notification, recipient);
        }
    }

    private void send(Notification notification, String recipient) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            if (StringUtils.hasText(mailFrom)) {
                message.setFrom(mailFrom);
            }
            message.setTo(recipient);
            message.setSubject("[PetCare] " + notification.getTitle());
            message.setText(notification.getMessage());
            mailSender.send(message);
            log.info("Sent notification email {} to {}", notification.getId(), recipient);
        } catch (Exception exception) {
            log.warn("Could not send notification email {} to {}: {}",
                    notification.getId(), recipient, exception.getMessage());
        }
    }
}
