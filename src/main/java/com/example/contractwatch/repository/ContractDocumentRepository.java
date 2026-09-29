package com.example.contractwatch.repository;

import com.example.contractwatch.model.ContractDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractDocumentRepository
        extends JpaRepository<ContractDocument, Long> {

    List<ContractDocument> findByContractId(
            Long contractId
    );
}