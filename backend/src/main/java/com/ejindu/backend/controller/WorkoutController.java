package com.ejindu.backend.controller;

import com.ejindu.backend.service.CalendarService;
import com.ejindu.backend.service.WorkoutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.ejindu.backend.dto.WorkoutDto;
import com.ejindu.backend.entity.User;
import com.ejindu.backend.repository.UserRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/workout")
@RequiredArgsConstructor
public class WorkoutController {

    private final WorkoutService workoutService;
    private final UserRepository userRepository;
    private final CalendarService calendarService;

    @PostMapping
    public ResponseEntity<WorkoutDto> createWorkout(@Valid @RequestBody WorkoutDto workoutDto, Authentication auth) {
        User user = (User) auth.getPrincipal();
        WorkoutDto saved = workoutService.createWorkout(workoutDto, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    ResponseEntity<List<WorkoutDto>> getWorkoutsBetween(@RequestParam LocalDate from,
                                                               @RequestParam LocalDate to,
                                                               Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<WorkoutDto> workoutsHistory = workoutService.getWorkoutsBetween(user, from, to);

        return ResponseEntity.ok(workoutsHistory);
    }

    @GetMapping("/{id}")
    ResponseEntity<WorkoutDto> getWorkoutById(@PathVariable UUID id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        WorkoutDto workout = workoutService.getWorkoutById(id, user);
        return ResponseEntity.ok(workout);
    }

    @DeleteMapping(path = "/{id}")
    ResponseEntity<String> deleteWorkout(@PathVariable UUID id, Authentication auth) {
        User user = (User) auth.getPrincipal();
        workoutService.deleteWorkout(id, user);
        return ResponseEntity.ok("Workout successfully deleted");
    }


    @GetMapping("/calendar")
    public ResponseEntity<Map<LocalDate, Long>> getMonthlyHeatmap(
            @RequestParam String month,            // expect "YYYY-MM"
            Authentication auth) {

        YearMonth ym = YearMonth.parse(month);
        User user    = (User) auth.getPrincipal();

        Map<LocalDate, Long> map = calendarService.heatmap(user, ym);

        return ResponseEntity.ok(map);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkoutDto> updateWorkout(
            @PathVariable UUID id,
            @Valid @RequestBody WorkoutDto dto,
            Authentication auth) {

        User owner = (User) auth.getPrincipal();
        WorkoutDto updated = workoutService.updateWorkout(id, dto, owner);
        return ResponseEntity.ok(updated);
    }

}
