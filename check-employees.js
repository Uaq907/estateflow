// Check employees in the database
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'estateflow',
};

async function checkEmployees() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('🔍 Checking employees in database...');
    
    const [employees] = await connection.query('SELECT id, name, email, position FROM employees LIMIT 10');
    
    console.log(`📊 Found ${employees.length} employees:`);
    console.log('=====================================');
    
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.name}`);
      console.log(`   Email: ${emp.email}`);
      console.log(`   Position: ${emp.position}`);
      console.log(`   Password: password123 (default)`);
      console.log('');
    });
    
    if (employees.length > 0) {
      console.log('✅ Database is ready! You can login with any of these accounts.');
      console.log('🌐 Go to: http://localhost:5000');
    } else {
      console.log('❌ No employees found. Need to import demo data.');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error checking employees:', error.message);
  }
}

checkEmployees();
