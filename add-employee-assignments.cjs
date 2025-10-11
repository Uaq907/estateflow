require('dotenv').config();
const mysql = require('mysql2/promise');

async function addEmployeeAssignments() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('✅ متصل بقاعدة البيانات\n');

        // الحصول على أول عقار
        const [properties] = await connection.query('SELECT id, name FROM properties LIMIT 1');
        if (properties.length === 0) {
            console.log('❌ لا توجد عقارات في قاعدة البيانات');
            return;
        }

        const property = properties[0];
        console.log(`📍 العقار: ${property.name} (${property.id})\n`);

        // الحصول على الموظفين (أول 3 موظفين)
        const [employees] = await connection.query('SELECT id, name, position FROM employees LIMIT 3');
        if (employees.length === 0) {
            console.log('❌ لا توجد موظفين في قاعدة البيانات');
            return;
        }

        console.log('👥 الموظفين المتاحين:');
        for (const emp of employees) {
            console.log(`   - ${emp.name} (${emp.position})`);
        }

        console.log('\n🔄 تعيين الموظفين للعقار...\n');

        let assigned = 0;
        for (const employee of employees) {
            try {
                // حذف التعيين القديم إن وجد
                await connection.execute(
                    'DELETE FROM employee_properties WHERE employeeId = ? AND propertyId = ?',
                    [employee.id, property.id]
                );

                // إضافة تعيين جديد
                await connection.execute(
                    'INSERT INTO employee_properties (employeeId, propertyId) VALUES (?, ?)',
                    [employee.id, property.id]
                );

                console.log(`✅ تم تعيين: ${employee.name} (${employee.position})`);
                assigned++;
            } catch (error) {
                console.log(`❌ فشل تعيين ${employee.name}: ${error.message}`);
            }
        }

        console.log(`\n🎉 تم تعيين ${assigned} موظف للعقار بنجاح!`);

        // التحقق
        const [result] = await connection.query(`
            SELECT e.name, e.position
            FROM employee_properties ep
            JOIN employees e ON ep.employeeId = e.id
            WHERE ep.propertyId = ?
        `, [property.id]);

        console.log('\n📋 الموظفون المعينون حالياً:');
        for (const emp of result) {
            console.log(`   ✅ ${emp.name} - ${emp.position}`);
        }

        console.log(`\n🌐 اذهب إلى: http://localhost:5000/dashboard/properties/${property.id}`);
        console.log('   يمكنك الآن رؤية الموظفين المعينين وحذفهم');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addEmployeeAssignments();

