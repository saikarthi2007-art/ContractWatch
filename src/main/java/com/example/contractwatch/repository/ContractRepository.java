package com.example.contractwatch.repository;

import com.example.contractwatch.model.Contract;
import com.example.contractwatch.model.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ContractRepository
        extends JpaRepository<Contract, Long> {

    List<Contract> findByStatus(
            ContractStatus status
    );

    List<Contract> findByStatusNotAndEndDateBetween(
            ContractStatus status,
            LocalDate startDate,
            LocalDate endDate
    );

    long countByStatus(
            ContractStatus status
    );
}