
CREATE TABLE IF NOT EXISTS maintenance_contracts (
    id VARCHAR(36) PRIMARY KEY,
    propertyId VARCHAR(36) NOT NULL,
    serviceType VARCHAR(255) NOT NULL,
    vendorName VARCHAR(255) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    contractAmount DECIMAL(12, 2) NOT NULL,
    paymentSchedule ENUM('Monthly', 'Quarterly', 'Annually', 'One-time') NOT NULL,
    nextDueDate DATE NOT NULL,
    contractUrl VARCHAR(255),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
);
