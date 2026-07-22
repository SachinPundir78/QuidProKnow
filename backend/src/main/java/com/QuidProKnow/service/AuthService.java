package com.skillify.service;

import com.skillify.dto.*;
import com.skillify.entity.*;
import com.skillify.exception.ApiException;
import com.skillify.repository.UserRepository;
import com.skillify.repository.UserSkillRepository;
import com.skillify.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final NotificationService notificationService;

    @Transactional
    public UserDTO syncClerkUser(RegisterRequest req, String clerkId) {
        
        // If user already exists, just return their profile
        var existingUser = userRepository.findByClerkId(clerkId);
        if (existingUser.isPresent()) {
            return UserDTO.from(existingUser.get());
        }
        
        // Check if email already used by a non-clerk legacy account
        if (userRepository.existsByEmail(req.getEmail())) {
            // We could merge them, but for simplicity we throw an exception or update the clerkId.
            // Let's just update the clerkId of the existing legacy account to seamlessly migrate them!
            User legacyUser = userRepository.findByEmail(req.getEmail()).get();
            legacyUser.setClerkId(clerkId);
            userRepository.save(legacyUser);
            return UserDTO.from(legacyUser);
        }

        UserType userType = UserType.valueOf(req.getUserType());
        if (userType == UserType.BARTER_USER &&
                (req.getSkillsOffered() == null || req.getSkillsOffered().isEmpty())) {
            throw new ApiException("Barter users must specify at least one skill they offer.", HttpStatus.BAD_REQUEST);
        }

        User user = User.builder()
                .clerkId(clerkId)
                .name(req.getName())
                .email(req.getEmail())
                .password("clerk-managed-account") // Added to bypass DB constraint
                .age(req.getAge())
                .bio(req.getBio())
                .userType(userType)
                .points(userType == UserType.LEARNER ? 100 : 50)
                .totalRatingSum(0)
                .totalRatings(0)
                .badge("NONE")
                .onboarded(false)
                .skills(new ArrayList<>())
                .build();

        user = userRepository.save(user);

        addSkillsToUser(user, req.getSkillsWanted(), SkillType.WANT);
        if (req.getSkillsOffered() != null) {
            addSkillsToUser(user, req.getSkillsOffered(), SkillType.OFFER);
        }
        
        notificationService.notify(user, "Welcome to QuidProKnow! You have received " + user.getPoints() + " points.");

        return UserDTO.from(user);
    }

    private void addSkillsToUser(User user, List<String> skillNames, SkillType type) {
        if (skillNames == null) return;
        for (String name : skillNames) {
            if (name != null && !name.isBlank()) {
                UserSkill skill = UserSkill.builder()
                        .user(user)
                        .skillName(name.trim())
                        .type(type)
                        .build();
                skill = userSkillRepository.save(skill);
                // Add directly to the in-memory collection so the same Hibernate-cached
                // User entity reflects the change — avoids stale 1st-level cache on findById.
                user.getSkills().add(skill);
            }
        }
    }

    @Transactional
    public UserDTO onboardUser(OnboardingRequest req, String clerkId) {
        User user = userRepository.findByClerkId(clerkId)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));

        UserType userType = UserType.valueOf(req.getUserType());
        if (userType == UserType.BARTER_USER &&
                (req.getSkillsOffered() == null || req.getSkillsOffered().isEmpty())) {
            throw new ApiException("Barter users must specify at least one skill they offer.", HttpStatus.BAD_REQUEST);
        }

        user.setUserType(userType);
        user.setAge(req.getAge());
        user.setBio(req.getBio());
        user.setPoints(userType == UserType.LEARNER ? 100 : 50);
        user.setOnboarded(true);

        // Clear existing skills and add new ones
        user.getSkills().clear();
        addSkillsToUser(user, req.getSkillsWanted(), SkillType.WANT);
        if (req.getSkillsOffered() != null) {
            addSkillsToUser(user, req.getSkillsOffered(), SkillType.OFFER);
        }

        user = userRepository.save(user);
        return UserDTO.from(user);
    }
}