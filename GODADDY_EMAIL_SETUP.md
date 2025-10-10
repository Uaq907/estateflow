# 📧 إعداد البريد الإلكتروني من GoDaddy

## خطوات الإعداد

### 1️⃣ الحصول على معلومات SMTP من GoDaddy

قم بتسجيل الدخول إلى حساب GoDaddy الخاص بك:

**إعدادات SMTP الخاصة بـ GoDaddy:**
```
SMTP Server: smtpout.secureserver.net
Port: 465 (SSL) أو 587 (TLS)
Username: your-email@yourdomain.com (بريدك الكامل)
Password: كلمة مرور البريد الإلكتروني
```

---

### 2️⃣ إضافة المتغيرات البيئية

أنشئ أو عدّل ملف `.env.local` في جذر المشروع:

```env
# GoDaddy Email Configuration
EMAIL_HOST=smtpout.secureserver.net
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=no-reply@uaq907.com
EMAIL_PASSWORD=YOUR_PASSWORD_HERE
EMAIL_FROM_NAME=نظام إدارة العقارات - UAQ907
EMAIL_FROM_ADDRESS=no-reply@uaq907.com
```

**⚠️ هام:** 
- البريد: `no-reply@uaq907.com` (تم التعيين)
- **استبدل `YOUR_PASSWORD_HERE` بكلمة المرور الفعلية** لبريدك من GoDaddy
- **لا ترفع ملف `.env.local` إلى Git!** (موجود في `.gitignore`)

---

### 3️⃣ إضافة المتغيرات إلى Railway (للنشر)

في لوحة تحكم Railway:

1. اذهب إلى **Variables**
2. أضف المتغيرات التالية:

```
EMAIL_HOST=smtpout.secureserver.net
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=no-reply@uaq907.com
EMAIL_PASSWORD=YOUR_PASSWORD_HERE
EMAIL_FROM_NAME=نظام إدارة العقارات - UAQ907
EMAIL_FROM_ADDRESS=no-reply@uaq907.com
```

**⚠️ تذكّر:** استبدل `YOUR_PASSWORD_HERE` بكلمة المرور الفعلية!

---

## 🚀 الاستخدام

### إرسال نموذج دعوى قانونية

```typescript
import { sendPetitionEmail } from '@/lib/email';

await sendPetitionEmail({
  to: 'tenant@example.com',
  clientName: 'فاطمة السالم',
  caseNumber: 'CASE-2025-001',
  petitionContent: '...' // محتوى النموذج
});
```

### إرسال تذكير باستحقاق شيك

```typescript
import { sendChequeReminderEmail } from '@/lib/email';

await sendChequeReminderEmail({
  to: 'manager@example.com',
  recipientName: 'أحمد محمد',
  chequeNumber: 'CHQ-2025-001',
  amount: 50000,
  dueDate: '15/10/2025',
  payeeName: 'شركة الصيانة'
});
```

### إرسال تنبيه انتهاء عقد

```typescript
import { sendLeaseExpiryEmail } from '@/lib/email';

await sendLeaseExpiryEmail({
  to: 'tenant@example.com',
  tenantName: 'فاطمة السالم',
  propertyName: 'فيلا الشاطئ',
  unitNumber: 'V-105',
  expiryDate: '31/12/2025',
  daysRemaining: 30
});
```

### إرسال بريد مخصص

```typescript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: 'recipient@example.com',
  subject: 'الموضوع',
  html: '<h1>مرحباً</h1><p>محتوى HTML</p>',
  text: 'محتوى نصي بديل'
});
```

---

## ✅ التحقق من الإعداد

قم بتشغيل الأمر التالي للتحقق من صحة الإعداد:

```bash
npm run dev
```

ثم في الكود:

```typescript
import { verifyEmailConfig } from '@/lib/email';

const isValid = await verifyEmailConfig();
console.log('Email config valid:', isValid);
```

---

## 🔧 استكشاف الأخطاء

### خطأ: "Invalid login"
- تأكد من صحة بريدك الإلكتروني وكلمة المرور
- تحقق من أن البريد مُفعّل في GoDaddy

### خطأ: "Connection timeout"
- تحقق من رقم المنفذ (465 أو 587)
- تأكد من إعدادات جدار الحماية

### خطأ: "Self-signed certificate"
أضف هذا إلى `transporter`:
```typescript
tls: {
  rejectUnauthorized: false
}
```

---

## 📌 ملاحظات

- GoDaddy يدعم **SMTP SSL** على المنفذ **465**
- يمكنك إرسال حتى **250 رسالة/يوم** للحسابات العادية
- للحسابات المميزة: حتى **1000 رسالة/يوم**
- البريد يُرسل فوراً (خلال ثوانٍ)

---

## 🎯 الميزات المتاحة الآن

✅ إرسال نماذج الدعاوى القانونية  
✅ تذكيرات استحقاق الشيكات  
✅ تنبيهات انتهاء العقود  
✅ إشعارات المصروفات  
✅ رسائل مخصصة

---

**بعد الإعداد، سيتم إرسال البريد الإلكتروني تلقائياً عند إنشاء قضية جديدة! 📨**

