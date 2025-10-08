# 📅 دليل نظام عرض الأحداث في التقويم

## 📊 نظرة عامة

**الرابط:** http://localhost:5000/dashboard/calendar

---

## 🎨 طريقة عرض الأحداث

### **1. هيكل الحدث (CalendarEvent)**

كل حدث يحتوي على:

```typescript
{
  id: string,           // معرف فريد
  date: Date,           // تاريخ الحدث
  title: string,        // عنوان الحدث
  type: 'lease' | 'payment' | 'maintenance' | 'cheque' | 'expense',
  link: string,         // رابط للتفاصيل
  details: string       // معلومات إضافية
}
```

---

## 📋 أنواع الأحداث المعروضة (5 أنواع)

### **1. 🏠 عقود الإيجار (Lease)**

| الحدث | المصدر | التفاصيل |
|-------|--------|----------|
| **Lease Start** | تاريخ بداية العقد | اسم العقار - نوع المستأجر: الاسم |
| **Lease End** | تاريخ نهاية العقد | اسم العقار - نوع المستأجر: الاسم |

**التفاصيل المعروضة:**
- اسم العقار (Property Name)
- نوع المستأجر:
  - **سكني:** "مستأجر: اسم المستأجر"
  - **تجاري:** "صاحب رخصة تجارية: الاسم التجاري"

**مثال:**
- `برج النخيل - مستأجر: أحمد محمد`
- `مجمع الأعمال - صاحب رخصة تجارية: شركة الإبداع`

**الرابط:** `/dashboard/leases/{leaseId}`  
**اللون:** أزرق (`bg-blue-500`)  
**الأيقونة:** FileSignature 📋

---

### **2. 💰 الدفعات (Payment)**

| الحدث | المصدر | التفاصيل |
|-------|--------|----------|
| **Payment Due** | تاريخ استحقاق الدفعة | Amount: AED X,XXX |

**الشرط:** فقط الدفعات غير المدفوعة (`status != 'Paid'`)  
**الرابط:** `/dashboard/leases/{leaseId}`  
**اللون:** أخضر (`bg-green-500`)  
**الأيقونة:** Banknote 💵

---

### **3. 🔧 عقود الصيانة (Maintenance)**

| الحدث | المصدر | التفاصيل |
|-------|--------|----------|
| **Contract Expiry** | تاريخ انتهاء عقد الصيانة | Vendor: اسم المورد |

**الرابط:** `/dashboard/maintenance`  
**اللون:** أصفر (`bg-yellow-500`)  
**الأيقونة:** Wrench 🔧

---

### **4. 💳 الشيكات (Cheque)**

| الحدث | المصدر | التفاصيل |
|-------|--------|----------|
| **Cheque Due** | تاريخ استحقاق الشيك | Payee: اسم المستفيد<br>Amount: AED X,XXX<br>ID: cheque-XXX |

**الشرط:** الشيكات غير المصروفة أو الملغاة  
(`status NOT IN ('Cleared', 'Cancelled')`)  
**الرابط:** `/dashboard/cheques?search={chequeId}`  
**اللون:** بنفسجي (`bg-purple-500`)  
**الأيقونة:** WalletCards 💳

---

### **5. 🧾 المصروفات (Expense)**

| الحدث | المصدر | التفاصيل |
|-------|--------|----------|
| **Expense Submitted** | تاريخ إنشاء المصروف | الفئة: AED X,XXX by اسم الموظف |

**الرابط:** `/dashboard/expenses`  
**اللون:** برتقالي (`bg-orange-500`)  
**الأيقونة:** Receipt 🧾

---

## 🎨 كيف يتم عرض الأحداث في التقويم

### **في الكالندر الشهري:**

#### **على الخلايا (Days):**
```
┌────┐
│ 15 │ ← رقم اليوم
│ •• │ ← نقاط ملونة (حتى 2 حدث)
│ +3 │ ← عدد الأحداث الإضافية
└────┘
```

**النقاط الملونة:**
- 🔵 أزرق = إيجار
- 🟢 أخضر = دفعة
- 🟡 أصفر = صيانة
- 🟣 بنفسجي = شيك
- 🟠 برتقالي = مصروف

#### **في القائمة الجانبية (عند النقر):**
```
┌──────────────────────────────┐
│ 🏠 Lease End                 │
│    Tenant ID: tenant-123     │
│    lease  15:00              │
├──────────────────────────────┤
│ 💰 Payment Due               │
│    Amount: AED 5,000         │
│    payment  09:00            │
└──────────────────────────────┘
```

---

### **في الكالندر السنوي:**

#### **على الشهور:**
```
┌─────────────┐
│ October [8] │ ← عدد أحداث الشهر
│ SMTWTFS     │
│ 1234567     │
│ 8910...     │ ← كل يوم قابل للنقر
│ ••  •       │ ← نقاط الأحداث
└─────────────┘
```

