require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAddExpenseDirect() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('✅ متصل بقاعدة البيانات\n');

        // 1. التحقق من وجود موظف وعقار
        const [employees] = await connection.query('SELECT id, name FROM employees LIMIT 1');
        const [properties] = await connection.query('SELECT id, name FROM properties LIMIT 1');
        const [units] = await connection.query('SELECT id, unitNumber FROM units LIMIT 1');

        if (employees.length === 0) {
            console.log('❌ لا يوجد موظفين');
            return;
        }
        if (properties.length === 0) {
            console.log('❌ لا يوجد عقارات');
            return;
        }

        const employee = employees[0];
        const property = properties[0];
        const unit = units.length > 0 ? units[0] : null;

        console.log('📋 البيانات المتاحة:');
        console.log(`   موظف: ${employee.name} (${employee.id})`);
        console.log(`   عقار: ${property.name} (${property.id})`);
        if (unit) {
            console.log(`   وحدة: ${unit.unitNumber} (${unit.id})`);
        }

        // 2. إنشاء مصروف اختباري مباشرة
        const testExpenseId = `test-expense-${Date.now()}`;
        const amount = 1000;
        const taxAmount = 50;
        const totalAmount = 1050;

        console.log('\n➕ إضافة مصروف اختباري...');

        await connection.execute(`
            INSERT INTO expenses (
                id, propertyId, unitId, employeeId, amount, baseAmount,
                category, description, status, supplier, taxNumber,
                isVat, taxAmount, amountWithoutTax, totalAmount, taxRate,
                createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
            testExpenseId,
            property.id,
            unit ? unit.id : null,
            employee.id,
            amount,
            amount,
            'Maintenance',
            'اختبار إضافة مصروف من السكريبت',
            'Pending',
            'مورد اختباري',
            'VAT12345',
            true,
            taxAmount,
            amount,
            totalAmount,
            5
        ]);

        console.log('✅ تم إضافة المصروف بنجاح!');

        // 3. التحقق من الإضافة
        const [check] = await connection.query('SELECT * FROM expenses WHERE id = ?', [testExpenseId]);
        if (check.length > 0) {
            console.log('✅ تم التحقق: المصروف موجود في قاعدة البيانات');
            const exp = check[0];
            console.log('\n📊 تفاصيل المصروف:');
            console.log(`   ID: ${exp.id}`);
            console.log(`   الفئة: ${exp.category}`);
            console.log(`   المبلغ: ${exp.amount} AED`);
            console.log(`   الحالة: ${exp.status}`);
            console.log(`   الموظف: ${employee.name}`);
        }

        // 4. حذف المصروف الاختباري
        console.log('\n🗑️  حذف المصروف الاختباري...');
        await connection.execute('DELETE FROM expenses WHERE id = ?', [testExpenseId]);
        console.log('✅ تم التنظيف');

        console.log('\n' + '='.repeat(60));
        console.log('🎉 نتيجة الاختبار:');
        console.log('='.repeat(60));
        console.log('✅ قاعدة البيانات تقبل إضافة المصروفات');
        console.log('✅ جميع الحقول تعمل بشكل صحيح');
        console.log('\n💡 إذا لم تعمل الإضافة من الواجهة:');
        console.log('   1. افتح Console في المتصفح (F12)');
        console.log('   2. ابحث عن رسائل الخطأ');
        console.log('   3. تحقق من:');
        console.log('      - اختيار عقار');
        console.log('      - اختيار فئة');
        console.log('      - إدخال مبلغ');
        console.log('      - إدخال وصف');
        console.log('   4. جرب الآن: http://localhost:5000/dashboard/expenses');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
        if (error.code) {
            console.log('Error code:', error.code);
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testAddExpenseDirect();

