package com.example.contractwatch.service;

import com.example.contractwatch.exception.ResourceNotFoundException;
import com.example.contractwatch.model.Contract;
import com.example.contractwatch.model.ContractDocument;
import com.example.contractwatch.repository.ContractDocumentRepository;
import com.example.contractwatch.repository.ContractRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ContractDocumentService {

    private final ContractDocumentRepository documentRepository;
    private final ContractRepository contractRepository;

    public ContractDocumentService(
            ContractDocumentRepository documentRepository,
            ContractRepository contractRepository) {

        this.documentRepository =
                documentRepository;

        this.contractRepository =
                contractRepository;
    }

    public List<ContractDocument> getDocuments(
            Long contractId) {

        if (!contractRepository
                .existsById(contractId)) {

            throw new ResourceNotFoundException(
                    "Contract with id " +
                            contractId +
                            " not found"
            );
        }

        return documentRepository
                .findByContractId(contractId);
    }

    public ContractDocument addDocument(
            Long contractId,
            ContractDocument document) {

        Contract contract =
                contractRepository.findById(
                        contractId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Contract with id " +
                                        contractId +
                                        " not found"
                        ));

        document.setContract(contract);

        return documentRepository.save(
                document
        );
    }
    public void deleteDocument(Long documentId) {

        ContractDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document with id " + documentId + " not found"
                ));

        documentRepository.delete(document);
    }
}