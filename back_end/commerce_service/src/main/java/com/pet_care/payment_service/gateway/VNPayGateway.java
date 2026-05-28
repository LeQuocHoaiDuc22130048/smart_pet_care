package com.pet_care.payment_service.gateway;

import com.pet_care.payment_service.configuration.VNPayConfig;
import com.pet_care.payment_service.exception.AppException;
import com.pet_care.payment_service.exception.ErrorCode;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Primary
@Component
@RequiredArgsConstructor
public class VNPayGateway implements PaymentGateway {
    private static final String VERSION = "2.1.0";
    private static final DateTimeFormatter VNPAY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final VNPayConfig config;

    @Override
    public String initiatePayment(String transactionId, BigDecimal amount, String description, String ignoredReturnUrl) {
        requireConfiguration();
        LocalDateTime now = LocalDateTime.now(VIETNAM_ZONE);
        SortedMap<String, String> params = new TreeMap<>();
        params.put("vnp_Amount", amount.movePointRight(2).toBigIntegerExact().toString());
        params.put("vnp_Command", "pay");
        params.put("vnp_CreateDate", now.format(VNPAY_DATE_FORMAT));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_ExpireDate", now.plusMinutes(15).format(VNPAY_DATE_FORMAT));
        params.put("vnp_IpAddr", "127.0.0.1");
        params.put("vnp_Locale", "vn");
        params.put("vnp_OrderInfo", sanitizeOrderInfo(description));
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", config.getReturnUrl());
        params.put("vnp_TmnCode", config.getTmnCode());
        params.put("vnp_TxnRef", transactionId);
        params.put("vnp_Version", VERSION);

        String query = encodedQuery(params);
        return config.getPayUrl() + "?" + query + "&vnp_SecureHash=" + hmacSha512(query);
    }

    public boolean verifySignature(Map<String, String> callbackParams) {
        requireConfiguration();
        String receivedSignature = callbackParams.get("vnp_SecureHash");
        if (receivedSignature == null || receivedSignature.isBlank()) {
            return false;
        }
        SortedMap<String, String> signedParams = new TreeMap<>();
        callbackParams.forEach((key, value) -> {
            if (key.startsWith("vnp_") && !"vnp_SecureHash".equals(key) && !"vnp_SecureHashType".equals(key)) {
                signedParams.put(key, value);
            }
        });
        byte[] expected = hmacSha512(encodedQuery(signedParams)).getBytes(StandardCharsets.UTF_8);
        byte[] actual = receivedSignature.getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    @Override
    public boolean verifyPayment(String transactionId) {
        return false;
    }

    @Override
    public boolean refund(String transactionId) {
        return false;
    }

    private String encodedQuery(Map<String, String> params) {
        return params.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String sanitizeOrderInfo(String description) {
        String source = description == null || description.isBlank() ? "Thanh toan don hang" : description;
        String ascii = Normalizer.normalize(source, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D');
        String sanitized = ascii.replaceAll("[^A-Za-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
        return sanitized.isBlank() ? "Thanh toan don hang" : sanitized;
    }

    private String hmacSha512(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(config.getSecretKey().getBytes(StandardCharsets.UTF_8), "HmacSHA512"));
            byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(bytes.length * 2);
            for (byte value : bytes) {
                result.append(String.format("%02x", value));
            }
            return result.toString();
        } catch (Exception exception) {
            throw new AppException(ErrorCode.PAYMENT_PROCESSING_FAILED);
        }
    }

    private void requireConfiguration() {
        if (config.getTmnCode() == null
                || config.getTmnCode().isBlank()
                || config.getSecretKey() == null
                || config.getSecretKey().isBlank()) {
            throw new AppException(ErrorCode.PAYMENT_PROCESSING_FAILED);
        }
    }
}
