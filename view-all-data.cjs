require('dotenv').config();
const mysql = require('mysql2/promise');

async function viewAllData() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('📊 عرض جميع البيانات في النظام\n');
        console.log('='.repeat(60));

        // 1. الموظفين
        console.log('\n👔 الموظفين:');
        console.log('─'.repeat(60));
        const [employees] = await connection.query('SELECT id, name, email, position FROM employees');
        console.table(employees);

        // 2. العقارات
        console.log('\n🏢 العقارات:');
        console.log('─'.repeat(60));
        const [properties] = await connection.query('SELECT id, name, type, address FROM properties');
        console.table(properties);

        // 3. الوحدات
        console.log('\n🏠 الوحدات:');
        console.log('─'.repeat(60));
        const [units] = await connection.query(`
            SELECT u.id, u.unitNumber, u.type, u.status, p.name as propertyName
            FROM units u
            LEFT JOIN properties p ON u.propertyId = p.id
        `);
        console.table(units);

        // 4. المستأجرين
        console.log('\n👥 المستأجرين:');
        console.log('─'.repeat(60));
        const [tenants] = await connection.query('SELECT id, name, email, phone, nationality FROM tenants');
        console.table(tenants);

        // 5. العقود
        console.log('\n📝 العقود:');
        console.log('─'.repeat(60));
        const [leases] = await connection.query(`
            SELECT 
                l.id, 
                t.name as tenantName,
                u.unitNumber,
                l.startDate,
                l.endDate,
                l.status
            FROM leases l
            LEFT JOIN tenants t ON l.tenantId = t.id
            LEFT JOIN units u ON l.unitId = u.id
        `);
        console.table(leases);

        // 6. المصروفات
        console.log('\n💰 المصروفات:');
        console.log('─'.repeat(60));
        const [expenses] = await connection.query(`
            SELECT 
                e.id,
                e.category,
                e.description,
                e.amount,
                e.status,
                emp.name as employeeName
            FROM expenses e
            LEFT JOIN employees emp ON e.employeeId = emp.id
            LIMIT 10
        `);
        if (expenses.length > 0) {
            console.table(expenses);
        } else {
            console.log('   ⚠️ لا توجد مصروفات - قم بتشغيل: node add-test-expenses.cjs');
        }

        // 7. تعيينات الموظفين
        console.log('\n👥 تعيينات الموظفين للعقارات:');
        console.log('─'.repeat(60));
        const [assignments] = await connection.query(`
            SELECT 
                e.name as employeeName,
                e.position,
                p.name as propertyName
            FROM employee_properties ep
            JOIN employees e ON ep.employeeId = e.id
            JOIN properties p ON ep.propertyId = p.id
        `);
        if (assignments.length > 0) {
            console.table(assignments);
        } else {
            console.log('   ℹ️ لا توجد تعيينات');
        }

        // 8. المالكين
        console.log('\n👨‍💼 المالكين:');
        console.log('─'.repeat(60));
        const [owners] = await connection.query('SELECT id, name, contact, email, nationality FROM owners');
        console.table(owners);

        // 9. البنوك
        console.log('\n🏦 البنوك:');
        console.log('─'.repeat(60));
        const [banks] = await connection.query('SELECT id, name, branchCode, accountNumber FROM banks');
        console.table(banks);

        console.log('\n' + '='.repeat(60));
        console.log('✅ تم عرض جميع البيانات بنجاح!');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

viewAllData();

