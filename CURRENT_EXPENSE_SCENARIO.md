# السيناريو الحالي: إضافة مصروف جديد في EstateFlow

## 📋 **نظرة عامة**

النظام الحالي لإدارة المصروفات بسيط ومباشر، يتكون من مرحلتين رئيسيتين: الإنشاء والموافقة.

---

## 🔄 **المراحل الحالية**

### 1️⃣ **إنشاء مصروف جديد (Create Expense)**

**من يقوم بها:** أي موظف لديه صلاحية `expenses:create`

**البيانات المطلوبة:**
- **العقار (Property)** - إلزامي
- **الوحدة (Unit)** - اختياري
- **الفئة (Category)** - إلزامي
  - Maintenance (صيانة)
  - Utilities (مرافق)
  - Marketing (تسويق)
  - Supplies (مشتريات)
  - Legal (قانونية)
  - Other (أخرى)
- **الوصف (Description)** - إلزامي
- **المورد (Supplier)** - اختياري
- **الرقم الضريبي (Tax Number)** - اختياري
- **المبلغ الأساسي (Base Amount)** - إلزامي
- **خاضع لضريبة القيمة المضافة (VAT)** - checkbox
  - إذا تم التفعيل، يضاف 5% تلقائياً
- **الإيصال (Receipt)** - اختياري (رفع ملف)

---

### 2️⃣ **الحفظ والإرسال**

عند الضغط على **"Submit"**:

1. **رفع الإيصال (إن وجد):**
   - يتم رفع الملف إلى `/uploads/expenses_receipts/`
   - الحد الأقصى للملف: 5MB

2. **حساب المبلغ النهائي:**
   ```javascript
   let finalAmount = baseAmount;
   let taxAmount = 0;
   
   if (isVat) {
       taxAmount = baseAmount * 0.05;  // 5% VAT
       finalAmount = baseAmount + taxAmount;
   }
   ```

3. **حفظ في قاعدة البيانات:**
   ```sql
   INSERT INTO expenses (
       propertyId,
       unitId,
       employeeId,
       category,
       description,
       supplier,
       taxNumber,
       isVat,
       baseAmount,
       amount,           -- المبلغ النهائي (شامل الضريبة)
       taxAmount,
       receiptUrl,
       status,          -- 'Pending' (الافتراضي)
       createdAt
   )
   ```

4. **الحالة الافتراضية:** `Pending` (قيد الانتظار)

5. **تسجيل في Activity Log:**
   - الموظف الذي أنشأ المصروف
   - النوع: `CREATE_EXPENSE`
   - التفاصيل: الفئة والمبلغ

6. **إرسال إشعار Telegram:**
   - **إلى:** قناة الإشعارات الإدارية (System-wide)
   - **الرسالة:**
     ```
     *New Expense Submitted*
     
     *Employee:* [اسم الموظف]
     *Category:* [الفئة]
     *Amount:* AED [المبلغ النهائي]
     *Description:* [الوصف]
     
     Please review and approve/reject.
     ```

---

### 3️⃣ **المراجعة والموافقة (Review & Approval)**

**من يقوم بها:** موظفون لديهم صلاحية `expenses:approve`

**الخيارات المتاحة:**

#### ✅ **أ) الموافقة (Approve)**
- يتم تحديث حالة المصروف إلى: `Approved`
- إرسال إشعار Telegram للموظف مقدم الطلب:
  ```
  *Expense Approved*
  
  *Expense ID:* [ID]
  *Amount:* AED [المبلغ]
  *Approved by:* [اسم المراجع]
  
  Your expense has been approved.
  ```
- تسجيل في Activity Log

#### ❌ **ب) الرفض (Reject)**
- يتم تحديث حالة المصروف إلى: `Rejected`
- إرسال إشعار Telegram للموظف مقدم الطلب:
  ```
  *Expense Rejected*
  
  *Expense ID:* [ID]
  *Amount:* AED [المبلغ]
  *Rejected by:* [اسم المراجع]
  
  Your expense has been rejected.
  ```
- تسجيل في Activity Log

#### 🔄 **ج) يحتاج تصحيح (Needs Correction)**
- يتم تحديث حالة المصروف إلى: `Needs Correction`
- الموظف الذي أنشأ المصروف يمكنه **تعديله فقط**
- بعد التعديل، تعود الحالة إلى `Pending` للمراجعة مرة أخرى

---

## 📊 **حالات المصروف (Expense Statuses)**

| الحالة | الوصف | من يمكنه التعديل |
|-------|-------|------------------|
| `Pending` | قيد الانتظار للمراجعة | لا أحد |
| `Approved` | موافق عليه | لا أحد |
| `Rejected` | مرفوض | لا أحد |
| `Needs Correction` | يحتاج تصحيح | الموظف صاحب المصروف فقط |

---

## 🔐 **الصلاحيات (Permissions)**

