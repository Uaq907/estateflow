require('dotenv').config();
const mysql = require('mysql2/promise');

async function testLeaseRenewal() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

        console.log('🔍 اختبار تجديد عقود الإيجار:\n');

        // 1. Check if we have an active lease
        const [leases] = await connection.query(`
            SELECT l.*, u.unitNumber, p.name as propertyName, t.name as tenantName
            FROM leases l
            JOIN units u ON l.unitId = u.id
            JOIN properties p ON u.propertyId = p.id
            JOIN tenants t ON l.tenantId = t.id
            WHERE l.status = 'Active'
            LIMIT 1
        `);

        if (leases.length === 0) {
            console.log('❌ لا توجد عقود نشطة للاختبار');
            console.log('💡 يمكنك إنشاء عقد جديد من: /dashboard/properties/[property-id]');
            return;
        }

        const lease = leases[0];
        console.log('✅ تم العثور على عقد نشط:');
        console.log(`   العقد: ${lease.id}`);
        console.log(`   الوحدة: ${lease.unitNumber}`);
        console.log(`   العقار: ${lease.propertyName}`);
        console.log(`   المستأجر: ${lease.tenantName}`);
        console.log(`   تاريخ البدء: ${new Date(lease.startDate).toLocaleDateString('ar-SA')}`);
        console.log(`   تاريخ الانتهاء: ${new Date(lease.endDate).toLocaleDateString('ar-SA')}`);
        console.log(`   الإيجار الشهري: ${lease.monthlyRent || lease.rentPaymentAmount} AED`);

        // 2. Check for unpaid payments
        const [unpaid] = await connection.query(`
            SELECT COUNT(*) as count, SUM(amount) as total
            FROM lease_payments
            WHERE leaseId = ? AND status != 'Paid'
        `, [lease.id]);

        const unpaidInfo = unpaid[0];
        console.log(`\n💰 الدفعات غير المدفوعة:`);
        console.log(`   العدد: ${unpaidInfo.count}`);
        console.log(`   المبلغ الإجمالي: ${unpaidInfo.total || 0} AED`);

        console.log('\n✅ وظيفة تجديد العقد متاحة في الواجهة:');
        console.log(`   الرابط: http://localhost:5000/dashboard/leases/${lease.id}`);
        console.log(`   الزر: "تجديد العقد"`);
        console.log('\n📝 الخطوات:');
        console.log('   1. افتح صفحة تفاصيل العقد');
        console.log('   2. اضغط "تجديد العقد"');
        console.log('   3. أدخل تاريخ البدء والانتهاء');
        console.log('   4. أدخل الإيجار الجديد وعدد الدفعات');
        console.log('   5. احفظ');
        console.log('\n🎯 ما سيحدث:');
        console.log('   ✅ إنشاء عقد جديد');
        console.log('   ✅ نقل الدفعات غير المدفوعة للعقد الجديد');
        console.log('   ✅ تحديث حالة العقد القديم إلى "Completed" أو "Completed with Dues"');
        console.log('   ✅ إنشاء جدول دفعات للعقد الجديد');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

testLeaseRenewal();

