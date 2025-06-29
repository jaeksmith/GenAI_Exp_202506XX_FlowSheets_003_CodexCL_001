package com.example.flowsheets.config;

import com.example.flowsheets.config.UserRecord;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import java.io.InputStream;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(ResourceLoader resourceLoader,
                                                 PasswordEncoder encoder) throws Exception {
        Resource resource = resourceLoader.getResource("classpath:users.json");
        try (InputStream is = resource.getInputStream()) {
            List<UserRecord> users = new ObjectMapper()
                .readValue(is, new TypeReference<List<UserRecord>>() {});
            InMemoryUserDetailsManager manager = new InMemoryUserDetailsManager();
            for (UserRecord u : users) {
                manager.createUser(User.withUsername(u.getUsername())
                    .password(u.getBcryptHash())
                    .roles(u.getRoles().toArray(new String[0]))
                    .build());
            }
            return manager;
        }
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
            .formLogin(Customizer.withDefaults())
            .logout(Customizer.withDefaults());
        return http.build();
    }
}