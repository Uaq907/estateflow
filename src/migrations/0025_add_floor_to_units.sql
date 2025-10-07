-- Add the floor column to the units table to store which floor the unit is on.
-- It is nullable because this only applies to properties of type 'Building'.
ALTER TABLE `units` ADD COLUMN `floor` INT NULL DEFAULT NULL AFTER `description`;
