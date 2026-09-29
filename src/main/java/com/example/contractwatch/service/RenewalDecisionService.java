package com.example.contractwatch.service;

import com.example.contractwatch.exception.BusinessRuleException;
import com.example.contractwatch.exception.ResourceNotFoundException;
import com.example.contractwatch.model.Contract;
import com.example.contractwatch.model.ContractStatus;
import com.example.contractwatch.model.DecisionType;
import com.example.contractwatch.model.RenewalDecision;
import com.example.contractwatch.repository.ContractRepository;
import com.example.contractwatch.repository.RenewalDecisionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class RenewalDecisionService {

    private final RenewalDecisionRepository decisionRepository;
    private final ContractRepository contractRepository;

    public RenewalDecisionService(
            RenewalDecisionRepository decisionRepository,
            ContractRepository contractRepository) {

        this.decisionRepository =
                decisionRepository;

        this.contractRepository =
                contractRepository;
    }

    @Transactional
    public RenewalDecision createDecision(
            Long contractId,
            RenewalDecision decision) {

        Contract contract =
                contractRepository.findById(
                        contractId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Contract with id " +
                                        contractId +
                                        " not found"
                        ));

        if (contract.getStatus()
                == ContractStatus.TERMINATED) {

            throw new BusinessRuleException(
                    "A decision cannot be logged on a TERMINATED contract"
            );
        }

        if (decision.getDecision() == null) {

            throw new BusinessRuleException(
                    "Decision is required"
            );
        }

        if (decision.getDecision()
                == DecisionType.RENEWED) {

            if (decision.getNewEndDate()
                    == null) {

                throw new BusinessRuleException(
                        "New end date is required when decision is RENEWED"
                );
            }

            if (!decision.getNewEndDate()
                    .isAfter(
                            contract.getEndDate()
                    )) {

                throw new BusinessRuleException(
                        "New end date must be after the contract's current end date"
                );
            }

            contract.setEndDate(
                    decision.getNewEndDate()
            );

            ContractStatus oldStatus =
                    contract.getStatus();

            contract.setStatus(
                    ContractStatus.ACTIVE
            );

            System.out.println(
                    "NOTIFICATION: Contract '" +
                            contract.getTitle() +
                            "' status changed from " +
                            oldStatus +
                            " to ACTIVE"
            );
        }

        if (decision.getDecision()
                == DecisionType.TERMINATED) {

            if (decision.getNewEndDate()
                    != null) {

                throw new BusinessRuleException(
                        "New end date must be empty when decision is TERMINATED"
                );
            }

            ContractStatus oldStatus =
                    contract.getStatus();

            contract.setStatus(
                    ContractStatus.TERMINATED
            );

            System.out.println(
                    "NOTIFICATION: Contract '" +
                            contract.getTitle() +
                            "' status changed from " +
                            oldStatus +
                            " to TERMINATED"
            );
        }

        decision.setContract(contract);

        decision.setDecisionDate(
                LocalDate.now()
        );

        contractRepository.save(contract);

        return decisionRepository.save(
                decision
        );
    }

    public List<RenewalDecision>
    getDecisionHistory(Long contractId) {

        if (!contractRepository
                .existsById(contractId)) {

            throw new ResourceNotFoundException(
                    "Contract with id " +
                            contractId +
                            " not found"
            );
        }

        return decisionRepository
                .findByContractId(contractId);
    }
}