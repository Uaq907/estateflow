import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'estateflow',
};

async function completeImportTenants() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ تم الاتصال بقاعدة البيانات');

        // Import real tenants data
        console.log('📋 استيراد بيانات المستأجرين الحقيقية...');
        const realTenants = [
            {
                id: 'tenant-001',
                name: 'أحمد محمد الشامسي',
                email: 'ahmed.shamsi@example.com',
                phone: '+971501234567',
                nationality: 'الإمارات',
                emiratesId: '784-1990-1234567-1',
                passportNumber: 'A1234567',
                visaNumber: 'V1234567',
                visaExpiryDate: '2025-12-31',
                address: 'دبي، الإمارات العربية المتحدة',
                occupation: 'مهندس برمجيات',
                employer: 'شركة التقنية المتقدمة',
                monthlyIncome: 25000,
                emergencyContact: '+971509876543',
                allowLogin: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'tenant-002',
                name: 'فاطمة أحمد الزهراني',
                email: 'fatima.zahrani@example.com',
                phone: '+971502345678',
                nationality: 'السعودية',
                emiratesId: '784-1988-2345678-2',
                passportNumber: 'B2345678',
                visaNumber: 'V2345678',
                visaExpiryDate: '2025-11-30',
                address: 'دبي، الإمارات العربية المتحدة',
                occupation: 'محاسبة',
                employer: 'مؤسسة المالية الذكية',
                monthlyIncome: 18000,
                emergencyContact: '+971508765432',
                allowLogin: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'tenant-003',
                name: 'محمد عبدالله العتيبي',
                email: 'mohammed.otaibi@example.com',
                phone: '+971503456789',
                nationality: 'السعودية',
                emiratesId: '784-1985-3456789-3',
                passportNumber: 'C3456789',
                visaNumber: 'V3456789',
                visaExpiryDate: '2025-10-31',
                address: 'دبي، الإمارات العربية المتحدة',
                occupation: 'مدير مشاريع',
                employer: 'شركة التطوير العقاري',
                monthlyIncome: 35000,
                emergencyContact: '+971507654321',
                allowLogin: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        for (const tenant of realTenants) {
            await connection.execute(`
                INSERT INTO tenants (
                    id, name, email, phone, nationality, emiratesId, passportNumber, 
                    visaNumber, visaExpiryDate, address, occupation, employer, 
                    monthlyIncome, emergencyContact, allowLogin, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                tenant.id, tenant.name, tenant.email, tenant.phone, tenant.nationality,
                tenant.emiratesId, tenant.passportNumber, tenant.visaNumber, tenant.visaExpiryDate,
                tenant.address, tenant.occupation, tenant.employer, tenant.monthlyIncome,
                tenant.emergencyContact, tenant.allowLogin, tenant.createdAt, tenant.updatedAt
            ]);
        }
        console.log(`✅ تم استيراد ${realTenants.length} مستأجر`);

        // Import real leases data
        console.log('📋 استيراد بيانات عقود الإيجار الحقيقية...');
        const realLeases = [
            {
                id: 'lease-001',
                unitId: 'unit-marina-1501',
                tenantId: 'tenant-001',
                startDate: '2024-01-01',
                endDate: '2024-12-31',
                monthlyRent: 18000,
                deposit: 36000,
                status: 'Active',
                contractUrl: '/uploads/contracts/lease-001.pdf',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'lease-002',
                unitId: 'unit-business-802',
                tenantId: 'tenant-002',
                startDate: '2024-02-01',
                endDate: '2025-01-31',
                monthlyRent: 38000,
                deposit: 76000,
                status: 'Active',
                contractUrl: '/uploads/contracts/lease-002.pdf',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'lease-003',
                unitId: 'unit-villa-001',
                tenantId: 'tenant-003',
                startDate: '2024-03-01',
                endDate: '2025-02-28',
                monthlyRent: 65000,
                deposit: 130000,
                status: 'Active',
                contractUrl: '/uploads/contracts/lease-003.pdf',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        for (const lease of realLeases) {
            await connection.execute(`
                INSERT INTO leases (
                    id, unitId, tenantId, startDate, endDate, monthlyRent, 
                    deposit, status, contractUrl, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                lease.id, lease.unitId, lease.tenantId, lease.startDate, lease.endDate,
                lease.monthlyRent, lease.deposit, lease.status, lease.contractUrl,
                lease.createdAt, lease.updatedAt
            ]);
        }
        console.log(`✅ تم استيراد ${realLeases.length} عقد إيجار`);

        // Add some expenses data
        console.log('📋 إضافة بيانات المصروفات...');
        const realExpenses = [
            {
                id: 'expense-001',
                description: 'صيانة مصعد برج مارينا الشاطئ',
                amount: 2500,
                category: 'Maintenance',
                status: 'Approved',
                propertyId: 'prop-marina-tower',
                unitId: null,
                submittedBy: 'tenant-001',
                approvedBy: 'admin@oligo.ae',
                receiptUrl: '/uploads/receipts/expense-001.pdf',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'expense-002',
                description: 'تنظيف مجمع الأعمال التجارية',
                amount: 800,
                category: 'Cleaning',
                status: 'Pending',
                propertyId: 'prop-business-district',
                unitId: null,
                submittedBy: 'tenant-002',
                approvedBy: null,
                receiptUrl: '/uploads/receipts/expense-002.pdf',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'expense-003',
                description: 'إصلاح نظام التكييف في فيلا الشاطئ الذهبي',
                amount: 3500,
                category: 'HVAC',
                status: 'Approved',
                propertyId: 'prop-luxury-villa',
                unitId: 'unit-villa-001',
                submittedBy: 'tenant-003',
                approvedBy: 'admin@oligo.ae',
                receiptUrl: '/uploads/receipts/expense-003.pdf',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        for (const expense of realExpenses) {
            await connection.execute(`
                INSERT INTO expenses (
                    id, description, amount, category, status, propertyId, 
                    unitId, submittedBy, approvedBy, receiptUrl, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                expense.id, expense.description, expense.amount, expense.category,
                expense.status, expense.propertyId, expense.unitId, expense.submittedBy,
                expense.approvedBy, expense.receiptUrl, expense.createdAt, expense.updatedAt
            ]);
        }
        console.log(`✅ تم إضافة ${realExpenses.length} مصروف`);

        // Verify the final data
        console.log('\n🔍 التحقق من البيانات النهائية...');
        const [finalStats] = await connection.execute(`
            SELECT 
                (SELECT COUNT(*) FROM owners) as total_owners,
                (SELECT COUNT(*) FROM properties) as total_properties,
                (SELECT COUNT(*) FROM units) as total_units,
                (SELECT COUNT(*) FROM tenants) as total_tenants,
                (SELECT COUNT(*) FROM leases) as total_leases,
                (SELECT COUNT(*) FROM expenses) as total_expenses
        `);
        
        const stats = finalStats[0];
        console.log('الإحصائيات النهائية:');
        console.log(`- الملاك: ${stats.total_owners}`);
        console.log(`- العقارات: ${stats.total_properties}`);
        console.log(`- الوحدات: ${stats.total_units}`);
        console.log(`- المستأجرين: ${stats.total_tenants}`);
        console.log(`- عقود الإيجار: ${stats.total_leases}`);
        console.log(`- المصروفات: ${stats.total_expenses}`);

        console.log('\n🎉 تم استيراد جميع البيانات الحقيقية بنجاح!');

    } catch (error) {
        console.error('❌ خطأ في استيراد البيانات:', error);
    } finally {
        if (connection) await connection.end();
    }
}

completeImportTenants();
