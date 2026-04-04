package com.pet_care.order_service.event;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BaseEvent<T> {
    String eventId;
    String type;
    LocalDateTime timestamp;
    T data;
}
