# 📅 دليل أحداث التقويم - Calendar Events Guide

## نظرة عامة
يعرض التقويم 5 أنواع من الأحداث، كل نوع له أيقونة ولون وتفاصيل خاصة به.

---

## 🎯 أنواع الأحداث (Event Types)

### 1️⃣ أحداث الإيجار (Lease Events)
**الأيقونة:** 📄 FileSignature  
**اللون:** أزرق (bg-blue-500)  
**النوع في الكود:** `lease`

#### أ) بداية عقد الإيجار (Lease Start)

**العنوان المترجم:**
- 🇦🇪 `بداية عقد الإيجار`
- 🇬🇧 `Lease Start`

**التفاصيل المعروضة:**
```
اسم العقار - نوع المستأجر: اسم المستأجر/صاحب الرخصة
```

**مثال (سكني):**
```
بداية عقد الإيجار
فيلا الشاطئ الذهبي - مستأجر: محمد عبدالله العتيبي
[إيجار] 00:00
```

**مثال (تجاري):**
```
بداية عقد الإيجار
برج النخيل - صاحب رخصة تجارية: شركة الأمل للتجارة
[إيجار] 00:00
```

**البيانات من قاعدة البيانات:**
```sql
SELECT 
    l.id, l.startDate, l.businessName,
    p.name as propertyName, p.type as propertyType,
    t.name as tenantName
FROM leases l
JOIN units u ON l.unitId = u.id
JOIN properties p ON u.propertyId = p.id
JOIN tenants t ON l.tenantId = t.id
```

---

#### ب) نهاية عقد الإيجار (Lease End)

**العنوان المترجم:**
- 🇦🇪 `نهاية عقد الإيجار`
- 🇬🇧 `Lease End`

**التفاصيل المعروضة:**
```
اسم العقار - نوع المستأجر: اسم المستأجر/صاحب الرخصة
المتأخرات: AED XXX  (يظهر فقط إذا كانت المتأخرات > 0)
```

**مثال (بدون متأخرات):**
```
نهاية عقد الإيجار
شقة البحر - مستأجر: أحمد سعيد المري
[إيجار] 00:00
```

**مثال (مع متأخرات):**
```
نهاية عقد الإيجار
فيلا الشاطئ الذهبي - مستأجر: محمد عبدالله العتيبي
المتأخرات: AED 5,000
[إيجار] 00:00
```

**حساب المتأخرات:**
```sql
COALESCE(SUM(
    CASE WHEN lp.status != 'Paid' AND lp.dueDate < CURDATE() 
    THEN lp.amount ELSE 0 END
), 0) as arrears
FROM lease_payments lp
WHERE lp.leaseId = l.id
```

**رابط التفاصيل:** `/dashboard/leases/{leaseId}`

---

### 2️⃣ دفعات الإيجار المستحقة (Payment Due)
**الأيقونة:** 💰 Banknote  
**اللون:** أخضر (bg-green-500)  
**النوع في الكود:** `payment`

**العنوان المترجم:**
- 🇦🇪 `دفعة مستحقة`
- 🇬🇧 `Payment Due`

**التفاصيل المعروضة:**
```
Amount: AED XXX
```

**مثال:**
```
دفعة مستحقة
Amount: AED 5,000
[دفعة] 09:00
```

**البيانات من قاعدة البيانات:**
```sql
SELECT 
    id, leaseId, dueDate, amount
FROM lease_payments
WHERE status != 'Paid'
```

**رابط التفاصيل:** `/dashboard/leases/{leaseId}`

---

### 3️⃣ انتهاء عقود الصيانة (Contract Expiry)
**الأيقونة:** 🔧 Wrench  
**اللون:** أصفر (bg-yellow-500)  
**النوع في الكود:** `maintenance`

**العنوان المترجم:**
- 🇦🇪 `انتهاء عقد الصيانة`
- 🇬🇧 `Contract Expiry`

**التفاصيل المعروضة:**
```
Vendor: اسم مقدم الخدمة
```

