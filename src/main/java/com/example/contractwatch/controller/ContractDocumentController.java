package com.example.contractwatch.controller;

import com.example.contractwatch.model.ContractDocument;
import com.example.contractwatch.service.ContractDocumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contractwatch/contracts")
public class ContractDocumentController {

    private final ContractDocumentService documentService;

    public ContractDocumentController(
            ContractDocumentService documentService) {

        this.documentService = documentService;
    }

    // GET DOCUMENTS
    @GetMapping("/{id}/documents")
    public List<ContractDocument> getDocuments(
            @PathVariable Long id) {

        return documentService.getDocuments(id);
    }

    // ADD DOCUMENT
    @PostMapping("/{id}/documents")
    @ResponseStatus(HttpStatus.CREATED)
    public ContractDocument addDocument(
            @PathVariable Long id,
            @Valid @RequestBody ContractDocument document) {

        return documentService.addDocument(
                id,
                document
        );
    }

    // DELETE DOCUMENT
    @DeleteMapping("/documents/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(
            @PathVariable Long documentId) {

        documentService.deleteDocument(documentId);
    }
}