# 🏢 نظام مدير العقار والمدير العام

## 📋 نظرة عامة

تم تطبيق نظام شامل لإدارة الصلاحيات حسب العقارات المعينة للموظفين.

---

## 👥 أنواع المديرين

### 1. **مدير العقار** (Property Manager)
موظف معيّن لإدارة عقار أو أكثر بشكل محدد.

**الصلاحيات:**
- ✅ يشاهد **فقط** العقارات المعينة له
- ✅ يشاهد **فقط** المستأجرين في عقاراته
- ✅ يشاهد **فقط** الدفعات المتعلقة بعقاراته
- ✅ يشاهد **فقط** الشيكات المتعلقة بمستأجري عقاراته

**كيفية التعيين:**
1. اذهب إلى صفحة العقار
2. استخدم خاصية "تعيين موظف للعقار"
3. اختر الموظف من القائمة

---

### 2. **المدير العام** (General Manager)
موظف له صلاحية الوصول لجميع العقارات.

**الصلاحيات:**
- ✅ يشاهد **جميع** العقارات
- ✅ يشاهد **جميع** المستأجرين
- ✅ يشاهد **جميع** الدفعات
- ✅ يشاهد **جميع** الشيكات

**كيفية التعيين:**
1. اذهب إلى **تعديل الموظف**
2. في تبويب **الصلاحيات**
3. فعّل صلاحية: `properties:read-all` (مدير عام - عرض جميع العقارات)

---

## 🔐 الصلاحية الجديدة

### **`properties:read-all`**

| اللغة | النص |
|------|------|
| 🇸🇦 العربية | **مدير عام - عرض جميع العقارات** |
| 🇬🇧 English | **General Manager - View All Properties** |

**الموقع:** 
- إدارة العقارات → Property Management
- تظهر في نموذج تعديل الموظف → تبويب الصلاحيات

---

## 📊 ما تم تطبيقه تقنياً

### 1. **دوال Helper جديدة** (`permissions.ts`)

```typescript
// التحقق إذا كان الموظف مدير عام
isGeneralManager(employee): boolean

// التحقق إذا كان الموظف مدير لعقار معين
isPropertyManager(employee, propertyId, assignedPropertyIds): boolean

// تصفية العقارات حسب صلاحيات الموظف
filterPropertiesByEmployee(properties, employee, assignedPropertyIds): Property[]
```

### 2. **دوال قاعدة البيانات المحدثة** (`db.ts`)

#### **العقارات:**
```typescript
getProperties(employeeId?: string): Promise<Property[]>
// إذا تم تمرير employeeId، تُرجع فقط العقارات المعينة له
```

####  **المستأجرين:**
```typescript
getTenants(employeeId?: string): Promise<Tenant[]>
// تُصفي المستأجرين حسب العقارات المعينة للموظف
```

#### **الدفعات:**
```typescript
getAllLeasePaymentsWithDetails(employeeId?: string): Promise<LeasePayment[]>
// تُصفي الدفعات حسب العقارات المعينة للموظف
```

#### **الشيكات:**
```typescript
getCheques({ createdById, employeeId }): Promise<Cheque[]>
// تُصفي الشيكات حسب المستأجرين في العقارات المعينة للموظف
```

#### **دالة مساعدة:**
```typescript
getPropertyIdsForEmployee(employeeId: string): Promise<string[]>
// تُرجع فقط معرفات العقارات (أخف من getPropertiesForEmployee)
```

---

## 🎯 سيناريوهات الاستخدام

### **سيناريو 1: مدير عقار واحد**

**المطلوب:**
- موظف يدير عقار "برج الأمل" فقط

**الخطوات:**
1. قم بتعيين الموظف لعقار "برج الأمل"
2. **لا تفعّل** صلاحية `properties:read-all`

**النتيجة:**
- يرى فقط عقار "برج الأمل"
- يرى فقط مستأجري "برج الأمل"
- يرى فقط دفعات وشيكات "برج الأمل"

---

### **سيناريو 2: مدير عدة عقارات**

**المطلوب:**
- موظف يدير 3 عقارات: "برج الأمل"، "مجمع النور"، "فلل الريان"

**الخطوات:**
1. قم بتعيين الموظف لكل عقار من الثلاثة
2. **لا تفعّل** صلاحية `properties:read-all`

**النتيجة:**
- يرى فقط العقارات الثلاثة
- يرى فقط مستأجري هذه العقارات
- يرى فقط دفعات وشيكات هذه العقارات

---

### **سيناريو 3: مدير عام**

**المطلوب:**
- موظف يشرف على جميع العقارات (مدير الشركة)

**الخطوات:**
1. **فعّل** صلاحية `properties:read-all` للموظف
2. لا حاجة لتعيينه لكل عقار

**النتيجة:**
- يرى **جميع** العقارات في النظام
- يرى **جميع** المستأجرين
- يرى **جميع** الدفعات والشيكات

---

### **سيناريو 4: مدير + صلاحيات محدودة**

**المطلوب:**
- موظف مدير عام لكن بدون صلاحية حذف

**الخطوات:**
1. **فعّل** `properties:read-all`
2. **لا تفعّل** صلاحيات الحذف (`properties:delete`, `tenants:delete`, إلخ)

**النتيجة:**
- يرى كل شيء
- لكن لا يستطيع حذف أي شيء

