package com.pet_care.booking.mapper;

import com.pet_care.booking.dto.response.BookingResponse;
import com.pet_care.booking.entity.Booking;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ServicePackageMapper.class, StaffMapper.class})
public interface BookingMapper {
    BookingResponse toResponse(Booking booking);
}
