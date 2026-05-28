package com.pet_care.user_service.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddressRequest {

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
