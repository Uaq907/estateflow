# تطبيق الملء التلقائي لنموذج طلب الإخلاء

## 📋 السيناريو الكامل

### **الخطوة 1: صفحة طلبات الإخلاء**
📍 `http://localhost:5000/dashboard/legal/eviction`

1. المستخدم يضغط على **"إضافة طلب إخلاء جديد"**
2. يظهر نموذج حوار لإدخال البيانات الأولية
3. المستخدم يختار المستأجر من القائمة:
   - **Option A**: مستأجر فردي من قاعدة البيانات
   - **Option B**: اسم تجاري / شركة

4. عند اختيار المستأجر، يتم **جلب البيانات تلقائياً**:

```typescript
// البيانات المجلوبة تلقائياً
const autoFilledData = {
  // بيانات المستأجر
  tenantName: "محمد أحمد",
  tenantId: "784-1990-1234567-1",
  tenantPhone: "+971501234567",
  tenantEmail: "mohammed@email.com",
  tenantNationality: "سير لانكا",
  tenantAddress: "برج مارينا - الطابق 15 - شقة 1502",
  
  // بيانات العقار
  propertyName: "برج مارينا الشاطئ",
  propertyAddress: "الكورنيش - أم القيوين",
  unitNumber: "1502",
  propertyType: "شقة",
  
  // بيانات العقد
  leaseId: "lease-001",
  contractNumber: "TC-2023-001",
  contractDate: "01/01/2023",
  startDate: "01/01/2023",
  endDate: "31/12/2023",
  rentAmount: 45000,
  
  // المتأخرات
  totalArrears: 15000,
  unpaidMonths: 4,
  lastPaymentDate: "01/05/2024",
  
  // بيانات المالك
  ownerName: "عبدالله محمد الشامسي",
  ownerId: "784-1980-7654321-1",
  ownerPhone: "+971509876543",
  ownerEmail: "owner@email.com",
  ownerAddress: "أم القيوين - منطقة الظهر"
};
```

---

### **الخطوة 2: حفظ الطلب وإنشاء النموذج**

بعد ملء البيانات الأساسية:

1. المستخدم يضغط على **"حفظ طلب الإخلاء"**
2. يتم حفظ الطلب في قاعدة البيانات
3. يظهر زر جديد: **"إنشاء نموذج الطلب"** أو **"فتح النموذج"**

---

### **الخطوة 3: الانتقال لصفحة النماذج**
📍 `http://localhost:5000/dashboard/legal/petition-templates`

عند الضغط على **"إنشاء نموذج الطلب"**:

1. يتم تمرير البيانات عبر:
   ```typescript
   // الطريقة 1: URL Parameters
   router.push(`/dashboard/legal/petition-templates?evictionId=${id}&autoFill=true`);
   
   // الطريقة 2: Session Storage
   sessionStorage.setItem('evictionAutoFillData', JSON.stringify(data));
   router.push('/dashboard/legal/petition-templates?autoFill=true');
   ```

2. صفحة النماذج تكتشف وجود بيانات الملء التلقائي
3. يتم فتح محرر النموذج تلقائياً مع ملء جميع الحقول

---

## 🔧 التطبيق التقني

### **1. تعديل صفحة الإخلاء**

إضافة زر "إنشاء نموذج الطلب" لكل طلب إخلاء:

```typescript
// في eviction-client.tsx
const handleOpenPetitionTemplate = (evictionRequest: EvictionRequest) => {
  // جلب جميع البيانات المرتبطة
  const petitionData = {
    ...evictionRequest,
    // إضافة أي بيانات إضافية مطلوبة
  };
  
  // حفظ في Session Storage
  sessionStorage.setItem('petitionAutoFillData', JSON.stringify(petitionData));
  
  // الانتقال لصفحة النماذج
  router.push('/dashboard/legal/petition-templates?autoFill=eviction&id=' + evictionRequest.id);
};
```

---

### **2. تعديل صفحة النماذج**

```typescript
// في petition-templates-client.tsx
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const shouldAutoFill = params.get('autoFill');
  const evictionId = params.get('id');
  
  if (shouldAutoFill === 'eviction' && evictionId) {
    // جلب البيانات من Session Storage
    const savedData = sessionStorage.getItem('petitionAutoFillData');
    
    if (savedData) {
      const data = JSON.parse(savedData);
      
      // فتح النموذج الأول (نموذج الإخلاء)
      setSelectedTemplate(petitionTemplates[0]);
      setIsEditorOpen(true);
      
      // ملء النموذج تلقائياً
      const filledContent = autoFillTemplate(petitionTemplates[0].content, data);
      setEditedContent(filledContent);
      
      // مسح البيانات المحفوظة
      sessionStorage.removeItem('petitionAutoFillData');
    }
  }
}, []);
```

---

### **3. دالة الملء التلقائي**

