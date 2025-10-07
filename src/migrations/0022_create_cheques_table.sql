
CREATE TABLE IF NOT EXISTS cheques (
    id VARCHAR(36) PRIMARY KEY,
    payeeType ENUM('saved', 'tenant', 'manual') NOT NULL,
    payeeId VARCHAR(36),
    tenantId VARCHAR(36),
    manualPayeeName VARCHAR(255),
    chequeNumber VARCHAR(255) NOT NULL,
    bankName VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    chequeDate DATE NOT NULL,
    dueDate DATE NOT NULL,
    status ENUM('Pending', 'Cleared', 'Bounced', 'Cancelled') NOT NULL DEFAULT 'Pending',
    description TEXT,
    chequeImageUrl VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (payeeId) REFERENCES payees(id) ON DELETE SET NULL,
    FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE SET NULL
);
