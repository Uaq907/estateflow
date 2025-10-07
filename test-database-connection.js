// Test database connection and setup
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'estateflow',
};

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('Config:', { ...dbConfig, password: '***' });
  
  try {
    // Test connection without database first
    const testConfig = { ...dbConfig };
    delete testConfig.database;
    
    const connection = await mysql.createConnection(testConfig);
    console.log('✅ MySQL server connection successful!');
    
    // Check if database exists
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [dbConfig.database]);
    
    if (databases.length === 0) {
      console.log(`📝 Creating database: ${dbConfig.database}`);
      await connection.query(`CREATE DATABASE ${dbConfig.database}`);
      console.log('✅ Database created successfully!');
    } else {
      console.log('✅ Database already exists!');
    }
    
    // Connect to the specific database
    await connection.end();
    const dbConnection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to estateflow database!');
    
    // Test a simple query
    const [tables] = await dbConnection.query('SHOW TABLES');
    console.log(`📊 Found ${tables.length} tables in database`);
    
    await dbConnection.end();
    console.log('🎉 Database setup test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solution: Install and start MySQL server');
      console.log('1. Install XAMPP from: https://www.apachefriends.org/download.html');
      console.log('2. Start MySQL service in XAMPP Control Panel');
      console.log('3. Run this test again');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solution: Check MySQL credentials in .env file');
    }
    
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
