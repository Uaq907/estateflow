# 📊 جميع العمليات المسجلة في النظام

## عرض السجلات
**الرابط:** http://localhost:5000/dashboard/settings/log-analyzer

---

## ✅ العمليات المسجلة حالياً (68 عملية)

### 🔐 **المصادقة والأمان (2)**
1. `LOGIN_SUCCESS` - تسجيل دخول ناجح
2. `SEND_TEST_TELEGRAM_SUCCESS` - إرسال رسالة تيليجرام تجريبية ناجحة
3. `SEND_TEST_TELEGRAM_FAILURE` - فشل إرسال رسالة تيليجرام

### 👥 **إدارة الموظفين (5)**
4. `CREATE_EMPLOYEE` - إنشاء موظف جديد
5. `UPDATE_EMPLOYEE` - تحديث بيانات موظف
6. `DELETE_EMPLOYEE` - حذف موظف
7. `PASSWORD_CHANGE_SUCCESS` - تغيير كلمة المرور بنجاح
8. `PASSWORD_CHANGE_FAILURE` - فشل تغيير كلمة المرور

### 🏠 **إدارة المستأجرين (5)**
9. `CREATE_TENANT` - إنشاء مستأجر جديد
10. `UPDATE_TENANT` - تحديث بيانات مستأجر
11. `DELETE_TENANT` - حذف مستأجر
12. `ASSIGN_TENANT` - تعيين مستأجر لوحدة
13. `REMOVE_TENANT` - إزالة مستأجر من وحدة

### 📄 **إدارة العقود والإيجارات (8)**
14. `UPDATE_LEASE` - تحديث عقد إيجار
15. `ADD_LEASE_PAYMENT` - إضافة دفعة إيجار
16. `UPDATE_LEASE_PAYMENT` - تحديث دفعة إيجار
17. `DELETE_LEASE_PAYMENT` - حذف دفعة إيجار
18. `ADD_LEASE_TRANSACTION` - إضافة معاملة دفع
19. `UPDATE_LEASE_TRANSACTION` - تحديث معاملة دفع
20. `DELETE_LEASE_TRANSACTION` - حذف معاملة دفع
21. `REVIEW_PAYMENT_EXTENSION` - مراجعة تمديد الدفع

### 🏢 **إدارة العقارات (5)**
22. `ASSIGN_EMPLOYEE_TO_PROPERTY` - تعيين موظف لعقار
23. `REMOVE_EMPLOYEE_FROM_PROPERTY` - إزالة موظف من عقار
24. `ADD_PROPERTY_DOCUMENT` - إضافة مستند لعقار
25. `DELETE_PROPERTY_DOCUMENT` - حذف مستند عقار
26. `CREATE_UNIT` - إنشاء وحدة جديدة
27. `UPDATE_UNIT` - تحديث وحدة

### 💰 **إدارة المصروفات (3)**
28. `CREATE_EXPENSE` - إنشاء مصروف جديد
29. `UPDATE_EXPENSE` - تحديث مصروف
30. `DELETE_EXPENSE` - حذف مصروف

### 🔧 **إدارة الصيانة (3)**
31. `CREATE_MAINTENANCE_CONTRACT` - إنشاء عقد صيانة
32. `UPDATE_MAINTENANCE_CONTRACT` - تحديث عقد صيانة
33. `DELETE_MAINTENANCE_CONTRACT` - حذف عقد صيانة

### 📦 **إدارة الأصول (3)**
34. `CREATE_ASSET` - إنشاء أصل جديد
35. `UPDATE_ASSET` - تحديث أصل
36. `DELETE_ASSET` - حذف أصل

### 🏦 **إدارة الشيكات (9)**
37. `CREATE_CHEQUE` - إنشاء شيك جديد
38. `UPDATE_CHEQUE` - تحديث شيك
39. `DELETE_CHEQUE` - حذف شيك
40. `ADD_CHEQUE_TRANSACTION` - إضافة معاملة شيك
41. `UPDATE_CHEQUE_TRANSACTION` - تحديث معاملة شيك
42. `DELETE_CHEQUE_TRANSACTION` - حذف معاملة شيك
43. `CREATE_PAYEE` - إنشاء مستفيد
44. `UPDATE_PAYEE` - تحديث مستفيد
45. `DELETE_PAYEE` - حذف مستفيد
46. `CREATE_BANK` - إنشاء بنك
47. `UPDATE_BANK` - تحديث بنك
48. `DELETE_BANK` - حذف بنك

### 👤 **إدارة الملاك (3)**
49. `CREATE_OWNER` - إنشاء مالك جديد
50. `UPDATE_OWNER` - تحديث بيانات مالك
51. `DELETE_OWNER` - حذف مالك

### ⚖️ **الإجراءات القانونية (3)**
52. `CREATE_EVICTION_REQUEST` - إنشاء طلب إخلاء
53. `UPDATE_EVICTION_REQUEST` - تحديث طلب إخلاء
54. `DELETE_EVICTION_REQUEST` - حذف طلب إخلاء

### ⚙️ **الإعدادات والتكوينات (3)**
55. `CREATE_UNIT_CONFIGURATION` - إنشاء تكوين وحدة
56. `UPDATE_UNIT_CONFIGURATION` - تحديث تكوين وحدة
57. `DELETE_UNIT_CONFIGURATION` - حذف تكوين وحدة

### 📥 **الاستيراد والتقارير (3)**
58. `BULK_IMPORT` - استيراد جماعي للبيانات
59. `GENERATE_REPORT` - إنشاء تقرير
60. `GENERATE_TAX_REPORT` - إنشاء تقرير ضريبي

### 📱 **إشعارات تيليجرام (3)**
61. `TELEGRAM_NOTIFICATION_SUCCESS` - نجاح إرسال إشعار تيليجرام
62. `TELEGRAM_NOTIFICATION_FAILURE` - فشل إرسال إشعار تيليجرام
63. `TELEGRAM_NOTIFICATION_SKIPPED` - تخطي إشعار تيليجرام

### 🗑️ **إدارة السجلات (2)**
64. `DELETE_ACTIVITY_LOG` - حذف سجل واحد
65. `DELETE_ALL_ACTIVITY_LOGS` - حذف جميع السجلات

---

## 📋 تفاصيل كل سجل

كل سجل يحتوي على:

| الحقل | الوصف |
|------|-------|
| **الوقت** | تاريخ ووقت العملية |
| **المستخدم** | اسم الموظف الذي قام بالعملية |
| **العملية** | نوع العملية (من القائمة أعلاه) |
| **نوع الكيان** | Employee, Tenant, Property, etc. |
| **معرف الكيان** | ID المتأثر |
| **التفاصيل** | معلومات إضافية (JSON) |

---

## 🎯 ملاحظات

- **إجمالي العمليات المسجلة:** 65+ عملية
- **العملية الأكثر شيوعاً:** LOGIN_SUCCESS
- **يتم حفظ:** آخر 1000 سجل فقط
- **الترتيب:** من الأحدث إلى الأقدم

---

## 🔍 البحث والتصفية

في صفحة محلل السجلات يمكنك:
- 🔎 البحث بالنص
- 📅 التصفية بالتاريخ
- 🏷️ التصفية بنوع العملية
- 👁️ عرض جميع متغيرات البرنامج
- 🗑️ حذف السجلات

---

**آخر تحديث:** 7 أكتوبر 2025

