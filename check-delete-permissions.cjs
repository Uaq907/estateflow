require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDeletePermissions() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'estateflow'
        });

        console.log('🔐 فحص صلاحيات حذف الموظفين:\n');
        console.log('='.repeat(60));

        const [employees] = await connection.query('SELECT id, name, email, permissions FROM employees');
        
        for (const emp of employees) {
            let perms = [];
            try {
                perms = typeof emp.permissions === 'string' ? JSON.parse(emp.permissions) : emp.permissions || [];
            } catch(e) {
                perms = [];
            }
            
            const canDelete = perms.includes('employees:delete') || perms.includes('all');
            
            console.log(`\n${canDelete ? '✅' : '❌'} ${emp.name} (${emp.email})`);
            console.log(`   صلاحية الحذف: ${canDelete ? 'نعم ✓' : 'لا ✗'}`);
            
            if (perms.length > 0) {
                const hasEmployeesDelete = perms.includes('employees:delete');
                const hasAll = perms.includes('all');
                
                if (hasAll) {
                    console.log(`   الصلاحيات: all (جميع الصلاحيات)`);
                } else if (hasEmployeesDelete) {
                    console.log(`   الصلاحيات: تشمل employees:delete`);
                } else {
                    console.log(`   الصلاحيات: ${perms.slice(0,3).join(', ')}${perms.length > 3 ? ` ... (${perms.length} إجمالاً)` : ''}`);
                }
            } else {
                console.log(`   الصلاحيات: لا توجد صلاحيات`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n💡 لإعطاء صلاحية الحذف لموظف:');
        console.log('   1. سجل دخول كمدير في: http://localhost:5000');
        console.log('   2. اذهب إلى: /dashboard/employees');
        console.log('   3. عدّل الموظف');
        console.log('   4. في قسم الصلاحيات، فعّل: employees:delete');
        console.log('   5. احفظ التغييرات');

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkDeletePermissions();

