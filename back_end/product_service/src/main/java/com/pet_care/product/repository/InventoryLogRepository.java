package com.pet_care.product.repository;

import com.pet_care.product.entity.InventoryLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryLogRepository extends JpaRepository<InventoryLog, String> {
}
