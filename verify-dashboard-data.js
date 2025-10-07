import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'estateflow',
};

async function verifyDashboardData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ تم الاتصال بقاعدة البيانات');

        // Test the exact query used by getProperties
        console.log('🔍 اختبار استعلام getProperties...');
        const [properties] = await connection.execute(`
            SELECT 
                p.*,
                o.name as ownerName,
                (SELECT COUNT(*) FROM units WHERE propertyId = p.id) as totalUnits,
                (SELECT COUNT(*) FROM units WHERE propertyId = p.id AND status = 'Rented') as occupiedUnits,
                (SELECT COUNT(*) FROM units WHERE propertyId = p.id AND status = 'Available') as availableUnits,
                (SELECT COUNT(*) FROM leases l JOIN units u ON l.unitId = u.id WHERE u.propertyId = p.id AND l.status = 'Active' AND (l.contractUrl IS NULL OR l.contractUrl = '')) as leasesWithoutContract
            FROM properties p 
            LEFT JOIN owners o ON p.ownerId = o.id
            ORDER BY p.name
        `);
        
        console.log(`✅ تم جلب ${properties.length} عقار:`);
        properties.forEach(prop => {
            console.log(`- ${prop.name} (${prop.type})`);
            console.log(`  المالك: ${prop.ownerName}`);
            console.log(`  الموقع: ${prop.location}`);
            console.log(`  الوحدات: ${prop.totalUnits} (مستأجرة: ${prop.occupiedUnits}, متاحة: ${prop.availableUnits})`);
            console.log(`  السعر: ${prop.price} درهم`);
            console.log('');
        });

        // Test getEmployees
        console.log('🔍 اختبار استعلام getEmployees...');
        const [employees] = await connection.execute('SELECT * FROM employees ORDER BY name');
        console.log(`✅ تم جلب ${employees.length} موظف:`);
        employees.forEach(emp => {
            console.log(`- ${emp.name} (${emp.email})`);
        });

        // Test getTenants
        console.log('\n🔍 اختبار استعلام getTenants...');
        const [tenants] = await connection.execute('SELECT * FROM tenants ORDER BY name');
        console.log(`✅ تم جلب ${tenants.length} مستأجر:`);
        tenants.forEach(tenant => {
            console.log(`- ${tenant.name} (${tenant.email})`);
        });

        // Test getExpenses
        console.log('\n🔍 اختبار استعلام getExpenses...');
        const [expenses] = await connection.execute('SELECT * FROM expenses ORDER BY createdAt DESC');
        console.log(`✅ تم جلب ${expenses.length} مصروف:`);
        expenses.forEach(expense => {
            console.log(`- ${expense.description} - ${expense.amount} درهم (${expense.status})`);
        });

        // Test getLeases
        console.log('\n🔍 اختبار استعلام getLeases...');
        const [leases] = await connection.execute('SELECT * FROM leases ORDER BY createdAt DESC');
        console.log(`✅ تم جلب ${leases.length} عقد إيجار:`);
        leases.forEach(lease => {
            console.log(`- عقد ${lease.id} - ${lease.status} - ${lease.monthlyRent} درهم/شهر`);
        });

        console.log('\n🎉 جميع البيانات جاهزة للعرض في Dashboard!');

    } catch (error) {
        console.error('❌ خطأ في التحقق من البيانات:', error);
    } finally {
        if (connection) await connection.end();
    }
}

verifyDashboardData();