**مثال:**
```
انتهاء عقد الصيانة
Vendor: شركة الصيانة المتقدمة
[صيانة] 12:00
```

**البيانات من قاعدة البيانات:**
```sql
SELECT 
    id, endDate, vendorName
FROM maintenance_contracts
```

**رابط التفاصيل:** `/dashboard/maintenance`

---

### 4️⃣ شيكات مستحقة (Cheque Due)
**الأيقونة:** 💳 WalletCards  
**اللون:** بنفسجي (bg-purple-500)  
**النوع في الكود:** `cheque`

**العنوان المترجم:**
- 🇦🇪 `شيك مستحق`
- 🇬🇧 `Cheque Due`

**التفاصيل المعروضة:**
```
نوع الشيك: اسم المستفيد, المبلغ: AED XXX, شيك رقم الشيك
```

**مثال:**
```
شيك مستحق
شخصي: شركة التكييف والتهوية, المبلغ: AED 44,444.00, شيك 12345
[شيك] 10:00
```

**أنواع الشيكات:**
- `شخصي` - جميع الشيكات حالياً

**البيانات من قاعدة البيانات:**
```sql
SELECT 
    c.id, c.dueDate, c.amount, c.chequeNumber,
    c.payeeType, p.type as payeeCategory,
    COALESCE(p.name, t.name, c.manualPayeeName) as payeeName
FROM cheques c
LEFT JOIN payees p ON c.payeeId = p.id AND c.payeeType = 'saved'
LEFT JOIN tenants t ON c.tenantId = t.id AND c.payeeType = 'tenant'
WHERE c.status NOT IN ('Cleared', 'Cancelled')
```

**رابط التفاصيل:** `/dashboard/cheques?search={chequeId}`

---

### 5️⃣ مصروفات مقدمة (Expense Submitted)
**الأيقونة:** 🧾 Receipt  
**اللون:** أحمر (bg-red-500)  
**النوع في الكود:** `expense`

**العنوان المترجم:**
- 🇦🇪 `مصروف مقدم`
- 🇬🇧 `Expense Submitted`

**التفاصيل المعروضة:**
```
الفئة: AED XXX by اسم الموظف
```

**مثال:**
```
مصروف مقدم
صيانة: AED 500 by أحمد محمد
[مصروف] 14:30
```

**البيانات من قاعدة البيانات:**
```sql
SELECT 
    ex.id, ex.createdAt, ex.category, ex.amount,
    emp.name as employeeName
FROM expenses ex
LEFT JOIN employees emp ON ex.employeeId = emp.id
```

**رابط التفاصيل:** `/dashboard/expenses`

---

## 🎨 خريطة الألوان والأيقونات

| النوع | الأيقونة | اللون | الكود |
|------|---------|------|------|
| إيجار | 📄 FileSignature | أزرق | `bg-blue-500` |
| دفعة | 💰 Banknote | أخضر | `bg-green-500` |
| صيانة | 🔧 Wrench | أصفر | `bg-yellow-500` |
| شيك | 💳 WalletCards | بنفسجي | `bg-purple-500` |
| مصروف | 🧾 Receipt | أحمر | `bg-red-500` |

---

## 📋 هيكل بيانات الحدث (Event Schema)

```typescript
interface CalendarEvent {
    id: string;           // معرّف فريد للحدث
    date: Date;           // تاريخ الحدث
    title: string;        // عنوان الحدث (بالإنجليزية في قاعدة البيانات)
    type: string;         // نوع الحدث: lease, payment, maintenance, cheque, expense
    details: string;      // تفاصيل الحدث (قد تحتوي على أسطر متعددة)
    link: string;         // رابط لصفحة التفاصيل
}
```

---

## 🔍 طريقة العرض في التقويم

### العرض الشهري (Monthly View)
```
┌─────────────────────────────────────┐
│  أكتوبر 2025                        │
│  ┌─────┬─────┬─────┬─────┐         │
│  │  1  │  2  │  3  │  4  │         │
│  │ 🟢  │     │ 🔵🟣│     │         │
│  ├─────┼─────┼─────┼─────┤         │
│  │  8  │  9  │ 10  │ 11  │         │
│  │ 🔵🟣│     │     │ 🟡  │         │
│  └─────┴─────┴─────┴─────┘         │
└─────────────────────────────────────┘
```

