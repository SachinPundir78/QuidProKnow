package com.skillify.controller;

import com.skillify.dto.ContactMessageRequest;
import com.skillify.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<Map<String, String>> send(@Valid @RequestBody ContactMessageRequest request) {
        contactService.send(request);
        return ResponseEntity.ok(Map.of("message", "Your message has been sent."));
    }
}
