package com.ejindu.backend.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ejindu.backend.entity.Workout;
import com.ejindu.backend.entity.WorkoutAnalysis;

public interface WorkoutAnalysisRepository extends JpaRepository<WorkoutAnalysis, UUID> {

    Optional<WorkoutAnalysis> findByWorkout(Workout workout);

    boolean existsByWorkout(Workout workout);
}