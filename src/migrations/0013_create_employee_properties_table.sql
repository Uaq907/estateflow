CREATE TABLE IF NOT EXISTS employee_properties (
    employeeId VARCHAR(36) NOT NULL,
    propertyId VARCHAR(36) NOT NULL,
    PRIMARY KEY (employeeId, propertyId),
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE
);
