import nodemailer from 'nodemailer';

// إعداد GoDaddy SMTP Transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtpout.secureserver.net',
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'no-reply@uaq907.com',
    pass: process.env.EMAIL_PASSWORD || '',
  },
  tls: {
    rejectUnauthorized: false // للتعامل مع شهادات GoDaddy
  }
});

// دالة لإرسال بريد إلكتروني
export async function sendEmail({
  to,
  subject,
  html,
  text,
  attachments,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
}) {
  try {
    const info = await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'نظام إدارة العقارات'} <${process.env.EMAIL_FROM_ADDRESS || 'no-reply@uaq907.com'}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
      attachments,
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
}

// دالة لإرسال نموذج دعوى قانونية
export async function sendPetitionEmail({
  to,
  clientName,
  caseNumber,
  petitionContent,
}: {
  to: string;
  clientName: string;
  caseNumber: string;
  petitionContent: string;
}) {
  const subject = `نموذج الدعوى القانونية - ${caseNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', 'Segoe UI', sans-serif;
          direction: rtl;
          text-align: right;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 3px solid #007bff;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #007bff;
          margin: 0;
        }
        .content {
          line-height: 1.8;
          white-space: pre-wrap;
          font-size: 14px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏛️ نظام إدارة العقارات - EstateFlow</h1>
          <p>نموذج الدعوى القانونية</p>
        </div>
        
        <p>السيد/ة <strong>${clientName}</strong> المحترم/ة،</p>
        
        <p>تحية طيبة وبعد،</p>
        
        <p>نرفق لكم نموذج الدعوى القانونية رقم <strong>${caseNumber}</strong> للمراجعة:</p>
        
        <div class="content">
${petitionContent}
        </div>
        
        <div class="footer">
          <p>هذا البريد الإلكتروني تم إرساله تلقائياً من نظام EstateFlow</p>
          <p>للاستفسارات، يرجى التواصل مع الإدارة</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
السيد/ة ${clientName} المحترم/ة،

تحية طيبة وبعد،

نرفق لكم نموذج الدعوى القانونية رقم ${caseNumber} للمراجعة:

${petitionContent}

---
هذا البريد الإلكتروني تم إرساله تلقائياً من نظام EstateFlow
  `;

  return sendEmail({ to, subject, html, text });
}

// دالة لإرسال إشعار استحقاق شيك
export async function sendChequeReminderEmail({
  to,
  recipientName,
  chequeNumber,
  amount,
  dueDate,
  payeeName,
}: {
  to: string;
  recipientName: string;
  chequeNumber: string;
  amount: number;
  dueDate: string;
  payeeName: string;
}) {
  const subject = `تذكير: شيك مستحق - رقم ${chequeNumber}`;
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          direction: rtl;
          text-align: right;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
        }
        .alert {
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
        .info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .info p {
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🔔 تذكير باستحقاق شيك</h2>
        
        <p>السيد/ة <strong>${recipientName}</strong> المحترم/ة،</p>
        
        <div class="alert">
          <p><strong>⚠️ تنبيه:</strong> لديك شيك مستحق قريباً</p>
        </div>
        
        <div class="info">
          <p><strong>رقم الشيك:</strong> ${chequeNumber}</p>
          <p><strong>المبلغ:</strong> ${amount.toLocaleString('ar-AE')} درهم</p>
          <p><strong>تاريخ الاستحقاق:</strong> ${dueDate}</p>
          <p><strong>المستفيد:</strong> ${payeeName}</p>
        </div>
        
        <p>يرجى التأكد من توفر الرصيد الكافي في الحساب قبل تاريخ الاستحقاق.</p>
        
        <p>مع تحيات،<br>نظام إدارة العقارات - EstateFlow</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}

// دالة لإرسال إشعار انتهاء عقد الإيجار
export async function sendLeaseExpiryEmail({
  to,
  tenantName,
  propertyName,
  unitNumber,
  expiryDate,
  daysRemaining,
}: {
  to: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  expiryDate: string;
  daysRemaining: number;
}) {
  const subject = `تنبيه: انتهاء عقد الإيجار خلال ${daysRemaining} يوم`;
  
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Arial', sans-serif;
          direction: rtl;
          text-align: right;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
        }
        .warning {
          background: #f8d7da;
          border: 1px solid #dc3545;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
          color: #721c24;
        }
        .info {
          background: #e7f3ff;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>📅 تنبيه: انتهاء عقد الإيجار</h2>
        
        <p>السيد/ة <strong>${tenantName}</strong> المحترم/ة،</p>
        
        <div class="warning">
          <p><strong>⚠️ تنبيه هام:</strong> سينتهي عقد الإيجار الخاص بكم خلال <strong>${daysRemaining} يوم</strong></p>
        </div>
        
        <div class="info">
          <p><strong>العقار:</strong> ${propertyName}</p>
          <p><strong>رقم الوحدة:</strong> ${unitNumber}</p>
          <p><strong>تاريخ الانتهاء:</strong> ${expiryDate}</p>
        </div>
        
        <p>يرجى التواصل مع الإدارة لتجديد العقد أو ترتيب الإخلاء.</p>
        
        <p>مع تحيات،<br>إدارة العقارات</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}

// التحقق من إعدادات البريد الإلكتروني
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
}

