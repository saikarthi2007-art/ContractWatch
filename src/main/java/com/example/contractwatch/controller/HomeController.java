package com.example.contractwatch.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contractwatch")
public class HomeController {

    @GetMapping
    public Map<String, Object> home() {

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("application", "ContractWatch");
        response.put("status", "Running");
        response.put("message", "ContractWatch API is working");
        response.put("baseUrl", "http://localhost:8080/api/contractwatch");

        response.put("availableFunctions", new String[]{
                "Vendors",
                "Contracts",
                "Renewal Reminders",
                "Renewal Decisions",
                "Contract Documents",
                "Reports"
        });

        return response;
    }
}