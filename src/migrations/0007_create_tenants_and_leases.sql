-- Migration to create tenants and leases tables, and link them to units.

CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    idNumber VARCHAR(255),
    idType VARCHAR(50),
    nationality VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE leases (
    id VARCHAR(36) PRIMARY KEY,
    unitId VARCHAR(36) NOT NULL,
    tenantId VARCHAR(36) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    rentAmount DECIMAL(10, 2),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (unitId) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Add a new 'Rented' status option to the units table status column if it's an ENUM
-- For VARCHAR, we just need to handle it in the application logic.
-- This migration assumes the 'status' column on 'units' is a VARCHAR and can accept 'Rented'.
