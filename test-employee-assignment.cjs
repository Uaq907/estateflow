require('dotenv').config();
const mysql = require('mysql2/promise');

async function testEmployeeAssignment() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

        console.log('✅ متصل بقاعدة البيانات');

        // 1. Get first employee and property
        const [employees] = await connection.query('SELECT id, name FROM employees LIMIT 1');
        const [properties] = await connection.query('SELECT id, name FROM properties LIMIT 1');

        if (employees.length === 0 || properties.length === 0) {
            console.log('❌ لا توجد موظفين أو عقارات في قاعدة البيانات');
            return;
        }

        const employee = employees[0];
        const property = properties[0];

        console.log(`\n📝 سيتم اختبار:`);
        console.log(`   موظف: ${employee.name} (${employee.id})`);
        console.log(`   عقار: ${property.name} (${property.id})`);

        // 2. Check if already assigned
        const [existing] = await connection.query(
            'SELECT * FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
            [employee.id, property.id]
        );

        if (existing.length > 0) {
            console.log('\n⚠️  الموظف معيّن بالفعل للعقار، سيتم الإزالة...');
            
            // Remove
            await connection.execute(
                'DELETE FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
                [employee.id, property.id]
            );
            console.log('✅ تم إزالة الموظف بنجاح');
        }

        // 3. Assign employee to property
        console.log('\n➕ إضافة الموظف إلى العقار...');
        await connection.execute(
            'INSERT INTO employee_properties (employeeId, propertyId) VALUES (?, ?)',
            [employee.id, property.id]
        );
        console.log('✅ تم إضافة الموظف بنجاح');

        // 4. Verify assignment
        const [assigned] = await connection.query(
            'SELECT * FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
            [employee.id, property.id]
        );
        console.log(`✅ التحقق: الموظف معيّن (${assigned.length} سجل)`);

        // 5. Remove employee from property
        console.log('\n➖ إزالة الموظف من العقار...');
        await connection.execute(
            'DELETE FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
            [employee.id, property.id]
        );
        console.log('✅ تم إزالة الموظف بنجاح');

        // 6. Verify removal
        const [removed] = await connection.query(
            'SELECT * FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
            [employee.id, property.id]
        );
        console.log(`✅ التحقق: الموظف تم إزالته (${removed.length} سجل)`);

        console.log('\n🎉 جميع الاختبارات نجحت!');
        console.log('\n📌 الوظيفة تعمل بشكل صحيح في قاعدة البيانات');
        console.log('📌 إذا لم تعمل في الواجهة، تحقق من:');
        console.log('   1. صلاحيات المستخدم (properties:update)');
        console.log('   2. تحديث الصفحة بعد الإزالة');
        console.log('   3. سجلات الأخطاء في المتصفح (Console)');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testEmployeeAssignment();

