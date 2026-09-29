package com.example.contractwatch.service;

import com.example.contractwatch.exception.BusinessRuleException;
import com.example.contractwatch.exception.ResourceNotFoundException;
import com.example.contractwatch.model.Vendor;
import com.example.contractwatch.repository.VendorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(
            VendorRepository vendorRepository) {

        this.vendorRepository = vendorRepository;
    }

    public List<Vendor> getAllVendors() {

        return vendorRepository.findAll();
    }

    public Vendor getVendorById(Long id) {

        return vendorRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vendor with id " +
                                        id +
                                        " not found"
                        ));
    }

    public Vendor createVendor(Vendor vendor) {

        return vendorRepository.save(vendor);
    }

    public Vendor updateVendor(
            Long id,
            Vendor updatedVendor) {

        Vendor existingVendor =
                getVendorById(id);

        existingVendor.setName(
                updatedVendor.getName()
        );

        existingVendor.setContactEmail(
                updatedVendor.getContactEmail()
        );

        existingVendor.setPhone(
                updatedVendor.getPhone()
        );

        return vendorRepository.save(
                existingVendor
        );
    }

    public void deleteVendor(Long id) {

        Vendor vendor =
                getVendorById(id);

        if (vendor.getContracts() != null
                && !vendor.getContracts().isEmpty()) {

            throw new BusinessRuleException(
                    "Cannot delete vendor because it still has contracts"
            );
        }

        vendorRepository.delete(vendor);
    }
}