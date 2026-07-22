package com.skillify.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.skillify.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,https://quidproknow.vercel.app}")
    private String allowedOrigins;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri:https://close-asp-5.clerk.accounts.dev}")
    private String issuerUri;

    @Bean
    public org.springframework.security.oauth2.jwt.JwtDecoder jwtDecoder() {
        return org.springframework.security.oauth2.jwt.NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/sync").authenticated()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/contact").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.jwtAuthenticationConverter(customJwtAuthenticationConverter()))
            );

        return http.build();
    }

    public Converter<Jwt, ? extends AbstractAuthenticationToken> customJwtAuthenticationConverter() {
        return jwt -> {
            String clerkId = jwt.getSubject();
            try {
                UserDetails userDetails = userDetailsService.loadUserByClerkId(clerkId);
                return new UsernamePasswordAuthenticationToken(userDetails, jwt, userDetails.getAuthorities());
            } catch (UsernameNotFoundException ex) {
                // User not yet synced, return standard Jwt token
                JwtAuthenticationConverter defaultConverter = new JwtAuthenticationConverter();
                return defaultConverter.convert(jwt);
            } catch (Exception ex) {
                System.err.println("CRITICAL ERROR IN SecurityConfig: customJwtAuthenticationConverter threw an exception!");
                ex.printStackTrace();
                throw ex;
            }
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(allowedOrigins.split(",")).stream().map(String::trim).toList());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
