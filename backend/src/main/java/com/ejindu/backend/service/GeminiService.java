package com.ejindu.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.ejindu.backend.entity.PeriodAnalysis;
import com.ejindu.backend.entity.User;
import com.ejindu.backend.entity.Workout;
import com.ejindu.backend.entity.WorkoutAnalysis;
import com.ejindu.backend.enums.Goal;
import com.ejindu.backend.repository.PeriodAnalysisRepository;
import com.ejindu.backend.repository.WorkoutAnalysisRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private final WebClient geminiClient;
    private final ObjectMapper mapper;
    private final WorkoutAnalysisRepository analysisRepository;
    private final PeriodAnalysisRepository periodAnalysisRepository;

    public Mono<String> analyseSingle(Workout w, Goal goal) {
        // Check if analysis already exists
        Optional<WorkoutAnalysis> existingAnalysis = analysisRepository.findByWorkout(w);
        if (existingAnalysis.isPresent()) {
            return Mono.just(existingAnalysis.get().getAnalysis());
        }

        String goalContext = getGoalContext(goal);
        String userName = w.getUser().getFirstName();

        String prompt = """
                Here is a workout for %s. Give constructive feedback and one suggestion.
                Talk to them directly using "you" and be conversational and encouraging.

                %s

                Workout JSON:
                %s
                """.formatted(userName, goalContext, toJson(w));

        return callGemini(prompt)
                .doOnNext(analysis -> {
                    // Cache the analysis
                    WorkoutAnalysis workoutAnalysis = WorkoutAnalysis.builder()
                            .workout(w)
                            .analysis(analysis)
                            .build();
                    analysisRepository.save(workoutAnalysis);
                });
    }

    public Mono<String> analysePeriod(List<Workout> list, LocalDate from, LocalDate to, Goal goal) {
        if (list.isEmpty()) {
            return Mono.just("No workouts found for the specified period.");
        }

        User user = list.get(0).getUser();

        // Check if period analysis already exists
        Optional<PeriodAnalysis> existingAnalysis = periodAnalysisRepository
                .findByUserAndFromDateAndToDateAndGoal(user, from, to, goal);
        if (existingAnalysis.isPresent()) {
            return Mono.just(existingAnalysis.get().getAnalysis());
        }

        String goalContext = getGoalContext(goal);
        String userName = user.getFirstName();

        String prompt = """
                %s performed %d workouts between %s and %s.

                %s

                Summarise their progress, note patterns, and suggest next steps.
                Talk to them directly using "you" and be conversational and encouraging.
                If they're not being consistent, tell them directly.

                Workouts JSON array:
                %s
                """
                .formatted(userName, list.size(), from, to, goalContext, toJson(list));

        return callGemini(prompt)
                .doOnNext(analysis -> {
                    // Cache the period analysis
                    PeriodAnalysis periodAnalysis = PeriodAnalysis.builder()
                            .user(user)
                            .fromDate(from)
                            .toDate(to)
                            .goal(goal)
                            .analysis(analysis)
                            .build();
                    periodAnalysisRepository.save(periodAnalysis);
                });
    }

    private Mono<String> callGemini(String prompt) {

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))));

        final String path = "/models/gemini-1.5-pro-latest:generateContent?key={key}";

        return geminiClient.post()
                .uri(path)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .doOnNext(json -> System.out.println("✅ Gemini raw json → " + json))
                .map(n -> n.at("/candidates/0/content/parts/0/text").asText())
                .doOnError(t -> {
                    System.err.println("🔥 Controller is blowing up with: " + t);
                    t.printStackTrace();
                });

    }

    private String getGoalContext(Goal goal) {
        if (goal == null) {
            return "Provide general fitness feedback and suggestions.";
        }

        return switch (goal) {
            case STRENGTH -> "Your primary goal is STRENGTH training.";
            case MUSCLE_GROWTH -> "Your primary goal is MUSCLE GROWTH (hypertrophy).";
            case BOTH -> "Your goal is BOTH STRENGTH and MUSCLE GROWTH.";
        };
    }

    private String toJson(Object o) {
        try {
            return mapper.writeValueAsString(o);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
