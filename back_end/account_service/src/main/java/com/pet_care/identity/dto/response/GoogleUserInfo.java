package com.pet_care.identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Google User Information extracted from ID Token
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleUserInfo {
    String googleId;      // sub claim
    String email;
    Boolean emailVerified;
    String name;
    String givenName;     // firstName
    String familyName;    // lastName
    String picture;       // avatar URL
    String locale;
}
