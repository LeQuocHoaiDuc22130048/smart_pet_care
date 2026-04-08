package com.pet_care.payment_service.gateway;

import com.pet_care.payment_service.configuration.VNPayConfig;
import com.pet_care.payment_service.entity.Payment;
import com.pet_care.payment_service.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class VNPayGateway implements PaymentGateway {
    @Override
    public String createPaymentUrl(Payment payment) {
        Map<String, String> params = new HashMap<>();

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", VNPayConfig.TMN_CODE);
        params.put("vnp_Amount", payment.getAmount().multiply(BigDecimal.valueOf(100)).toString());
        params.put("vnp_TxnRef", payment.getId());
        params.put("vnp_OrderInfo", "Thanh toan don hang");
        params.put("vnp_ReturnUrl", VNPayConfig.RETURN_URL);
        params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        String query = buildQuery(params);
        String hash = hmacSHA512(VNPayConfig.SECRET_KEY, query);

        return VNPayConfig.PAY_URL + "?" + query + "&vnp_SecureHash=" + hash;
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes());
            return HexFormat.of().formatHex(bytes);
        } catch (Exception e){
            throw new RuntimeException(e);
        }
    }

    private String buildQuery(Map<String, String> params) {
        return params.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }

    @Override
    public PaymentStatus handleCallback(Map<String, String> params) {
        return null;
    }
}
