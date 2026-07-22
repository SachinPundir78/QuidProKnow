package com.skillify.chat.config;

import com.skillify.security.CustomUserDetailsService;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Validates the JWT token on every STOMP CONNECT frame.
 * If the token is missing or invalid the connection is refused.
 * Subsequent frames on the same session are trusted (principal already set).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null) return message;

        // Only validate on CONNECT; subsequent frames inherit the principal
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new IllegalArgumentException("WebSocket connection requires a valid JWT token.");
            }

            String token = authHeader.substring(7);
            try {
                org.springframework.security.oauth2.jwt.Jwt jwt = jwtDecoder.decode(token);
                String clerkId = jwt.getSubject();
                UserDetails userDetails = userDetailsService.loadUserByClerkId(clerkId);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, jwt, userDetails.getAuthorities());
                accessor.setUser(auth);
                log.debug("WebSocket authenticated: {}", clerkId);
            } catch (Exception e) {
                throw new IllegalArgumentException("WebSocket auth failed: " + e.getMessage());
            }
        }

        return message;
    }
}
