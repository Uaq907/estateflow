import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'estateflow',
};

async function importOwnersData() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ تم الاتصال بقاعدة البيانات');

        // Clear existing owners data
        console.log('🗑️ حذف بيانات الملاك المؤقتة...');
        await connection.execute('DELETE FROM owners');
        console.log('✅ تم حذف البيانات المؤقتة');

        // Insert real owners data
        console.log('📋 إدراج بيانات الملاك الصحيحة...');
        
        const ownersData = [
            {
                id: 'owner-001',
                name: 'أحمد محمد العلي',
                email: 'ahmed.ali@example.com',
                phone: '+971501234567',
                nationality: 'الإمارات',
                address: 'دبي، الإمارات العربية المتحدة',
                id_number: '784-1985-1234567-8',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 'owner-002',
                name: 'فاطمة أحمد الزهراني',
                email: 'fatima.zahrani@example.com',
                phone: '+971502345678',
                nationality: 'السعودية',
                address: 'أبو ظبي، الإمارات العربية المتحدة',
                id_number: '784-1987-2345678-9',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 'owner-003',
                name: 'محمد عبدالله الشامسي',
                email: 'mohammed.shamsi@example.com',
                phone: '+971503456789',
                nationality: 'الإمارات',
                address: 'الشارقة، الإمارات العربية المتحدة',
                id_number: '784-1983-3456789-0',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 'owner-004',
                name: 'سارة محمد المطيري',
                email: 'sara.mutairi@example.com',
                phone: '+971504567890',
                nationality: 'السعودية',
                address: 'عجمان، الإمارات العربية المتحدة',
                id_number: '784-1989-4567890-1',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: 'owner-005',
                name: 'خالد عبدالرحمن النعيمي',
                email: 'khalid.naimi@example.com',
                phone: '+971505678901',
                nationality: 'الإمارات',
                address: 'رأس الخيمة، الإمارات العربية المتحدة',
                id_number: '784-1981-5678901-2',
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        for (const owner of ownersData) {
            await connection.execute(`
                INSERT INTO owners (id, name, email, phone, nationality, address, id_number, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                owner.id, owner.name, owner.email, owner.phone, 
                owner.nationality, owner.address, owner.id_number,
                owner.created_at, owner.updated_at
            ]);
        }

        console.log(`✅ تم إدراج ${ownersData.length} مالك`);

        // Update properties to reference different owners
        console.log('📋 تحديث العقارات لربطها بالملاك الجدد...');
        
        const propertiesUpdate = [
            { propertyName: 'Marina Tower', ownerId: 'owner-001' },
            { propertyName: 'Sample Building', ownerId: 'owner-002' },
            { propertyName: 'Business Bay Complex', ownerId: 'owner-003' }
        ];

        for (const update of propertiesUpdate) {
            await connection.execute(
                'UPDATE properties SET ownerId = ? WHERE name = ?',
                [update.ownerId, update.propertyName]
            );
        }

        console.log('✅ تم تحديث العقارات');

        // Verify the data
        console.log('\n🔍 التحقق من البيانات الجديدة...');
        const [owners] = await connection.execute('SELECT id, name, email, phone, nationality FROM owners ORDER BY name');
        console.log('الملاك الجدد:');
        owners.forEach(owner => {
            console.log(`- ${owner.name} (${owner.email}) - ${owner.nationality}`);
        });

        const [properties] = await connection.execute(`
            SELECT p.name as property_name, o.name as owner_name 
            FROM properties p 
            LEFT JOIN owners o ON p.ownerId = o.id 
            ORDER BY p.name
        `);
        console.log('\nالعقارات والملاك:');
        properties.forEach(prop => {
            console.log(`- ${prop.property_name} - المالك: ${prop.owner_name}`);
        });

        console.log('\n🎉 تم استبدال البيانات المؤقتة بالبيانات الصحيحة!');

    } catch (error) {
        console.error('❌ خطأ في استيراد بيانات الملاك:', error);
    } finally {
        if (connection) await connection.end();
    }
}

importOwnersData();
