-- This migration simplifies the expense workflow.
-- It is NOT idempotent and should only be run once.

-- Step 1: Add a temporary column to hold the new status
ALTER TABLE expenses ADD COLUMN new_status VARCHAR(50);

-- Step 2: Map old statuses to new statuses
UPDATE expenses SET new_status = 
    CASE 
        WHEN status = 'Completed' THEN 'Approved'
        WHEN status = 'Approved for Payment' THEN 'Approved'
        WHEN status = 'Paid' THEN 'Approved'
        WHEN status = 'Pending Final Confirmation' THEN 'Approved'
        WHEN status = 'Pending' THEN 'Pending'
        WHEN status = 'Rejected' THEN 'Rejected'
        WHEN status = 'Needs Correction' THEN 'Needs Correction'
        ELSE 'Pending' -- Default for any other unknown statuses
    END;

-- Step 3: Change the status column definition.
-- This might fail if there are unexpected values. If so, inspect the table.
ALTER TABLE expenses MODIFY COLUMN status 
    ENUM('Pending', 'Approved', 'Rejected', 'Needs Correction') 
    DEFAULT 'Pending' NOT NULL;

-- Step 4: Update the status column from the temporary column
UPDATE expenses SET status = new_status;

-- Step 5: Drop the temporary column
ALTER TABLE expenses DROP COLUMN new_status;

-- Step 6: Drop the now unused paymentProofUrl column
ALTER TABLE expenses DROP COLUMN paymentProofUrl;

-- Step 7: Rename quotationUrl to receiptUrl for clarity
ALTER TABLE expenses CHANGE quotationUrl receiptUrl VARCHAR(255);

-- Step 8: Update the default value for the status column
ALTER TABLE expenses ALTER COLUMN status SET DEFAULT 'Pending';

-- Final verification (optional):
-- SELECT status, COUNT(*) FROM expenses GROUP BY status;
