package com.ejindu.backend.mapper;

import java.util.List;

import com.ejindu.backend.dto.ExerciseSetDto;
import com.ejindu.backend.dto.WorkoutDto;
import com.ejindu.backend.dto.WorkoutExerciseDto;
import com.ejindu.backend.entity.ExerciseSet;
import com.ejindu.backend.entity.User;
import com.ejindu.backend.entity.Workout;
import com.ejindu.backend.entity.WorkoutExercise;

public class WorkoutMapper {

        public static Workout toEntity(WorkoutDto dto, User owner) {
                Workout workout = Workout.builder()
                                .id(dto.getId())
                                .name(dto.getName())
                                .date(dto.getDate())
                                .user(owner)
                                .notes(dto.getNotes())
                                .build();

                List<WorkoutExercise> exercises = dto.getExercises().stream()
                                .map(exDto -> {
                                        WorkoutExercise exercise = WorkoutExercise.builder()
                                                        .id(exDto.getId())
                                                        .name(exDto.getName())
                                                        .workout(workout)
                                                        .build();

                                        List<ExerciseSet> sets = exDto.getSets().stream()
                                                        .map(setDto -> ExerciseSet.builder()
                                                                        .id(setDto.getId())
                                                                        .reps(setDto.getReps())
                                                                        .weightLbs(setDto.getWeightLbs())
                                                                        .workoutExercise(exercise)
                                                                        .build())
                                                        .toList();

                                        exercise.setSets(sets);
                                        return exercise;
                                }).toList();

                workout.setExercises(exercises);
                return workout;
        }

        public static WorkoutDto toDto(Workout workout) {
                return WorkoutDto.builder()
                                .id(workout.getId())
                                .name(workout.getName())
                                .date(workout.getDate())
                                .notes(workout.getNotes())
                                .exercises(
                                        workout.getExercises().stream()
                                                .map(ex -> WorkoutExerciseDto.builder()
                                                        .id(ex.getId())
                                                        .name(ex.getName())
                                                        .sets(
                                                                ex.getSets().stream()
                                                                        .map(set -> ExerciseSetDto
                                                                                .builder()
                                                                                .id(set.getId())
                                                                                .reps(set.getReps())
                                                                                .weightLbs(set.getWeightLbs())
                                                                                .build())
                                                                        .toList())
                                                        .build())
                                                .toList())
                        .build();
        }
}
