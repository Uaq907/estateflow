ALTER TABLE `lease_payments`
ADD COLUMN `extensionRequested` BOOLEAN DEFAULT FALSE,
ADD COLUMN `requestedDueDate` DATE NULL,
ADD COLUMN `extensionStatus` ENUM('Pending', 'Approved', 'Rejected') NULL,
ADD COLUMN `extensionReason` TEXT NULL,
ADD COLUMN `managerNotes` TEXT NULL;