#### **عند النقر على يوم:**
```
العنوان: Events for 15th October 2025
يعرض: أحداث يوم 15 أكتوبر فقط (ليس كل الشهر)
```

---

## 🔍 التفاصيل التقنية

### **1. جلب الأحداث:**

الدالة: `getCalendarEvents()` في `src/lib/db.ts`

```sql
-- عقود الإيجار (بداية + نهاية) - مع التفاصيل الكاملة
SELECT 
    l.id, l.startDate, 'Lease Start',
    p.name as propertyName,
    t.name as tenantName,
    t.tradeName,
    l.propertyType
FROM leases l
JOIN units u ON l.unitId = u.id
JOIN properties p ON u.propertyId = p.id
JOIN tenants t ON l.tenantId = t.id
UNION ALL
SELECT 
    l.id, l.endDate, 'Lease End',
    p.name as propertyName,
    t.name as tenantName,
    t.tradeName,
    l.propertyType
FROM leases l
JOIN units u ON l.unitId = u.id
JOIN properties p ON u.propertyId = p.id
JOIN tenants t ON l.tenantId = t.id

-- الدفعات المستحقة
SELECT id, dueDate, 'Payment Due', amount 
FROM lease_payments 
WHERE status != 'Paid'

-- عقود الصيانة
SELECT id, endDate, 'Contract Expiry', vendorName 
FROM maintenance_contracts

-- الشيكات المستحقة
SELECT id, dueDate, 'Cheque Due', amount 
FROM cheques 
WHERE status NOT IN ('Cleared', 'Cancelled')

-- المصروفات
SELECT id, createdAt, 'Expense Submitted', category, amount 
FROM expenses
```

### **2. تنظيم الأحداث:**

```typescript
// تجميع الأحداث حسب التاريخ
const eventsByDay = {
  '2025-10-15': [event1, event2, event3],
  '2025-10-20': [event4],
  ...
}
```

### **3. عرض الأحداث:**

#### **في الخلايا:**
- نقاط صغيرة ملونة (حتى 2)
- عداد للأحداث الإضافية (+X)

#### **في القائمة:**
- بطاقة كاملة لكل حدث
- أيقونة + لون مميز
- العنوان + التفاصيل
- نوع الحدث + الوقت
- رابط قابل للنقر

---

## 🎯 السلوك الحالي

### **الكالندر الشهري:**
1. ✅ لا يعرض أحداث عند فتح الصفحة
2. ✅ انقر على تاريخ → يعرض أحداث ذلك اليوم
3. ✅ "Today" → يختار اليوم الحالي

### **الكالندر السنوي:**
1. ✅ لا يعرض أحداث عند فتح الصفحة
2. ✅ انقر على **يوم** في أي شهر → يعرض أحداث ذلك اليوم
3. ✅ "Today" → يختار اليوم الحالي
4. ✅ الشهر المحتوي على اليوم المختار يكون مميّز

---

## 📝 مثال عملي

### **سيناريو:**
عندك 3 أحداث في 15 أكتوبر 2025:
- 🏠 Lease End (برج النخيل - مستأجر سكني)
- 💰 Payment Due (AED 5,000)
- 💳 Cheque Due (AED 3,000)

### **ما يظهر:**

#### **في الخلية (يوم 15):**
```
┌────┐
│ 15 │
│ 🔵🟢│ ← نقطتان فقط
│ +1 │ ← الحدث الثالث
└────┘
```

#### **في القائمة (عند النقر):**
```
📋 Events for 15th October 2025
───────────────────────────────
🏠 Lease End
   برج النخيل - مستأجر: أحمد محمد
   lease  00:00

💰 Payment Due  
   Amount: AED 5,000
   payment  09:00
   
💳 Cheque Due
   Payee: أحمد محمد, Amount: AED 3,000
   cheque  10:00
```

**أو للعقد التجاري:**
```
🏠 Lease End
   مجمع الأعمال - صاحب رخصة تجارية: شركة الإبداع
   lease  00:00
```

---

## 🔗 الروابط

كل حدث قابل للنقر ويوجه إلى:

| النوع | الوجهة |
|------|--------|
| Lease | `/dashboard/leases/{id}` |
| Payment | `/dashboard/leases/{leaseId}` |
| Maintenance | `/dashboard/maintenance` |
| Cheque | `/dashboard/cheques?search={id}` |
| Expense | `/dashboard/expenses` |

---

## ✨ المميزات

✅ **5 أنواع أحداث** مختلفة  
✅ **ألوان مميزة** لكل نوع  
✅ **نقاط مرئية** على الأيام  
✅ **تفاصيل كاملة** عند النقر  
✅ **روابط مباشرة** للصفحات  
✅ **تصفية ذكية** (فقط الأحداث المهمة)  
✅ **responsive** على جميع الأجهزة  
✅ **مترجم** بالكامل للعربية والإنجليزية  

---

**آخر تحديث:** 8 أكتوبر 2025