| الإجراء | الصلاحية المطلوبة |
|---------|-------------------|
| إنشاء مصروف | `expenses:create` |
| عرض المصروفات | `expenses:read` |
| الموافقة/الرفض/طلب التصحيح | `expenses:approve` |
| تعديل (بعد طلب التصحيح) | `expenses:create` + أن يكون صاحب المصروف |
| حذف | `expenses:delete` |

---

## 📧 **الإشعارات (Notifications)**

### **1. عند إنشاء مصروف:**
- **إلى:** قناة Telegram الإدارية (System-wide)
- **المحتوى:** تفاصيل المصروف الجديد

### **2. عند الموافقة:**
- **إلى:** الموظف صاحب المصروف (Personal notification)
- **المحتوى:** إشعار بالموافقة

### **3. عند الرفض:**
- **إلى:** الموظف صاحب المصروف (Personal notification)
- **المحتوى:** إشعار بالرفض

### **4. عند طلب التصحيح:**
- لا يوجد إشعار حالياً (يمكن إضافته)

---

## 🗂️ **قاعدة البيانات (Database Structure)**

### **جدول `expenses`:**

```sql
CREATE TABLE expenses (
  id VARCHAR(255) PRIMARY KEY,
  propertyId VARCHAR(255) NOT NULL,
  unitId VARCHAR(255),
  employeeId VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  supplier VARCHAR(255),
  taxNumber VARCHAR(255),
  isVat BOOLEAN DEFAULT FALSE,
  baseAmount DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,          -- baseAmount + tax
  taxAmount DECIMAL(10, 2) DEFAULT 0,
  receiptUrl VARCHAR(500),
  status ENUM('Pending', 'Approved', 'Rejected', 'Needs Correction') DEFAULT 'Pending',
  submittedBy VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);
```

---

## 📝 **مثال على السيناريو الكامل**

### **السيناريو العادي:**

1. **الموظف "أحمد"** يفتح صفحة المصروفات
2. يضغط **"Add Expense"**
3. يدخل البيانات:
   - العقار: برج مارينا
   - الفئة: Maintenance (صيانة)
   - الوصف: إصلاح مكيف الصالة
   - المورد: شركة التبريد
   - المبلغ: 500 درهم
   - ✓ خاضع لضريبة القيمة المضافة
   - رفع إيصال
4. يضغط **"Submit"**
5. النظام يحسب:
   - Base Amount: 500
   - Tax Amount: 25 (5%)
   - Final Amount: 525
6. يحفظ في قاعدة البيانات بحالة `Pending`
7. يرسل إشعار Telegram للقناة الإدارية
8. **المراجع "محمد"** يفتح المصروفات
9. يراجع المصروف
10. يضغط **"Approve"**
11. تتحديث الحالة إلى `Approved`
12. "أحمد" يستلم إشعار Telegram بالموافقة

### **السيناريو مع طلب التصحيح:**

1. **الموظف "سالم"** يضيف مصروف بمبلغ 1000 درهم
2. **المراجع "علي"** يجد خطأ في المبلغ
3. يضغط **"Needs Correction"**
4. الحالة تتحول إلى `Needs Correction`
5. "سالم" يعدل المبلغ إلى 800 درهم
6. يضغط **"Submit"** مرة أخرى
7. الحالة ترجع إلى `Pending`
8. "علي" يراجع مرة أخرى ويوافق

---

## 🎨 **واجهة المستخدم (UI Components)**

### **1. صفحة قائمة المصروفات:**
- `expense-management-client.tsx`
- Dashboard Cards (إحصائيات)
- Filters (بحث، فلترة حسب العقار والحالة)
- جدول المصروفات

### **2. Dialog إضافة/تعديل:**
- `expense-dialog.tsx`
- نموذج إدخال البيانات
- رفع الإيصال

### **3. قائمة المصروفات:**
- `expense-list.tsx`
- عرض جدولي
- أزرار الإجراءات (View, Edit, Delete, Approve, Reject, Request Correction)

---

## ✅ **المميزات الحالية:**

- ✅ نظام بسيط وسهل الاستخدام
- ✅ حساب تلقائي للضريبة (5% VAT)
- ✅ رفع الإيصالات
- ✅ إشعارات Telegram
- ✅ تسجيل Activity Log
- ✅ صلاحيات محكمة
- ✅ إمكانية التصحيح

---

## ⚠️ **القيود الحالية:**

- ⚠️ لا يوجد workflow معقد (موافقة واحدة فقط)
- ⚠️ لا يوجد ربط مع طلبات الشراء
- ⚠️ لا يوجد موافقة مشروطة (conditional approval)
- ⚠️ لا يمكن إرجاع المصروف مع ملاحظات محددة
- ⚠️ لا يوجد تتبع للمراجع
- ⚠️ الإشعار عند طلب التصحيح مفقود

---

**تاريخ التوثيق:** 2025-10-09  
**الإصدار:** 1.0 (Current System)

