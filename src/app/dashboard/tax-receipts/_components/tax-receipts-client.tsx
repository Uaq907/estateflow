'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Receipt, Printer, Download, Calculator } from 'lucide-react';
import type { Employee, Tenant, Lease } from '@/lib/types';

export default function TaxReceiptsClient({
  employee,
  tenants,
  leases
}: {
  employee: Employee;
  tenants: Tenant[];
  leases: Lease[];
}) {
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [baseAmount, setBaseAmount] = useState('');
  const [receiptFor, setReceiptFor] = useState('إيجار شهري');
  const [paymentMethod, setPaymentMethod] = useState('تحويل بنكي');
  
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const selectedLease = leases.find(l => l.tenantId === selectedTenantId);
  
  const baseAmountNum = parseFloat(baseAmount) || 0;
  const taxAmount = baseAmountNum * 0.05;
  const totalAmount = baseAmountNum + taxAmount;

  const generateReceiptHTML = () => {
    const receiptNumber = `TAX-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const date = new Date().toLocaleDateString('ar-SA');
    
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>إيصال ضريبة القيمة المضافة - ${receiptNumber}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
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
    }
    .tax-invoice {
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
    .receipt-info {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
      padding: 15px;
      background: #f5f5f5;
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
    }
    .amount-table .total-row {
      background: #f0f0f0;
      font-weight: bold;
      font-size: 18px;
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
    }
    @media print {
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <h1>نظام إدارة العقارات - UAQ907</h1>
      <div class="tax-invoice">إيصال ضريبة القيمة المضافة</div>
      <p style="font-size: 14px; margin-top: 10px;">TAX INVOICE / RECEIPT</p>
    </div>
    
    <div class="company-info">
      <p><strong>الاسم التجاري:</strong> UAQ907 لإدارة العقارات</p>
      <p><strong>الرقم الضريبي (TRN):</strong> 100000000000003</p>
      <p><strong>العنوان:</strong> أم القيوين - الإمارات العربية المتحدة</p>
      <p><strong>الهاتف:</strong> 0522020200 | <strong>البريد:</strong> no-reply@uaq907.com</p>
    </div>
    
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
    
    <div class="section-title">معلومات العميل / Customer Information</div>
    <table class="info-table">
      <tr>
        <td>اسم العميل / Customer Name:</td>
        <td>${selectedTenant?.name || 'غير محدد'}</td>
      </tr>
      ${selectedTenant?.idNumber ? `
      <tr>
        <td>رقم الهوية / ID Number:</td>
        <td>${selectedTenant.idNumber}</td>
      </tr>
      ` : ''}
      ${selectedLease ? `
      <tr>
        <td>رقم العقد / Lease Number:</td>
        <td>${selectedLease.id}</td>
      </tr>
      ` : ''}
    </table>
    
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
          <td>${baseAmountNum.toLocaleString('ar-AE', { minimumFractionDigits: 2 })}</td>
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
    
    <table class="info-table">
      <tr>
        <td>طريقة الدفع / Payment Method:</td>
        <td>${paymentMethod}</td>
      </tr>
    </table>
    
    <div class="notes">
      <h4 style="margin-bottom: 10px;">ملاحظات هامة / Important Notes:</h4>
      <ul style="margin-right: 20px;">
        <li>هذا الإيصال صالح كمستند ضريبي رسمي</li>
        <li>يُرجى الاحتفاظ بهذا الإيصال لسجلاتكم الضريبية</li>
        <li>This receipt is valid as an official tax document</li>
        <li>Please keep this receipt for your tax records</li>
      </ul>
    </div>
    
    <div class="signature-section">
      <div class="signature-box">
        <div class="signature-line">المستلم / Received By</div>
      </div>
      <div class="signature-box">
        <div class="signature-line">الإدارة / Management</div>
      </div>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #000;">
      <p style="text-align: center; font-size: 12px; color: #666;">
        تم إصدار هذا الإيصال بواسطة نظام إدارة العقارات - UAQ907<br>
        This receipt is generated by UAQ907 Property Management System<br>
        <strong>التاريخ والوقت:</strong> ${new Date().toLocaleString('ar-AE')}
      </p>
    </div>
  </div>
  
  <div class="no-print" style="text-align: center; margin-top: 20px;">
    <button onclick="window.print()" style="padding: 12px 30px; margin: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
      🖨️ طباعة الإيصال
    </button>
    <button onclick="window.close()" style="padding: 12px 30px; margin: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
      ✖️ إغلاق
    </button>
  </div>
</body>
</html>
    `;
  };

  const handleGenerateReceipt = () => {
    if (!selectedTenantId || !baseAmount || baseAmountNum <= 0) {
      alert('⚠️ يرجى اختيار المستأجر وإدخال المبلغ');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateReceiptHTML());
      printWindow.document.close();
    }
  };

  return (
    <>
      <AppHeader loggedInEmployee={employee} />
      <main className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">🧾 إصدار إيصالات الضريبة</h1>
          <p className="text-gray-600">إنشاء إيصالات ضريبة القيمة المضافة المستلمة</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* نموذج الإدخال */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                بيانات الإيصال
              </CardTitle>
              <CardDescription>
                أدخل بيانات الإيصال الضريبي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* اختيار المستأجر */}
              <div>
                <Label>المستأجر *</Label>
                <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المستأجر..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* المبلغ الأساسي */}
              <div>
                <Label htmlFor="baseAmount">المبلغ الأساسي (بدون ضريبة) *</Label>
                <Input
                  id="baseAmount"
                  type="number"
                  placeholder="0.00"
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* الغرض من الدفع */}
              <div>
                <Label>الغرض من الدفع</Label>
                <Select value={receiptFor} onValueChange={setReceiptFor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="إيجار شهري">إيجار شهري</SelectItem>
                    <SelectItem value="إيجار سنوي">إيجار سنوي</SelectItem>
                    <SelectItem value="دفعة أولى">دفعة أولى</SelectItem>
                    <SelectItem value="دفعة نهائية">دفعة نهائية</SelectItem>
                    <SelectItem value="مستحقات متأخرة">مستحقات متأخرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* طريقة الدفع */}
              <div>
                <Label>طريقة الدفع</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                    <SelectItem value="شيك">شيك</SelectItem>
                    <SelectItem value="نقداً">نقداً</SelectItem>
                    <SelectItem value="بطاقة">بطاقة ائتمان</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* زر إنشاء الإيصال */}
              <Button 
                onClick={handleGenerateReceipt}
                className="w-full"
                size="lg"
                disabled={!selectedTenantId || !baseAmount || baseAmountNum <= 0}
              >
                <Receipt className="h-4 w-4 mr-2" />
                إنشاء الإيصال
              </Button>
            </CardContent>
          </Card>

          {/* معاينة الحسابات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                حساب الضريبة
              </CardTitle>
              <CardDescription>
                معاينة المبالغ والضريبة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* معلومات المستأجر المختار */}
                {selectedTenant && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-2">المستأجر المحدد:</h4>
                    <p className="text-sm"><strong>الاسم:</strong> {selectedTenant.name}</p>
                    <p className="text-sm"><strong>البريد:</strong> {selectedTenant.email}</p>
                    <p className="text-sm"><strong>الهاتف:</strong> {selectedTenant.phone}</p>
                    {selectedTenant.idNumber && (
                      <p className="text-sm"><strong>رقم الهوية:</strong> {selectedTenant.idNumber}</p>
                    )}
                  </div>
                )}

                {/* حساب الضريبة */}
                <div className="space-y-3">
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">المبلغ الأساسي:</span>
                    <span className="font-semibold">
                      {baseAmountNum.toLocaleString('ar-AE', { minimumFractionDigits: 2 })} درهم
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-700">ضريبة القيمة المضافة (5%):</span>
                    <span className="font-semibold text-blue-600">
                      {taxAmount.toLocaleString('ar-AE', { minimumFractionDigits: 2 })} درهم
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-2xl">
                    <span className="font-bold">الإجمالي:</span>
                    <span className="font-bold text-green-600">
                      {totalAmount.toLocaleString('ar-AE', { minimumFractionDigits: 2 })} درهم
                    </span>
                  </div>
                </div>

                {/* معلومات إضافية */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-sm">
                  <p className="font-semibold mb-2">📋 معلومات الإيصال:</p>
                  <p><strong>الغرض:</strong> {receiptFor}</p>
                  <p><strong>طريقة الدفع:</strong> {paymentMethod}</p>
                  <p><strong>الرقم الضريبي:</strong> 100000000000003</p>
                </div>

                {/* تنبيه */}
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-800">
                    <strong>💡 ملاحظة:</strong> سيتم إنشاء الإيصال في نافذة جديدة يمكن طباعته أو حفظه كـ PDF
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

