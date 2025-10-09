-- Add new columns to expenses table for enhanced workflow

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS purchaseRequestId VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS rejectionReason TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS revisionNotes TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reviewedBy VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS reviewedAt DATETIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS conditionalApproval BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS receiptUploadedAt DATETIME DEFAULT NULL;

-- Update status enum to include new statuses
ALTER TABLE expenses 
MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Returned', 'Pending Receipt') DEFAULT 'Pending';

