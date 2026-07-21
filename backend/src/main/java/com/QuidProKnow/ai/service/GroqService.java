package com.skillify.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

/**
 * Calls the Groq API with a compact prompt to minimise token consumption.
 * Score/strengths/weaknesses/suggestions are already computed by the rule engine;
 * Groq only adds human-readable narrative (≤150 words).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GroqService {

    @Value("${groq.api.key:}")
    private String groqApiKey;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private String getApiKey() {
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            return geminiApiKey.trim();
        }
        return groqApiKey;
    }

    private String getUrl() {
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            return "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        }
        return "https://api.groq.com/openai/v1/chat/completions";
    }

    private String getModel() {
        if (geminiApiKey != null && !geminiApiKey.trim().isEmpty()) {
            return "gemini-1.5-flash";
        }
        return "llama-3.3-70b-versatile";
    }

    /**
     * Generates a short personalised feedback paragraph from the rule-based findings.
     *
     * @return AI feedback text, or a safe fallback message on failure
     */
    public String generateFeedback(int score,
                                   List<String> strengths,
                                   List<String> weaknesses,
                                   List<String> suggestions) {
        String prompt = buildPrompt(score, strengths, weaknesses, suggestions);
        try {
            return callGroq(prompt);
        } catch (Exception e) {
            log.error("Groq API call failed: {}", e.getMessage());
            return buildFallbackFeedback(score, strengths, weaknesses);
        }
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private String buildPrompt(int score, List<String> strengths,
                               List<String> weaknesses, List<String> suggestions) {
        // Deliberately compact to minimise tokens
        return """
                You are a career mentor on a skill-exchange platform. \
                Write a profile review in ≤120 words covering: \
                1) one-line summary  2) top strength  3) most important improvement  4) single next action. \
                Be specific, encouraging, professional. No bullet points—prose only.
                
                Score: %d/100
                Strengths: %s
                Weaknesses: %s
                Top suggestion: %s
                """.formatted(
                score,
                strengths.isEmpty() ? "none yet" : String.join(", ", strengths),
                weaknesses.isEmpty() ? "none" : String.join(", ", weaknesses),
                suggestions.isEmpty() ? "keep improving" : suggestions.get(0)
        );
    }

    private String callGroq(String userPrompt) throws Exception {
        String activeApiKey = getApiKey();
        if (activeApiKey == null || activeApiKey.trim().isEmpty()) {
            throw new IllegalStateException("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured.");
        }

        var body = objectMapper.writeValueAsString(new GroqRequest(
                getModel(),
                150,          // max_tokens — hard cap keeps costs minimal
                0.5f,         // lower temperature = less rambling
                List.of(new Message("user", userPrompt))
        ));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(getUrl()))
                .timeout(Duration.ofSeconds(20))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + activeApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("AI service returned HTTP {}: {}", response.statusCode(), response.body());
            throw new RuntimeException("AI API error: HTTP " + response.statusCode());
        }

        JsonNode root = objectMapper.readTree(response.body());
        return root.path("choices").get(0).path("message").path("content").asText().trim();
    }

    private String buildFallbackFeedback(int score, List<String> strengths, List<String> weaknesses) {
        String level = score >= 75 ? "strong" : score >= 50 ? "solid" : "developing";
        String topStrength = strengths.isEmpty() ? "your commitment to learning" : strengths.get(0).toLowerCase();
        String topWeakness = weaknesses.isEmpty() ? "continue building" : "address: " + weaknesses.get(0).toLowerCase();
        return "Your profile shows a %s foundation with a score of %d/100. Your highlight is %s. To grow further, %s. Keep engaging with the community to boost your credibility and attract more skill exchange partners."
                .formatted(level, score, topStrength, topWeakness);
    }

    // ── Inner records for JSON serialisation ────────────────────────────

    private record GroqRequest(String model, int max_tokens, float temperature, List<Message> messages) {}
    private record Message(String role, String content) {}
}
