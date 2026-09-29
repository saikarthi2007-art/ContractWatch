package com.example.contractwatch.service;

import com.example.contractwatch.exception.BusinessRuleException;
import com.example.contractwatch.exception.ResourceNotFoundException;
import com.example.contractwatch.model.Contract;
import com.example.contractwatch.model.ContractStatus;
import com.example.contractwatch.model.Vendor;
import com.example.contractwatch.repository.ContractRepository;
import com.example.contractwatch.repository.VendorRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final VendorRepository vendorRepository;

    public ContractService(
            ContractRepository contractRepository,
            VendorRepository vendorRepository) {

        this.contractRepository =
                contractRepository;

        this.vendorRepository =
                vendorRepository;
    }

    public List<Contract> getAllContracts() {

        updateRenewalStatuses();

        return contractRepository.findAll();
    }

    public Contract getContractById(Long id) {

        Contract contract =
                contractRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contract with id " +
                                                id +
                                                " not found"
                                ));

        checkAndUpdateRenewalStatus(
                contract
        );

        return contract;
    }

    @Transactional
    public Contract createContract(
            Contract contract) {

        validateContract(contract);

        Long vendorId =
                contract.getVendor().getId();

        Vendor vendor =
                vendorRepository.findById(vendorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vendor with id " +
                                                vendorId +
                                                " not found"
                                ));

        contract.setVendor(vendor);

        contract.setStatus(
                ContractStatus.ACTIVE
        );

        Contract saved =
                contractRepository.save(
                        contract
                );

        checkAndUpdateRenewalStatus(
                saved
        );

        return saved;
    }

    @Transactional
    public Contract updateContract(
            Long id,
            Contract updatedContract) {

        Contract existing =
                getContractById(id);

        validateContract(
                updatedContract
        );

        Long vendorId =
                updatedContract
                        .getVendor()
                        .getId();

        Vendor vendor =
                vendorRepository.findById(vendorId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Vendor with id " +
                                                vendorId +
                                                " not found"
                                ));

        existing.setTitle(
                updatedContract.getTitle()
        );

        existing.setVendor(vendor);

        existing.setStartDate(
                updatedContract.getStartDate()
        );

        existing.setEndDate(
                updatedContract.getEndDate()
        );

        existing.setNoticePeriodDays(
                updatedContract
                        .getNoticePeriodDays()
        );

        Contract saved =
                contractRepository.save(
                        existing
                );

        checkAndUpdateRenewalStatus(
                saved
        );

        return saved;
    }

    public void deleteContract(Long id) {

        Contract contract =
                contractRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Contract with id " +
                                                id +
                                                " not found"
                                ));

        contractRepository.delete(contract);
    }

    public List<Contract> getRenewalReminders() {

        updateRenewalStatuses();

        return contractRepository.findByStatus(
                ContractStatus.RENEWAL_REVIEW
        );
    }

    public List<Contract> getExpiringSoon() {

        updateRenewalStatuses();

        LocalDate today =
                LocalDate.now();

        LocalDate thirtyDaysLater =
                today.plusDays(30);

        return contractRepository
                .findByStatusNotAndEndDateBetween(
                        ContractStatus.TERMINATED,
                        today,
                        thirtyDaysLater
                );
    }

    private boolean isInNoticeWindow(
            Contract contract) {

        LocalDate today =
                LocalDate.now();

        LocalDate flagDate =
                contract.getEndDate()
                        .minusDays(
                                contract
                                        .getNoticePeriodDays()
                        );

        return !today.isBefore(flagDate)
                && !today.isAfter(
                contract.getEndDate()
        );
    }

    private void checkAndUpdateRenewalStatus(
            Contract contract) {

        if (contract.getStatus()
                == ContractStatus.TERMINATED) {

            return;
        }

        if (contract.getStatus()
                == ContractStatus.ACTIVE
                && isInNoticeWindow(contract)) {

            ContractStatus oldStatus =
                    contract.getStatus();

            contract.setStatus(
                    ContractStatus.RENEWAL_REVIEW
            );

            contractRepository.save(
                    contract
            );

            printNotification(
                    contract,
                    oldStatus,
                    ContractStatus.RENEWAL_REVIEW
            );
        }
    }

    private void updateRenewalStatuses() {

        List<Contract> contracts =
                contractRepository.findAll();

        for (Contract contract : contracts) {

            checkAndUpdateRenewalStatus(
                    contract
            );
        }
    }

    private void validateContract(
            Contract contract) {

        if (contract.getVendor() == null
                || contract.getVendor().getId() == null) {

            throw new BusinessRuleException(
                    "Vendor is required"
            );
        }

        if (contract.getStartDate() == null
                || contract.getEndDate() == null) {

            throw new BusinessRuleException(
                    "Start date and end date are required"
            );
        }

        if (!contract.getEndDate()
                .isAfter(
                        contract.getStartDate()
                )) {

            throw new BusinessRuleException(
                    "End date must be after start date"
            );
        }

        if (contract.getNoticePeriodDays() == null
                || contract.getNoticePeriodDays() <= 0) {

            throw new BusinessRuleException(
                    "Notice period must be positive"
            );
        }

        long duration =
                ChronoUnit.DAYS.between(
                        contract.getStartDate(),
                        contract.getEndDate()
                );

        if (contract.getNoticePeriodDays()
                > duration) {

            throw new BusinessRuleException(
                    "Notice period cannot be longer than the total contract duration"
            );
        }
    }

    private void printNotification(
            Contract contract,
            ContractStatus oldStatus,
            ContractStatus newStatus) {

        System.out.println(
                "NOTIFICATION: Contract '" +
                        contract.getTitle() +
                        "' status changed from " +
                        oldStatus +
                        " to " +
                        newStatus
        );
    }

    @Scheduled(fixedRate = 86400000)
    public void scheduledRenewalCheck() {

        System.out.println(
                "Running daily ContractWatch renewal check..."
        );

        updateRenewalStatuses();
    }
}