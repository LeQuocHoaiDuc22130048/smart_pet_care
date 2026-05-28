package com.pet_care.account.configuration;

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

    private static final String IDENTITY_PREFIX = "/pet_care_identity";
    private static final String USER_PREFIX = "/pet_care_user";

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
        if (path.equals(IDENTITY_PREFIX) || path.equals(USER_PREFIX)) {
            return "/";
        }
        if (path.startsWith(IDENTITY_PREFIX + "/")) {
            return path.substring(IDENTITY_PREFIX.length());
        }
        if (path.startsWith(USER_PREFIX + "/")) {
            return path.substring(USER_PREFIX.length());
        }
        return null;
    }
}
