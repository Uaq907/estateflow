const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function showDatabaseTables() {
    let connection;
    try {
        // إنشاء الاتصال
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'estateflow',
            port: parseInt(process.env.DB_PORT || '3306')
        });

        console.log('✅ متصل بقاعدة البيانات:', process.env.DB_NAME || 'estateflow');
        console.log('═══════════════════════════════════════════════════════\n');

        // عرض جميع الجداول
        const [tables] = await connection.query('SHOW TABLES');
        
        console.log('📋 جميع الجداول في قاعدة البيانات:\n');
        console.log('┌─────┬─────────────────────────────────────────┐');
        console.log('│ #   │ اسم الجدول                              │');
        console.log('├─────┼─────────────────────────────────────────┤');
        
        tables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            const num = String(index + 1).padStart(3, ' ');
            const name = String(tableName).padEnd(40, ' ');
            console.log(`│ ${num} │ ${name} │`);
        });
        
        console.log('└─────┴─────────────────────────────────────────┘');
        console.log(`\n📊 إجمالي الجداول: ${tables.length}\n`);
        
        // عرض عدد السجلات في كل جدول
        console.log('═══════════════════════════════════════════════════════');
        console.log('📈 عدد السجلات في كل جدول:\n');
        console.log('┌─────────────────────────────────────────┬─────────┐');
        console.log('│ اسم الجدول                              │ العدد   │');
        console.log('├─────────────────────────────────────────┼─────────┤');
        
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
            const count = countResult[0].count;
            const name = String(tableName).padEnd(40, ' ');
            const num = String(count).padStart(8, ' ');
            console.log(`│ ${name} │${num} │`);
        }
        
        console.log('└─────────────────────────────────────────┴─────────┘\n');

        // عرض تفاصيل كل جدول
        console.log('═══════════════════════════════════════════════════════');
        console.log('🔍 تفاصيل أعمدة الجداول:\n');
        
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            const [columns] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
            
            console.log(`\n📦 جدول: ${tableName}`);
            console.log('─────────────────────────────────────────');
            console.log('┌─────────────────────────┬─────────────────┬──────┐');
            console.log('│ اسم العمود              │ النوع           │ مفتاح│');
            console.log('├─────────────────────────┼─────────────────┼──────┤');
            
            columns.forEach(col => {
                const field = String(col.Field).padEnd(24, ' ');
                const type = String(col.Type).padEnd(16, ' ');
                const key = String(col.Key || '').padEnd(5, ' ');
                console.log(`│ ${field} │ ${type} │ ${key} │`);
            });
            
            console.log('└─────────────────────────┴─────────────────┴──────┘');
        }

    } catch (error) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('🔐 تأكد من اسم المستخدم وكلمة المرور في ملف .env.local');
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🔌 تأكد من أن خادم MySQL يعمل (XAMPP/MySQL)');
        }
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 تم إغلاق الاتصال بقاعدة البيانات');
        }
    }
}

showDatabaseTables();
