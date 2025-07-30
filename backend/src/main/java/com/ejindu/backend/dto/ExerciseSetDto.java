package com.ejindu.backend.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExerciseSetDto {

    private UUID id;

    @Min(1)
    private int reps;

    @Min(0)
    private int weightLbs;

}
