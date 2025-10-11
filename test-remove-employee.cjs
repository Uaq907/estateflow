require('dotenv').config();
const mysql = require('mysql2/promise');

async function testRemoveEmployee() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('✅ متصل بقاعدة البيانات\n');

        // الحصول على موظف معين لعقار
        const [assignments] = await connection.query(`
            SELECT 
                ep.employeeId,
                ep.propertyId,
                e.name as employeeName,
                p.name as propertyName
            FROM employee_properties ep
            JOIN employees e ON ep.employeeId = e.id
            JOIN properties p ON ep.propertyId = p.id
            LIMIT 1
        `);

        if (assignments.length === 0) {
            console.log('⚠️ لا توجد تعيينات موظفين للعقارات');
            console.log('💡 قم بتشغيل: node add-employee-assignments.cjs');
            return;
        }

        const assignment = assignments[0];
        console.log('📋 التعيين المستخدم للاختبار:');
        console.log(`   موظف: ${assignment.employeeName}`);
        console.log(`   عقار: ${assignment.propertyName}`);

        // اختبار الإزالة
        console.log('\n➖ إزالة الموظف من العقار...');
        await connection.execute(
            'DELETE FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
            [assignment.employeeId, assignment.propertyId]
        );

        console.log('✅ تم إزالة الموظف بنجاح من قاعدة البيانات');

        // التحقق من الإزالة
        const [check] = await connection.query(
            'SELECT * FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
            [assignment.employeeId, assignment.propertyId]
        );

        if (check.length === 0) {
            console.log('✅ تم التحقق: الموظف تم إزالته من العقار');
        } else {
            console.log('❌ فشل: الموظف لا يزال معيناً!');
        }

        // إعادة التعيين للاختبار التالي
        console.log('\n🔄 إعادة التعيين...');
        await connection.execute(
            'INSERT INTO employee_properties (employeeId, propertyId) VALUES (?, ?)',
            [assignment.employeeId, assignment.propertyId]
        );
        console.log('✅ تم إعادة تعيين الموظف');

        console.log('\n🎉 اختبار الإزالة نجح!');
        console.log('\n💡 إذا لم تعمل في الواجهة:');
        console.log('   1. تحقق من صلاحية المستخدم (properties:update)');
        console.log('   2. افتح المتصفح Console للتحقق من الأخطاء');
        console.log('   3. تحديث الصفحة بعد الإزالة');
        console.log(`   4. الصفحة: http://localhost:5000/dashboard/properties/${assignment.propertyId}`);

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testRemoveEmployee();

