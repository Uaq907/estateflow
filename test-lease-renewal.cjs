require('dotenv').config();
const mysql = require('mysql2/promise');

async function testLeaseRenewal() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('✅ متصل بقاعدة البيانات\n');

        // 1. Get a lease to test
        const [leases] = await connection.query(`
            SELECT l.*, u.unitNumber, t.name as tenantName, p.name as propertyName
            FROM leases l
            JOIN units u ON l.unitId = u.id
            JOIN tenants t ON l.tenantId = t.id
            JOIN properties p ON u.propertyId = p.id
            WHERE l.status = 'Active'
            LIMIT 1
        `);

        if (leases.length === 0) {
            console.log('❌ لا توجد عقود نشطة للاختبار');
            return;
        }

        const lease = leases[0];
        console.log('📋 العقد المستخدم للاختبار:');
        console.log(`   ID: ${lease.id}`);
        console.log(`   المستأجر: ${lease.tenantName}`);
        console.log(`   الوحدة: ${lease.unitNumber} في ${lease.propertyName}`);
        console.log(`   تاريخ البدء: ${new Date(lease.startDate).toLocaleDateString('ar-SA')}`);
        console.log(`   تاريخ الانتهاء: ${new Date(lease.endDate).toLocaleDateString('ar-SA')}`);
        console.log(`   المبلغ الشهري: ${lease.monthlyRent || lease.rentPaymentAmount || 'غير محدد'} AED`);

        // 2. Check unpaid payments
        const [unpaidPayments] = await connection.query(
            `SELECT * FROM lease_payments WHERE leaseId = ? AND status != 'Paid'`,
            [lease.id]
        );

        console.log(`\n💰 الدفعات غير المدفوعة: ${unpaidPayments.length} دفعة`);
        if (unpaidPayments.length > 0) {
            console.log('   (سيتم نقلها للعقد الجديد)');
            let totalUnpaid = 0;
            for (const payment of unpaidPayments) {
                totalUnpaid += parseFloat(payment.amount);
            }
            console.log(`   المجموع: ${totalUnpaid.toFixed(2)} AED`);
        }

        // 3. Simulate renewal data
        const newStartDate = new Date('2025-02-01');
        const newEndDate = new Date('2026-01-31');
        const newRentAmount = (parseFloat(lease.monthlyRent || lease.rentPaymentAmount || 20000) * 1.05); // 5% increase
        const numberOfPayments = 12;

        console.log('\n🔄 بيانات التجديد المقترحة:');
        console.log(`   تاريخ البدء الجديد: ${newStartDate.toLocaleDateString('ar-SA')}`);
        console.log(`   تاريخ الانتهاء الجديد: ${newEndDate.toLocaleDateString('ar-SA')}`);
        console.log(`   المبلغ الشهري الجديد: ${newRentAmount.toFixed(2)} AED (+5%)`);
        console.log(`   عدد الدفعات: ${numberOfPayments}`);
        console.log(`   إجمالي العقد: ${(newRentAmount * numberOfPayments).toFixed(2)} AED`);

        console.log('\n✅ الاختبار النظري نجح!');
        console.log('\n💡 لاختبار التجديد الفعلي:');
        console.log(`   1. اذهب إلى: http://localhost:5000/dashboard/leases/${lease.id}`);
        console.log('   2. اضغط "تجديد العقد"');
        console.log('   3. أدخل التواريخ والمبالغ الجديدة');
        console.log('   4. اضغط "تجديد العقد"');
        console.log('\n📌 تحقق من:');
        console.log('   ✅ إنشاء عقد جديد');
        console.log('   ✅ نقل المتأخرات (إن وجدت)');
        console.log('   ✅ تحديث العقد القديم إلى "Completed"');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testLeaseRenewal();

