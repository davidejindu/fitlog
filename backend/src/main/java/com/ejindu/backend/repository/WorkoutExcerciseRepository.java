package com.ejindu.backend.repository;

import com.ejindu.backend.entity.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WorkoutExcerciseRepository extends JpaRepository<WorkoutExercise, UUID> {
}
