package com.example.contractwatch.repository;

import com.example.contractwatch.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository
        extends JpaRepository<Vendor, Long> {
}