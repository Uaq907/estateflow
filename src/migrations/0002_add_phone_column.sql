
ALTER TABLE employees ADD COLUMN phone VARCHAR(255);

UPDATE employees SET phone = '123-456-7890' WHERE id = '1';
UPDATE employees SET phone = '234-567-8901' WHERE id = '2';
UPDATE employees SET phone = '345-678-9012' WHERE id = '3';
