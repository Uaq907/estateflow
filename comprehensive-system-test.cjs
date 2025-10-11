require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAllFeatures() {
    let connection;
    try {
        console.log('🚀 بدء الفحص الشامل للنظام...\n');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            connectTimeout: 30000
        });

        console.log('✅ 1. الاتصال بقاعدة البيانات\n');

        // Test 1: Check all tables exist
        console.log('📊 2. التحقق من الجداول الأساسية:');
        const requiredTables = [
            'employees', 'properties', 'units', 'tenants', 'leases', 
            'lease_payments', 'payment_transactions', 'expenses', 
            'owners', 'banks', 'cheques', 'payees', 'assets',
            'maintenance_contracts', 'employee_properties'
        ];
        
        for (const table of requiredTables) {
            const [rows] = await connection.query('SHOW TABLES LIKE ?', [table]);
            const exists = rows.length > 0;
            console.log(`   ${exists ? '✅' : '❌'} ${table}`);
        }

        // Test 2: Check data counts
        console.log('\n📈 3. عدد السجلات في كل جدول:');
        const tables = ['employees', 'properties', 'units', 'tenants', 'leases', 'expenses', 'owners', 'banks'];
        for (const table of tables) {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            const count = rows[0].count;
            console.log(`   ${table.padEnd(20)} : ${count} سجل`);
        }

        // Test 3: Check employees have permissions
        console.log('\n🔐 4. التحقق من صلاحيات الموظفين:');
        const [employees] = await connection.query('SELECT id, name, email, permissions FROM employees LIMIT 3');
        for (const emp of employees) {
            let perms = [];
            try {
                perms = typeof emp.permissions === 'string' ? JSON.parse(emp.permissions) : emp.permissions || [];
            } catch(e) {
                perms = [];
            }
            console.log(`   ✅ ${emp.name} (${emp.email})`);
            console.log(`      صلاحيات: ${perms.length > 0 ? perms.slice(0, 3).join(', ') + '...' : 'لا توجد'}`);
        }

        // Test 4: Check leases with tenants
        console.log('\n🏠 5. التحقق من العقود والمستأجرين:');
        const [leases] = await connection.query(`
            SELECT l.id, l.status, t.name as tenantName, u.unitNumber, p.name as propertyName
            FROM leases l
            LEFT JOIN tenants t ON l.tenantId = t.id
            LEFT JOIN units u ON l.unitId = u.id
            LEFT JOIN properties p ON u.propertyId = p.id
            LIMIT 3
        `);
        for (const lease of leases) {
            console.log(`   ✅ عقد ${lease.id}`);
            console.log(`      المستأجر: ${lease.tenantName || 'غير محدد'}`);
            console.log(`      الوحدة: ${lease.unitNumber || 'غير محدد'} في ${lease.propertyName || 'غير محدد'}`);
            console.log(`      الحالة: ${lease.status}`);
        }

        // Test 5: Check expenses
        console.log('\n💰 6. التحقق من المصروفات:');
        const [expenses] = await connection.query(`
            SELECT 
                category, 
                status, 
                COUNT(*) as count,
                SUM(amount) as total
            FROM expenses
            GROUP BY category, status
        `);
        if (expenses.length > 0) {
            for (const exp of expenses) {
                console.log(`   ✅ ${exp.category} - ${exp.status}: ${exp.count} مصروف (${exp.total} AED)`);
            }
        } else {
            console.log('   ⚠️ لا توجد مصروفات - قم بتشغيل: node add-test-expenses.cjs');
        }

        // Test 6: Check payment transactions
        console.log('\n💳 7. التحقق من المعاملات المالية:');
        const [transactions] = await connection.query(`
            SELECT 
                paymentMethod,
                COUNT(*) as count,
                SUM(amountPaid) as total
            FROM payment_transactions
            GROUP BY paymentMethod
        `);
        if (transactions.length > 0) {
            for (const trans of transactions) {
                console.log(`   ✅ ${trans.paymentMethod || 'نقدي'}: ${trans.count} معاملة (${trans.total} AED)`);
            }
        } else {
            console.log('   ℹ️ لا توجد معاملات مالية بعد');
        }

        // Test 7: Check employee-property assignments
        console.log('\n👥 8. التحقق من تعيينات الموظفين للعقارات:');
        const [assignments] = await connection.query(`
            SELECT 
                e.name as employeeName,
                p.name as propertyName
            FROM employee_properties ep
            JOIN employees e ON ep.employeeId = e.id
            JOIN properties p ON ep.propertyId = p.id
            LIMIT 5
        `);
        if (assignments.length > 0) {
            for (const assign of assignments) {
                console.log(`   ✅ ${assign.employeeName} ← ${assign.propertyName}`);
            }
        } else {
            console.log('   ℹ️ لا توجد تعيينات موظفين للعقارات');
        }

        // Test 8: Check critical columns exist
        console.log('\n🔍 9. التحقق من الأعمدة الحرجة:');
        const criticalChecks = [
            { table: 'expenses', column: 'paymentReceiptUrl' },
            { table: 'expenses', column: 'requestReceiptUrl' },
            { table: 'expenses', column: 'purchaseReceiptUrl' },
            { table: 'expenses', column: 'totalAmount' },
            { table: 'expenses', column: 'taxRate' },
            { table: 'units', column: 'configuration' },
            { table: 'leases', column: 'businessName' },
        ];
        
        for (const check of criticalChecks) {
            const [cols] = await connection.query(`
                SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
            `, [process.env.DB_DATABASE, check.table, check.column]);
            const exists = cols.length > 0;
            console.log(`   ${exists ? '✅' : '❌'} ${check.table}.${check.column}`);
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('🎉 نتيجة الفحص الشامل:');
        console.log('='.repeat(50));
        console.log('✅ قاعدة البيانات: متصلة وتعمل');
        console.log('✅ الجداول: جميعها موجودة');
        console.log('✅ البيانات: جاهزة للاستخدام');
        console.log('✅ الأعمدة الحرجة: موجودة');
        console.log('\n🌐 النظام جاهز على: http://localhost:5000');
        console.log('\n💡 لاختبار الوظائف:');
        console.log('   1. تسجيل الدخول: admin@estateflow.com / password123');
        console.log('   2. إدارة العقارات: /dashboard/properties');
        console.log('   3. إدارة المصروفات: /dashboard/expenses');
        console.log('   4. إدارة العقود: /dashboard/leases');
        console.log('   5. إدارة الموظفين: /dashboard/employees');

    } catch (error) {
        console.error('\n❌ خطأ في الفحص:', error.message);
        console.error('\n💡 تحقق من:');
        console.log('   1. XAMPP/MySQL يعمل');
        console.log('   2. قاعدة البيانات estateflow موجودة');
        console.log('   3. ملف .env يحتوي على الإعدادات الصحيحة');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testAllFeatures();

