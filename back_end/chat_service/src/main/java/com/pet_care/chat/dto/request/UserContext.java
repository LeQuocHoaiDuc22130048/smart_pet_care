package com.pet_care.chat.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Thông tin context của user để bot cá nhân hóa câu trả lời.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserContext {
    private String userName;
    private List<String> petNames;   // tên các thú cưng của user
    private Integer totalOrders;
    private String lastOrderStatus;  // trạng thái đơn hàng gần nhất
}
