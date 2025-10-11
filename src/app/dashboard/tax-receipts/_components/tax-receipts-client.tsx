'use client';

import { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, FileText, Upload, Download, Eye, Edit, Trash2, Bell } from 'lucide-react';
import { AppHeader } from '@/components/layout/header';
import { useToast } from '@/hooks/use-toast';

interface TaxReceipt {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  customerTRN: string;
  serviceDescription: string;
  invoiceAmount: number;
  vatAmount: number;
  totalAmount: number;
  amountInWords: string;
  invoiceDate: string;
  trnNumber: string;
  bankDetails: {
    bank: string;
    accountHolder: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
    branch: string;
  };
  contactDetails: {
    location: string;
    poBox: string;
    phones: string[];
    emails: string[];
  };
  imageUrl?: string;
  createdAt: string;
  expenseId?: string;
  ownerId?: string;
  ownerName?: string;
  propertyName?: string;
  businessName?: string;
}

interface TaxReceiptsClientProps {
  loggedInEmployee: any;
}

export default function TaxReceiptsClient({ loggedInEmployee }: TaxReceiptsClientProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<TaxReceipt | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data for tax receipts
  const [taxReceipts, setTaxReceipts] = useState<TaxReceipt[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('taxReceipts');
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((receipt: any) => ({
            id: receipt.id || `tr-${receipt.invoiceNumber}`,
            invoiceNumber: receipt.invoiceNumber,
            customerName: receipt.customerName,
            customerAddress: receipt.customerAddress,
            customerTRN: receipt.customerTRN,
            serviceDescription: receipt.serviceDescription,
            invoiceAmount: receipt.invoiceAmount,
            vatAmount: receipt.vatAmount,
            totalAmount: receipt.totalAmount,
            amountInWords: receipt.amountInWords,
            invoiceDate: receipt.invoiceDate,
            trnNumber: receipt.trnNumber,
            bankDetails: receipt.bankDetails,
            contactDetails: receipt.contactDetails,
            imageUrl: receipt.imageUrl,
            createdAt: receipt.createdAt || receipt.invoiceDate,
            expenseId: receipt.expenseId,
            ownerId: receipt.ownerId,
            ownerName: receipt.ownerName,
            propertyName: receipt.propertyName,
            businessName: receipt.businessName
          }));
        }
      } catch (error) {
        console.error('Error loading tax receipts from localStorage:', error);
      }
    }
    
    // Default mock data
    return [
      {
        id: 'tr-001',
        invoiceNumber: '0046',
        customerName: 'فاطمة السالم',
        customerAddress: 'أم القيوين - الظهر',
        customerTRN: '100427200900003',
        serviceDescription: 'رسوم خدمة إدارية',
        invoiceAmount: 1000,
        vatAmount: 50,
        totalAmount: 1050,
        amountInWords: 'ألف وخمسون درهم إماراتي',
        invoiceDate: '2025-01-10',
        trnNumber: '100427200900003',
        bankDetails: {
          bank: 'ADIB Bank',
          accountHolder: 'Abdulla Mohamed Ali Omair AL Ali',
          accountNumber: '18860565',
          iban: 'AE76500000000188650565',
          swiftCode: 'ADIBUQWA',
          branch: 'Umm AL Quwain'
        },
        contactDetails: {
          location: 'Umm Al-Quwain - UAE',
          poBox: '125',
          phones: ['050-6332331', '050-6271221', '055-6271211'],
          emails: ['uaq79000@gmail.com', 'uaq42000@hotmail.com']
        },
        imageUrl: '/api/placeholder/400/600',
        createdAt: '2025-01-10'
      }
    ];
  });

  // Listen for new tax receipts created from expenses
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('taxReceipts');
          if (stored) {
            const parsed = JSON.parse(stored);
            const newReceipts = parsed.map((receipt: any) => ({
              id: receipt.id || `tr-${receipt.invoiceNumber}`,
              invoiceNumber: receipt.invoiceNumber,
              customerName: receipt.customerName,
              customerAddress: receipt.customerAddress,
              customerTRN: receipt.customerTRN,
              serviceDescription: receipt.serviceDescription,
              invoiceAmount: receipt.invoiceAmount,
              vatAmount: receipt.vatAmount,
              totalAmount: receipt.totalAmount,
              amountInWords: receipt.amountInWords,
              invoiceDate: receipt.invoiceDate,
              trnNumber: receipt.trnNumber,
              bankDetails: receipt.bankDetails,
              contactDetails: receipt.contactDetails,
              imageUrl: receipt.imageUrl,
              createdAt: receipt.createdAt || receipt.invoiceDate,
              expenseId: receipt.expenseId,
              ownerId: receipt.ownerId,
              ownerName: receipt.ownerName,
              propertyName: receipt.propertyName,
              businessName: receipt.businessName
            }));
            
            // Check if there are new receipts
            if (newReceipts.length > taxReceipts.length) {
              const newReceipt = newReceipts[0]; // Most recent receipt
              if (newReceipt.expenseId) {
                toast({
                  title: "تم إنشاء إيصال ضريبي تلقائياً",
                  description: `تم إنشاء إيصال ضريبي رقم ${newReceipt.invoiceNumber} للمصروف المعتمد`,
                  duration: 7000,
                });
              }
            }
            
            setTaxReceipts(newReceipts);
          }
        } catch (error) {
          console.error('Error loading tax receipts from localStorage:', error);
        }
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on component mount
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [taxReceipts.length, toast]);

  const [newReceipt, setNewReceipt] = useState<Partial<TaxReceipt>>({
    invoiceNumber: '',
    customerName: '',
    customerAddress: '',
    customerTRN: '',
    serviceDescription: '',
    invoiceAmount: 0,
    vatAmount: 0,
    totalAmount: 0,
    amountInWords: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    trnNumber: '100427200900003',
    bankDetails: {
      bank: 'ADIB Bank',
      accountHolder: 'Abdulla Mohamed Ali Omair AL Ali',
      accountNumber: '18860565',
      iban: 'AE76500000000188650565',
      swiftCode: 'ADIBUQWA',
      branch: 'Umm AL Quwain'
    },
    contactDetails: {
      location: 'Umm Al-Quwain - UAE',
      poBox: '125',
      phones: ['050-6332331', '050-6271221', '055-6271211'],
      emails: ['uaq79000@gmail.com', 'uaq42000@hotmail.com']
    }
  });

  const filteredReceipts = useMemo(() => {
    return taxReceipts.filter(receipt =>
      receipt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.invoiceNumber.includes(searchTerm) ||
      receipt.customerTRN.includes(searchTerm)
    );
  }, [taxReceipts, searchTerm]);

  const handleCreateReceipt = () => {
    if (newReceipt.customerName && newReceipt.invoiceNumber) {
      const receipt: TaxReceipt = {
        id: `tr-${Date.now()}`,
        invoiceNumber: newReceipt.invoiceNumber!,
        customerName: newReceipt.customerName!,
        customerAddress: newReceipt.customerAddress!,
        customerTRN: newReceipt.customerTRN!,
        serviceDescription: newReceipt.serviceDescription!,
        invoiceAmount: newReceipt.invoiceAmount!,
        vatAmount: newReceipt.vatAmount!,
        totalAmount: newReceipt.totalAmount!,
        amountInWords: newReceipt.amountInWords!,
        invoiceDate: newReceipt.invoiceDate!,
        trnNumber: newReceipt.trnNumber!,
        bankDetails: newReceipt.bankDetails!,
        contactDetails: newReceipt.contactDetails!,
        createdAt: new Date().toISOString().split('T')[0]
      };

      const updatedReceipts = [receipt, ...taxReceipts];
      setTaxReceipts(updatedReceipts);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('taxReceipts', JSON.stringify(updatedReceipts));
      }
      
      // Show success notification
      toast({
        title: "تم إنشاء الإيصال الضريبي بنجاح",
        description: `تم إنشاء الإيصال رقم ${receipt.invoiceNumber} بنجاح`,
        duration: 5000,
      });
      
      setIsCreateDialogOpen(false);
      setNewReceipt({
        invoiceNumber: '',
        customerName: '',
        customerAddress: '',
        customerTRN: '',
        serviceDescription: '',
        invoiceAmount: 0,
        vatAmount: 0,
        totalAmount: 0,
        amountInWords: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        trnNumber: '100427200900003',
        bankDetails: {
          bank: 'ADIB Bank',
          accountHolder: 'Abdulla Mohamed Ali Omair AL Ali',
          accountNumber: '18860565',
          iban: 'AE76500000000188650565',
          swiftCode: 'ADIBUQWA',
          branch: 'Umm AL Quwain'
        },
        contactDetails: {
          location: 'Umm Al-Quwain - UAE',
          poBox: '125',
          phones: ['050-6332331', '050-6271221', '055-6271211'],
          emails: ['uaq79000@gmail.com', 'uaq42000@hotmail.com']
        }
      });
    }
  };

  const handleViewReceipt = (receipt: TaxReceipt) => {
    setSelectedReceipt(receipt);
    setIsViewDialogOpen(true);
    setIsEditing(false);
  };

  const calculateVAT = (amount: number) => {
    const vat = amount * 0.05;
    const total = amount + vat;
    return { vat, total };
  };

  const handleAmountChange = (amount: number) => {
    const { vat, total } = calculateVAT(amount);
    setNewReceipt(prev => ({
      ...prev,
      invoiceAmount: amount,
      vatAmount: vat,
      totalAmount: total
    }));
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const handlePrintReceipt = (receipt: TaxReceipt) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>إيصال ضريبي - ${receipt.invoiceNumber}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: black;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #333;
            padding: 30px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .company-name-ar {
            font-size: 20px;
            margin-bottom: 15px;
          }
          .invoice-title {
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0;
            padding: 10px;
            border: 1px solid #333;
            display: inline-block;
          }
          .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .detail-section h4 {
            margin-bottom: 15px;
            font-size: 16px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 5px;
          }
          .detail-item {
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
          }
          .detail-label {
            font-weight: bold;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #333;
            padding: 12px;
            text-align: right;
          }
          .items-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .total-row {
            font-weight: bold;
            background-color: #f9f9f9;
          }
          .bank-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
          }
          .signature-section {
            border-top: 2px solid #333;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: end;
          }
          .signature-line {
            border-bottom: 2px dashed #333;
            width: 200px;
            height: 40px;
          }
          .print-date {
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .invoice-container { border: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">Abdulla Mohamed Ali Omair Al Ali</div>
            <div class="company-name-ar">عبدالله محمد علي عمير العلي</div>
            <div class="invoice-title">فاتورة ضريبية / TAX INVOICE</div>
            <div>رقم الفاتورة: ${receipt.invoiceNumber}</div>
          </div>

          <div class="invoice-details">
            <div class="detail-section">
              <h4>تفاصيل الفاتورة</h4>
              <div class="detail-item">
                <span class="detail-label">رقم الفاتورة الضريبية:</span>
                <span>${receipt.invoiceNumber}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">رقم الضريبة (TRN):</span>
                <span>${receipt.trnNumber}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">تاريخ الفاتورة:</span>
                <span>${new Date(receipt.invoiceDate).toLocaleDateString('en-GB')}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>تفاصيل العميل</h4>
              <div class="detail-item">
                <span class="detail-label">اسم العميل:</span>
                <span>${receipt.customerName}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">عنوان العميل:</span>
                <span>${receipt.customerAddress}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">رقم الضريبة للعميل:</span>
                <span>${receipt.customerTRN}</span>
              </div>
              ${receipt.expenseId ? `
              <div class="detail-item">
                <span class="detail-label">المصروف المرتبط:</span>
                <span>${receipt.expenseId}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>الوصف</th>
                <th>مبلغ الفاتورة (AED)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${receipt.serviceDescription}</td>
                <td>${formatCurrency(receipt.invoiceAmount)}</td>
              </tr>
              <tr>
                <td>إجمالي مبلغ الفاتورة</td>
                <td>${formatCurrency(receipt.invoiceAmount)}</td>
              </tr>
              <tr>
                <td>ضريبة القيمة المضافة (5%)</td>
                <td>${formatCurrency(receipt.vatAmount)}</td>
              </tr>
              <tr class="total-row">
                <td>إجمالي مبلغ الفاتورة (شامل الضريبة)</td>
                <td>${formatCurrency(receipt.totalAmount)}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-bottom: 20px;">
            <strong>المبلغ بالكلمات:</strong> ${receipt.amountInWords}
          </div>

          <div class="bank-details">
            <div class="detail-section">
              <h4>تفاصيل الحساب البنكي</h4>
              <div class="detail-item">
                <span class="detail-label">البنك:</span>
                <span>${receipt.bankDetails.bank}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">اسم صاحب الحساب:</span>
                <span>${receipt.bankDetails.accountHolder}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">رقم الحساب:</span>
                <span>${receipt.bankDetails.accountNumber}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">رقم الآيبان:</span>
                <span>${receipt.bankDetails.iban}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">رمز السويفت:</span>
                <span>${receipt.bankDetails.swiftCode}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">الفرع:</span>
                <span>${receipt.bankDetails.branch}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>معلومات الاتصال</h4>
              <div class="detail-item">
                <span class="detail-label">الموقع:</span>
                <span>${receipt.contactDetails.location}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">صندوق البريد:</span>
                <span>${receipt.contactDetails.poBox}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">الهواتف:</span>
                <span>${receipt.contactDetails.phones.join(', ')}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">البريد الإلكتروني:</span>
                <span>${receipt.contactDetails.emails.join(', ')}</span>
              </div>
            </div>
          </div>

          <div class="signature-section">
            <div>
              <div><strong>توقيع المستلم:</strong></div>
              <div class="signature-line"></div>
            </div>
            <div class="print-date">
              تاريخ الطباعة: ${new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('taxReceipts.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('taxReceipts.description')}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('taxReceipts.addNew')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('taxReceipts.createReceipt')}</DialogTitle>
              <DialogDescription>
                قم بملء البيانات التالية لإنشاء إيصال ضريبي جديد
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="invoiceNumber">{t('taxReceipts.invoiceNumber')}</Label>
                  <Input
                    id="invoiceNumber"
                    value={newReceipt.invoiceNumber}
                    onChange={(e) => setNewReceipt(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="أدخل رقم الفاتورة"
                  />
                </div>
                
                <div>
                  <Label htmlFor="invoiceDate">{t('taxReceipts.invoiceDate')}</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={newReceipt.invoiceDate}
                    onChange={(e) => setNewReceipt(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerName">{t('taxReceipts.customerName')}</Label>
                  <Input
                    id="customerName"
                    value={newReceipt.customerName}
                    onChange={(e) => setNewReceipt(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="أدخل اسم العميل"
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerAddress">{t('taxReceipts.customerAddress')}</Label>
                  <Textarea
                    id="customerAddress"
                    value={newReceipt.customerAddress}
                    onChange={(e) => setNewReceipt(prev => ({ ...prev, customerAddress: e.target.value }))}
                    placeholder="أدخل عنوان العميل"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerTRN">{t('taxReceipts.customerTRN')}</Label>
                  <Input
                    id="customerTRN"
                    value={newReceipt.customerTRN}
                    onChange={(e) => setNewReceipt(prev => ({ ...prev, customerTRN: e.target.value }))}
                    placeholder="أدخل رقم الضريبة"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceDescription">{t('taxReceipts.serviceDescription')}</Label>
                  <Textarea
                    id="serviceDescription"
                    value={newReceipt.serviceDescription}
                    onChange={(e) => setNewReceipt(prev => ({ ...prev, serviceDescription: e.target.value }))}
                    placeholder="أدخل وصف الخدمة"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="invoiceAmount">{t('taxReceipts.invoiceAmount')}</Label>
                  <Input
                    id="invoiceAmount"
                    type="number"
                    value={newReceipt.invoiceAmount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    placeholder="أدخل المبلغ"
                  />
                </div>
                
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span>{t('taxReceipts.basicAmount')}:</span>
                    <span className="font-medium">{formatCurrency(newReceipt.invoiceAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('taxReceipts.vat5Percent')}:</span>
                    <span className="font-medium">{formatCurrency(newReceipt.vatAmount || 0)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('taxReceipts.totalAmount')}:</span>
                    <span>{formatCurrency(newReceipt.totalAmount || 0)}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="amountInWords">{t('taxReceipts.amountInWords')}</Label>
                  <Textarea
                    id="amountInWords"
                    value={newReceipt.amountInWords}
                    onChange={(e) => setNewReceipt(prev => ({ ...prev, amountInWords: e.target.value }))}
                    placeholder="أدخل المبلغ بالكلمات"
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                {t('taxReceipts.cancel')}
              </Button>
              <Button onClick={handleCreateReceipt}>
                {t('taxReceipts.createReceipt')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('taxReceipts.allReceipts')}</CardTitle>
          <CardDescription>
            قائمة بجميع الإيصالات الضريبية المسجلة في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('taxReceipts.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">{t('taxReceipts.invoiceNumber')}</TableHead>
                <TableHead className="text-right">{t('taxReceipts.customerName')}</TableHead>
                <TableHead className="text-right">{t('taxReceipts.invoiceDate')}</TableHead>
                <TableHead className="text-right">{t('taxReceipts.totalAmount')}</TableHead>
                <TableHead className="text-right">{t('taxReceipts.customerTRN')}</TableHead>
                <TableHead className="text-right">المصدر</TableHead>
                <TableHead className="text-right">{t('taxReceipts.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium text-right">{receipt.invoiceNumber}</TableCell>
                  <TableCell className="text-right">{receipt.customerName}</TableCell>
                  <TableCell className="text-right">{new Date(receipt.invoiceDate).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell className="text-right">{formatCurrency(receipt.totalAmount)}</TableCell>
                  <TableCell className="text-right">{receipt.customerTRN}</TableCell>
                  <TableCell className="text-right">
                    {receipt.expenseId ? (
                      <Badge variant="secondary" className="text-xs">
                        <Bell className="w-3 h-3 ml-1" />
                        تلقائي
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        يدوي
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-reverse space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(receipt)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrintReceipt(receipt)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Receipt Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('taxReceipts.viewReceipt')}</DialogTitle>
            <DialogDescription>
              {t('taxReceipts.taxInvoiceNumber')}: {selectedReceipt?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReceipt && (
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">Abdulla Mohamed Ali Omair Al Ali</h2>
                <h3 className="text-xl">عبدالله محمد علي عمير العلي</h3>
                <div className="mt-2">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    {t('taxReceipts.taxInvoice')}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {t('taxReceipts.invoiceNumber')}: {selectedReceipt.invoiceNumber}
                </div>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">{t('taxReceipts.taxInvoiceNumber')}:</Label>
                    <p>{selectedReceipt.invoiceNumber}</p>
                  </div>
                  <div>
                    <Label className="font-medium">{t('taxReceipts.trnNumber')}:</Label>
                    <p>{selectedReceipt.trnNumber}</p>
                  </div>
                  <div>
                    <Label className="font-medium">{t('taxReceipts.invoiceDate')}:</Label>
                    <p>{new Date(selectedReceipt.invoiceDate).toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="font-medium">{t('taxReceipts.customerName')}:</Label>
                    <p>{selectedReceipt.customerName}</p>
                  </div>
                  <div>
                    <Label className="font-medium">{t('taxReceipts.customerAddress')}:</Label>
                    <p>{selectedReceipt.customerAddress}</p>
                  </div>
                  <div>
                    <Label className="font-medium">{t('taxReceipts.customerTRN')}:</Label>
                    <p>{selectedReceipt.customerTRN}</p>
                  </div>
                  {selectedReceipt.expenseId && (
                    <div>
                      <Label className="font-medium">المصروف المرتبط:</Label>
                      <p className="text-blue-600 font-medium">رقم المصروف: {selectedReceipt.expenseId}</p>
                    </div>
                  )}
                  {selectedReceipt.ownerName && (
                    <div>
                      <Label className="font-medium">اسم المالك:</Label>
                      <p className="text-green-600 font-medium">{selectedReceipt.ownerName}</p>
                    </div>
                  )}
                  {selectedReceipt.propertyName && (
                    <div>
                      <Label className="font-medium">العقار:</Label>
                      <p>{selectedReceipt.propertyName}</p>
                    </div>
                  )}
                  {selectedReceipt.businessName && (
                    <div>
                      <Label className="font-medium">الاسم التجاري:</Label>
                      <p className="text-purple-600 font-medium">{selectedReceipt.businessName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Invoice Items */}
              <div className="border rounded-lg p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الوصف</TableHead>
                      <TableHead className="text-right">{t('taxReceipts.invoiceAmount')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>{selectedReceipt.serviceDescription}</TableCell>
                      <TableCell className="text-right">{formatCurrency(selectedReceipt.invoiceAmount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">إجمالي مبلغ الفاتورة</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(selectedReceipt.invoiceAmount)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">{t('taxReceipts.vat5Percent')}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(selectedReceipt.vatAmount)}</TableCell>
                    </TableRow>
                    <TableRow className="border-t-2">
                      <TableCell className="font-bold text-lg">{t('taxReceipts.totalIncludingVAT')}</TableCell>
                      <TableCell className="text-right font-bold text-lg">{formatCurrency(selectedReceipt.totalAmount)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                
                <div className="mt-4">
                  <Label className="font-medium">{t('taxReceipts.amountInWords')}:</Label>
                  <p className="mt-1">{selectedReceipt.amountInWords}</p>
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg">{t('taxReceipts.bankDetails')}</h4>
                  <div className="space-y-2">
                    <div><Label className="font-medium">{t('taxReceipts.bank')}:</Label> <span>{selectedReceipt.bankDetails.bank}</span></div>
                    <div><Label className="font-medium">{t('taxReceipts.accountHolder')}:</Label> <span>{selectedReceipt.bankDetails.accountHolder}</span></div>
                    <div><Label className="font-medium">{t('taxReceipts.accountNumber')}:</Label> <span>{selectedReceipt.bankDetails.accountNumber}</span></div>
                    <div><Label className="font-medium">{t('taxReceipts.iban')}:</Label> <span>{selectedReceipt.bankDetails.iban}</span></div>
                    <div><Label className="font-medium">{t('taxReceipts.swiftCode')}:</Label> <span>{selectedReceipt.bankDetails.swiftCode}</span></div>
                    <div><Label className="font-medium">{t('taxReceipts.branch')}:</Label> <span>{selectedReceipt.bankDetails.branch}</span></div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-lg">{t('taxReceipts.contactDetails')}</h4>
                  <div className="space-y-2">
                    <div><Label className="font-medium">{t('taxReceipts.location')}:</Label> <span>{selectedReceipt.contactDetails.location}</span></div>
                    <div><Label className="font-medium">{t('taxReceipts.poBox')}:</Label> <span>{selectedReceipt.contactDetails.poBox}</span></div>
                    <div><Label className="font-medium">{t('taxReceipts.phones')}:</Label> 
                      <div className="mt-1">
                        {selectedReceipt.contactDetails.phones.map((phone, index) => (
                          <div key={index}>{phone}</div>
                        ))}
                      </div>
                    </div>
                    <div><Label className="font-medium">{t('taxReceipts.emails')}:</Label>
                      <div className="mt-1">
                        {selectedReceipt.contactDetails.emails.map((email, index) => (
                          <div key={index}>{email}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signature */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-end">
                  <div>
                    <Label className="font-medium">{t('taxReceipts.receiverSign')}:</Label>
                    <div className="border-b-2 border-dashed border-gray-400 w-48 mt-2"></div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('taxReceipts.printDate')}: {new Date().toLocaleDateString('en-GB')}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {t('taxReceipts.close')}
            </Button>
            <Button onClick={() => selectedReceipt && handlePrintReceipt(selectedReceipt)}>
              <Download className="mr-2 h-4 w-4" />
              طباعة الإيصال
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
