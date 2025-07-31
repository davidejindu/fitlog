package com.ejindu.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ejindu.backend.dto.UserDto;
import com.ejindu.backend.entity.User;
import com.ejindu.backend.mapper.UserMapper;
import com.ejindu.backend.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Authentication auth) {
        User user = (User) auth.getPrincipal();
        UserDto userDto = UserMapper.mapUserToUserDto(user);
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            @Valid @RequestBody UserDto userDto,
            Authentication auth) {
        User currentUser = (User) auth.getPrincipal();

        // Update only the allowed fields
        currentUser.setFirstName(userDto.getFirstName());
        currentUser.setLastName(userDto.getLastName());

        User savedUser = userRepository.save(currentUser);
        UserDto updatedUserDto = UserMapper.mapUserToUserDto(savedUser);

        return ResponseEntity.ok(updatedUserDto);
    }

    @DeleteMapping("/account")
    public ResponseEntity<String> deleteAccount(Authentication auth) {
        User user = (User) auth.getPrincipal();
        userRepository.delete(user);
        return ResponseEntity.ok("Account deleted successfully");
    }
}