package com.ejindu.backend.repository;

import com.ejindu.backend.entity.User;
import com.ejindu.backend.entity.Workout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutRepository extends JpaRepository<Workout, UUID> {

    List<Workout> findByUserAndDateBetween(User user, LocalDate from, LocalDate to);

   Optional<Workout> findByIdAndUser(UUID id, User owner);

    @Query("""
  SELECT w.date AS date, COUNT(w) AS cnt
  FROM   Workout w
  WHERE  w.user = :user
    AND  w.date BETWEEN :start AND :end
  GROUP  BY w.date
""")
    List<DailyCount> workoutCounts(
            @Param("user")  User user,
            @Param("start") LocalDate start,
            @Param("end")   LocalDate end);


    interface DailyCount {
        LocalDate getDate();
        long      getCnt();
    }


}
