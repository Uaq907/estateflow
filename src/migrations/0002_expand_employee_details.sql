ALTER TABLE employees
ADD COLUMN visaNumber VARCHAR(255) NULL,
ADD COLUMN visaExpiryDate DATE NULL,
ADD COLUMN insuranceNumber VARCHAR(255) NULL,
ADD COLUMN insuranceExpiryDate DATE NULL,
ADD COLUMN telegramBotToken VARCHAR(255) NULL,
ADD COLUMN telegramChannelId VARCHAR(255) NULL;

-- Note: The following statements will remove the old columns.
-- Back up your data if you need to migrate it from the old columns to the new ones.
ALTER TABLE employees
DROP COLUMN visaDetails,
DROP COLUMN insuranceDetails,
DROP COLUMN telegramConfig;
