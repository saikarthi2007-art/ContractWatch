package com.example.contractwatch.repository;

import com.example.contractwatch.model.RenewalDecision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RenewalDecisionRepository
        extends JpaRepository<RenewalDecision, Long> {

    List<RenewalDecision> findByContractId(
            Long contractId
    );
}