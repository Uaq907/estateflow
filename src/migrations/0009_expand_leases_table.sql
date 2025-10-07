-- Add new columns to the leases table for detailed lease information
ALTER TABLE leases
ADD COLUMN tenantSince DATE,
ADD COLUMN totalLeaseAmount DECIMAL(10, 2),
ADD COLUMN taxedAmount DECIMAL(10, 2),
ADD COLUMN numberOfPayments INT,
ADD COLUMN renewalIncreasePercentage DECIMAL(5, 2),
ADD COLUMN contractUrl VARCHAR(255),
ADD COLUMN guaranteeChequeAmount DECIMAL(10, 2),
ADD COLUMN guaranteeChequeUrl VARCHAR(255);

-- Rename rentAmount to rentPaymentAmount for clarity
ALTER TABLE leases CHANGE COLUMN rentAmount rentPaymentAmount DECIMAL(10, 2);
