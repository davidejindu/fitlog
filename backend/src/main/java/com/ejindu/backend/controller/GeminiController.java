package com.ejindu.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.ejindu.backend.entity.User;
import com.ejindu.backend.entity.Workout;
import com.ejindu.backend.enums.Goal;
import com.ejindu.backend.repository.WorkoutRepository;
import com.ejindu.backend.service.GeminiService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/gemini")
@RequiredArgsConstructor
public class GeminiController {

        private final WorkoutRepository workoutRepo;
        private final GeminiService gemini;

        @PostMapping(value = "/workout/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<Map<String, String>> analyseWorkout(
                        @PathVariable UUID id,
                        @RequestParam(required = false) Goal goal,
                        Authentication auth) {
                User owner = (User) auth.getPrincipal();

                Workout w = workoutRepo.findById(id)
                                .filter(wo -> wo.getUser().getId().equals(owner.getId()))
                                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

                return gemini.analyseSingle(w, goal)
                                .map(result -> ResponseEntity.ok(Map.of("analysis", result)))
                                .doOnError(error -> System.out
                                                .println("❌ GeminiController - Error: " + error.getMessage()))
                                .block();
        }

        @PostMapping(value = "/period", produces = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<Map<String, String>> analyseRange(
                        @Valid @RequestBody DateRange req,
                        @RequestParam(required = false) Goal goal,
                        Authentication auth) {
                User owner = (User) auth.getPrincipal();

                List<Workout> list = workoutRepo.findByUserAndDateBetween(
                                owner, req.from(), req.to());

                return gemini.analysePeriod(list, req.from(), req.to(), goal)
                                .map(result -> ResponseEntity.ok(Map.of("analysis", result)))
                                .block();
        }

        public record DateRange(LocalDate from, LocalDate to) {
        }
}
