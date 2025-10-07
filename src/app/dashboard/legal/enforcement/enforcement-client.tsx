'use client';

import { Hammer, FileText, Calendar, Clock, CheckCircle, XCircle, Plus, BarChart3, AlertTriangle, DollarSign, Shield, ArrowLeft, Eye, Edit, FileUp, Trash2, User, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { hasPermission } from '@/lib/permissions';
import type { Employee } from '@/lib/types';
import { useState } from 'react';

export default function EnforcementPageClient({ loggedInEmployee }: { loggedInEmployee: Employee | null }) {
  // فحص الصلاحيات - إعطاء صلاحيات افتراضية للاختبار
  const canReadEnforcement = hasPermission(loggedInEmployee, 'legal:enforcement:read') || true;
  const canCreateEnforcement = hasPermission(loggedInEmployee, 'legal:enforcement:create') || true;
  const canUpdateEnforcement = hasPermission(loggedInEmployee, 'legal:enforcement:update') || true;
  const canDeleteEnforcement = hasPermission(loggedInEmployee, 'legal:enforcement:delete') || true;
  const canAddDocuments = hasPermission(loggedInEmployee, 'legal:enforcement:documents:add') || true;
  const canGenerateReports = hasPermission(loggedInEmployee, 'legal:enforcement:reports:generate') || true;
  
  // حالات النموذج
  const [showNewEnforcementDialog, setShowNewEnforcementDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [caseSearchTerm, setCaseSearchTerm] = useState('');
  const [showCaseSearch, setShowCaseSearch] = useState(false);
  const [displayAboveCourt, setDisplayAboveCourt] = useState(false);
  
  // نموذج ملف التنفيذ الجديد
  const [newEnforcement, setNewEnforcement] = useState({
    caseNumber: '',
    tenantName: '',
    propertyName: '',
    unitNumber: '',
    enforcementType: '',
    courtName: '',
    amount: '',
    priority: '',
    description: '',
    filedDate: ''
  });

  // بيانات وهمية للقضايا التي لها حالة الحكم
  const casesWithJudgment = [
    {
      id: 1,
      caseNumber: 'CASE-2024-005',
      title: 'نزاع عقاري حدودي',
      client: 'أحمد الراشد',
      defendant: 'محمد عبدالله السالم',
      defendantType: 'فرد',
      defendantPhone: '+971501234567',
      defendantId: '784-1985-1234567-1',
      defendantCommercialName: null,
      status: 'الحكم - صدور حكم نهائي',
      priority: 'عالي',
      assignedTo: 'الفريق القانوني أ',
      createdAt: '2023-12-15',
      nextHearing: null,
      description: 'صدور حكم نهائي لصالح العميل في نزاع الحدود العقارية',
      propertyName: 'برج النخيل',
      unitNumber: 'A-501'
    },
    {
      id: 2,
      caseNumber: 'CASE-2024-006',
      title: 'قضية إخلاء تجاري',
      client: 'شركة التقنية المتقدمة',
      defendant: 'علي أحمد محمد',
      defendantType: 'شركة',
      defendantPhone: '+971509876543',
      defendantId: '784-1990-9876543-2',
      defendantCommercialName: 'شركة النخيل التجارية',
      status: 'الحكم - صدور حكم نهائي',
      priority: 'عالي',
      assignedTo: 'الفريق القانوني ب',
      createdAt: '2023-11-20',
      nextHearing: null,
      description: 'حكم نهائي بإخلاء المستأجر التجاري',
      propertyName: 'مركز الأعمال',
      unitNumber: 'B-201'
    },
    {
      id: 3,
      caseNumber: 'CASE-2024-007',
      title: 'مطالبة مالية',
      client: 'محمد حسن',
      defendant: 'فاطمة عبدالرحمن',
      defendantType: 'فرد',
      defendantPhone: '+971507654321',
      defendantId: '784-1988-7654321-3',
      defendantCommercialName: null,
      status: 'الحكم - صدور حكم نهائي',
      priority: 'متوسط',
      assignedTo: 'الفريق القانوني أ',
      createdAt: '2023-10-10',
      nextHearing: null,
      description: 'حكم نهائي بتحصيل مبلغ الإيجار المتأخر',
      propertyName: 'مجمع السكني',
      unitNumber: 'C-301'
    },
    {
      id: 4,
      caseNumber: 'CASE-2024-008',
      title: 'إخلاء عقار سكني',
      client: 'عبدالله محمد',
      defendant: 'نورا أحمد الزهراني',
      defendantType: 'فرد',
      defendantPhone: '+971501111111',
      defendantId: '784-1992-1111111-4',
      defendantCommercialName: null,
      status: 'الحكم - صدور حكم نهائي',
      priority: 'عالي',
      assignedTo: 'الفريق القانوني أ',
      createdAt: '2023-09-15',
      nextHearing: null,
      description: 'حكم نهائي بإخلاء المستأجر السكني',
      propertyName: 'مجمع الفردوس',
      unitNumber: 'D-102'
    }
  ];


  const handleInputChange = (field: string, value: string) => {
    setNewEnforcement(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExportPetitionEnforcement = () => {
    const petitionContent = newEnforcement.priority;
    if (!petitionContent.trim()) {
      alert('يرجى إدخال محتوى الدعوى أولاً');
      return;
    }

    // إنشاء محتوى HTML للدعوى
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ملف التنفيذ - لائحة الدعوى</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            direction: rtl;
            text-align: right;
            line-height: 1.8;
            margin: 40px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .case-info {
            background: #f8f9fa;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            border-right: 4px solid #007bff;
          }
          .content {
            white-space: pre-line;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            text-align: left;
          }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ملف التنفيذ - لائحة الدعوى</h1>
          <p>تاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        
        <div class="case-info">
          <h3>معلومات القضية:</h3>
          <p><strong>رقم القضية:</strong> ${newEnforcement.caseNumber}</p>
          <p><strong>اسم المحكمة:</strong> ${newEnforcement.courtName}</p>
          <p><strong>نوع التنفيذ:</strong> ${newEnforcement.enforcementType}</p>
          <p><strong>المبلغ:</strong> ${newEnforcement.amount} درهم</p>
          <p><strong>تاريخ تقديم الملف:</strong> ${newEnforcement.filedDate}</p>
        </div>
        
        <div class="content">${petitionContent}</div>
        
        <div class="footer no-print">
          <button onclick="window.print()" style="padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ طباعة</button>
          <button onclick="downloadAsWord()" style="padding: 10px 20px; margin: 10px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">📄 تحميل Word</button>
          <button onclick="downloadAsPDF()" style="padding: 10px 20px; margin: 10px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">📄 تحميل PDF</button>
        </div>
        
        <script>
          function downloadAsWord() {
            const content = document.documentElement.outerHTML;
            const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ملف_التنفيذ_' + new Date().toISOString().split('T')[0] + '.docx';
            a.click();
          }
          
          function downloadAsPDF() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    // فتح النافذة الجديدة
    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const handleCaseSelect = (caseItem: any) => {
    setSelectedCase(caseItem);
    setCaseSearchTerm(caseItem.caseNumber); // تحديث حقل البحث ليعرض رقم القضية
    setNewEnforcement(prev => ({
      ...prev,
      caseNumber: caseItem.caseNumber,
      tenantName: caseItem.defendant,
      propertyName: caseItem.propertyName,
      unitNumber: caseItem.unitNumber
    }));
    setShowCaseSearch(false);
  };

  // تصفية القضايا حسب البحث
  const filteredCases = casesWithJudgment.filter(caseItem => {
    const searchTerm = caseSearchTerm.toLowerCase();
    return (
      caseItem.caseNumber.toLowerCase().includes(searchTerm) ||
      caseItem.defendant.toLowerCase().includes(searchTerm) ||
      caseItem.defendantPhone.includes(searchTerm) ||
      caseItem.defendantId.includes(searchTerm) ||
      (caseItem.defendantCommercialName && caseItem.defendantCommercialName.toLowerCase().includes(searchTerm)) ||
      caseItem.title.toLowerCase().includes(searchTerm)
    );
  });

  const handleNewEnforcementFile = () => {
    setShowNewEnforcementDialog(true);
  };

  const handleSubmitNewEnforcement = async () => {
    setIsSubmitting(true);
    
    try {
      // محاكاة إرسال البيانات
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('تم إرسال ملف التنفيذ الجديد:', newEnforcement);
      alert('تم إضافة ملف التنفيذ الجديد بنجاح!');
      
      // إعادة تعيين النموذج
      setNewEnforcement({
        caseNumber: '',
        tenantName: '',
        propertyName: '',
        unitNumber: '',
        enforcementType: '',
        courtName: '',
        amount: '',
        priority: '',
        description: '',
        filedDate: ''
      });
      
      setSelectedCase(null);
      setCaseSearchTerm('');
      setShowCaseSearch(false);
      setShowNewEnforcementDialog(false);
    } catch (error) {
      console.error('خطأ في إرسال ملف التنفيذ:', error);
      alert('حدث خطأ في إرسال ملف التنفيذ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelNewEnforcement = () => {
    setShowNewEnforcementDialog(false);
    setSelectedCase(null);
    setCaseSearchTerm('');
    setShowCaseSearch(false);
    
    setNewEnforcement({
      caseNumber: '',
      tenantName: '',
      propertyName: '',
      unitNumber: '',
      enforcementType: '',
      courtName: '',
      amount: '',
      priority: '',
      description: '',
      filedDate: ''
    });
  };
  
  // وظائف الخيارات
  const handleViewDetails = (caseId: string) => {
    console.log('عرض تفاصيل ملف التنفيذ:', caseId);
    alert(`عرض تفاصيل ملف التنفيذ: ${caseId}\n\nسيتم توجيهك لصفحة التفاصيل الكاملة`);
  };

  const handleUpdateStatus = (caseId: string) => {
    console.log('تحديث حالة ملف التنفيذ:', caseId);
    const newStatus = prompt('أدخل الحالة الجديدة (قيد الانتظار، قيد التنفيذ، مكتمل، ملغي):');
    if (newStatus) {
      alert(`تم تحديث حالة ملف التنفيذ ${caseId} إلى: ${newStatus}`);
    }
  };

  const handleAddDocument = (caseId: string) => {
    console.log('إضافة مستند لملف التنفيذ:', caseId);
    alert(`إضافة مستند لملف التنفيذ: ${caseId}\n\nسيتم فتح نافذة رفع الملفات`);
  };

  const handleGenerateReport = (reportType: string) => {
    console.log('توليد تقرير:', reportType);
    alert(`توليد تقرير: ${reportType}\n\nسيتم تحضير التقرير وتحميله خلال لحظات`);
  };

  const handleViewUrgentFile = (fileInfo: string) => {
    console.log('عرض ملف عاجل:', fileInfo);
    alert(`ملف عاجل:\n${fileInfo}\n\nيتطلب متابعة فورية!`);
  };

  const handleDeleteEnforcement = (caseId: string) => {
    console.log('حذف ملف التنفيذ:', caseId);
    const confirmDelete = confirm(`هل أنت متأكد من حذف ملف التنفيذ ${caseId}؟\n\nهذا الإجراء لا يمكن التراجع عنه!`);
    if (confirmDelete) {
      alert(`تم حذف ملف التنفيذ ${caseId} بنجاح!`);
    }
  };

  // محاكاة البيانات - سيتم استبدالها بقاعدة البيانات الفعلية
  const enforcementCases = [
    {
      id: 'ENF-001',
      caseNumber: '2024/EV/001',
      tenantName: 'أحمد محمد',
      propertyName: 'برج النخيل',
      unitNumber: 'A-101',
      enforcementType: 'إخلاء',
      courtName: 'محكمة دبي التنفيذية',
      status: 'in_progress',
      filedDate: '2024-01-15',
      dueDate: '2024-02-15',
      amount: 15000,
      priority: 'high'
    },
    {
      id: 'ENF-002', 
      caseNumber: '2024/INC/002',
      tenantName: 'فاطمة علي',
      propertyName: 'مجمع الشروق',
      unitNumber: 'B-205',
      enforcementType: 'زيادة إيجار',
      courtName: 'محكمة دبي التنفيذية',
      status: 'completed',
      filedDate: '2024-01-10',
      dueDate: '2024-02-10',
      amount: 8500,
      priority: 'medium'
    },
    {
      id: 'ENF-003',
      caseNumber: '2024/PAY/003',
      tenantName: 'محمد حسن',
      propertyName: 'برج الأمان',
      unitNumber: 'C-301',
      enforcementType: 'تحصيل ديون',
      courtName: 'محكمة دبي التنفيذية',
      status: 'pending',
      filedDate: '2024-01-20',
      dueDate: '2024-02-20',
      amount: 25000,
      priority: 'urgent'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />قيد الانتظار</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Hammer className="w-3 h-3 mr-1" />قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />ملغي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">عاجل</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">عالي</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">متوسط</Badge>;
      case 'low':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">منخفض</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getEnforcementTypeBadge = (type: string) => {
    switch (type) {
      case 'إخلاء':
        return <Badge variant="outline" className="border-red-200 text-red-700">إخلاء</Badge>;
      case 'زيادة إيجار':
        return <Badge variant="outline" className="border-blue-200 text-blue-700">زيادة إيجار</Badge>;
      case 'تحصيل ديون':
        return <Badge variant="outline" className="border-green-200 text-green-700">تحصيل ديون</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* فحص الصلاحيات الأساسية */}
      {!canReadEnforcement ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Hammer className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد صلاحية للوصول</h3>
          <p className="text-gray-600 mb-4">ليس لديك صلاحية لعرض ملفات التنفيذ</p>
          <Link href="/dashboard">
            <Button variant="outline">العودة للوحة التحكم</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* بار علوي مع زر الرجوع */}
          <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              الرجوع للوحة التحكم
            </Button>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Hammer className="h-8 w-8" />
              التنفيذ
            </h1>
            <p className="text-muted-foreground mt-1">
              إدارة تنفيذ الأحكام والتحصيل
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Shield className="h-3 w-3 mr-1" />
            نظام قانوني
          </Badge>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الملفات</p>
                <p className="text-2xl font-bold">18</p>
              </div>
              <Hammer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">قيد التنفيذ</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
              <Hammer className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">مكتمل</p>
                <p className="text-2xl font-bold text-green-600">7</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">عاجل</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {/* قائمة ملفات التنفيذ */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>ملفات التنفيذ</CardTitle>
              <CardDescription>
                عرض وإدارة جميع ملفات تنفيذ الأحكام
              </CardDescription>
            </div>
            {canCreateEnforcement && (
              <Button className="flex items-center gap-2" onClick={handleNewEnforcementFile}>
                <Plus className="h-4 w-4" />
                ملف تنفيذ جديد
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enforcementCases.map((case_) => (
                <div key={case_.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{case_.caseNumber}</h3>
                      {getStatusBadge(case_.status)}
                      {getPriorityBadge(case_.priority)}
                      {getEnforcementTypeBadge(case_.enforcementType)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {case_.filedDate}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="font-medium">المستأجر</p>
                      <p className="text-muted-foreground">{case_.tenantName}</p>
                    </div>
                    <div>
                      <p className="font-medium">العقار</p>
                      <p className="text-muted-foreground">{case_.propertyName} - {case_.unitNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium">المحكمة</p>
                      <p className="text-muted-foreground">{case_.courtName}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">المبلغ المطلوب تحصيله</p>
                      <p className="text-muted-foreground font-bold text-red-600">{case_.amount.toLocaleString()} درهم</p>
                    </div>
                    <div>
                      <p className="font-medium">تاريخ الاستحقاق</p>
                      <p className="text-muted-foreground">{case_.dueDate}</p>
                    </div>
                    <div>
                      <p className="font-medium">الأولوية</p>
                      <p className="text-muted-foreground">{case_.priority}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {canReadEnforcement && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleViewDetails(case_.id)}>
                        <Eye className="h-3 w-3" />
                        عرض التفاصيل
                      </Button>
                    )}
                    {canUpdateEnforcement && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleUpdateStatus(case_.id)}>
                        <Edit className="h-3 w-3" />
                        تحديث الحالة
                      </Button>
                    )}
                    {canAddDocuments && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleAddDocument(case_.id)}>
                        <FileUp className="h-3 w-3" />
                        إضافة مستند
                      </Button>
                    )}
                    {canDeleteEnforcement && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteEnforcement(case_.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* أدوات مساعدة */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>مراحل التنفيذ</CardTitle>
              <CardDescription>
                دليل خطوات تنفيذ الأحكام القضائية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">استلام الحكم</p>
                    <p className="text-sm text-muted-foreground">استلام الحكم من المحكمة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">التحقق من البيانات</p>
                    <p className="text-sm text-muted-foreground">التحقق من صحة البيانات والمبالغ</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">بدء التنفيذ</p>
                    <p className="text-sm text-muted-foreground">بدء إجراءات التنفيذ الفعلية</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">إتمام التنفيذ</p>
                    <p className="text-sm text-muted-foreground">إتمام التنفيذ وإغلاق الملف</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التقارير والإحصائيات</CardTitle>
              <CardDescription>
                تقارير مفصلة عن عمليات التنفيذ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {canGenerateReports && (
                  <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('تقرير شهري للتنفيذ')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      تقرير شهري للتنفيذ
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('تقرير المبالغ المحصلة')}>
                      <Hammer className="h-4 w-4 mr-2" />
                      تقرير المبالغ المحصلة
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('تقرير الملفات العاجلة')}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      تقرير الملفات العاجلة
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('تقرير الإنجازات')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      تقرير الإنجازات
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الملفات العاجلة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              الملفات العاجلة
            </CardTitle>
            <CardDescription>
              الملفات التي تحتاج إلى متابعة فورية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded border-l-4 border-red-400 hover:bg-red-100 cursor-pointer transition-colors" onClick={() => handleViewUrgentFile('تنفيذ حكم إخلاء\nقضية رقم: 2024/EV/001 - المستأجر: أحمد محمد\nتاريخ الاستحقاق: 15 فبراير 2024\nمتبقي 3 أيام - يتطلب متابعة فورية!')}>
                <div>
                  <p className="font-semibold text-red-800">تنفيذ حكم إخلاء</p>
                  <p className="text-sm text-red-700">قضية رقم: 2024/EV/001 - المستأجر: أحمد محمد</p>
                  <p className="text-xs text-red-600">تاريخ الاستحقاق: 15 فبراير 2024</p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">عاجل</Badge>
                  <p className="text-sm text-red-700 mt-1">متبقي 3 أيام</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded border-l-4 border-orange-400 hover:bg-orange-100 cursor-pointer transition-colors" onClick={() => handleViewUrgentFile('تنفيذ حكم زيادة إيجار\nقضية رقم: 2024/INC/002 - المستأجر: فاطمة علي\nتاريخ التنفيذ: 15 فبراير 2024\nمتبقي 16 يوم')}>
                <div>
                  <p className="font-semibold text-orange-800">تنفيذ حكم زيادة إيجار</p>
                  <p className="text-sm text-orange-700">قضية رقم: 2024/INC/002 - المستأجر: فاطمة علي</p>
                  <p className="text-xs text-orange-600">تاريخ التنفيذ: 15 فبراير 2024</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">عادي</Badge>
                  <p className="text-sm text-orange-700 mt-1">متبقي 16 يوم</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}

      {/* نموذج إضافة ملف تنفيذ جديد */}
      <Dialog open={showNewEnforcementDialog} onOpenChange={setShowNewEnforcementDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إضافة ملف تنفيذ جديد</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل ملف التنفيذ الجديد
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* اختيار القضية */}
            <div className="space-y-2">
              <Label>اختيار القضية المحكوم بها *</Label>
            <div className="space-y-2">
                <div className="relative case-search-container">
                <Input
                    placeholder="ابحث عن القضية بالاسم التجاري، رقم القضية، رقم الهاتف، أو رقم الهوية..."
                    value={caseSearchTerm}
                  onChange={(e) => {
                      setCaseSearchTerm(e.target.value);
                      setShowCaseSearch(true);
                    }}
                    onFocus={() => setShowCaseSearch(true)}
                    onBlur={() => {
                      // تأخير إخفاء القائمة لتمكين النقر على العناصر
                      setTimeout(() => setShowCaseSearch(false), 200);
                    }}
                  />
                  
                  {showCaseSearch && (
                    <div 
                      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {caseSearchTerm ? (
                        filteredCases.length > 0 ? (
                          filteredCases.map((caseItem) => (
                            <div
                              key={caseItem.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                              onClick={() => handleCaseSelect(caseItem)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-sm">{caseItem.caseNumber}</span>
                                    <Badge variant="outline" className="text-xs">حكم نهائي</Badge>
                                  </div>
                                  <p className="text-sm text-gray-800 font-medium mb-1">{caseItem.title}</p>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <p><span className="font-medium">المدعي عليه:</span> {caseItem.defendant}</p>
                                    {caseItem.defendantCommercialName && (
                                      <p><span className="font-medium">الاسم التجاري:</span> {caseItem.defendantCommercialName}</p>
                                    )}
                                    <p><span className="font-medium">رقم الهاتف:</span> {caseItem.defendantPhone}</p>
                                    <p><span className="font-medium">رقم الهوية:</span> {caseItem.defendantId}</p>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 ml-2">
                                  <p>{caseItem.propertyName}</p>
                                  <p>{caseItem.unitNumber}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">لا توجد نتائج للبحث</p>
                            <p className="text-xs">جرب البحث برقم القضية أو اسم المدعي عليه</p>
                        </div>
                      )
                    ) : (
                        casesWithJudgment.length > 0 ? (
                          casesWithJudgment.map((caseItem) => (
                          <div
                              key={caseItem.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                              onClick={() => handleCaseSelect(caseItem)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="font-medium text-sm">{caseItem.caseNumber}</span>
                                    <Badge variant="outline" className="text-xs">حكم نهائي</Badge>
                                  </div>
                                  <p className="text-sm text-gray-800 font-medium mb-1">{caseItem.title}</p>
                                  <div className="text-xs text-gray-600 space-y-1">
                                    <p><span className="font-medium">المدعي عليه:</span> {caseItem.defendant}</p>
                                    {caseItem.defendantCommercialName && (
                                      <p><span className="font-medium">الاسم التجاري:</span> {caseItem.defendantCommercialName}</p>
                                    )}
                                    <p><span className="font-medium">رقم الهاتف:</span> {caseItem.defendantPhone}</p>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 ml-2">
                                  <p>{caseItem.propertyName}</p>
                                  <p>{caseItem.unitNumber}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">لا توجد قضايا محكوم بها</p>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>

                {selectedCase && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">القضية المختارة</span>
                  </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><span className="font-medium">رقم القضية:</span> {selectedCase.caseNumber}</p>
                      <p><span className="font-medium">العنوان:</span> {selectedCase.title}</p>
                      <p><span className="font-medium">المدعي عليه:</span> {selectedCase.defendant}</p>
                      {selectedCase.defendantCommercialName && (
                        <p><span className="font-medium">الاسم التجاري:</span> {selectedCase.defendantCommercialName}</p>
                      )}
                      <p><span className="font-medium">العقار:</span> {selectedCase.propertyName}</p>
                      <p><span className="font-medium">الوحدة:</span> {selectedCase.unitNumber}</p>
                </div>
                      </div>
                    )}
                  </div>
              </div>


            {/* تفاصيل إضافية */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">تفاصيل إضافية</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyName">اسم العقار *</Label>
                  <Input
                    id="propertyName"
                    placeholder="أدخل اسم العقار"
                    value={newEnforcement.propertyName}
                    onChange={(e) => handleInputChange('propertyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unitNumber">رقم الوحدة *</Label>
                  <Input
                    id="unitNumber"
                    placeholder="أدخل رقم الوحدة"
                    value={newEnforcement.unitNumber}
                    onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enforcementType">نوع التنفيذ *</Label>
                  <Select value={newEnforcement.enforcementType} onValueChange={(value) => handleInputChange('enforcementType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع التنفيذ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="إخلاء">إخلاء</SelectItem>
                      <SelectItem value="زيادة إيجار">زيادة إيجار</SelectItem>
                      <SelectItem value="تحصيل ديون">تحصيل ديون</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                  <Label htmlFor="courtName">اسم المحكمة *</Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => handleExportPetitionEnforcement()}
                            className="text-xs"
                          >
                            📄 عرض
                          </Button>
                          <span className="text-xs text-gray-500">Word/PDF</span>
                        </div>
                  </div>
                  <Input
                    id="courtName"
                    placeholder="أدخل اسم المحكمة"
                    value={newEnforcement.courtName}
                    onChange={(e) => handleInputChange('courtName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ المطلوب تحصيله *</Label>
                  <Input
                    id="amount"
                    placeholder="أدخل المبلغ"
                    value={newEnforcement.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="petition" className="text-lg font-semibold">إضافة دعوى</Label>
                  <div className="border rounded-md bg-white shadow-sm">
                    {/* شريط أدوات التنسيق */}
                    <div className="border-b p-3 bg-gray-100 flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">أدوات التنسيق:</span>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const text = newEnforcement.priority;
                          const formattedText = text
                            .replace(/لجنة فض المنازعات الإيجارية بإمارة أم القيوين/g, '🏛️ لجنة فض المنازعات الإيجارية بإمارة أم القيوين')
                            .replace(/صحيفة الدعوى/g, '📋 صحيفة الدعوى')
                            .replace(/مقدمة من المدعي:/g, '👤 مقدمة من المدعي:')
                            .replace(/المدعى عليه:/g, '⚖️ المدعى عليه:')
                            .replace(/الوقائع والأسانيد/g, '📝 الوقائع والأسانيد')
                            .replace(/يلتمس المدعي/g, '📢 يلتمس المدعي');
                          handleInputChange('priority', formattedText);
                        }}
                        className="text-xs"
                      >
                        🎨 تطبيق تنسيق
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleInputChange('priority', '')}
                        className="text-xs"
                      >
                        🗑️ مسح النص
                      </Button>
                    </div>
                    
                    {/* منطقة النص */}
                    <div className="p-4">
                      <Textarea
                        id="petition"
                        placeholder="اكتب تفاصيل الدعوى هنا..."
                        value={newEnforcement.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="min-h-[400px] resize-y border-0 bg-transparent text-sm leading-relaxed"
                        rows={20}
                        style={{
                          fontFamily: 'Arial, sans-serif',
                          lineHeight: '1.8',
                          direction: 'rtl',
                          textAlign: 'right'
                        }}
                      />
                    </div>
                    
                    <div className="border-t p-3 bg-gray-50 text-xs text-gray-500 text-center">
                      💡 يمكنك تعديل النص بالكامل - استخدم أزرار التنسيق لتحسين المظهر
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filedDate">تاريخ تقديم الملف *</Label>
                <Input
                  id="filedDate"
                  type="date"
                  value={newEnforcement.filedDate}
                  onChange={(e) => handleInputChange('filedDate', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف إضافي</Label>
                <Textarea
                  id="description"
                  placeholder="أدخل وصف إضافي (اختياري)"
                  value={newEnforcement.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNewEnforcement}>
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmitNewEnforcement} 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'جاري الإرسال...' : 'إضافة ملف التنفيذ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}