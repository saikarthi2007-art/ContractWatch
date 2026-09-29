package com.example.contractwatch.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {

    private final JdbcTemplate jdbcTemplate;

    public ReportService(
            JdbcTemplate jdbcTemplate) {

        this.jdbcTemplate =
                jdbcTemplate;
    }

    public Map<String, Object> getSummary() {

        Map<String, Object> summary =
                new HashMap<>();

        Integer total =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM contracts",
                        Integer.class
                );

        Integer active =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM contracts " +
                                "WHERE status = 'ACTIVE'",
                        Integer.class
                );

        Integer review =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM contracts " +
                                "WHERE status = 'RENEWAL_REVIEW'",
                        Integer.class
                );

        Integer terminated =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM contracts " +
                                "WHERE status = 'TERMINATED'",
                        Integer.class
                );

        LocalDate today =
                LocalDate.now();

        LocalDate thirtyDaysLater =
                today.plusDays(30);

        Integer expiring =
                jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM contracts " +
                                "WHERE status <> 'TERMINATED' " +
                                "AND end_date BETWEEN ? AND ?",
                        Integer.class,
                        Date.valueOf(today),
                        Date.valueOf(thirtyDaysLater)
                );

        summary.put(
                "totalContracts",
                total
        );

        summary.put(
                "activeContracts",
                active
        );

        summary.put(
                "renewalReviewContracts",
                review
        );

        summary.put(
                "terminatedContracts",
                terminated
        );

        summary.put(
                "expiringIn30Days",
                expiring
        );

        return summary;
    }
}