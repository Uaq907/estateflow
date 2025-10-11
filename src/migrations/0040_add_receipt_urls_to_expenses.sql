-- Add three types of receipt URLs to expenses table

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS paymentReceiptUrl VARCHAR(500) DEFAULT NULL COMMENT 'إيصال دفع المبلغ';

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS requestReceiptUrl VARCHAR(500) DEFAULT NULL COMMENT 'إيصال الطلب';

ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS purchaseReceiptUrl VARCHAR(500) DEFAULT NULL COMMENT 'إيصال المشتريات';

