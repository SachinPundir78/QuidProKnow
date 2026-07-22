package com.skillify.service;

import com.skillify.dto.ContactMessageRequest;
import com.skillify.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class ContactService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.from:sachinpundir0078@gmail.com}")
    private String fromEmail;

    @Value("${app.contact.recipient:sachinpundir0078@gmail.com}")
    private String recipientEmail;

    public void send(ContactMessageRequest request) {
        if (!StringUtils.hasText(fromEmail) || !StringUtils.hasText(recipientEmail)) {
            throw new ApiException("Contact email is not configured yet.", HttpStatus.SERVICE_UNAVAILABLE);
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(recipientEmail);
        message.setReplyTo(request.getEmail().trim());
        message.setSubject("New QuidProKnow contact message");
        message.setText("Name: " + request.getName().trim()
                + "\nEmail: " + request.getEmail().trim()
                + "\n\nMessage:\n" + request.getMessage().trim());
        try {
            mailSender.send(message);
        } catch (Exception ex) {
            throw new ApiException("We could not send your message. Please try again later.", HttpStatus.BAD_GATEWAY);
        }
    }
}
