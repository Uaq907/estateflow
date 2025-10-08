# سيناريو إضافة طلب إخلاء جديد

## 📋 نظرة عامة

هذا المستند يوضح السيناريو الكامل لإنشاء طلب إخلاء جديد في النظام، حيث يتم:
1. اختيار المستأجر أو الاسم التجاري
2. جلب البيانات المطلوبة تلقائياً
3. فتح نموذج طلب الإخلاء
4. ملء النموذج تلقائياً بالبيانات المجلوبة

---

## 🔄 تدفق العمل (Workflow)

### **المرحلة 1: صفحة الإخلاء (Eviction Page)**
`/dashboard/legal/eviction`

```
┌─────────────────────────────────────────┐
│  إدارة طلبات الإخلاء                    │
├─────────────────────────────────────────┤
│  [+ إضافة طلب إخلاء جديد]              │
└─────────────────────────────────────────┘
```

**عند الضغط على الزر:**
- يفتح Dialog لاختيار المستأجر

---

### **المرحلة 2: اختيار المستأجر**

```typescript
<Dialog>
  <DialogTitle>اختيار المستأجر</DialogTitle>
  
  <Select onChange={handleTenantSelect}>
    <SelectTrigger>
      <SelectValue placeholder="اختر المستأجر أو الاسم التجاري" />
    </SelectTrigger>
    <SelectContent>
      {/* عرض قائمة المستأجرين */}
      {tenants.map(tenant => (
        <SelectItem value={tenant.id}>
          {tenant.name} - {tenant.businessName || 'مستأجر فردي'}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  
  <Button onClick={fetchDataAndOpenPetition}>
    التالي
  </Button>
</Dialog>
```

---

### **المرحلة 3: جلب البيانات**

عند اختيار المستأجر، يتم جلب البيانات التالية:

```typescript
async function fetchTenantData(tenantId: string) {
  const response = await fetch(`/api/eviction/tenant-data?tenantId=${tenantId}`);
  const data = await response.json();
  
  return {
    // بيانات المستأجر
    tenant: {
      name: data.tenant.name,
      idNumber: data.tenant.idNumber,
      nationality: data.tenant.nationality,
      phone: data.tenant.phone,
      email: data.tenant.email,
      address: data.tenant.address || 'غير محدد',
      businessName: data.tenant.businessName || null
    },
    
    // بيانات العقد
    lease: {
      contractNumber: data.lease.contractNumber,
      startDate: data.lease.startDate,
      endDate: data.lease.endDate,
      rentAmount: data.lease.rentAmount,
      property: data.lease.propertyName,
      unit: data.lease.unitNumber
    },
    
    // بيانات المتأخرات
    arrears: {
      amount: data.arrears.totalAmount,
      fromDate: data.arrears.fromDate,
      toDate: data.arrears.toDate,
      overdueMonths: data.arrears.overdueMonths
    },
    
    // بيانات المالك
    owner: {
      name: data.owner.name,
      idNumber: data.owner.idNumber,
      phone: data.owner.phone,
      email: data.owner.email,
      address: data.owner.address
    }
  };
}
```

---

### **المرحلة 4: التوجيه لصفحة النماذج**

بعد جلب البيانات، يتم التوجيه لصفحة النماذج مع المعلومات:

```typescript
const router = useRouter();

function redirectToPetitionTemplate(tenantData) {
  // حفظ البيانات في sessionStorage للاستخدام في الصفحة التالية
  sessionStorage.setItem('evictionData', JSON.stringify(tenantData));
  
  // التوجيه لصفحة النماذج
  router.push('/dashboard/legal/petition-templates?action=new&type=eviction');
}
```

**URL Example:**
```
http://localhost:5000/dashboard/legal/petition-templates?action=new&type=eviction
```

---

### **المرحلة 5: ملء النموذج تلقائياً**

في صفحة `petition-templates-client.tsx`:

```typescript
useEffect(() => {
  // التحقق من وجود بيانات إخلاء
  const evictionDataStr = sessionStorage.getItem('evictionData');
  
  if (evictionDataStr) {
    const evictionData = JSON.parse(evictionDataStr);
    
    // تحميل نموذج الإخلاء
    const evictionTemplate = petitionTemplates.find(
      t => t.category === 'إخلاء'
    );
    
    // ملء النموذج بالبيانات
    const filledContent = fillEvictionTemplate(
      evictionTemplate.content,
      evictionData
    );
    
    // تحديث الحالة لفتح محرر النموذج
    setEditingTemplate({
      ...evictionTemplate,
      content: filledContent,
      title: `دعوى إخلاء - ${evictionData.tenant.name}`
    });
    setIsNewTemplate(true);
    setShowEditor(true);
    
    // مسح البيانات بعد الاستخدام
    sessionStorage.removeItem('evictionData');
  }
}, []);
```

