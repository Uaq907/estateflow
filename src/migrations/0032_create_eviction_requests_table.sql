-- Migration 0032: Create Eviction Requests Table
-- This table stores all eviction requests with tenant and property details

CREATE TABLE IF NOT EXISTS eviction_requests (
    id VARCHAR(255) PRIMARY KEY,
    tenantId VARCHAR(255),
    tenantName VARCHAR(255) NOT NULL,
    propertyName VARCHAR(255) NOT NULL,
    unitNumber VARCHAR(100),
    reason TEXT NOT NULL,
    dueAmount DECIMAL(15, 2) DEFAULT 0,
    submittedDate DATE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    createdBy VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE SET NULL,
    INDEX idx_tenant (tenantId),
    INDEX idx_submitted_date (submittedDate),
    INDEX idx_status (status)
);
