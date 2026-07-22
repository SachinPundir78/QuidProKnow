package com.skillify.controller;

import com.skillify.dto.AuthResponse;
import com.skillify.dto.LoginRequest;
import com.skillify.dto.RegisterRequest;
import com.skillify.dto.UserDTO;
import com.skillify.security.SecurityUtils;
import com.skillify.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/sync")
    public ResponseEntity<UserDTO> syncUser(
            @Valid @RequestBody RegisterRequest req,
            org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(authService.syncClerkUser(req, extractClerkId(auth)));
    }

    @PutMapping("/onboard")
    public ResponseEntity<UserDTO> onboardUser(
            @Valid @RequestBody com.skillify.dto.OnboardingRequest req,
            org.springframework.security.core.Authentication auth) {
        return ResponseEntity.ok(authService.onboardUser(req, extractClerkId(auth)));
    }

    private String extractClerkId(org.springframework.security.core.Authentication auth) {
        if (auth == null) {
            throw new com.skillify.exception.ApiException("Unauthorized: Missing security token", org.springframework.http.HttpStatus.UNAUTHORIZED);
        }
        if (auth instanceof org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getSubject();
        } else if (auth.getPrincipal() instanceof com.skillify.security.UserPrincipal userPrincipal) {
            return userPrincipal.getUser().getClerkId();
        } else if (auth.getCredentials() instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            return jwt.getSubject();
        } else if (auth.getPrincipal() instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
            return jwt.getSubject();
        }
        throw new com.skillify.exception.ApiException("Unauthorized or invalid token type", org.springframework.http.HttpStatus.UNAUTHORIZED);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> profile() {
        return ResponseEntity.ok(UserDTO.from(SecurityUtils.currentUser()));
    }
}
