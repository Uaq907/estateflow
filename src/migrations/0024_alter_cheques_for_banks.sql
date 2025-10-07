-- Add the bankId column to link to the new banks table
ALTER TABLE `cheques` ADD COLUMN `bankId` VARCHAR(36) NOT NULL;

-- Add a foreign key constraint to ensure data integrity
ALTER TABLE `cheques` ADD CONSTRAINT `fk_cheque_bank` FOREIGN KEY (`bankId`) REFERENCES `banks`(`id`);

-- Remove the old, redundant bankName column
ALTER TABLE `cheques` DROP COLUMN `bankName`;
