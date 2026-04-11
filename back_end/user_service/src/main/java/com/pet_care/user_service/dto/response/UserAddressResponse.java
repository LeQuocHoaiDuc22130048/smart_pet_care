package com.pet_care.user_service.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddressResponse {

    private String id;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("recipient_name")
    private String recipientName;

    private String phone;

    private String province;

    private String district;

    private String ward;

    @JsonProperty("street_details")
    private String streetDetails;

    @JsonProperty("is_default")
    private Boolean isDefault;
}
