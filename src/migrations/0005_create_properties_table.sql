
CREATE TABLE properties (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    location TEXT,
    status VARCHAR(100),
    price DECIMAL(15, 2),
    size DECIMAL(10, 2),
    sizeUnit VARCHAR(20),
    description TEXT,
    imageUrl VARCHAR(255),
    dateListed DATE
);
