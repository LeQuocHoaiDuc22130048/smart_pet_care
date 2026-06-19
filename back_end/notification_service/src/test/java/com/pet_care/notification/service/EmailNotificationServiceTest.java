package com.pet_care.notification.service;

import com.pet_care.notification.entity.Notification;
import com.pet_care.notification.enums.NotificationType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailNotificationServiceTest {

    @Mock
    JavaMailSender mailSender;

    @Mock
    EmailRecipientService emailRecipientService;

    @InjectMocks
    EmailNotificationService emailNotificationService;

    @BeforeEach
    void setUp() {
        // Set default configurations for tests
        ReflectionTestUtils.setField(emailNotificationService, "mailEnabled", true);
        ReflectionTestUtils.setField(emailNotificationService, "mailFrom", "test@petcare.com");
    }

    @Test
    void sendIfEligible_whenMailDisabled_shouldNotSend() {
        ReflectionTestUtils.setField(emailNotificationService, "mailEnabled", false);

        Notification notification = Notification.builder()
                .id("noti-123")
                .userId("user-123")
                .title("Test Subject")
                .message("Test Body")
                .type(NotificationType.BOOKING)
                .build();

        emailNotificationService.sendIfEligible(notification);

        verifyNoInteractions(emailRecipientService);
        verifyNoInteractions(mailSender);
    }

    @Test
    void sendIfEligible_whenNoRecipients_shouldNotSend() {
        Notification notification = Notification.builder()
                .id("noti-123")
                .userId("user-123")
                .title("Test Subject")
                .message("Test Body")
                .type(NotificationType.BOOKING)
                .build();

        when(emailRecipientService.findGoogleEmailsForNotificationUser("user-123"))
                .thenReturn(List.of());

        emailNotificationService.sendIfEligible(notification);

        verify(emailRecipientService, times(1)).findGoogleEmailsForNotificationUser("user-123");
        verifyNoInteractions(mailSender);
    }

    @Test
    void sendIfEligible_whenValidRecipients_shouldSendEmail() {
        Notification notification = Notification.builder()
                .id("noti-123")
                .userId("user-123")
                .title("Test Subject")
                .message("Test Body")
                .type(NotificationType.BOOKING)
                .build();

        when(emailRecipientService.findGoogleEmailsForNotificationUser("user-123"))
                .thenReturn(List.of("recipient1@gmail.com", "recipient2@gmail.com"));

        emailNotificationService.sendIfEligible(notification);

        verify(emailRecipientService, times(1)).findGoogleEmailsForNotificationUser("user-123");
        
        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(2)).send(messageCaptor.capture());

        List<SimpleMailMessage> sentMessages = messageCaptor.getAllValues();
        assertEquals(2, sentMessages.size());

        SimpleMailMessage firstMsg = sentMessages.get(0);
        assertEquals("test@petcare.com", firstMsg.getFrom());
        assertEquals("recipient1@gmail.com", firstMsg.getTo()[0]);
        assertEquals("[PetCare] Test Subject", firstMsg.getSubject());
        assertEquals("Test Body", firstMsg.getText());

        SimpleMailMessage secondMsg = sentMessages.get(1);
        assertEquals("recipient2@gmail.com", secondMsg.getTo()[0]);
    }
}
