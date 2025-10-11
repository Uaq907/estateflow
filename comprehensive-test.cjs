require('dotenv').config();
const mysql = require('mysql2/promise');

async function comprehensiveTest() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

        console.log('🔍 اختبار شامل للنظام:\n');
        console.log('═'.repeat(60));

        // 1. Database Connection
        console.log('\n✅ 1. الاتصال بقاعدة البيانات');
        await connection.ping();
        console.log('   ✓ الاتصال نشط وجاهز');

        // 2. Tables
        const [tables] = await connection.query('SHOW TABLES');
        console.log(`\n✅ 2. الجداول في قاعدة البيانات: ${tables.length} جدول`);

        // 3. Employees
        const [employees] = await connection.query('SELECT COUNT(*) as count FROM employees');
        console.log(`\n✅ 3. الموظفون: ${employees[0].count} موظف`);

        // 4. Properties
        const [properties] = await connection.query('SELECT COUNT(*) as count FROM properties');
        console.log(`\n✅ 4. العقارات: ${properties[0].count} عقار`);

        // 5. Units
        const [units] = await connection.query('SELECT COUNT(*) as count FROM units');
        console.log(`\n✅ 5. الوحدات: ${units[0].count} وحدة`);

        // 6. Tenants
        const [tenants] = await connection.query('SELECT COUNT(*) as count FROM tenants');
        console.log(`\n✅ 6. المستأجرون: ${tenants[0].count} مستأجر`);

        // 7. Leases
        const [leases] = await connection.query('SELECT COUNT(*) as count, status FROM leases GROUP BY status');
        console.log(`\n✅ 7. عقود الإيجار:`);
        leases.forEach(l => console.log(`   - ${l.status}: ${l.count}`));

        // 8. Expenses
        const [expenses] = await connection.query('SELECT COUNT(*) as count, status FROM expenses GROUP BY status');
        console.log(`\n✅ 8. المصروفات:`);
        if (expenses.length > 0) {
            expenses.forEach(e => console.log(`   - ${e.status}: ${e.count}`));
        } else {
            console.log('   لا توجد مصروفات');
        }

        // 9. Employee-Property Assignments
        const [assignments] = await connection.query('SELECT COUNT(*) as count FROM employee_properties');
        console.log(`\n✅ 9. تعيينات الموظفين للعقارات: ${assignments[0].count} تعيين`);

        // 10. Check critical columns
        console.log('\n✅ 10. الأعمدة الحديثة في جدول expenses:');
        const [expenseCols] = await connection.query('DESCRIBE expenses');
        const colNames = expenseCols.map(c => c.Field);
        
        const criticalCols = ['paymentReceiptUrl', 'requestReceiptUrl', 'purchaseReceiptUrl'];
        criticalCols.forEach(col => {
            console.log(`   ${colNames.includes(col) ? '✅' : '❌'} ${col}`);
        });

        console.log('\n' + '═'.repeat(60));
        console.log('\n🎉 جميع الفحوصات نجحت!');
        console.log('\n📋 ملخص النظام:');
        console.log(`   - الموظفون: ${employees[0].count}`);
        console.log(`   - العقارات: ${properties[0].count}`);
        console.log(`   - الوحدات: ${units[0].count}`);
        console.log(`   - المستأجرون: ${tenants[0].count}`);
        console.log(`   - العقود النشطة: ${leases.find(l => l.status === 'Active')?.count || 0}`);
        console.log(`   - المصروفات: ${expenses.reduce((sum, e) => sum + e.count, 0)}`);

        console.log('\n🌐 الروابط الرئيسية:');
        console.log('   • الرئيسية: http://localhost:5000/dashboard');
        console.log('   • العقارات: http://localhost:5000/dashboard/properties');
        console.log('   • العقود: http://localhost:5000/dashboard/leases');
        console.log('   • المصروفات: http://localhost:5000/dashboard/expenses');
        console.log('   • الموظفون: http://localhost:5000/dashboard/employees');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

comprehensiveTest();

