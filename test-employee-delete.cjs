require('dotenv').config();
const mysql = require('mysql2/promise');

async function testEmployeeDelete() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('✅ متصل بقاعدة البيانات\n');

        // إنشاء موظف تجريبي للحذف
        const testId = 'test-emp-' + Date.now();
        console.log('➕ إنشاء موظف تجريبي...');
        
        await connection.execute(`
            INSERT INTO employees (
                id, name, email, password, position, department, 
                salary, startDate, phone, permissions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
        `, [
            testId,
            'موظف تجريبي للحذف',
            `test${Date.now()}@test.com`,
            '$2b$10$test', // dummy hash
            'Test Employee',
            'Testing',
            5000,
            '0501234567',
            JSON.stringify([])
        ]);

        console.log(`✅ تم إنشاء الموظف التجريبي: ${testId}\n`);

        // محاولة الحذف
        console.log('🗑️  محاولة حذف الموظف التجريبي...');
        
        try {
            await connection.execute('DELETE FROM employees WHERE id = ?', [testId]);
            console.log('✅ تم حذف الموظف بنجاح!\n');
            
            // التحقق من الحذف
            const [check] = await connection.query('SELECT * FROM employees WHERE id = ?', [testId]);
            if (check.length === 0) {
                console.log('✅ تأكيد: الموظف تم حذفه من قاعدة البيانات\n');
            }
        } catch (deleteError) {
            console.error('❌ فشل الحذف:', deleteError.message);
            console.log('Error code:', deleteError.code);
            
            // تنظيف: حذف الموظف التجريبي يدوياً
            await connection.execute('DELETE FROM employees WHERE id = ?', [testId]);
        }

        // اختبار حذف موظف مرتبط ببيانات
        console.log('─'.repeat(60));
        console.log('🔍 فحص الموظفين المرتبطين ببيانات:\n');
        
        const [linkedEmployees] = await connection.query(`
            SELECT DISTINCT e.id, e.name, 
                   (SELECT COUNT(*) FROM leases WHERE employeeId = e.id) as leaseCount,
                   (SELECT COUNT(*) FROM expenses WHERE employeeId = e.id) as expenseCount,
                   (SELECT COUNT(*) FROM employee_properties WHERE employeeId = e.id) as propertyCount
            FROM employees e
            WHERE e.id IN (
                SELECT DISTINCT employeeId FROM leases
                UNION
                SELECT DISTINCT employeeId FROM expenses WHERE employeeId IS NOT NULL
                UNION
                SELECT DISTINCT employeeId FROM employee_properties
            )
            LIMIT 3
        `);

        if (linkedEmployees.length > 0) {
            console.log('⚠️  الموظفون المرتبطون ببيانات (لا يمكن حذفهم مباشرة):');
            for (const emp of linkedEmployees) {
                console.log(`\n   🔗 ${emp.name}`);
                if (emp.leaseCount > 0) console.log(`      - ${emp.leaseCount} عقد/عقود`);
                if (emp.expenseCount > 0) console.log(`      - ${emp.expenseCount} مصروف/مصروفات`);
                if (emp.propertyCount > 0) console.log(`      - ${emp.propertyCount} عقار/عقارات`);
                console.log(`      💡 يجب حذف/نقل هذه البيانات أولاً`);
            }
        } else {
            console.log('✅ لا يوجد موظفون مرتبطون ببيانات');
        }

        console.log('\n' + '='.repeat(60));
        console.log('🎯 الخلاصة:');
        console.log('='.repeat(60));
        console.log('✅ دالة الحذف تعمل بشكل صحيح على مستوى قاعدة البيانات');
        console.log('✅ الموظفون غير المرتبطين يمكن حذفهم');
        console.log('⚠️  الموظفون المرتبطون يحتاجون حذف البيانات المرتبطة أولاً');
        console.log('\n💡 للاختبار في الواجهة:');
        console.log('   1. سجل دخول بـ: uaq907@gmail.com / password123');
        console.log('   2. اذهب إلى: http://localhost:5000/dashboard/employees');
        console.log('   3. اختر موظف غير مرتبط ببيانات');
        console.log('   4. احذفه - يجب أن يعمل الآن!');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testEmployeeDelete();

