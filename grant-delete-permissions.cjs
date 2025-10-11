require('dotenv').config();
const mysql = require('mysql2/promise');

async function grantDeletePermissions() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('✅ متصل بقاعدة البيانات\n');

        // Get admin employees
        const [admins] = await connection.query(`
            SELECT id, name, email, permissions, position
            FROM employees 
            WHERE position LIKE '%Admin%' OR position LIKE '%Manager%'
        `);

        if (admins.length === 0) {
            console.log('⚠️ لا يوجد موظفين إداريين');
            return;
        }

        console.log('🔧 منح صلاحيات الحذف للمدراء:\n');

        for (const admin of admins) {
            let perms = [];
            try {
                perms = typeof admin.permissions === 'string' ? JSON.parse(admin.permissions) : admin.permissions || [];
            } catch(e) {
                perms = [];
            }

            // إضافة صلاحية الحذف إذا لم تكن موجودة
            if (!perms.includes('employees:delete') && !perms.includes('all')) {
                perms.push('employees:delete');
                perms.push('employees:create');
                perms.push('employees:update');
                perms.push('employees:read');
                
                await connection.execute(
                    'UPDATE employees SET permissions = ? WHERE id = ?',
                    [JSON.stringify(perms), admin.id]
                );

                console.log(`✅ ${admin.name} (${admin.position})`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   الصلاحيات الممنوحة: employees:delete, employees:create, employees:update, employees:read`);
                console.log('');
            } else {
                console.log(`ℹ️  ${admin.name} - لديه الصلاحيات بالفعل`);
            }
        }

        console.log('🎉 تم تحديث الصلاحيات بنجاح!');
        console.log('\n💡 الآن يمكنك:');
        console.log('   1. تسجيل الدخول بأي حساب مدير');
        console.log('   2. الذهاب إلى: http://localhost:5000/dashboard/employees');
        console.log('   3. حذف أي موظف من القائمة');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

grantDeletePermissions();

