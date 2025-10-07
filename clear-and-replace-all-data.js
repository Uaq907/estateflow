import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'estateflow',
};

async function clearAndReplaceAllData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ تم الاتصال بقاعدة البيانات');

        // Clear ALL existing data (except employees and system tables)
        console.log('🗑️ حذف جميع البيانات المؤقتة...');
        
        // Delete in correct order to avoid foreign key constraints
        await connection.execute('DELETE FROM lease_payments');
        await connection.execute('DELETE FROM leases');
        await connection.execute('DELETE FROM expenses');
        await connection.execute('DELETE FROM units');
        await connection.execute('DELETE FROM properties');
        await connection.execute('DELETE FROM tenants');
        await connection.execute('DELETE FROM owners');
        
        console.log('✅ تم حذف جميع البيانات المؤقتة');

        // Import clean real data
        console.log('📋 استيراد البيانات الحقيقية النظيفة...');
        
        // 1. Import real owners
        const realOwners = [
            {
                id: 1,
                name: 'شركة العقارات المتقدمة',
                email: 'info@advancedestates.ae',
                phone: '+971412345678',
                nationality: 'الإمارات',
                address: 'دبي، الإمارات العربية المتحدة',
                id_number: '784-2023-001234-1',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 2,
                name: 'مجموعة الاستثمار العقاري',
                email: 'contact@realestateinvest.ae',
                phone: '+971422345678',
                nationality: 'الإمارات',
                address: 'أبو ظبي، الإمارات العربية المتحدة',
                id_number: '784-2023-002345-2',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 3,
                name: 'شركة التطوير العقاري الذكي',
                email: 'development@smartrealestate.ae',
                phone: '+971432345678',
                nationality: 'السعودية',
                address: 'الشارقة، الإمارات العربية المتحدة',
                id_number: '784-2023-003456-3',
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        for (const owner of realOwners) {
            await connection.execute(`
                INSERT INTO owners (id, name, email, phone, nationality, address, id_number, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [owner.id, owner.name, owner.email, owner.phone, owner.nationality, owner.address, owner.id_number, owner.created_at, owner.updated_at]);
        }
        console.log(`✅ تم استيراد ${realOwners.length} مالك`);

        // 2. Import real properties
        const realProperties = [
            {
                id: 'prop-marina-tower',
                name: 'برج مارينا الشاطئ',
                type: 'Residential',
                location: 'دبي مارينا، دبي',
                status: 'Active',
                price: 3500000,
                size: 150,
                sizeUnit: 'sqm',
                description: 'برج سكني فاخر في قلب دبي مارينا مع إطلالات بحرية خلابة',
                address: 'دبي مارينا، دبي، الإمارات العربية المتحدة',
                floors: 55,
                rooms: 4,
                configuration: '4 غرف نوم، 3 حمام، صالة، مطبخ، شرفة',
                ownerId: 1,
                managerId: null
            },
            {
                id: 'prop-business-district',
                name: 'مجمع الأعمال التجارية',
                type: 'Commercial',
                location: 'دبي مول، دبي',
                status: 'Active',
                price: 7500000,
                size: 400,
                sizeUnit: 'sqm',
                description: 'مجمع تجاري متكامل في قلب دبي مول مع مرافق حديثة',
                address: 'دبي مول، دبي، الإمارات العربية المتحدة',
                floors: 35,
                rooms: 12,
                configuration: '12 مكتب، 3 صالات اجتماعات، مطبخ، موقف سيارات',
                ownerId: 2,
                managerId: null
            },
            {
                id: 'prop-luxury-villa',
                name: 'فيلا الشاطئ الذهبي',
                type: 'Villa',
                location: 'جميرا، دبي',
                status: 'Active',
                price: 12500000,
                size: 800,
                sizeUnit: 'sqm',
                description: 'فيلا فاخرة على الشاطئ مع حديقة خاصة وحمام سباحة ومرسى خاص',
                address: 'جميرا، دبي، الإمارات العربية المتحدة',
                floors: 3,
                rooms: 8,
                configuration: '8 غرف نوم، 6 حمامات، صالة، مطبخ، حديقة، حمام سباحة',
                ownerId: 3,
                managerId: null
            }
        ];

        for (const property of realProperties) {
            await connection.execute(`
                INSERT INTO properties (
                    id, name, type, location, status, price, size, sizeUnit, 
                    description, address, floors, rooms, configuration, ownerId, managerId
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                property.id, property.name, property.type, property.location,
                property.status, property.price, property.size, property.sizeUnit,
                property.description, property.address, property.floors, property.rooms,
                property.configuration, property.ownerId, property.managerId
            ]);
        }
        console.log(`✅ تم استيراد ${realProperties.length} عقار`);

        // 3. Import real units
        const realUnits = [
            // Units for برج مارينا الشاطئ
            { id: 'unit-marina-1501', propertyId: 'prop-marina-tower', unitNumber: 'A-1501', type: 'Apartment', status: 'Rented', rentPrice: 18000, size: 150 },
            { id: 'unit-marina-1502', propertyId: 'prop-marina-tower', unitNumber: 'A-1502', type: 'Apartment', status: 'Available', rentPrice: 19000, size: 155 },
            { id: 'unit-marina-1503', propertyId: 'prop-marina-tower', unitNumber: 'A-1503', type: 'Apartment', status: 'Rented', rentPrice: 18500, size: 148 },
            
            // Units for مجمع الأعمال التجارية
            { id: 'unit-business-801', propertyId: 'prop-business-district', unitNumber: 'B-0801', type: 'Office', status: 'Available', rentPrice: 35000, size: 200 },
            { id: 'unit-business-802', propertyId: 'prop-business-district', unitNumber: 'B-0802', type: 'Office', status: 'Rented', rentPrice: 38000, size: 220 },
            { id: 'unit-business-803', propertyId: 'prop-business-district', unitNumber: 'B-0803', type: 'Office', status: 'Rented', rentPrice: 36000, size: 210 },
            
            // Units for فيلا الشاطئ الذهبي
            { id: 'unit-villa-001', propertyId: 'prop-luxury-villa', unitNumber: 'V-001', type: 'Villa', status: 'Rented', rentPrice: 65000, size: 800 },
            { id: 'unit-villa-002', propertyId: 'prop-luxury-villa', unitNumber: 'V-002', type: 'Villa', status: 'Available', rentPrice: 68000, size: 820 },
        ];

        for (const unit of realUnits) {
            await connection.execute(`
                INSERT INTO units (
                    id, propertyId, unitNumber, type, status, rentPrice, size, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [unit.id, unit.propertyId, unit.unitNumber, unit.type, unit.status, unit.rentPrice, unit.size]);
        }
        console.log(`✅ تم استيراد ${realUnits.length} وحدة`);

        // 4. Import real tenants
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

        // 5. Import real leases
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

        // 6. Import some expenses
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
            }
        ];

        // Get admin employee ID
        const [adminResult] = await connection.execute("SELECT id FROM employees WHERE email = 'admin@oligo.ae'");
        const adminId = adminResult[0]?.id || '1';

        for (const expense of realExpenses) {
            await connection.execute(`
                INSERT INTO expenses (
                    id, description, amount, category, status, propertyId, 
                    unitId, employeeId, submittedBy, approvedBy, receiptUrl, createdAt, updatedAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                expense.id, expense.description, expense.amount, expense.category,
                expense.status, expense.propertyId, expense.unitId, adminId, expense.submittedBy,
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

        // Show properties with owners
        console.log('\n📋 العقارات مع الملاك:');
        const [propertiesWithOwners] = await connection.execute(`
            SELECT p.name as property_name, p.type, p.location, o.name as owner_name 
            FROM properties p 
            LEFT JOIN owners o ON p.ownerId = o.id 
            ORDER BY p.name
        `);
        
        propertiesWithOwners.forEach(prop => {
            console.log(`- ${prop.property_name} (${prop.type}) - المالك: ${prop.owner_name} - الموقع: ${prop.location}`);
        });

        console.log('\n🎉 تم استبدال جميع البيانات بنجاح!');

    } catch (error) {
        console.error('❌ خطأ في استبدال البيانات:', error);
    } finally {
        if (connection) await connection.end();
    }
}

clearAndReplaceAllData();
