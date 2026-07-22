package com.skillify.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class OnboardingRequest {
    @NotBlank(message = "User type is required")
    private String userType;
    private int age;
    private String bio;
    private List<String> skillsWanted;
    private List<String> skillsOffered;
}