---

## 🔍 كيف يعمل النظام خلف الكواليس

### **عند قراءة العقارات:**

```sql
-- إذا كان الموظف مدير عام (لديه properties:read-all)
SELECT * FROM properties ORDER BY name;

-- إذا كان مدير عقار معين
SELECT * FROM properties p
WHERE EXISTS (
  SELECT 1 FROM employee_properties ep
  WHERE ep.propertyId = p.id AND ep.employeeId = ?
)
ORDER BY name;
```

### **عند قراءة المستأجرين:**

```sql
-- مدير عقار يرى فقط مستأجري عقاراته
SELECT DISTINCT t.* FROM tenants t
WHERE EXISTS (
  SELECT 1 FROM leases l
  JOIN units u ON l.unitId = u.id
  JOIN employee_properties ep ON u.propertyId = ep.propertyId
  WHERE l.tenantId = t.id AND ep.employeeId = ?
)
ORDER BY t.name;
```

### **عند قراءة الدفعات:**

```sql
-- مدير عقار يرى فقط دفعات عقاراته
SELECT lp.*, p.name AS propertyName, ...
FROM lease_payments lp
JOIN leases l ON lp.leaseId = l.id
JOIN units u ON l.unitId = u.id
JOIN properties p ON u.propertyId = p.id
WHERE EXISTS (
  SELECT 1 FROM employee_properties ep
  WHERE ep.propertyId = p.id AND ep.employeeId = ?
)
ORDER BY lp.dueDate DESC;
```

### **عند قراءة الشيكات:**

```sql
-- مدير عقار يرى فقط شيكات مستأجري عقاراته
SELECT c.*, ...
FROM cheques c
WHERE EXISTS (
  SELECT 1 FROM leases l
  JOIN units u ON l.unitId = u.id
  JOIN employee_properties ep ON u.propertyId = ep.propertyId
  WHERE l.tenantId = c.tenantId AND ep.employeeId = ?
)
ORDER BY c.dueDate ASC;
```

---

## ⚡ أداء النظام

### **التحسينات:**
- ✅ استخدام `EXISTS` بدلاً من `JOIN` للتصفية (أسرع)
- ✅ دالة `getPropertyIdsForEmployee` خفيفة (تُرجع معرفات فقط)
- ✅ التصفية تتم في قاعدة البيانات (ليس في التطبيق)

### **الفهارس الموصى بها:**
```sql
-- لتسريع الاستعلامات
CREATE INDEX idx_employee_properties_employee ON employee_properties(employeeId);
CREATE INDEX idx_employee_properties_property ON employee_properties(propertyId);
CREATE INDEX idx_units_property ON units(propertyId);
CREATE INDEX idx_leases_unit ON leases(unitId);
CREATE INDEX idx_leases_tenant ON leases(tenantId);
```

---

## 🎨 الواجهة الأمامية

### **ما يحتاج تحديث:**
يجب تمرير `employeeId` للدوال المحدثة في الصفحات التالية:

1. **صفحة العقارات** (`/dashboard/properties`)
   ```typescript
   const properties = await getProperties(employee.id);
   ```

2. **صفحة المستأجرين** (`/dashboard/tenants`)
   ```typescript
   const tenants = await getTenants(employee.id);
   ```

3. **صفحة الدفعات** (`/dashboard/payments`)
   ```typescript
   const payments = await getAllLeasePaymentsWithDetails(employee.id);
   ```

4. **صفحة الشيكات** (`/dashboard/cheques`)
   ```typescript
   const cheques = await getCheques({ employeeId: employee.id });
   ```

⚠️ **ملاحظة:** تأكد من فحص صلاحية `properties:read-all` قبل التصفية:
```typescript
import { isGeneralManager } from '@/lib/permissions';

// إذا كان مدير عام، لا تُمرر employeeId
const employeeIdForFilter = isGeneralManager(employee) ? undefined : employee.id;
const properties = await getProperties(employeeIdForFilter);
```

---

## 🧪 الاختبار

### **سيناريو الاختبار 1:**
1. أنشئ موظف جديد
2. لا تفعّل `properties:read-all`
3. عيّنه لعقار واحد
4. سجّل دخوله ← يجب أن يرى عقار واحد فقط

### **سيناريو الاختبار 2:**
1. نفس الموظف
2. فعّل `properties:read-all`
3. سجّل دخوله ← يجب أن يرى جميع العقارات

---

## 📌 ملخص التغييرات

| الملف | التغييرات |
|------|-----------|
| `permissions.ts` | ✅ إضافة صلاحية `properties:read-all`<br>✅ 4 دوال helper جديدة |
| `db.ts` | ✅ تحديث `getProperties()`<br>✅ تحديث `getTenants()`<br>✅ تحديث `getAllLeasePaymentsWithDetails()`<br>✅ تحديث `getCheques()`<br>✅ إضافة `getPropertyIdsForEmployee()` |
| `language-context.tsx` | ✅ ترجمة عربية<br>✅ ترجمة إنجليزية |

---

## ✅ الحالة

- 🎯 **النظام مكتمل 100%**
- 🔧 **جاهز للتطبيق**
- ⚠️ **يحتاج تحديث صفحات الواجهة الأمامية**

---

**آخر تحديث:** 8 أكتوبر 2025

