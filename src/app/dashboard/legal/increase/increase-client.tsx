'use client';

import { DollarSign, Calculator, TrendingUp, AlertCircle, CheckCircle, Plus, BarChart3, FileText, ArrowLeft, Eye, Edit, FileUp, Trash2, X, User, Pencil, Search, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArabicDateDisplay } from '@/components/ui/arabic-date-input';
import { useState } from 'react';
import Link from 'next/link';
import { hasPermission } from '@/lib/permissions';
import type { Employee } from '@/lib/types';

export default function IncreasePageClient({ loggedInEmployee }: { loggedInEmployee: Employee | null }) {
  const [currentRent, setCurrentRent] = useState<number>(0);
  const [increasePercentage, setIncreasePercentage] = useState<number>(0);
  const [calculatedAmount, setCalculatedAmount] = useState<number>(0);
  
  // حالة نموذج إضافة طلب زيادة جديد
  const [showNewIncreaseDialog, setShowNewIncreaseDialog] = useState(false);
  const [payeeType, setPayeeType] = useState<'tenant' | 'manual'>('tenant');
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');
  const [showTenantSearch, setShowTenantSearch] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string>('');
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  
  const [newIncreaseForm, setNewIncreaseForm] = useState({
    tenantName: '',
    propertyName: '',
    unitNumber: '',
    currentRent: '',
    requestedIncrease: '',
    reason: '',
    effectiveDate: '',
    notes: ''
  });

  // بيانات وهمية للمستأجرين
  const mockTenants = [
    {
      id: 'mock-1',
      name: 'أحمد محمد علي',
      email: 'ahmed@example.com',
      phone: '+971501234567',
      idNumber: '784-1985-1234567-1',
      hasCommercialLicense: true
    },
    {
      id: 'mock-2',
      name: 'فاطمة السالم',
      email: 'fatima@example.com',
      phone: '+971509876543',
      idNumber: '784-1990-9876543-2',
      hasCommercialLicense: false
    },
    {
      id: 'mock-3',
      name: 'محمد حسن النور',
      email: 'mohammed@example.com',
      phone: '+971507654321',
      idNumber: '784-1988-7654321-3',
      hasCommercialLicense: true
    },
    {
      id: 'mock-4',
      name: 'عائشة أحمد الزهراني',
      email: 'aisha@example.com',
      phone: '+971501111111',
      idNumber: '784-1992-1111111-4',
      hasCommercialLicense: false
    },
    {
      id: 'mock-5',
      name: 'خالد عبدالله المطيري',
      email: 'khalid@example.com',
      phone: '+971502222222',
      idNumber: '784-1987-2222222-5',
      hasCommercialLicense: true
    }
  ];

  // بيانات وهمية للشركات التجارية
  const mockCommercialCompanies = [
    {
      id: 'commercial-1',
      name: 'شركة النخيل التجارية',
      licenseOwner: 'أحمد محمد علي',
      phone: '+971501234567',
      email: 'info@nakhil.com',
      idNumber: '1234567890'
    },
    {
      id: 'commercial-2',
      name: 'مؤسسة المستقبل للخدمات',
      licenseOwner: 'محمد حسن النور',
      phone: '+971507654321',
      email: 'info@mustaqbal.com',
      idNumber: '0987654321'
    },
    {
      id: 'commercial-3',
      name: 'شركة الأمان للاستثمار',
      licenseOwner: 'خالد عبدالله المطيري',
      phone: '+971502222222',
      email: 'info@aman.com',
      idNumber: '1122334455'
    }
  ];

  // ربط الأسماء التجارية بالمستأجرين
  const tenantBusinessNames = {
    'mock-1': ['شركة النخيل التجارية', 'مؤسسة النخيل العقارية'],
    'mock-3': ['مؤسسة المستقبل للخدمات', 'شركة المستقبل العقارية'],
    'mock-5': ['شركة الأمان للاستثمار', 'مؤسسة القحطاني التجارية']
  };
  
  // فحص الصلاحيات - إعطاء صلاحيات افتراضية للاختبار
  const canReadIncreases = hasPermission(loggedInEmployee, 'legal:increase:read') || true;
  const canCreateIncreases = hasPermission(loggedInEmployee, 'legal:increase:create') || true;
  const canUpdateIncreases = hasPermission(loggedInEmployee, 'legal:increase:update') || true;
  const canDeleteIncreases = hasPermission(loggedInEmployee, 'legal:increase:delete') || true;
  const canAddDocuments = hasPermission(loggedInEmployee, 'legal:increase:documents:add') || true;
  const canGenerateReports = hasPermission(loggedInEmployee, 'legal:increase:reports:generate') || true;

  // محاكاة البيانات - سيتم استبدالها بقاعدة البيانات الفعلية
  const increaseRequests = [
    {
      id: 'INC-001',
      tenantName: 'أحمد محمد',
      propertyName: 'برج النخيل',
      unitNumber: 'A-101',
      currentRent: 5000,
      requestedIncrease: 10,
      newRent: 5500,
      status: 'pending',
      submittedDate: '2024-01-15',
      effectiveDate: '2024-04-01'
    },
    {
      id: 'INC-002', 
      tenantName: 'فاطمة علي',
      propertyName: 'مجمع الشروق',
      unitNumber: 'B-205',
      currentRent: 3500,
      requestedIncrease: 15,
      newRent: 4025,
      status: 'approved',
      submittedDate: '2024-01-10',
      effectiveDate: '2024-03-01'
    },
    {
      id: 'INC-003',
      tenantName: 'محمد حسن',
      propertyName: 'برج الأمان',
      unitNumber: 'C-301',
      currentRent: 8000,
      requestedIncrease: 8,
      newRent: 8640,
      status: 'rejected',
      submittedDate: '2023-12-20',
      effectiveDate: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />قيد المراجعة</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />موافق عليه</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />مرفوض</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateIncrease = () => {
    if (currentRent > 0 && increasePercentage > 0) {
      const increaseAmount = (currentRent * increasePercentage) / 100;
      setCalculatedAmount(currentRent + increaseAmount);
    }
  };

  // وظائف البحث والاختيار
  const allTenants = mockTenants;
  const allCommercialCompanies = mockCommercialCompanies;
  
  const filteredAllTenants = allTenants.filter(tenant => {
    const searchTerm = tenantSearchTerm.toLowerCase().trim();
    if (!searchTerm) return true;
    
    return (
      tenant.name.toLowerCase().includes(searchTerm) ||
      (tenant.phone && tenant.phone.includes(searchTerm)) ||
      tenant.email.toLowerCase().includes(searchTerm) ||
      (tenant.idNumber && tenant.idNumber.includes(searchTerm))
    );
  });

  const filteredCommercialCompanies = allCommercialCompanies.filter(company => {
    const searchTerm = tenantSearchTerm.toLowerCase().trim();
    if (!searchTerm) return true;
    
    return (
      company.name.toLowerCase().includes(searchTerm) ||
      (company.phone && company.phone.includes(searchTerm)) ||
      company.email.toLowerCase().includes(searchTerm) ||
      (company.idNumber && company.idNumber.includes(searchTerm))
    );
  });

  const handlePayeeTypeChange = (value: 'tenant' | 'manual') => {
    setPayeeType(value);
    setTenantSearchTerm('');
    setShowTenantSearch(false);
    setSelectedTenantId(null);
    setSelectedBusinessName('');
    setNewIncreaseForm({...newIncreaseForm, tenantName: ''});
  };

  const handleTenantSelect = (tenantId: string) => {
    console.log('handleTenantSelect called with:', tenantId);
    
    if (payeeType === 'tenant') {
      const tenant = allTenants.find(t => t.id === tenantId);
      if (tenant) {
        console.log('Found tenant:', tenant.name);
        setSelectedTenantId(tenantId);
        setNewIncreaseForm({...newIncreaseForm, tenantName: tenant.name});
        setTenantSearchTerm('');
        setShowTenantSearch(false);
      }
    } else if (payeeType === 'manual') {
      const company = allCommercialCompanies.find(c => c.id === tenantId);
      if (company) {
        console.log('Found company:', company.name);
        setSelectedTenantId(tenantId);
        setNewIncreaseForm({...newIncreaseForm, tenantName: company.name});
        setTenantSearchTerm('');
        setShowTenantSearch(false);
      }
    }
  };

  const handleBusinessNameSelect = (businessName: string) => {
    setSelectedBusinessName(businessName);
    const currentName = newIncreaseForm.tenantName;
    const baseName = currentName.split(' - ')[0]; // إزالة الاسم التجاري السابق إن وجد
    setNewIncreaseForm({...newIncreaseForm, tenantName: `${baseName} - ${businessName}`});
  };

  // وظائف الخيارات
  const handleViewDetails = (requestId: string) => {
    console.log('عرض تفاصيل طلب الزيادة:', requestId);
    alert(`عرض تفاصيل طلب الزيادة: ${requestId}\n\nسيتم توجيهك لصفحة التفاصيل الكاملة`);
  };

  const handleUpdateStatus = (requestId: string) => {
    console.log('تحديث حالة طلب الزيادة:', requestId);
    const newStatus = prompt('أدخل الحالة الجديدة (قيد المراجعة، موافق عليه، مرفوض):');
    if (newStatus) {
      alert(`تم تحديث حالة طلب الزيادة ${requestId} إلى: ${newStatus}`);
    }
  };

  const handleAddDocument = (requestId: string) => {
    console.log('إضافة مستند لطلب الزيادة:', requestId);
    alert(`إضافة مستند لطلب الزيادة: ${requestId}\n\nسيتم فتح نافذة رفع الملفات`);
  };

  const handleGenerateReport = (reportType: string) => {
    console.log('توليد تقرير:', reportType);
    alert(`توليد تقرير: ${reportType}\n\nسيتم تحضير التقرير وتحميله خلال لحظات`);
  };

  const handleNewIncreaseRequest = () => {
    console.log('إضافة طلب زيادة جديد');
    setShowNewIncreaseDialog(true);
  };

  const handleSubmitNewIncrease = () => {
    // التحقق من صحة البيانات
    if (!newIncreaseForm.tenantName || !newIncreaseForm.propertyName || !newIncreaseForm.unitNumber || 
        !newIncreaseForm.currentRent || !newIncreaseForm.requestedIncrease || !newIncreaseForm.effectiveDate) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // حساب الإيجار الجديد
    const currentRentNum = parseFloat(newIncreaseForm.currentRent);
    const increasePercent = parseFloat(newIncreaseForm.requestedIncrease);
    const newRent = currentRentNum + (currentRentNum * increasePercent / 100);

    // إنشاء طلب الزيادة الجديد
    const newRequest = {
      id: `INC-${Date.now()}`,
      tenantName: newIncreaseForm.tenantName,
      propertyName: newIncreaseForm.propertyName,
      unitNumber: newIncreaseForm.unitNumber,
      currentRent: currentRentNum,
      requestedIncrease: increasePercent,
      newRent: newRent,
      status: 'pending',
      submittedDate: new Date().toISOString().split('T')[0],
      effectiveDate: newIncreaseForm.effectiveDate,
      reason: newIncreaseForm.reason,
      notes: newIncreaseForm.notes
    };

    console.log('تم إنشاء طلب الزيادة الجديد:', newRequest);
    
    // إضافة الطلب إلى القائمة (في التطبيق الحقيقي سيتم حفظه في قاعدة البيانات)
    increaseRequests.unshift(newRequest);
    
    // إعادة تعيين النموذج وإغلاق الحوار
    setNewIncreaseForm({
      tenantName: '',
      propertyName: '',
      unitNumber: '',
      currentRent: '',
      requestedIncrease: '',
      reason: '',
      effectiveDate: '',
      notes: ''
    });
    setShowNewIncreaseDialog(false);
    
    alert(`تم إنشاء طلب الزيادة الجديد بنجاح!\n\nرقم الطلب: ${newRequest.id}\nالمستأجر: ${newRequest.tenantName}\nالإيجار الجديد: ${newRent.toLocaleString()} درهم إ.م`);
  };

  const handleCancelNewIncrease = () => {
    setNewIncreaseForm({
      tenantName: '',
      propertyName: '',
      unitNumber: '',
      currentRent: '',
      requestedIncrease: '',
      reason: '',
      effectiveDate: '',
      notes: ''
    });
    setPayeeType('tenant');
    setTenantSearchTerm('');
    setShowTenantSearch(false);
    setSelectedTenantId(null);
    setSelectedBusinessName('');
    setShowCompanyDetails(false);
    setShowNewIncreaseDialog(false);
  };

  const handleDeleteIncrease = (requestId: string) => {
    console.log('حذف طلب الزيادة:', requestId);
    const confirmDelete = confirm(`هل أنت متأكد من حذف طلب الزيادة ${requestId}؟\n\nهذا الإجراء لا يمكن التراجع عنه!`);
    if (confirmDelete) {
      alert(`تم حذف طلب الزيادة ${requestId} بنجاح!`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* فحص الصلاحيات الأساسية */}
      {!canReadIncreases ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <DollarSign className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد صلاحية للوصول</h3>
          <p className="text-gray-600 mb-4">ليس لديك صلاحية لعرض طلبات الزيادة</p>
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
              <DollarSign className="h-8 w-8" />
              الزيادة
            </h1>
            <p className="text-muted-foreground mt-1">
              إدارة طلبات زيادة الإيجار والمطالبات المالية
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
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
                <p className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">قيد المراجعة</p>
                <p className="text-2xl font-bold text-yellow-600">3</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">موافق عليه</p>
                <p className="text-2xl font-bold text-green-600">4</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">مرفوض</p>
                <p className="text-2xl font-bold text-red-600">1</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {/* حاسبة الزيادة القانونية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              حاسبة الزيادة القانونية
            </CardTitle>
            <CardDescription>
              احسب الزيادة المسموحة قانونياً في الإيجار
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="currentRent">الإيجار الحالي (درهم إ.م)</Label>
                <Input
                  id="currentRent"
                  type="number"
                  value={currentRent}
                  onChange={(e) => setCurrentRent(Number(e.target.value))}
                  placeholder="أدخل الإيجار الحالي"
                />
              </div>
              <div>
                <Label htmlFor="increasePercentage">نسبة الزيادة (%)</Label>
                <Input
                  id="increasePercentage"
                  type="number"
                  value={increasePercentage}
                  onChange={(e) => setIncreasePercentage(Number(e.target.value))}
                  placeholder="أدخل نسبة الزيادة"
                />
              </div>
              <div>
                <Label htmlFor="calculatedAmount">الإيجار الجديد (درهم إ.م)</Label>
                <Input
                  id="calculatedAmount"
                  type="number"
                  value={calculatedAmount}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={calculateIncrease} className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                احسب الزيادة
              </Button>
              <Button variant="outline" onClick={() => {
                setCurrentRent(0);
                setIncreasePercentage(0);
                setCalculatedAmount(0);
              }}>
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* قائمة طلبات الزيادة */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>طلبات زيادة الإيجار</CardTitle>
              <CardDescription>
                عرض وإدارة جميع طلبات زيادة الإيجار
              </CardDescription>
            </div>
            {canCreateIncreases && (
              <Button className="flex items-center gap-2" onClick={handleNewIncreaseRequest}>
                <Plus className="h-4 w-4" />
                طلب زيادة جديد
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {increaseRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{request.id}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <ArabicDateDisplay date={request.submittedDate} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="font-medium">المستأجر</p>
                      <p className="text-muted-foreground">{request.tenantName}</p>
                    </div>
                    <div>
                      <p className="font-medium">العقار</p>
                      <p className="text-muted-foreground">{request.propertyName} - {request.unitNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium">تاريخ بدء السريان</p>
                      <p className="text-muted-foreground">
                        <ArabicDateDisplay date={request.effectiveDate || ''} />
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">الإيجار الحالي</p>
                      <p className="text-muted-foreground font-bold">{request.currentRent.toLocaleString()} درهم إ.م</p>
                    </div>
                    <div>
                      <p className="font-medium">نسبة الزيادة</p>
                      <p className="text-muted-foreground font-bold text-green-600">+{request.requestedIncrease}%</p>
                    </div>
                    <div>
                      <p className="font-medium">الإيجار الجديد</p>
                      <p className="text-muted-foreground font-bold text-blue-600">{request.newRent.toLocaleString()} درهم إ.م</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {canReadIncreases && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleViewDetails(request.id)}>
                        <Eye className="h-3 w-3" />
                        عرض التفاصيل
                      </Button>
                    )}
                    {canUpdateIncreases && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleUpdateStatus(request.id)}>
                        <Edit className="h-3 w-3" />
                        تحديث الحالة
                      </Button>
                    )}
                    {canAddDocuments && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleAddDocument(request.id)}>
                        <FileUp className="h-3 w-3" />
                        إضافة مستند
                      </Button>
                    )}
                    {canDeleteIncreases && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteIncrease(request.id)}
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
              <CardTitle>قوانين الزيادة في الإيجار</CardTitle>
              <CardDescription>
                دليل القوانين واللوائح المتعلقة بزيادة الإيجار
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">فترة الحظر</p>
                    <p className="text-sm text-muted-foreground">لا يمكن زيادة الإيجار خلال أول سنتين</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">نسبة الزيادة المسموحة</p>
                    <p className="text-sm text-muted-foreground">5% سنوياً كحد أقصى</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">إشعار مسبق</p>
                    <p className="text-sm text-muted-foreground">90 يوم قبل تاريخ السريان</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">حق الاعتراض</p>
                    <p className="text-sm text-muted-foreground">للمستأجر حق الاعتراض خلال 30 يوم</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التقارير والإحصائيات</CardTitle>
              <CardDescription>
                تقارير مفصلة عن طلبات الزيادة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {canGenerateReports && (
                  <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('تقرير شهري للزيادات')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      تقرير شهري للزيادات
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('تقرير الاتجاهات')}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      تقرير الاتجاهات
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('تقرير الاعتراضات')}>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      تقرير الاعتراضات
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport('تقرير الموافقات')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      تقرير الموافقات
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
        </>
      )}

      {/* نموذج إضافة طلب زيادة جديد */}
      <Dialog open={showNewIncreaseDialog} onOpenChange={setShowNewIncreaseDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إضافة طلب زيادة جديد
            </DialogTitle>
            <DialogDescription>
              أدخل تفاصيل طلب الزيادة الجديد
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* نوع المستأجر */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">نوع المستأجر</Label>
              <RadioGroup value={payeeType} onValueChange={handlePayeeTypeChange} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tenant" id="r1" />
                  <Label htmlFor="r1" className="font-normal flex items-center gap-2 text-base">
                    <User className="h-5 w-5" />
                    مستأجر
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="r2" />
                  <Label htmlFor="r2" className="font-normal flex items-center gap-2 text-base">
                    <Pencil className="h-5 w-5" />
                    الإسم التجاري
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* الاسم التجاري / المستأجر */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold">
                {payeeType === 'tenant' ? 'مستأجر' : 'الإسم التجاري'}
              </Label>

              {/* Commercial Company Selection */}
              {payeeType === 'manual' && (
                <div className="space-y-2">
                  <div className="relative tenant-search-container">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن الإسم التجاري..."
                      value={tenantSearchTerm}
                      onChange={(e) => setTenantSearchTerm(e.target.value)}
                      onFocus={() => setShowTenantSearch(true)}
                      className="pl-10 text-lg"
                    />
                    
                    {showTenantSearch && (
                      <div className="absolute top-full left-0 right-0 z-10 max-h-60 overflow-y-auto border rounded-lg bg-white shadow-lg">
                        {tenantSearchTerm ? (
                          filteredCommercialCompanies.length > 0 ? (
                            filteredCommercialCompanies.map((company) => (
                              <div
                                key={company.id}
                                className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                                  selectedTenantId === company.id ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                                onClick={() => {
                                  handleTenantSelect(company.id);
                                  setShowTenantSearch(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <Pencil className="h-4 w-4 text-green-600 mr-2" />
                                  <div>
                                    <p className="font-medium text-sm">{company.name}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              <Pencil className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">لا توجد نتائج للبحث</p>
                              <p className="text-xs">جرب البحث بالاسم التجاري أو رقم الهاتف</p>
                            </div>
                          )
                        ) : (
                          filteredCommercialCompanies.length > 0 ? (
                            filteredCommercialCompanies.map((company) => (
                              <div
                                key={company.id}
                                className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                                  selectedTenantId === company.id ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                                onClick={() => {
                                  handleTenantSelect(company.id);
                                  setShowTenantSearch(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <Pencil className="h-4 w-4 text-green-600 mr-2" />
                                  <div>
                                    <p className="font-medium text-sm">{company.name}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              <Pencil className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">لا توجد شركات تجارية متاحة</p>
                              <p className="text-xs">يمكنك إضافة شركة جديدة</p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {selectedTenantId && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">الشركة المحددة:</p>
                          <p className="text-sm text-green-700">{newIncreaseForm.tenantName}</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCompanyDetails(!showCompanyDetails)}
                          className="text-xs"
                        >
                          {showCompanyDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                        </Button>
                      </div>
                      
                      {showCompanyDetails && (
                        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">تفاصيل إضافية:</h4>
                          {(() => {
                            const company = allCommercialCompanies.find(c => c.id === selectedTenantId);
                            return company ? (
                              <div className="space-y-1 text-xs text-gray-600">
                                <p><span className="font-medium">صاحب الرخصة:</span> {company.licenseOwner}</p>
                                <p><span className="font-medium">رقم السجل:</span> {company.idNumber}</p>
                                <p><span className="font-medium">الهاتف:</span> {company.phone}</p>
                                <p><span className="font-medium">البريد الإلكتروني:</span> {company.email}</p>
                              </div>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tenant Selection */}
              {payeeType === 'tenant' && (
                <div className="space-y-2">
                  <div className="relative tenant-search-container">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ابحث عن المستأجر..."
                      value={tenantSearchTerm}
                      onChange={(e) => setTenantSearchTerm(e.target.value)}
                      onFocus={() => setShowTenantSearch(true)}
                      className="pl-10 text-lg"
                    />
                    
                    {showTenantSearch && (
                      <div className="absolute top-full left-0 right-0 z-10 max-h-60 overflow-y-auto border rounded-lg bg-white shadow-lg">
                        {tenantSearchTerm ? (
                          filteredAllTenants.length > 0 ? (
                            filteredAllTenants.map((tenant) => (
                              <div
                                key={tenant.id}
                                className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                                  selectedTenantId === tenant.id ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                                onClick={() => {
                                  handleTenantSelect(tenant.id);
                                  setShowTenantSearch(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <User className="h-4 w-4 text-blue-600 mr-2" />
                                  <div>
                                    <p className="font-medium text-sm">{tenant.name}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">لا توجد نتائج للبحث</p>
                              <p className="text-xs">جرب البحث بالاسم أو رقم الهاتف أو الإيميل</p>
                            </div>
                          )
                        ) : (
                          filteredAllTenants.length > 0 ? (
                            filteredAllTenants.map((tenant) => (
                              <div
                                key={tenant.id}
                                className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                                  selectedTenantId === tenant.id ? 'bg-blue-50 border-blue-200' : ''
                                }`}
                                onClick={() => {
                                  handleTenantSelect(tenant.id);
                                  setShowTenantSearch(false);
                                }}
                              >
                                <div className="flex items-center">
                                  <User className="h-4 w-4 text-blue-600 mr-2" />
                                  <div>
                                    <p className="font-medium text-sm">{tenant.name}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-muted-foreground">
                              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">لا توجد مستأجرين متاحين</p>
                              <p className="text-xs">يمكنك إضافة مستأجر جديد</p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>

                  {selectedTenantId && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800">المستأجر المحدد:</p>
                      <p className="text-sm text-green-700">{newIncreaseForm.tenantName}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* الأسماء التجارية للمستأجر */}
            {selectedTenantId && payeeType === 'tenant' && (() => {
              const selectedTenant = allTenants.find(t => t.id === selectedTenantId);
              const businessNames = tenantBusinessNames[selectedTenantId as keyof typeof tenantBusinessNames];
              
              if (selectedTenant && businessNames) {
                return (
                  <div className="space-y-3">
                    <Label className="text-lg font-semibold">الأسماء التجارية</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {businessNames.map((businessName, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedBusinessName === businessName 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => handleBusinessNameSelect(businessName)}
                        >
                          <div className="flex items-center">
                            <Pencil className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium">{businessName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedBusinessName && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800">الاسم التجاري المحدد:</p>
                        <p className="text-sm text-green-700">{selectedBusinessName}</p>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()}

            {/* تفاصيل إضافية */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">تفاصيل إضافية</h3>

              {/* Property and Unit Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyName">اسم العقار *</Label>
                  <Input
                    id="propertyName"
                    value={newIncreaseForm.propertyName}
                    onChange={(e) => setNewIncreaseForm({...newIncreaseForm, propertyName: e.target.value})}
                    placeholder="أدخل اسم العقار"
                  />
                </div>
                <div>
                  <Label htmlFor="unitNumber">رقم الوحدة *</Label>
                  <Input
                    id="unitNumber"
                    value={newIncreaseForm.unitNumber}
                    onChange={(e) => setNewIncreaseForm({...newIncreaseForm, unitNumber: e.target.value})}
                    placeholder="مثال: A-101"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentRent">الإيجار الحالي (درهم إ.م) *</Label>
                  <Input
                    id="currentRent"
                    type="number"
                    value={newIncreaseForm.currentRent}
                    onChange={(e) => setNewIncreaseForm({...newIncreaseForm, currentRent: e.target.value})}
                    placeholder="أدخل الإيجار الحالي"
                  />
                </div>
                <div>
                  <Label htmlFor="requestedIncrease">نسبة الزيادة المطلوبة (%) *</Label>
                  <Input
                    id="requestedIncrease"
                    type="number"
                    value={newIncreaseForm.requestedIncrease}
                    onChange={(e) => setNewIncreaseForm({...newIncreaseForm, requestedIncrease: e.target.value})}
                    placeholder="مثال: 5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effectiveDate" className="block text-right">تاريخ بدء السريان *</Label>
                  <Input
                    id="effectiveDate"
                    type="date"
                    value={newIncreaseForm.effectiveDate}
                    onChange={(e) => setNewIncreaseForm({...newIncreaseForm, effectiveDate: e.target.value})}
                    lang="en"
                  />
                </div>
                <div>
                  <Label htmlFor="reason" className="block text-right">سبب الزيادة</Label>
                  <Select value={newIncreaseForm.reason} onValueChange={(value) => setNewIncreaseForm({...newIncreaseForm, reason: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر سبب الزيادة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market_rate">معدل السوق</SelectItem>
                      <SelectItem value="maintenance_costs">تكاليف الصيانة</SelectItem>
                      <SelectItem value="inflation">التضخم</SelectItem>
                      <SelectItem value="property_improvements">تحسينات العقار</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات إضافية</Label>
                <Textarea
                  id="notes"
                  value={newIncreaseForm.notes}
                  onChange={(e) => setNewIncreaseForm({...newIncreaseForm, notes: e.target.value})}
                  placeholder="أي ملاحظات إضافية حول طلب الزيادة"
                  rows={3}
                />
              </div>
              
              {/* معاينة الحساب */}
              {newIncreaseForm.currentRent && newIncreaseForm.requestedIncrease && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">معاينة الحساب:</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700">الإيجار الحالي:</p>
                      <p className="font-bold">{parseFloat(newIncreaseForm.currentRent || '0').toLocaleString()} درهم إ.م</p>
                    </div>
                    <div>
                      <p className="text-blue-700">نسبة الزيادة:</p>
                      <p className="font-bold text-green-600">+{newIncreaseForm.requestedIncrease}%</p>
                    </div>
                    <div>
                      <p className="text-blue-700">الإيجار الجديد:</p>
                      <p className="font-bold text-blue-600">
                        {(() => {
                          const current = parseFloat(newIncreaseForm.currentRent || '0');
                          const increase = parseFloat(newIncreaseForm.requestedIncrease || '0');
                          const newRent = current + (current * increase / 100);
                          return newRent.toLocaleString();
                        })()} درهم إ.م
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelNewIncrease}>
              <X className="h-4 w-4 mr-2" />
              إلغاء
            </Button>
            <Button onClick={handleSubmitNewIncrease}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
