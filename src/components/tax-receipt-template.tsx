'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, Printer } from 'lucide-react';

interface TaxReceiptProps {
  receiptNumber: string;
  date: string;
  tenantName: string;
  tenantId?: string;
  propertyName: string;
  unitNumber: string;
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  receiptFor?: string;
}

export function TaxReceiptTemplate({
  receiptNumber,
  date,
  tenantName,
  tenantId,
  propertyName,
  unitNumber,
  baseAmount,
  taxAmount,
  totalAmount,
  paymentMethod = 'تحويل بنكي',
  receiptFor = 'إيجار شهري'
}: TaxReceiptProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const receiptContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>إيصال ضريبة القيمة المضافة - ${receiptNumber}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', 'Segoe UI', sans-serif;
          direction: rtl;
          text-align: right;
          line-height: 1.6;
          color: #333;
        }
        
        .receipt-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          border: 2px solid #000;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px double #000;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #000;
        }
        
        .header .tax-invoice {
          font-size: 20px;
          font-weight: bold;
          background: #000;
          color: #fff;
          padding: 8px 20px;
          display: inline-block;
          margin: 10px 0;
        }
        
        .company-info {
          text-align: center;
          margin-bottom: 20px;
          font-size: 14px;
        }
        
        .company-info p {
          margin: 5px 0;
        }
        
        .receipt-info {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          padding: 15px;
          background: #f5f5f5;
        }
        
        .receipt-info div {
          flex: 1;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin: 20px 0 10px 0;
          padding: 8px;
          background: #e9ecef;
          border-right: 4px solid #000;
        }
        
        .info-table {
          width: 100%;
          margin: 15px 0;
        }
        
        .info-table td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        
        .info-table td:first-child {
          font-weight: bold;
          width: 40%;
        }
        
        .amount-table {
          width: 100%;
          margin: 20px 0;
          border-collapse: collapse;
        }
        
        .amount-table th,
        .amount-table td {
          padding: 12px;
          text-align: right;
          border: 1px solid #000;
        }
        
        .amount-table th {
          background: #000;
          color: #fff;
          font-weight: bold;
        }
        
        .amount-table .total-row {
          background: #f0f0f0;
          font-weight: bold;
          font-size: 18px;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #000;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
        }
        
        .signature-box {
          text-align: center;
          width: 45%;
        }
        
        .signature-line {
          border-top: 2px solid #000;
          margin-top: 60px;
          padding-top: 10px;
        }
        
        .notes {
          margin-top: 30px;
          padding: 15px;
          background: #fff9e6;
          border: 1px solid #ffd700;
          border-radius: 5px;
        }
        
        .notes h4 {
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        @media print {
          .no-print {
            display: none !important;
          }
          
          .receipt-container {
            border: 2px solid #000;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <!-- الرأسية -->
        <div class="header">
          <h1>نظام إدارة العقارات - UAQ907</h1>
          <div class="tax-invoice">إيصال ضريبة القيمة المضافة</div>
          <p style="font-size: 14px; margin-top: 10px;">TAX INVOICE / RECEIPT</p>
        </div>
        
        <!-- معلومات الشركة -->
        <div class="company-info">
          <p><strong>الاسم التجاري:</strong> UAQ907 لإدارة العقارات</p>
          <p><strong>الرقم الضريبي (TRN):</strong> 100000000000003</p>
          <p><strong>العنوان:</strong> أم القيوين - الإمارات العربية المتحدة</p>
          <p><strong>الهاتف:</strong> 0522020200 | <strong>البريد:</strong> no-reply@uaq907.com</p>
        </div>
        
        <Separator />
        
        <!-- معلومات الإيصال -->
        <div class="receipt-info">
          <div>
            <p><strong>رقم الإيصال:</strong> ${receiptNumber}</p>
            <p><strong>التاريخ:</strong> ${date}</p>
          </div>
          <div style="text-align: left;">
            <p><strong>Receipt No:</strong> ${receiptNumber}</p>
            <p><strong>Date:</strong> ${date}</p>
          </div>
        </div>
        
        <!-- معلومات العميل -->
        <div class="section-title">معلومات العميل / Customer Information</div>
        <table class="info-table">
          <tr>
            <td>اسم العميل / Customer Name:</td>
            <td>${tenantName}</td>
          </tr>
          ${tenantId ? `
          <tr>
            <td>رقم الهوية / ID Number:</td>
            <td>${tenantId}</td>
          </tr>
          ` : ''}
          <tr>
            <td>العقار / Property:</td>
            <td>${propertyName}</td>
          </tr>
          <tr>
            <td>رقم الوحدة / Unit Number:</td>
            <td>${unitNumber}</td>
          </tr>
        </table>
        
        <!-- تفاصيل المبلغ -->
        <div class="section-title">تفاصيل المبلغ / Amount Details</div>
        <table class="amount-table">
          <thead>
            <tr>
              <th>البيان / Description</th>
              <th>المبلغ (درهم) / Amount (AED)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${receiptFor}</td>
              <td>${baseAmount.toLocaleString('ar-AE', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>ضريبة القيمة المضافة (5%) / VAT (5%)</td>
              <td>${taxAmount.toLocaleString('ar-AE', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr class="total-row">
              <td>المجموع الإجمالي / Total Amount</td>
              <td>${totalAmount.toLocaleString('ar-AE', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
        
        <!-- طريقة الدفع -->
        <table class="info-table">
          <tr>
            <td>طريقة الدفع / Payment Method:</td>
            <td>${paymentMethod}</td>
          </tr>
        </table>
        
        <!-- ملاحظات -->
        <div class="notes">
          <h4>ملاحظات هامة / Important Notes:</h4>
          <ul style="margin-right: 20px; margin-top: 10px;">
            <li>هذا الإيصال صالح كمستند ضريبي رسمي</li>
            <li>يُرجى الاحتفاظ بهذا الإيصال لسجلاتكم الضريبية</li>
            <li>This receipt is valid as an official tax document</li>
            <li>Please keep this receipt for your tax records</li>
          </ul>
        </div>
        
        <!-- التوقيعات -->
        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line">
              المستلم / Received By
            </div>
          </div>
          <div class="signature-box">
            <div class="signature-line">
              الإدارة / Management
            </div>
          </div>
        </div>
        
        <!-- التذييل -->
        <div class="footer">
          <p style="text-align: center; font-size: 12px; color: #666;">
            تم إصدار هذا الإيصال بواسطة نظام إدارة العقارات - UAQ907<br>
            This receipt is generated by UAQ907 Property Management System<br>
            <strong>التاريخ والوقت:</strong> ${new Date().toLocaleString('ar-AE')}
          </p>
        </div>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 30px; margin: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
          🖨️ طباعة
        </button>
        <button onclick="window.close()" style="padding: 10px 30px; margin: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
          ✖️ إغلاق
        </button>
      </div>
    </body>
    </html>
  `;

  const handlePreviewReceipt = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">إيصال ضريبة القيمة المضافة</h3>
            <p className="text-sm text-gray-600">رقم الإيصال: {receiptNumber}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewReceipt}
            >
              <Printer className="h-4 w-4 mr-2" />
              طباعة الإيصال
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewReceipt}
            >
              <Download className="h-4 w-4 mr-2" />
              تنزيل PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* معاينة سريعة */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">العميل:</p>
              <p className="font-semibold">{tenantName}</p>
            </div>
            <div>
              <p className="text-gray-600">التاريخ:</p>
              <p className="font-semibold">{date}</p>
            </div>
            <div>
              <p className="text-gray-600">العقار:</p>
              <p className="font-semibold">{propertyName} - {unitNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">المبلغ الإجمالي:</p>
              <p className="font-semibold text-green-600">
                {totalAmount.toLocaleString('ar-AE', { minimumFractionDigits: 2 })} درهم
              </p>
            </div>
          </div>

          <Separator />

          {/* تفاصيل الضريبة */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">المبلغ الأساسي:</span>
              <span className="font-semibold">
                {baseAmount.toLocaleString('ar-AE', { minimumFractionDigits: 2 })} درهم
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">ضريبة القيمة المضافة (5%):</span>
              <span className="font-semibold text-blue-600">
                {taxAmount.toLocaleString('ar-AE', { minimumFractionDigits: 2 })} درهم
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg">
              <span className="font-bold">المجموع الإجمالي:</span>
              <span className="font-bold text-green-600">
                {totalAmount.toLocaleString('ar-AE', { minimumFractionDigits: 2 })} درهم
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