---

### **المرحلة 6: دالة ملء النموذج**

```typescript
function fillEvictionTemplate(templateContent: string, data: any): string {
  let filledContent = templateContent;
  
  // استبدال بيانات المدعي (المالك)
  filledContent = filledContent
    .replace(/\[اسم_المدعي\]/g, data.owner.name)
    .replace(/\[هوية_المدعي\]/g, data.owner.idNumber)
    .replace(/\[عنوان_المدعي\]/g, data.owner.address)
    .replace(/\[هاتف_المدعي\]/g, data.owner.phone)
    .replace(/\[ايميل_المدعي\]/g, data.owner.email);
  
  // استبدال بيانات المدعى عليه (المستأجر)
  filledContent = filledContent
    .replace(/\[اسم_المدعى_عليه\]/g, data.tenant.name)
    .replace(/\[هوية_المدعى_عليه\]/g, data.tenant.idNumber)
    .replace(/\[عنوان_المدعى_عليه\]/g, data.tenant.address)
    .replace(/\[هاتف_المدعى_عليه\]/g, data.tenant.phone)
    .replace(/\[ايميل_المدعى_عليه\]/g, data.tenant.email);
  
  // استبدال بيانات العقد
  filledContent = filledContent
    .replace(/\[رقم_العقد\]/g, data.lease.contractNumber)
    .replace(/\[تاريخ_العقد\]/g, formatDate(data.lease.startDate))
    .replace(/\[تاريخ_البداية\]/g, formatDate(data.lease.startDate))
    .replace(/\[تاريخ_النهاية\]/g, formatDate(data.lease.endDate))
    .replace(/\[قيمة_الايجار\]/g, data.lease.rentAmount.toLocaleString())
    .replace(/\[اسم_العقار\]/g, `${data.lease.property} - ${data.lease.unit || 'الوحدة الرئيسية'}`);
  
  // استبدال بيانات المتأخرات
  filledContent = filledContent
    .replace(/\[المبلغ_المتأخر\]/g, data.arrears.amount.toLocaleString())
    .replace(/\[تاريخ_اليوم\]/g, formatDate(new Date()));
  
  // إضافة الجنسية إذا كانت موجودة
  if (data.tenant.nationality) {
    filledContent = filledContent.replace(
      /سير لانكا الجنسية/g,
      `${data.tenant.nationality} الجنسية`
    );
  }
  
  return filledContent;
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
```

---

## 🎯 مثال عملي كامل

### **قبل ملء النموذج:**
```
المستأجر: [اسم_المدعى_عليه] – سير لانكا الجنسية
العنوان: [عنوان_المدعى_عليه]
رقم العقد: [رقم_العقد]
المبلغ المتأخر: [المبلغ_المتأخر] درهم
```

### **بعد ملء النموذج:**
```
المستأجر: أحمد محمد علي – مصر الجنسية
العنوان: برج الخليج - الشارقة - الوحدة 305
رقم العقد: TC-2024-1234
المبلغ المتأخر: 45,000 درهم
```

---

## 📊 تدفق البيانات (Data Flow)

```
┌──────────────────┐
│  Eviction Page   │
│  (اختيار مستأجر) │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  API Call        │
│  /api/eviction/  │
│  tenant-data     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Session Storage │
│  (تخزين مؤقت)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Petition        │
│  Templates Page  │
│  (ملء تلقائي)    │
└──────────────────┘
```

---

## 🛠️ الملفات المطلوب تعديلها

