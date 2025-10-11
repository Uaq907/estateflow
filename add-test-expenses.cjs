require('dotenv').config();
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

async function addTestExpenses() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('✅ متصل بقاعدة البيانات');

        // الحصول على أول موظف وعقار
        const [employees] = await connection.query('SELECT id FROM employees LIMIT 1');
        const [properties] = await connection.query('SELECT id FROM properties LIMIT 1');
        const [units] = await connection.query('SELECT id FROM units LIMIT 1');

        if (employees.length === 0 || properties.length === 0) {
            console.log('❌ لا توجد بيانات موظفين أو عقارات في قاعدة البيانات');
            return;
        }

        const employeeId = employees[0].id;
        const propertyId = properties[0].id;
        const unitId = units.length > 0 ? units[0].id : null;

        console.log('📊 إضافة بيانات تجريبية...');

        const testExpenses = [
            {
                id: randomUUID(),
                propertyId,
                unitId,
                employeeId,
                amount: 500,
                baseAmount: 500,
                category: 'Maintenance',
                supplier: 'شركة الصيانة السريعة',
                description: 'إصلاح تكييف الوحدة',
                status: 'Pending',
                taxNumber: 'VAT123456',
                isVat: true,
                taxAmount: 25,
                amountWithoutTax: 500,
                totalAmount: 525,
                taxRate: 5
            },
            {
                id: randomUUID(),
                propertyId,
                unitId,
                employeeId,
                amount: 1200,
                baseAmount: 1200,
                category: 'Utilities',
                supplier: 'شركة الكهرباء والماء',
                description: 'فاتورة الكهرباء والماء - يناير',
                status: 'Approved',
                taxNumber: null,
                isVat: false,
                taxAmount: 0,
                amountWithoutTax: 1200,
                totalAmount: 1200,
                taxRate: 0
            },
            {
                id: randomUUID(),
                propertyId,
                unitId: null,
                employeeId,
                amount: 3000,
                baseAmount: 3000,
                category: 'Marketing',
                supplier: 'وكالة التسويق الرقمي',
                description: 'حملة تسويقية للعقار',
                status: 'Pending',
                taxNumber: 'VAT789012',
                isVat: true,
                taxAmount: 150,
                amountWithoutTax: 3000,
                totalAmount: 3150,
                taxRate: 5
            },
            {
                id: randomUUID(),
                propertyId,
                unitId,
                employeeId,
                amount: 800,
                baseAmount: 800,
                category: 'Supplies',
                supplier: 'متجر مواد البناء',
                description: 'مواد تنظيف وصيانة',
                status: 'Pending',
                taxNumber: 'VAT345678',
                isVat: true,
                taxAmount: 40,
                amountWithoutTax: 800,
                totalAmount: 840,
                taxRate: 5
            },
            {
                id: randomUUID(),
                propertyId,
                unitId: null,
                employeeId,
                amount: 2500,
                baseAmount: 2500,
                category: 'Legal',
                supplier: 'مكتب المحاماة القانوني',
                description: 'استشارات قانونية',
                status: 'Pending',
                taxNumber: null,
                isVat: false,
                taxAmount: 0,
                amountWithoutTax: 2500,
                totalAmount: 2500,
                taxRate: 0
            },
            {
                id: randomUUID(),
                propertyId,
                unitId,
                employeeId,
                amount: 600,
                baseAmount: 600,
                category: 'Maintenance',
                supplier: 'شركة السباكة المحترفة',
                description: 'إصلاح تسريب الماء',
                status: 'Needs Correction',
                taxNumber: 'VAT567890',
                isVat: true,
                taxAmount: 30,
                amountWithoutTax: 600,
                totalAmount: 630,
                taxRate: 5,
                managerNotes: 'يرجى إرفاق فاتورة أصلية وإيصال الدفع'
            },
            {
                id: randomUUID(),
                propertyId,
                unitId: null,
                employeeId,
                amount: 4500,
                baseAmount: 4500,
                category: 'Other',
                supplier: 'شركة الأمن والحراسة',
                description: 'خدمات الأمن الشهرية',
                status: 'Approved',
                taxNumber: 'VAT901234',
                isVat: true,
                taxAmount: 225,
                amountWithoutTax: 4500,
                totalAmount: 4725,
                taxRate: 5
            },
            {
                id: randomUUID(),
                propertyId,
                unitId,
                employeeId,
                amount: 1500,
                baseAmount: 1500,
                category: 'Maintenance',
                supplier: 'شركة الدهانات الحديثة',
                description: 'دهان الوحدة',
                status: 'Rejected',
                taxNumber: 'VAT234567',
                isVat: true,
                taxAmount: 75,
                amountWithoutTax: 1500,
                totalAmount: 1575,
                taxRate: 5,
                managerNotes: 'السعر مرتفع جداً، يرجى الحصول على عرض سعر آخر'
            }
        ];

        for (const expense of testExpenses) {
            await connection.execute(
                `INSERT INTO expenses (
                    id, propertyId, unitId, employeeId, amount, baseAmount, category, 
                    supplier, description, status, taxNumber, isVat, taxAmount, 
                    amountWithoutTax, totalAmount, taxRate, managerNotes, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    expense.id,
                    expense.propertyId,
                    expense.unitId,
                    expense.employeeId,
                    expense.amount,
                    expense.baseAmount,
                    expense.category,
                    expense.supplier,
                    expense.description,
                    expense.status,
                    expense.taxNumber,
                    expense.isVat,
                    expense.taxAmount,
                    expense.amountWithoutTax,
                    expense.totalAmount,
                    expense.taxRate,
                    expense.managerNotes || null
                ]
            );
        }

        console.log(`✅ تم إضافة ${testExpenses.length} مصروف تجريبي بنجاح!`);
        console.log('\n📋 توزيع الحالات:');
        console.log('  - Pending: 4 مصروف');
        console.log('  - Approved: 2 مصروف');
        console.log('  - Needs Correction: 1 مصروف');
        console.log('  - Rejected: 1 مصروف');
        console.log('\n🌐 يمكنك الآن مشاهدة المصروفات على: http://localhost:5000/dashboard/expenses');

    } catch (error) {
        console.error('❌ خطأ:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

addTestExpenses();