### عرض اليوم المختار
```
أحداث ليوم 8 أكتوبر 2025
──────────────────────────

🔵 نهاية عقد الإيجار
   فيلا الشاطئ - مستأجر: محمد
   المتأخرات: AED 5,000
   [إيجار] 00:00

🟣 شيك مستحق
   شخصي: شركة التكييف
   المبلغ: AED 44,444.00
   شيك 12345
   [شيك] 10:00
```

---

## 🔗 الروابط والتنقل

| نوع الحدث | الرابط |
|-----------|--------|
| إيجار | `/dashboard/leases/{id}` |
| دفعة | `/dashboard/leases/{leaseId}` |
| صيانة | `/dashboard/maintenance` |
| شيك | `/dashboard/cheques?search={id}` |
| مصروف | `/dashboard/expenses` |

---

## ⚙️ الملفات الأساسية

### ملفات قاعدة البيانات:
- `src/lib/db.ts` - دالة `getCalendarEvents()` (السطر 2237)

### ملفات واجهة المستخدم:
- `src/app/dashboard/calendar/page.tsx` - الصفحة الرئيسية
- `src/app/dashboard/calendar/_components/calendar-client.tsx` - العرض التفاعلي
- `src/app/dashboard/calendar/_components/custom-calendar.tsx` - مكون التقويم

### ملفات الترجمة:
- `src/contexts/language-context.tsx` - جميع النصوص المترجمة

---

## 📝 ملاحظات مهمة

1. **المتأخرات:** تظهر فقط في أحداث "نهاية عقد الإيجار" وفقط إذا كانت > 0
2. **التواريخ:** تستخدم `date-fns` مع دعم اللغة العربية والإنجليزية
3. **النصوص متعددة الأسطر:** يتم عرضها باستخدام `whitespace-pre-line`
4. **الترجمة الديناميكية:** جميع العناوين تترجم حسب لغة المستخدم
5. **الفلترة:** تستبعد الشيكات المسحوبة أو الملغاة

---

## 🎯 أمثلة كاملة

### مثال 1: حدث سكني بدون متأخرات
```
نهاية عقد الإيجار
شقة البحر - مستأجر: أحمد سعيد المري
[إيجار] 00:00
→ /dashboard/leases/abc123
```

### مثال 2: حدث تجاري مع متأخرات
```
نهاية عقد الإيجار
برج النخيل - صاحب رخصة تجارية: شركة الأمل للتجارة
المتأخرات: AED 12,500
[إيجار] 00:00
→ /dashboard/leases/def456
```

### مثال 3: شيك مستحق
```
شيك مستحق
شخصي: شركة التكييف والتهوية, المبلغ: AED 44,444.00, شيك A12345
[شيك] 10:00
→ /dashboard/cheques?search=xyz789
```

### مثال 4: دفعة مستحقة
```
دفعة مستحقة
Amount: AED 8,500
[دفعة] 09:00
→ /dashboard/leases/ghi012
```

### مثال 5: عقد صيانة منتهي
```
انتهاء عقد الصيانة
Vendor: شركة الصيانة المتقدمة
[صيانة] 12:00
→ /dashboard/maintenance
```

### مثال 6: مصروف مقدم
```
مصروف مقدم
صيانة: AED 750 by عبدالله محمد
[مصروف] 14:30
→ /dashboard/expenses
```

---

## 📞 للدعم والمساعدة

إذا كنت بحاجة لإضافة نوع حدث جديد أو تعديل طريقة العرض:
1. عدّل دالة `getCalendarEvents()` في `src/lib/db.ts`
2. أضف الترجمات في `src/contexts/language-context.tsx`
3. عدّل `eventTypeConfig` في `calendar-client.tsx` إذا كنت تريد أيقونة/لون جديد

---

**تاريخ آخر تحديث:** أكتوبر 2025  
**الإصدار:** 1.0
