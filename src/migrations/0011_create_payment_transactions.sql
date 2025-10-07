CREATE TABLE IF NOT EXISTS payment_transactions (
    id VARCHAR(36) PRIMARY KEY,
    leasePaymentId VARCHAR(36) NOT NULL,
    amountPaid DECIMAL(10, 2) NOT NULL,
    paymentDate DATE NOT NULL,
    paymentMethod VARCHAR(50),
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leasePaymentId) REFERENCES lease_payments(id) ON DELETE CASCADE
);

ALTER TABLE lease_payments
ADD COLUMN paymentMethod VARCHAR(50) AFTER status;
