package com.pet_care.commerce.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class LegacyServicePrefixForwardingFilter extends OncePerRequestFilter {

    private static final String CART_PREFIX = "/pet_care_cart";
    private static final String ORDER_PREFIX = "/pet_care_order";
    private static final String PAYMENT_PREFIX = "/pet_care_payment";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        String forwardedPath = stripLegacyPrefix(path);

        if (forwardedPath != null) {
            String query = request.getQueryString();
            request.getRequestDispatcher(forwardedPath + (query == null ? "" : "?" + query))
                    .forward(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String stripLegacyPrefix(String path) {
        if (path.equals(CART_PREFIX) || path.equals(ORDER_PREFIX) || path.equals(PAYMENT_PREFIX)) {
            return "/";
        }
        if (path.startsWith(CART_PREFIX + "/")) {
            return path.substring(CART_PREFIX.length());
        }
        if (path.startsWith(ORDER_PREFIX + "/")) {
            return path.substring(ORDER_PREFIX.length());
        }
        if (path.startsWith(PAYMENT_PREFIX + "/")) {
            return path.substring(PAYMENT_PREFIX.length());
        }
        return null;
    }
}
