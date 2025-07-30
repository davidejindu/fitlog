package com.ejindu.backend.service;

import com.ejindu.backend.entity.User;
import com.ejindu.backend.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final WorkoutRepository workoutRepository;

    public Map<LocalDate, Long> heatmap(User user, YearMonth ym) {
        LocalDate first = ym.atDay(1);
        LocalDate last  = ym.atEndOfMonth().isAfter(LocalDate.now())
                ? LocalDate.now()
                : ym.atEndOfMonth();

        Set<LocalDate> trainedDays = new HashSet<>();
        Map<LocalDate, Long> map   = new LinkedHashMap<>();

        workoutRepository.workoutCounts(user, first, last)
                .forEach(row -> map.put(row.getDate(), row.getCnt()));

        for (LocalDate d = first; !d.isAfter(last); d = d.plusDays(1)) {
            map.putIfAbsent(d, 0L);
        }
        return map.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a,b) -> a,
                        LinkedHashMap::new));
    }

}
