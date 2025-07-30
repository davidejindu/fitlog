package com.ejindu.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ejindu.backend.dto.WorkoutDto;
import com.ejindu.backend.entity.ExerciseSet;
import com.ejindu.backend.entity.User;
import com.ejindu.backend.entity.Workout;
import com.ejindu.backend.entity.WorkoutExercise;
import com.ejindu.backend.mapper.WorkoutMapper;
import com.ejindu.backend.repository.WorkoutRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Transactional
@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    public WorkoutDto createWorkout(WorkoutDto workoutDto, User user) {
        Workout workoutEntity = WorkoutMapper.toEntity(workoutDto, user);
        Workout savedWorkout = workoutRepository.save(workoutEntity);
        WorkoutDto result = WorkoutMapper.toDto(savedWorkout);
        return result;
    }

    public List<WorkoutDto> getWorkoutsBetween(User user, LocalDate from, LocalDate to) {
        return workoutRepository.findByUserAndDateBetween(user, from, to).stream()
                .map(WorkoutMapper::toDto)
                .toList();
    }

    public void deleteWorkout(UUID workoutId, User user) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new EntityNotFoundException("Workout not found"));
        if (!workout.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Not your workout");
        }

        workoutRepository.delete(workout);
    }

    public WorkoutDto updateWorkout(UUID id, WorkoutDto dto, User owner) {

        Workout existing = workoutRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!existing.getUser().getId().equals(owner.getId())) {
            throw new AccessDeniedException("Not your workout");
        }

        // Update workout
        existing.setName(dto.getName());
        existing.setDate(dto.getDate());
        existing.setNotes(dto.getNotes());

        // Clear and recreate exercises
        existing.getExercises().clear();
        List<WorkoutExercise> exercises = dto.getExercises().stream()
                .map(exDto -> {
                    WorkoutExercise exercise = WorkoutExercise.builder()
                            .name(exDto.getName())
                            .workout(existing)
                            .build();

                    List<ExerciseSet> sets = exDto.getSets().stream()
                            .map(setDto -> ExerciseSet.builder()
                                    .reps(setDto.getReps())
                                    .weightLbs(setDto.getWeightLbs())
                                    .workoutExercise(exercise)
                                    .build())
                            .toList();

                    exercise.setSets(sets);
                    return exercise;
                })
                .toList();

        existing.setExercises(exercises);

        Workout saved = workoutRepository.save(existing);
        return WorkoutMapper.toDto(saved);
    }
}
