package com.skillify.service;

import com.skillify.entity.Session;
import com.skillify.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@quidproknow.com}")
    private String fromEmail;

    public void sendSessionAcceptedEmail(User recipient, Session session, User provider) {
        if (!StringUtils.hasText(recipient.getEmail())) return;

        String meetingLink = session.getMeetingLink() != null ? session.getMeetingLink() : "Link will be shared in chat.";
        String gCalLink = generateGoogleCalendarLink(session);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(recipient.getEmail());
        message.setSubject("Your QuidProKnow Session was Accepted!");
        
        String body = String.format(
                "Hello %s,\n\nGreat news! Your session request for \"%s\" has been accepted by %s.\n\n" +
                "Session Time: %s\n" +
                "Meeting Link: %s\n\n" +
                "You can add this directly to your Google Calendar by clicking the link below:\n%s\n\n" +
                "Happy learning!\nThe QuidProKnow Team",
                recipient.getName(),
                session.getSkill(),
                provider.getName(),
                session.getScheduledTime().replace("T", " "),
                meetingLink,
                gCalLink
        );

        message.setText(body);
        sendSafely(message);
    }

    public void sendSessionReminderEmail(User recipient, Session session, int minutesBefore) {
        if (!StringUtils.hasText(recipient.getEmail())) return;

        String meetingLink = session.getMeetingLink() != null ? session.getMeetingLink() : "Check your chat for the link.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(recipient.getEmail());
        message.setSubject("Reminder: QuidProKnow Session in " + minutesBefore + " minutes!");
        
        String body = String.format(
                "Hello %s,\n\nThis is a friendly reminder that your session for \"%s\" is starting in %d minutes!\n\n" +
                "Meeting Link: %s\n\n" +
                "Get ready!\nThe QuidProKnow Team",
                recipient.getName(),
                session.getSkill(),
                minutesBefore,
                meetingLink
        );

        message.setText(body);
        sendSafely(message);
    }

    private void sendSafely(SimpleMailMessage message) {
        try {
            mailSender.send(message);
            log.info("Successfully sent email to: {}", (Object) message.getTo());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", message.getTo(), e.getMessage());
        }
    }

    private String generateGoogleCalendarLink(Session session) {
        try {
            LocalDateTime start = LocalDateTime.parse(session.getScheduledTime(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            LocalDateTime end = start.plusHours(1); // Default to 1-hour session

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss");
            String dates = start.format(formatter) + "/" + end.format(formatter);

            String text = URLEncoder.encode("QuidProKnow Session: " + session.getSkill(), StandardCharsets.UTF_8);
            String details = URLEncoder.encode("Meeting Link: " + (session.getMeetingLink() != null ? session.getMeetingLink() : "Check chat"), StandardCharsets.UTF_8);

            return String.format("https://calendar.google.com/calendar/render?action=TEMPLATE&text=%s&dates=%s&details=%s", text, dates, details);
        } catch (Exception e) {
            log.warn("Could not generate Google Calendar link for session {}", session.getId());
            return "";
        }
    }
}
