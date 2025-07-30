package com.ejindu.backend.mapper;

import com.ejindu.backend.dto.UserDto;
import com.ejindu.backend.entity.User;

public class UserMapper {

    public static UserDto mapUserToUserDto(User user) {
        if(user == null) {return null;}
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();

    }

    public static User mapUserDtoToUser(UserDto userDto) {
        if(userDto == null) {return null;}
        return User.builder()
                .id(userDto.getId())
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .email(userDto.getEmail())
                .role(userDto.getRole())
                .build();
    }
}
