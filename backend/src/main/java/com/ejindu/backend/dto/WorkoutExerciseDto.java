package com.ejindu.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WorkoutExerciseDto {

    private UUID id;

    @NotBlank
    private String name;

    @NotEmpty
    @Valid
    private List<ExerciseSetDto> sets;

}
