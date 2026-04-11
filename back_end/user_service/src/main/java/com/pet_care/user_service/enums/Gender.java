package com.pet_care.user_service.enums;

import lombok.Getter;

@Getter
public enum Gender {
	MALE("Đực"),
	FEMALE("Cái");

	private final String displayName;

	Gender(String displayName) {
		this.displayName = displayName;
	}
}

