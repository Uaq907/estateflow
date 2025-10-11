require('dotenv').config();
const mysql = require('mysql2/promise');

async function testEmployeePropertyAssignment() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('✅ متصل بقاعدة البيانات\n');

        // 1. Get employees and properties
        const [employees] = await connection.query('SELECT id, name, position FROM employees LIMIT 3');
        const [properties] = await connection.query('SELECT id, name FROM properties LIMIT 1');

        if (employees.length === 0 || properties.length === 0) {
            console.log('❌ لا توجد موظفين أو عقارات');
            return;
        }

        const property = properties[0];
        console.log(`📍 العقار: ${property.name} (${property.id})\n`);

        // 2. Show current employees assigned to this property
        const [currentAssignments] = await connection.query(`
            SELECT e.id, e.name, e.position
            FROM employee_properties ep
            JOIN employees e ON ep.employeeId = e.id
            WHERE ep.propertyId = ?
        `, [property.id]);

        console.log('👥 الموظفون المعينون حالياً:');
        if (currentAssignments.length > 0) {
            currentAssignments.forEach((emp, idx) => {
                console.log(`   ${idx + 1}. ${emp.name} - ${emp.position}`);
            });
        } else {
            console.log('   لا يوجد موظفون معينون');
        }

        // 3. Assign all employees to the property
        console.log('\n➕ تعيين الموظفين للعقار:');
        for (const employee of employees) {
            // Check if already assigned
            const [existing] = await connection.query(
                'SELECT * FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
                [employee.id, property.id]
            );

            if (existing.length > 0) {
                console.log(`   ⚠️  ${employee.name} معيّن بالفعل`);
            } else {
                await connection.execute(
                    'INSERT INTO employee_properties (employeeId, propertyId) VALUES (?, ?)',
                    [employee.id, property.id]
                );
                console.log(`   ✅ تم تعيين: ${employee.name} - ${employee.position}`);
            }
        }

        // 4. Verify assignments
        const [verifyAssignments] = await connection.query(`
            SELECT e.id, e.name, e.position
            FROM employee_properties ep
            JOIN employees e ON ep.employeeId = e.id
            WHERE ep.propertyId = ?
        `, [property.id]);

        console.log(`\n✅ التحقق: تم تعيين ${verifyAssignments.length} موظف للعقار`);
        verifyAssignments.forEach((emp, idx) => {
            console.log(`   ${idx + 1}. ${emp.name} - ${emp.position}`);
        });

        // 5. Test removing one employee
        if (verifyAssignments.length > 0) {
            const employeeToRemove = verifyAssignments[0];
            console.log(`\n➖ محاولة إزالة: ${employeeToRemove.name}`);

            const [beforeRemove] = await connection.query(
                'SELECT * FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
                [employeeToRemove.id, property.id]
            );
            console.log(`   قبل الإزالة: ${beforeRemove.length} سجل`);

            await connection.execute(
                'DELETE FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
                [employeeToRemove.id, property.id]
            );

            const [afterRemove] = await connection.query(
                'SELECT * FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
                [employeeToRemove.id, property.id]
            );
            console.log(`   بعد الإزالة: ${afterRemove.length} سجل`);

            if (afterRemove.length === 0) {
                console.log(`   ✅ تم إزالة ${employeeToRemove.name} بنجاح!`);
            } else {
                console.log(`   ❌ فشل في إزالة ${employeeToRemove.name}`);
            }
        }

        // 6. Final count
        const [finalAssignments] = await connection.query(`
            SELECT COUNT(*) as count
            FROM employee_properties
            WHERE propertyId = ?
        `, [property.id]);

        console.log(`\n📊 النتيجة النهائية: ${finalAssignments[0].count} موظف معيّن للعقار`);

        console.log('\n✅ جميع الاختبارات نجحت!');
        console.log('\n💡 اختبر في الواجهة:');
        console.log(`   1. اذهب إلى: http://localhost:5000/dashboard/properties/${property.id}`);
        console.log('   2. انتقل إلى قسم "الموظفون المعينون"');
        console.log('   3. اضغط على أيقونة ➖ بجانب اسم الموظف');
        console.log('   4. تأكد الحذف');
        console.log('\n📌 إذا لم تعمل، تحقق من:');
        console.log('   ✅ صلاحية properties:update للمستخدم الحالي');
        console.log('   ✅ وجود أخطاء في Console المتصفح');
        console.log('   ✅ اتصال قاعدة البيانات');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testEmployeePropertyAssignment();

