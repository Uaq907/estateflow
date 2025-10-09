-- Create purchase_requests table

CREATE TABLE IF NOT EXISTS purchase_requests (
  id VARCHAR(255) PRIMARY KEY,
  employeeId VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  estimatedAmount DECIMAL(10, 2),
  propertyId VARCHAR(255),
  unitId VARCHAR(255),
  status ENUM('Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled') DEFAULT 'Pending',
  approvedBy VARCHAR(255),
  approvedAt DATETIME DEFAULT NULL,
  rejectionReason TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE SET NULL,
  FOREIGN KEY (approvedBy) REFERENCES employees(id) ON DELETE SET NULL
);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_requests_employee ON purchase_requests(employeeId);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_property ON purchase_requests(propertyId);

