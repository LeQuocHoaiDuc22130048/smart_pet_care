package com.pet_care.notification.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailRecipientServiceTest {

    @Mock
    JdbcTemplate jdbcTemplate;

    @InjectMocks
    EmailRecipientService emailRecipientService;

    @Test
    void findGoogleEmailsForNotificationUser_whenEmptyUserId_shouldReturnEmpty() {
        List<String> emails = emailRecipientService.findGoogleEmailsForNotificationUser("");
        assertTrue(emails.isEmpty());
        verifyNoInteractions(jdbcTemplate);
    }

    @Test
    void findGoogleEmailsForNotificationUser_whenNormalUser_shouldQueryUserEmail() {
        String username = "user123";
        when(jdbcTemplate.queryForList(anyString(), eq(String.class), eq(username)))
                .thenReturn(List.of("user123@gmail.com"));

        List<String> emails = emailRecipientService.findGoogleEmailsForNotificationUser(username);

        assertEquals(1, emails.size());
        assertEquals("user123@gmail.com", emails.get(0));
        verify(jdbcTemplate, times(1)).queryForList(anyString(), eq(String.class), eq(username));
    }

    @Test
    void findGoogleEmailsForNotificationUser_whenAdmin_shouldQueryAdminEmails() {
        String username = "ADMIN";
        when(jdbcTemplate.queryForList(anyString(), eq(String.class)))
                .thenReturn(List.of("admin1@gmail.com", "admin2@gmail.com"));

        List<String> emails = emailRecipientService.findGoogleEmailsForNotificationUser(username);

        assertEquals(2, emails.size());
        assertTrue(emails.contains("admin1@gmail.com"));
        assertTrue(emails.contains("admin2@gmail.com"));
        verify(jdbcTemplate, times(1)).queryForList(anyString(), eq(String.class));
    }
}
