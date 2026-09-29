package com.example.contractwatch.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Contract title is required")
    private String title;

    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    @NotNull(message = "Vendor is required")
    private Vendor vendor;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotNull(message = "Notice period is required")
    @Positive(message = "Notice period must be positive")
    private Integer noticePeriodDays;

    @Enumerated(EnumType.STRING)
    private ContractStatus status = ContractStatus.ACTIVE;

    @OneToMany(mappedBy = "contract")
    @JsonIgnore
    private List<RenewalDecision> renewalDecisions =
            new ArrayList<>();

    @OneToMany(mappedBy = "contract")
    @JsonIgnore
    private List<ContractDocument> documents =
            new ArrayList<>();

    public Contract() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Integer getNoticePeriodDays() {
        return noticePeriodDays;
    }

    public void setNoticePeriodDays(Integer noticePeriodDays) {
        this.noticePeriodDays = noticePeriodDays;
    }

    public ContractStatus getStatus() {
        return status;
    }

    public void setStatus(ContractStatus status) {
        this.status = status;
    }

    public List<RenewalDecision> getRenewalDecisions() {
        return renewalDecisions;
    }

    public void setRenewalDecisions(
            List<RenewalDecision> renewalDecisions) {

        this.renewalDecisions = renewalDecisions;
    }

    public List<ContractDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(
            List<ContractDocument> documents) {

        this.documents = documents;
    }
}