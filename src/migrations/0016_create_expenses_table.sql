
CREATE TABLE expenses (
    id VARCHAR(36) PRIMARY KEY,
    propertyId VARCHAR(36) NOT NULL,
    employeeId VARCHAR(36) NOT NULL,
    managerId VARCHAR(36),
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    receiptUrl VARCHAR(255),
    managerNotes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (managerId) REFERENCES employees(id) ON DELETE SET NULL
);
