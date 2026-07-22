package com.skillify.security;

import com.skillify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("No user with email: " + email));
    }

    public UserDetails loadUserByClerkId(String clerkId) throws UsernameNotFoundException {
        return userRepository.findByClerkId(clerkId)
                .map(UserPrincipal::new)
                .orElseThrow(() -> new UsernameNotFoundException("No user with clerkId: " + clerkId));
    }
}
