-- Migration: Add multiple receipt fields to expenses table
-- Created: 2025-10-11

-- Add new receipt fields
ALTER TABLE expenses 
ADD COLUMN paymentReceiptUrl VARCHAR(500) DEFAULT NULL COMMENT 'إيصال دفع المبلغ',
ADD COLUMN requestReceiptUrl VARCHAR(500) DEFAULT NULL COMMENT 'إيصال الطلب',
ADD COLUMN purchaseReceiptUrl VARCHAR(500) DEFAULT NULL COMMENT 'إيصال المشتريات';

-- Migrate existing receiptUrl to paymentReceiptUrl
UPDATE expenses 
SET paymentReceiptUrl = receiptUrl 
WHERE receiptUrl IS NOT NULL AND receiptUrl != '';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_receipts ON expenses(paymentReceiptUrl, requestReceiptUrl, purchaseReceiptUrl);

