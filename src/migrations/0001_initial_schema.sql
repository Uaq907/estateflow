
CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    startDate DATE NOT NULL
);

INSERT INTO employees (id, name, email, password, position, department, startDate)
SELECT * FROM (
    SELECT
        '1' as id,
        'Alice Johnson' as name,
        'alice.j@estateflow.com' as email,
        'password123' as password,
        'Property Manager' as position,
        'Operations' as department,
        '2022-08-15' as startDate
    UNION ALL
    SELECT
        '2',
        'Bob Williams',
        'bob.w@estateflow.com',
        'password123',
        'Lead Agent',
        'Sales',
        '2021-01-20'
    UNION ALL
    SELECT
        '3',
        'Charlie Brown',
        'charlie.b@estateflow.com',
        'password123',
        'Maintenance Coordinator',
        'Facilities',
        '2023-03-10'
) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM employees);
