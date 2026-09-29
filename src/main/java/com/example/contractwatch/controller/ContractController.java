package com.example.contractwatch.controller;

import com.example.contractwatch.model.Contract;
import com.example.contractwatch.model.RenewalDecision;
import com.example.contractwatch.service.ContractService;
import com.example.contractwatch.service.RenewalDecisionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contractwatch/contracts")
public class ContractController {

    private final ContractService contractService;
    private final RenewalDecisionService renewalDecisionService;

    public ContractController(
            ContractService contractService,
            RenewalDecisionService renewalDecisionService) {

        this.contractService = contractService;
        this.renewalDecisionService = renewalDecisionService;
    }

    // GET ALL CONTRACTS
    @GetMapping
    public List<Contract> getAllContracts() {
        return contractService.getAllContracts();
    }

    // GET CONTRACT BY ID
    @GetMapping("/{id}")
    public Contract getContract(@PathVariable Long id) {
        return contractService.getContractById(id);
    }

    // CREATE CONTRACT
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Contract createContract(
            @Valid @RequestBody Contract contract) {

        return contractService.createContract(contract);
    }

    // UPDATE CONTRACT
    @PutMapping("/{id}")
    public Contract updateContract(
            @PathVariable Long id,
            @Valid @RequestBody Contract contract) {

        return contractService.updateContract(id, contract);
    }

    // DELETE CONTRACT
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContract(@PathVariable Long id) {

        contractService.deleteContract(id);
    }

    // RENEWAL REMINDERS
    @GetMapping("/renewal-reminders")
    public List<Contract> getRenewalReminders() {

        return contractService.getRenewalReminders();
    }

    // EXPIRING SOON
    @GetMapping("/expiring-soon")
    public List<Contract> getExpiringSoon() {

        return contractService.getExpiringSoon();
    }

    // ADD RENEWAL DECISION
    @PostMapping("/{id}/renewal-decision")
    @ResponseStatus(HttpStatus.CREATED)
    public RenewalDecision createRenewalDecision(
            @PathVariable Long id,
            @Valid @RequestBody RenewalDecision decision) {

        return renewalDecisionService.createDecision(
                id,
                decision
        );
    }

    // GET RENEWAL HISTORY
    @GetMapping("/{id}/renewal-decisions")
    public List<RenewalDecision> getRenewalDecisions(
            @PathVariable Long id) {

        return renewalDecisionService.getDecisionHistory(id);
    }
}