### 1. **إنشاء API Route جديد**
`src/app/api/eviction/tenant-data/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getTenantDataForEviction } from '@/lib/db';
import { getEmployeeFromSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const employee = await getEmployeeFromSession();
    if (!employee) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    const data = await getTenantDataForEviction(tenantId);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tenant data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 2. **إضافة دالة في `db.ts`**
`src/lib/db.ts`

```typescript
export async function getTenantDataForEviction(tenantId: string) {
  const connection = await getConnection();
  
  try {
    // جلب بيانات المستأجر
    const [tenantRows] = await connection.execute(
      `SELECT 
        t.id, t.name, t.idNumber, t.nationality, t.phone, t.email, t.address,
        l.businessName
      FROM tenants t
      LEFT JOIN leases l ON l.tenantId = t.id AND l.status = 'Active'
      WHERE t.id = ?
      LIMIT 1`,
      [tenantId]
    );
    
    const tenant = tenantRows[0];
    
    // جلب بيانات العقد النشط
    const [leaseRows] = await connection.execute(
      `SELECT 
        l.id, l.contractNumber, l.startDate, l.endDate, l.rentAmount,
        p.name as propertyName, u.unitNumber,
        o.name as ownerName, o.idNumber as ownerIdNumber,
        o.phone as ownerPhone, o.email as ownerEmail, o.address as ownerAddress
      FROM leases l
      JOIN units u ON l.unitId = u.id
      JOIN properties p ON u.propertyId = p.id
      LEFT JOIN owners o ON p.ownerId = o.id
      WHERE l.tenantId = ? AND l.status = 'Active'
      ORDER BY l.startDate DESC
      LIMIT 1`,
      [tenantId]
    );
    
    const lease = leaseRows[0];
    
    // حساب المتأخرات
    const [arrearsRows] = await connection.execute(
      `SELECT 
        SUM(amount) as totalAmount,
        MIN(dueDate) as fromDate,
        MAX(dueDate) as toDate,
        COUNT(*) as overdueMonths
      FROM lease_payments
      WHERE leaseId = ? AND status != 'Paid' AND dueDate < CURDATE()`,
      [lease.id]
    );
    
    const arrears = arrearsRows[0];
    
    return {
      tenant: {
        name: tenant.name,
        idNumber: tenant.idNumber,
        nationality: tenant.nationality || 'غير محدد',
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.address || 'غير محدد',
        businessName: tenant.businessName
      },
      lease: {
        contractNumber: lease.contractNumber,
        startDate: lease.startDate,
        endDate: lease.endDate,
        rentAmount: lease.rentAmount,
        propertyName: lease.propertyName,
        unitNumber: lease.unitNumber
      },
      arrears: {
        totalAmount: arrears.totalAmount || 0,
        fromDate: arrears.fromDate,
        toDate: arrears.toDate,
        overdueMonths: arrears.overdueMonths || 0
      },
      owner: {
        name: lease.ownerName || 'غير محدد',
        idNumber: lease.ownerIdNumber || 'غير محدد',
        phone: lease.ownerPhone || 'غير محدد',
        email: lease.ownerEmail || 'غير محدد',
        address: lease.ownerAddress || 'غير محدد'
      }
    };
  } finally {
    connection.release();
  }
}
```

### 3. **تعديل صفحة الإخلاء**
`src/app/dashboard/legal/eviction/page.tsx` - إضافة زر جديد:

```typescript
<Button onClick={() => setShowTenantSelector(true)}>
  <Plus className="mr-2 h-4 w-4" />
  إنشاء طلب إخلاء من نموذج
</Button>
```

### 4. **تعديل `petition-templates-client.tsx`**
إضافة الكود في `useEffect`:

```typescript
useEffect(() => {
  const evictionDataStr = sessionStorage.getItem('evictionData');
  if (evictionDataStr) {
    handleAutoFillEviction(JSON.parse(evictionDataStr));
    sessionStorage.removeItem('evictionData');
  }
}, []);
```

---

## ✅ الفوائد

1. **⚡ توفير الوقت**: ملء تلقائي لجميع البيانات
2. **🎯 دقة عالية**: لا أخطاء في نسخ البيانات
3. **📊 بيانات محدثة**: جلب مباشر من قاعدة البيانات
4. **✍️ قابل للتعديل**: يمكن تعديل النموذج بعد الملء التلقائي
5. **🔄 سهولة الاستخدام**: عملية بسيطة بخطوات واضحة

---

## 🎬 الخطوات النهائية للمستخدم

1. **الذهاب لصفحة الإخلاء**
2. **الضغط على "إنشاء طلب إخلاء من نموذج"**
3. **اختيار المستأجر من القائمة**
4. **الضغط على "التالي"**
5. **سيتم فتح النموذج مملوءاً تلقائياً**
6. **مراجعة وتعديل البيانات إذا لزم الأمر**
7. **حفظ النموذج**

---

## 📌 ملاحظات مهمة

- ✅ يتم حفظ البيانات في `sessionStorage` مؤقتاً
- ✅ البيانات تُحذف تلقائياً بعد الاستخدام
- ✅ النموذج قابل للتعديل بالكامل بعد الملء
- ✅ يدعم المستأجرين الأفراد والشركات
- ✅ يحسب المتأخرات تلقائياً

---

**تاريخ الإنشاء:** 8 أكتوبر 2025  
**آخر تحديث:** 8 أكتوبر 2025
