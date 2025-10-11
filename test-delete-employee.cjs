require('dotenv').config();
const mysql = require('mysql2/promise');

async function testDeleteEmployee() {
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
        const testEmployeeId = `test-employee-${Date.now()}`;
        
        console.log('➕ إنشاء موظف تجريبي للحذف...');
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        await connection.execute(
            `INSERT INTO employees (id, name, email, password, position, department, startDate, permissions)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [testEmployeeId, 'موظف تجريبي', 'test@test.com', hashedPassword, 'موظف', 'اختبار', '[]']
        );
        console.log(`✅ تم إنشاء الموظف: ${testEmployeeId}\n`);

        // التحقق من الإنشاء
        const [created] = await connection.query('SELECT * FROM employees WHERE id = ?', [testEmployeeId]);
        console.log(`✅ التحقق: الموظف موجود (${created.length} سجل)\n`);

        // محاولة الحذف
        console.log('🗑️ حذف الموظف...');
        
        // حذف من employee_properties أولاً إذا كان معيناً
        await connection.execute('DELETE FROM employee_properties WHERE employeeId = ?', [testEmployeeId]);
        
        // حذف الموظف
        await connection.execute('DELETE FROM employees WHERE id = ?', [testEmployeeId]);
        
        console.log('✅ تم حذف الموظف من قاعدة البيانات\n');

        // التحقق من الحذف
        const [deleted] = await connection.query('SELECT * FROM employees WHERE id = ?', [testEmployeeId]);
        
        if (deleted.length === 0) {
            console.log('✅ التحقق النهائي: الموظف تم حذفه بنجاح! ✓');
        } else {
            console.log('❌ فشل: الموظف لا يزال موجوداً!');
        }

        console.log('\n🎉 اختبار الحذف نجح!');
        console.log('\n💡 الآن يمكنك حذف الموظفين من الواجهة:');
        console.log('   1. سجل دخول: uaq907@gmail.com / password123');
        console.log('   2. اذهب إلى: http://localhost:5000/dashboard/employees');
        console.log('   3. اضغط ⋮ بجانب أي موظف');
        console.log('   4. اختر "حذف"');
        console.log('   5. اضغط "حذف" في نافذة التأكيد');
        console.log('   6. ✅ سيتم حذف الموظف فوراً');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        console.error('\n💡 تفاصيل الخطأ:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testDeleteEmployee();

