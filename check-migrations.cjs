require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkMigrations() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

        console.log('🔍 التحقق من أعمدة جدول expenses:\n');

        const [cols] = await connection.query('DESCRIBE expenses');
        const colNames = cols.map(c => c.Field);
        
        const requiredCols = [
            'paymentReceiptUrl',
            'requestReceiptUrl', 
            'purchaseReceiptUrl',
            'amountWithoutTax',
            'totalAmount',
            'taxRate'
        ];

        console.log('📋 الأعمدة المطلوبة:');
        const missingCols = [];
        requiredCols.forEach(col => {
            const exists = colNames.includes(col);
            console.log(`  ${exists ? '✅' : '❌'} ${col}`);
            if (!exists) missingCols.push(col);
        });

        if (missingCols.length > 0) {
            console.log('\n⚠️  أعمدة مفقودة:', missingCols.length);
            console.log('\n📝 يجب تشغيل migrations التالية:');
            console.log('   - src/migrations/0038_add_tax_fields_to_expenses.sql');
            console.log('   - src/migrations/0039_add_approval_tracking_to_expenses.sql');
            console.log('\n🔧 لتشغيل migrations يدوياً، استخدم:');
            console.log('   mysql -u root -p estateflow < src/migrations/0038_add_tax_fields_to_expenses.sql');
            console.log('   mysql -u root -p estateflow < src/migrations/0039_add_approval_tracking_to_expenses.sql');
        } else {
            console.log('\n✅ جميع الأعمدة موجودة!');
        }

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkMigrations();

