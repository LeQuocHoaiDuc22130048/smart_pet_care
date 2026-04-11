package com.pet_care.user_service.entity;

import jakarta.persistence.*;
import lombok.*;

@Table(name = "user_addresses")
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    String id;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "recipient_name")
    String recipientName;

    @Column(name = "recipient_phone")
    String phone;

    String province;
    String district;
    String ward;

    @Column(name = "street_details")
    String streetDetails;

    @Column(name = "is_default")
    Boolean isDefault;
}
