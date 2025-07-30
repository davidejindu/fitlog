package com.ejindu.backend.dto;

import com.ejindu.backend.entity.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkoutDto {


    private UUID id;

    private String notes;

    @NotBlank
    private String name;

    @NonNull
    private LocalDate date;

    @NotEmpty
    @Valid
    private List<WorkoutExerciseDto> exercises;

}
