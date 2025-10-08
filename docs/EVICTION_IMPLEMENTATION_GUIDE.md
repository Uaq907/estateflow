# دليل التنفيذ العملي: نظام إنشاء طلبات الإخلاء التلقائي

## 📚 جدول المحتويات
1. [الخطوة 1: إنشاء API Route](#الخطوة-1-إنشاء-api-route)
2. [الخطوة 2: إضافة دالة قاعدة البيانات](#الخطوة-2-إضافة-دالة-قاعدة-البيانات)
3. [الخطوة 3: تعديل صفحة الإخلاء](#الخطوة-3-تعديل-صفحة-الإخلاء)
4. [الخطوة 4: تعديل صفحة النماذج](#الخطوة-4-تعديل-صفحة-النماذج)
5. [الخطوة 5: الاختبار](#الخطوة-5-الاختبار)

---

## الخطوة 1: إنشاء API Route

### 📁 الملف: `src/app/api/eviction/tenant-data/route.ts`

**إنشاء ملف جديد:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getTenantDataForEviction } from '@/lib/db';
import { getEmployeeFromSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  try {
    // 1. التحقق من تسجيل الدخول
    const employee = await getEmployeeFromSession();
    if (!employee) {
      return NextResponse.json(
        { error: 'غير مصرح' }, 
        { status: 401 }
      );
    }

    // 2. التحقق من الصلاحيات
    if (!hasPermission(employee, 'legal:eviction:read') || 
        !hasPermission(employee, 'tenants:read')) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية للوصول' }, 
        { status: 403 }
      );
    }

    // 3. الحصول على معرف المستأجر من الـ query
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'معرف المستأجر مطلوب' }, 
        { status: 400 }
      );
    }

    // 4. جلب البيانات
    const data = await getTenantDataForEviction(tenantId);
    
    if (!data) {
      return NextResponse.json(
        { error: 'لم يتم العثور على بيانات للمستأجر' }, 
        { status: 404 }
      );
    }

    // 5. إرجاع البيانات
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching tenant data for eviction:', error);
    return NextResponse.json(
      { 
        error: 'خطأ في جلب البيانات',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
```

---

## الخطوة 2: إضافة دالة قاعدة البيانات

### 📁 الملف: `src/lib/db.ts`

**إضافة الدالة التالية:**

```typescript
export async function getTenantDataForEviction(tenantId: string) {
  const connection = await getConnection();
  
  try {
    // 1. جلب بيانات المستأجر والعقد النشط
    const [rows] = await connection.execute(`
      SELECT 
        -- بيانات المستأجر
        t.id as tenantId,
        t.name as tenantName,
        t.idNumber as tenantIdNumber,
        t.idType as tenantIdType,
        t.nationality as tenantNationality,
        t.phone as tenantPhone,
        t.email as tenantEmail,
        t.address as tenantAddress,
        
        -- بيانات العقد
        l.id as leaseId,
        l.contractNumber,
        l.startDate,
        l.endDate,
        l.rentAmount,
        l.businessName,
        l.status as leaseStatus,
        
        -- بيانات العقار والوحدة
        p.id as propertyId,
        p.name as propertyName,
        p.address as propertyAddress,
        u.unitNumber,
        
        -- بيانات المالك
        o.name as ownerName,
        o.idNumber as ownerIdNumber,
        o.phone as ownerPhone,
        o.email as ownerEmail,
        o.address as ownerAddress
        
      FROM tenants t
      LEFT JOIN leases l ON l.tenantId = t.id AND l.status = 'Active'
      LEFT JOIN units u ON l.unitId = u.id
      LEFT JOIN properties p ON u.propertyId = p.id
      LEFT JOIN owners o ON p.ownerId = o.id
      WHERE t.id = ?
      ORDER BY l.startDate DESC
      LIMIT 1
    `, [tenantId]);

    if (rows.length === 0) {
      throw new Error('المستأجر غير موجود');
    }

    const row = rows[0];

    if (!row.leaseId) {
      throw new Error('لا يوجد عقد نشط لهذا المستأجر');
    }

    // 2. حساب المتأخرات
    const [arrearsRows] = await connection.execute(`
      SELECT 
        COALESCE(SUM(amount), 0) as totalAmount,
        MIN(dueDate) as fromDate,
        MAX(dueDate) as toDate,
        COUNT(*) as overdueCount
      FROM lease_payments
      WHERE leaseId = ? 
        AND status != 'Paid' 
        AND dueDate < CURDATE()
    `, [row.leaseId]);

    const arrears = arrearsRows[0];

    // 3. تنسيق البيانات للإرجاع
    return {
      tenant: {
        id: row.tenantId,
        name: row.tenantName,
        idNumber: row.tenantIdNumber || 'غير محدد',
        idType: row.tenantIdType || 'هوية',
        nationality: row.tenantNationality || 'غير محدد',
        phone: row.tenantPhone || 'غير محدد',
        email: row.tenantEmail || 'غير محدد',
        address: row.tenantAddress || 'غير محدد',
        businessName: row.businessName || null
      },
      lease: {
        id: row.leaseId,
        contractNumber: row.contractNumber,
        startDate: row.startDate,
        endDate: row.endDate,
        rentAmount: parseFloat(row.rentAmount),
        propertyName: row.propertyName,
        propertyAddress: row.propertyAddress || 'غير محدد',
        unitNumber: row.unitNumber || 'الوحدة الرئيسية'
      },
      arrears: {
        totalAmount: parseFloat(arrears.totalAmount) || 0,
        fromDate: arrears.fromDate,
        toDate: arrears.toDate,
        overdueCount: parseInt(arrears.overdueCount) || 0
      },
      owner: {
        name: row.ownerName || 'غير محدد',
        idNumber: row.ownerIdNumber || 'غير محدد',
        phone: row.ownerPhone || 'غير محدد',
        email: row.ownerEmail || 'غير محدد',
        address: row.ownerAddress || 'غير محدد'
      },
      generatedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error in getTenantDataForEviction:', error);
    throw error;
  } finally {
    connection.release();
  }
}
```

---

## الخطوة 3: تعديل صفحة الإخلاء

### 📁 الملف: `src/app/dashboard/legal/eviction/eviction-client.tsx`

**إضافة الكود التالي:**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2 } from 'lucide-react';

export function EvictionClient({ tenants, ...otherProps }) {
  const [showTenantSelector, setShowTenantSelector] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleCreateFromTemplate() {
    if (!selectedTenantId) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى اختيار مستأجر'
      });
      return;
    }

    setIsLoading(true);

    try {
      // جلب البيانات من API
      const response = await fetch(
        `/api/eviction/tenant-data?tenantId=${selectedTenantId}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في جلب البيانات');
      }

      const tenantData = await response.json();

      // حفظ البيانات في sessionStorage
      sessionStorage.setItem('evictionData', JSON.stringify(tenantData));

      // التوجيه لصفحة النماذج
      router.push('/dashboard/legal/petition-templates?action=new&type=eviction');

    } catch (error) {
      console.error('Error fetching tenant data:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في جلب البيانات'
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* الصفحة الحالية */}
      <div className="space-y-4">
        {/* زر جديد لإنشاء من النموذج */}
        <Button 
          onClick={() => setShowTenantSelector(true)}
          variant="outline"
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          إنشاء طلب إخلاء من نموذج
        </Button>

        {/* باقي المحتوى... */}
      </div>

      {/* Dialog اختيار المستأجر */}
      <Dialog open={showTenantSelector} onOpenChange={setShowTenantSelector}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>اختيار المستأجر</DialogTitle>
            <DialogDescription>
              اختر المستأجر لإنشاء طلب إخلاء من النموذج
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>المستأجر</Label>
              <Select 
                value={selectedTenantId} 
                onValueChange={setSelectedTenantId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المستأجر أو الاسم التجاري" />
                </SelectTrigger>
                <SelectContent>
                  {tenants
                    .filter(t => t.hasActiveLease) // فقط المستأجرين ذوي العقود النشطة
                    .map(tenant => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{tenant.name}</span>
                          {tenant.businessName && (
                            <span className="text-xs text-muted-foreground">
                              {tenant.businessName}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            عقد: {tenant.activeLeaseNumber}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowTenantSelector(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleCreateFromTemplate}
              disabled={!selectedTenantId || isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'جاري التحميل...' : 'التالي'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## الخطوة 4: تعديل صفحة النماذج

### 📁 الملف: `src/app/dashboard/legal/petition-templates/petition-templates-client.tsx`

**إضافة الكود التالي:**

```typescript
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

export default function PetitionTemplatesClient({ loggedInEmployee }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // التحقق من وجود action=new&type=eviction في URL
    const action = searchParams.get('action');
    const type = searchParams.get('type');
    
    if (action === 'new' && type === 'eviction') {
      handleAutoFillEviction();
    }
  }, [searchParams]);

  function handleAutoFillEviction() {
    // 1. قراءة البيانات من sessionStorage
    const evictionDataStr = sessionStorage.getItem('evictionData');
    
    if (!evictionDataStr) {
      console.warn('No eviction data found in sessionStorage');
      return;
    }

    try {
      const data = JSON.parse(evictionDataStr);
      
      // 2. اختيار نموذج الإخلاء
      const evictionTemplate = petitionTemplates.find(
        t => t.category === 'إخلاء' && t.emirate === 'أم القيوين'
      );
      
      if (!evictionTemplate) {
        throw new Error('نموذج الإخلاء غير موجود');
      }

      // 3. ملء النموذج بالبيانات
      const filledContent = fillEvictionTemplate(
        evictionTemplate.content,
        data
      );

      // 4. إنشاء نموذج جديد
      const newTemplate = {
        ...evictionTemplate,
        id: Date.now(), // معرف مؤقت جديد
        title: `دعوى إخلاء - ${data.tenant.name}${data.tenant.businessName ? ` (${data.tenant.businessName})` : ''}`,
        content: filledContent,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        usageCount: 0
      };

      // 5. فتح المحرر مع النموذج المملوء
      setEditingTemplate(newTemplate);
      setIsNewTemplate(true);
      setShowEditor(true);

      // 6. عرض رسالة نجاح
      toast({
        title: 'تم بنجاح',
        description: 'تم ملء النموذج بالبيانات المطلوبة'
      });

      // 7. مسح البيانات من sessionStorage
      sessionStorage.removeItem('evictionData');
      
    } catch (error) {
      console.error('Error auto-filling eviction template:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'فشل في ملء النموذج تلقائياً'
      });
    }
  }

  function fillEvictionTemplate(content: string, data: any): string {
    let filled = content;
    const today = new Date();

    // المتغيرات القابلة للاستبدال
    const replacements = {
      // المدعي (المالك)
      '[اسم_المدعي]': data.owner.name,
      '[هوية_المدعي]': data.owner.idNumber,
      '[عنوان_المدعي]': data.owner.address,
      '[هاتف_المدعي]': data.owner.phone,
      '[ايميل_المدعي]': data.owner.email,

      // المدعى عليه (المستأجر)
      '[اسم_المدعى_عليه]': data.tenant.businessName || data.tenant.name,
      '[هوية_المدعى_عليه]': data.tenant.idNumber,
      '[عنوان_المدعى_عليه]': data.tenant.address,
      '[هاتف_المدعى_عليه]': data.tenant.phone,
      '[ايميل_المدعى_عليه]': data.tenant.email,

      // العقد
      '[رقم_العقد]': data.lease.contractNumber,
      '[تاريخ_العقد]': formatDate(data.lease.startDate),
      '[تاريخ_البداية]': formatDate(data.lease.startDate),
      '[تاريخ_النهاية]': formatDate(data.lease.endDate),
      '[قيمة_الايجار]': data.lease.rentAmount.toLocaleString('ar-AE'),
      '[اسم_العقار]': `${data.lease.propertyName} - ${data.lease.unitNumber}`,

      // المتأخرات
      '[المبلغ_المتأخر]': data.arrears.totalAmount.toLocaleString('ar-AE'),
      '[تاريخ_اليوم]': formatDate(today),

      // الجنسية (استبدال ديناميكي)
      'سير لانكا الجنسية': `${data.tenant.nationality} الجنسية`
    };

    // تنفيذ جميع الاستبدالات
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(key.replace(/[[\]]/g, '\\$&'), 'g');
      filled = filled.replace(regex, value);
    });

    return filled;
  }

  function formatDate(date: Date | string): string {
    const d = new Date(date);
    return format(d, 'dd/MM/yyyy');
  }

  // ... باقي الكود
}
```

---

## الخطوة 5: الاختبار

### 🧪 سيناريوهات الاختبار

#### **اختبار 1: مستأجر بعقد نشط ومتأخرات**

**البيانات:**
- المستأجر: أحمد محمد علي
- العقد: TC-2024-001
- المتأخرات: 45,000 درهم

**الخطوات:**
1. افتح `/dashboard/legal/eviction`
2. اضغط على "إنشاء طلب إخلاء من نموذج"
3. اختر "أحمد محمد علي"
4. اضغط "التالي"
5. تحقق من ملء النموذج تلقائياً

**النتيجة المتوقعة:** ✅ النموذج مملوء بالبيانات الصحيحة

---

#### **اختبار 2: مستأجر بدون عقد نشط**

**البيانات:**
- المستأجر: خالد أحمد (عقد منتهي)

**الخطوات:**
1. افتح `/dashboard/legal/eviction`
2. اضغط على "إنشاء طلب إخلاء من نموذج"
3. اختر "خالد أحمد"
4. اضغط "التالي"

**النتيجة المتوقعة:** ❌ رسالة خطأ: "لا يوجد عقد نشط لهذا المستأجر"

---

#### **اختبار 3: مستأجر تجاري (Business)**

**البيانات:**
- المستأجر: محمد علي
- الاسم التجاري: شركة الخليج للتجارة
- العقد: TC-2024-055
- المتأخرات: 120,000 درهم

**الخطوات:**
1. افتح `/dashboard/legal/eviction`
2. اضغط على "إنشاء طلب إخلاء من نموذج"
3. اختر "شركة الخليج للتجارة"
4. اضغط "التالي"
5. تحقق من استخدام الاسم التجاري في النموذج

**النتيجة المتوقعة:** ✅ النموذج يستخدم "شركة الخليج للتجارة" بدلاً من الاسم الشخصي

---

## 🔧 معالجة الأخطاء المتقدمة

```typescript
async function handleCreateFromTemplate() {
  try {
    setIsLoading(true);

    // محاولة جلب البيانات
    const response = await fetch(`/api/eviction/tenant-data?tenantId=${selectedTenantId}`);

    // معالجة أخطاء HTTP
    if (response.status === 401) {
      toast({
        variant: 'destructive',
        title: 'غير مصرح',
        description: 'يرجى تسجيل الدخول مرة أخرى'
      });
      return;
    }

    if (response.status === 403) {
      toast({
        variant: 'destructive',
        title: 'ممنوع',
        description: 'ليس لديك صلاحية للوصول'
      });
      return;
    }

    if (response.status === 404) {
      toast({
        variant: 'destructive',
        title: 'غير موجود',
        description: 'لم يتم العثور على بيانات المستأجر'
      });
      return;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'فشل في جلب البيانات');
    }

    const data = await response.json();

    // التحقق من وجود عقد نشط
    if (!data.lease) {
      toast({
        variant: 'destructive',
        title: 'لا يوجد عقد',
        description: 'لا يوجد عقد نشط لهذا المستأجر'
      });
      return;
    }

    // المتابعة للمرحلة التالية...
    sessionStorage.setItem('evictionData', JSON.stringify(data));
    router.push('/dashboard/legal/petition-templates?action=new&type=eviction');

  } catch (error) {
    // معالجة أخطاء الشبكة
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      toast({
        variant: 'destructive',
        title: 'خطأ في الاتصال',
        description: 'تحقق من اتصال الإنترنت'
      });
      return;
    }

    // أخطاء أخرى
    console.error('Error:', error);
    toast({
      variant: 'destructive',
      title: 'خطأ',
      description: error instanceof Error ? error.message : 'حدث خطأ غير متوقع'
    });
  } finally {
    setIsLoading(false);
  }
}
```

---

## 📱 واجهة المستخدم المحسّنة

### **عرض المعلومات في الـ Dialog:**

```typescript
<Dialog open={showTenantSelector} onOpenChange={setShowTenantSelector}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>إنشاء طلب إخلاء من نموذج</DialogTitle>
      <DialogDescription>
        سيتم جلب جميع البيانات تلقائياً وملء النموذج
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      {/* حقل البحث */}
      <div className="space-y-2">
        <Label>بحث</Label>
        <Input
          placeholder="ابحث بالاسم أو رقم العقد..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* قائمة المستأجرين */}
      <div className="space-y-2">
        <Label>المستأجر</Label>
        <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
          <SelectTrigger>
            <SelectValue placeholder="اختر المستأجر" />
          </SelectTrigger>
          <SelectContent>
            {filteredTenants.map(tenant => (
              <SelectItem key={tenant.id} value={tenant.id}>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <div className="font-medium">{tenant.name}</div>
                    {tenant.businessName && (
                      <div className="text-xs text-muted-foreground">
                        {tenant.businessName}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="mr-2">
                    {tenant.activeLeaseNumber}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* معاينة البيانات (اختياري) */}
      {selectedTenantId && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-sm space-y-1">
              <p className="font-semibold">سيتم ملء النموذج بالبيانات التالية:</p>
              <ul className="list-disc list-inside text-muted-foreground">
                <li>بيانات المستأجر الشخصية</li>
                <li>تفاصيل العقد والعقار</li>
                <li>المتأخرات (إن وجدت)</li>
                <li>بيانات المالك</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setShowTenantSelector(false)}>
        إلغاء
      </Button>
      <Button 
        onClick={handleCreateFromTemplate}
        disabled={!selectedTenantId || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري المعالجة...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            إنشاء النموذج
          </>
        )}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## 🎨 تحسينات إضافية

### **1. إضافة تقدم التحميل (Progress Bar)**

```typescript
<Dialog>
  {isLoading && (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <div className="text-center">
              <p className="font-medium">جاري جلب البيانات...</p>
              <p className="text-sm text-muted-foreground">
                {loadingStep}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )}
</Dialog>
```

### **2. إضافة معاينة قبل التوجيه**

```typescript
<DialogContent className="max-w-3xl">
  {showPreview && (
    <div className="space-y-4">
      <h3 className="font-bold">معاينة البيانات</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">المستأجر</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>الاسم:</strong> {previewData.tenant.name}</p>
            <p><strong>الهوية:</strong> {previewData.tenant.idNumber}</p>
            <p><strong>الهاتف:</strong> {previewData.tenant.phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">العقد</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>رقم العقد:</strong> {previewData.lease.contractNumber}</p>
            <p><strong>الإيجار:</strong> {previewData.lease.rentAmount.toLocaleString()} AED</p>
            <p><strong>المتأخرات:</strong> {previewData.arrears.totalAmount.toLocaleString()} AED</p>
          </CardContent>
        </Card>
      </div>

      <Button onClick={proceedToTemplate}>
        المتابعة لملء النموذج
      </Button>
    </div>
  )}
</DialogContent>
```

---

## ✨ الخلاصة

هذا النظام يوفر:
- ✅ تكامل كامل بين صفحات الإخلاء والنماذج
- ✅ ملء تلقائي ذكي للنماذج
- ✅ معالجة شاملة للأخطاء
- ✅ واجهة مستخدم سهلة وواضحة
- ✅ دعم كامل للمستأجرين الأفراد والشركات
- ✅ حساب تلقائي للمتأخرات
- ✅ قابلية التعديل بعد الملء التلقائي

---

**📝 ملاحظة:** هذا دليل تقني كامل. للتنفيذ الفعلي، اتبع الخطوات بالترتيب وتأكد من اختبار كل خطوة قبل المتابعة للتالية.
