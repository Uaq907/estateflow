-- Add new columns for enhanced property details
ALTER TABLE properties
ADD COLUMN purpose VARCHAR(255),
ADD COLUMN floors INT,
ADD COLUMN rooms INT,
ADD COLUMN configuration VARCHAR(255),
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD COLUMN address TEXT;
