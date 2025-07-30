package com.ejindu.backend.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ejindu.backend.entity.PeriodAnalysis;
import com.ejindu.backend.entity.User;
import com.ejindu.backend.enums.Goal;

public interface PeriodAnalysisRepository extends JpaRepository<PeriodAnalysis, UUID> {

    Optional<PeriodAnalysis> findByUserAndFromDateAndToDateAndGoal(
            User user, LocalDate fromDate, LocalDate toDate, Goal goal);

    boolean existsByUserAndFromDateAndToDateAndGoal(
            User user, LocalDate fromDate, LocalDate toDate, Goal goal);
}