```typescript
function autoFillTemplate(template: string, data: any): string {
  let content = template;
  
  // قائمة الاستبدالات
  const replacements = {
    // معلومات المدعي (المالك)
    '[اسم_المدعي]': data.ownerName || '',
    '[هوية_المدعي]': data.ownerId || '',
    '[عنوان_المدعي]': data.ownerAddress || '',
    '[هاتف_المدعي]': data.ownerPhone || '',
    '[ايميل_المدعي]': data.ownerEmail || '',
    
    // معلومات المدعى عليه (المستأجر)
    '[اسم_المدعى_عليه]': data.tenantName || '',
    '[هوية_المدعى_عليه]': data.tenantId || data.tenantIdNumber || '',
    '[عنوان_المدعى_عليه]': data.tenantAddress || data.propertyName || '',
    '[هاتف_المدعى_عليه]': data.tenantPhone || '',
    '[ايميل_المدعى_عليه]': data.tenantEmail || '',
    '[جنسية_المدعى_عليه]': data.tenantNationality || '',
    
    // معلومات العقد
    '[رقم_العقد]': data.contractNumber || data.leaseId || '',
    '[تاريخ_العقد]': data.contractDate || data.leaseStartDate || '',
    '[تاريخ_البداية]': data.startDate || data.leaseStartDate || '',
    '[تاريخ_النهاية]': data.endDate || data.leaseEndDate || '',
    '[قيمة_الايجار]': data.rentAmount?.toLocaleString() || '',
    
    // معلومات العقار
    '[اسم_العقار]': data.propertyName || '',
    '[عنوان_العقار]': data.propertyAddress || '',
    '[رقم_الوحدة]': data.unitNumber || '',
    '[نوع_العقار]': data.propertyType || '',
    
    // المعلومات المالية
    '[المبلغ_المتأخر]': data.dueAmount || data.totalArrears?.toLocaleString() || '',
    '[عدد_الاشهر_المتأخرة]': data.unpaidMonths || '',
    '[تاريخ_اخر_دفعة]': data.lastPaymentDate || '',
    
    // معلومات إضافية
    '[تاريخ_اليوم]': new Date().toLocaleDateString('ar-AE'),
    '[سبب_الاخلاء]': data.reason || '',
    '[تفاصيل_اضافية]': data.description || ''
  };
  
  // تطبيق جميع الاستبدالات
  Object.entries(replacements).forEach(([placeholder, value]) => {
    content = content.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
  });
  
  return content;
}
```

---

## 🎯 الواجهة المقترحة

### **في صفحة طلبات الإخلاء:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>طلب إخلاء #{evictionRequest.id}</CardTitle>
    <CardDescription>المستأجر: {evictionRequest.tenantName}</CardDescription>
  </CardHeader>
  <CardContent>
    {/* عرض تفاصيل الطلب */}
  </CardContent>
  <CardFooter className="flex gap-2">
    <Button onClick={() => handleViewDetails(evictionRequest)}>
      <Eye className="mr-2 h-4 w-4" />
      عرض التفاصيل
    </Button>
    <Button 
      onClick={() => handleOpenPetitionTemplate(evictionRequest)}
      variant="default"
    >
      <FileText className="mr-2 h-4 w-4" />
      إنشاء نموذج طلب الإخلاء
    </Button>
    <Button onClick={() => handleEdit(evictionRequest)} variant="outline">
      <Edit className="mr-2 h-4 w-4" />
      تعديل
    </Button>
  </CardFooter>
</Card>
```

---

## ✅ الميزات

1. ✅ **ملء تلقائي ذكي** - جميع البيانات تُجلب من قاعدة البيانات
2. ✅ **قابل للتعديل** - المستخدم يمكنه تعديل النموذج بعد الملء
3. ✅ **متعدد النماذج** - يدعم نماذج مختلفة (إخلاء، مطالبة مالية، إلخ)
4. ✅ **تكامل سلس** - انتقال سلس بين الصفحتين
5. ✅ **أمان البيانات** - استخدام Session Storage للبيانات المؤقتة

---

## 📊 مخطط التدفق

```
صفحة الإخلاء → اختيار مستأجر → جلب البيانات → حفظ الطلب
                                                          ↓
     ← ملء النموذج تلقائياً ← فتح المحرر ← صفحة النماذج ←
```

---

## 🚀 الخطوات التالية للتطبيق

1. ✅ إضافة زر "إنشاء نموذج طلب الإخلاء" في بطاقات طلبات الإخلاء
2. ✅ تطوير دالة `handleOpenPetitionTemplate`
3. ✅ إضافة `useEffect` في صفحة النماذج للملء التلقائي
4. ✅ تطوير دالة `autoFillTemplate`
5. ✅ اختبار السيناريو الكامل
6. ✅ إضافة رسائل نجاح/خطأ مناسبة

---

**تاريخ الإنشاء**: 2025-10-08  
**آخر تحديث**: 2025-10-08
