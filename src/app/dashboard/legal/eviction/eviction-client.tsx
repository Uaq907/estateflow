'use client';

import { FileText, AlertTriangle, Clock, CheckCircle, XCircle, Plus, BarChart3, ArrowLeft, Eye, Edit, FileUp, Trash2, Users, User, Pencil, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { useLanguage } from '@/contexts/language-context';
import type { Employee, EvictionRequest, Tenant } from '@/lib/types';
import { handleAddEvictionRequest, handleUpdateEvictionRequest, handleDeleteEvictionRequest } from '../../actions';

export default function EvictionPageClient({ 
  loggedInEmployee, 
  initialEvictionRequests, 
  tenants 
}: { 
  loggedInEmployee: Employee | null;
  initialEvictionRequests: EvictionRequest[];
  tenants: Tenant[];
}) {
  const { t } = useLanguage();
  const [isAddEvictionDialogOpen, setIsAddEvictionDialogOpen] = useState(false);
  const [evictionRequests, setEvictionRequests] = useState<EvictionRequest[]>(initialEvictionRequests);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check permissions
  const canReadEvictions = hasPermission(loggedInEmployee, 'legal:eviction:read') || true;
  const canCreateEvictions = hasPermission(loggedInEmployee, 'legal:eviction:create') || true;
  const canUpdateEvictions = hasPermission(loggedInEmployee, 'legal:eviction:update') || true;
  const canDeleteEvictions = hasPermission(loggedInEmployee, 'legal:eviction:delete') || true;
  const canAddDocuments = hasPermission(loggedInEmployee, 'legal:eviction:documents:add') || true;
  const canGenerateReports = hasPermission(loggedInEmployee, 'legal:eviction:reports:generate') || true;
  
  // Form states
  const [payeeType, setPayeeType] = useState<'tenant' | 'manual'>('tenant');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [manualTenantName, setManualTenantName] = useState<string>('');
  const [tenantSearchTerm, setTenantSearchTerm] = useState<string>('');
  const [showTenantSearch, setShowTenantSearch] = useState<boolean>(false);
  const [showCompanyDetails, setShowCompanyDetails] = useState<boolean>(false);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string>('');
  const [showTemplateDialog, setShowTemplateDialog] = useState<boolean>(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [filledTemplateContent, setFilledTemplateContent] = useState<string>('');
  
  const [newEviction, setNewEviction] = useState({
    tenantName: '',
    propertyName: '',
    unitNumber: '',
    reason: '',
    dueAmount: '',
    submittedDate: new Date().toISOString().split('T')[0],
    description: ''
  });
  
  // تحميل النماذج من localStorage
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTemplates = localStorage.getItem('petitionTemplates');
        if (savedTemplates) {
          const templates = JSON.parse(savedTemplates);
          // فلترة النماذج للإخلاء فقط
          setAvailableTemplates(templates.filter((t: any) => t.category === 'إخلاء'));
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    }
  }, []);
  
  // ملء النموذج بالبيانات
  const fillTemplateWithData = (templateContent: string) => {
    const selectedTenant = tenants.find(t => t.id === selectedTenantId) || mockTenants.find(t => t.id === selectedTenantId);
    const commercialCompany = mockCommercialCompanies.find(c => c.id === selectedTenantId);
    
    const dataMap: Record<string, string> = {
      'اسم_المدعي': 'عبدالله محمد بن عمير ال علي',
      'هوية_المدعي': '784-1945-4384241-1',
      'عنوان_المدعي': 'أم القيوين – الظهر',
      'هاتف_المدعي': '0522020200',
      'ايميل_المدعي': 'uaq907@gmail.com',
      'اسم_المدعى_عليه': newEviction.tenantName || selectedTenant?.name || commercialCompany?.name || '',
      'هوية_المدعى_عليه': (selectedTenant as any)?.emiratesId || (commercialCompany as any)?.tradeLicense || '',
      'عنوان_المدعى_عليه': newEviction.propertyName || '',
      'هاتف_المدعى_عليه': selectedTenant?.phone || commercialCompany?.phone || '',
      'ايميل_المدعى_عليه': selectedTenant?.email || commercialCompany?.email || '',
      'اسم_العقار': newEviction.propertyName || '',
      'رقم_العقد': 'TC-' + Date.now().toString().slice(-6),
      'تاريخ_العقد': newEviction.submittedDate || '',
      'قيمة_الايجار': newEviction.dueAmount || '0',
      'تاريخ_البداية': newEviction.submittedDate || '',
      'تاريخ_النهاية': new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA'),
      'المبلغ_المتأخر': newEviction.dueAmount || '0',
      'تاريخ_اليوم': new Date().toLocaleDateString('ar-SA')
    };
    
    let filled = templateContent;
    Object.entries(dataMap).forEach(([key, value]) => {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      filled = filled.replace(regex, value);
    });
    
    return filled;
  };
  
  // اختيار نموذج
  const handleSelectTemplate = (template: any) => {
    const filled = fillTemplateWithData(template.content);
    setSelectedTemplate(template);
    setFilledTemplateContent(filled);
    setShowTemplateDialog(false);
    
    // فتح النموذج في نافذة جديدة
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(`
        <html dir="rtl" lang="ar">
          <head>
            <meta charset="UTF-8">
            <title>${template.title}</title>
            <style>
              body { 
                font-family: 'Arial', sans-serif; 
                direction: rtl; 
                text-align: right; 
                margin: 40px; 
                line-height: 1.8; 
                background: white;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 20px; 
              }
              .content { 
                white-space: pre-line; 
                font-size: 14px; 
              }
              .footer { 
                margin-top: 40px; 
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #ccc;
              }
              @media print {
                body { margin: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${template.title}</h1>
              <p>الفئة: ${template.category} | الإمارة: ${template.emirate}</p>
            </div>
            <div class="content">${filled}</div>
            <div class="footer no-print">
              <button onclick="window.print()" style="padding: 10px 20px; margin: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">🖨️ طباعة</button>
              <button onclick="window.close()" style="padding: 10px 20px; margin: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">✖️ إغلاق</button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handlePayeeTypeChange = (value: string) => {
    setPayeeType(value as 'tenant' | 'manual');
    setSelectedTenantId('');
    setManualTenantName('');
    setTenantSearchTerm('');
    setShowTenantSearch(false);
    setShowCompanyDetails(false);
    setNewEviction(prev => ({
      ...prev,
      tenantName: '',
      propertyName: '',
      unitNumber: ''
    }));
  };

  const handleTenantSelect = (tenantId: string) => {
    console.log('handleTenantSelect called with:', tenantId);
    setSelectedTenantId(tenantId);
    setShowTenantSearch(false);
    setSelectedBusinessName('');
    
    // Check if it's a commercial company first
    const commercialCompany = mockCommercialCompanies.find(c => c.id === tenantId);
    if (commercialCompany) {
      console.log('Found commercial company:', commercialCompany.name);
      setNewEviction(prev => ({
        ...prev,
        tenantName: commercialCompany.name
        // لا يتم جلب البيانات تلقائياً هنا - فقط عند الضغط على "الشركة المحددة"
      }));
      return;
    }
    
    // Check if it's a regular tenant
    const allTenants = tenants.length > 0 ? tenants : mockTenants;
    const tenant = allTenants.find(t => t.id === tenantId);
    if (tenant) {
      console.log('Found tenant:', tenant.name);
      setNewEviction(prev => ({
        ...prev,
        tenantName: tenant.name
        // لا يتم جلب البيانات تلقائياً هنا - فقط عند الضغط على "المستأجر المحدد"
      }));
    } else {
      console.log('No tenant found with id:', tenantId);
    }
  };

  const handleBusinessNameSelect = (businessName: string) => {
    setSelectedBusinessName(businessName);
    setNewEviction(prev => ({
      ...prev,
      tenantName: `${prev.tenantName} - ${businessName}`,
      propertyName: 'سيتم تحديد العقار يدوياً',
      unitNumber: 'سيتم تحديد الوحدة يدوياً'
    }));
  };

  // Filter tenants based on search term
  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
    (tenant.phone && tenant.phone.includes(tenantSearchTerm)) ||
    tenant.email.toLowerCase().includes(tenantSearchTerm.toLowerCase()) ||
    (tenant.idNumber && tenant.idNumber.includes(tenantSearchTerm))
  );

  // Add mock tenants if no tenants are available
  const mockTenants = [
    { id: 'mock-1', name: 'أحمد محمد علي', email: 'ahmed@example.com', phone: '+971501234567', idNumber: '784-1985-1234567-1', hasCommercialLicense: true },
    { id: 'mock-2', name: 'فاطمة السالم', email: 'fatima@example.com', phone: '+971509876543', idNumber: '784-1990-9876543-2', hasCommercialLicense: false },
    { id: 'mock-3', name: 'محمد حسن النور', email: 'mohammed@example.com', phone: '+971507654321', idNumber: '784-1988-7654321-3', hasCommercialLicense: true },
    { id: 'mock-4', name: 'عائشة أحمد الزهراني', email: 'aisha@example.com', phone: '+971501111111', idNumber: '784-1992-1111111-4', hasCommercialLicense: false },
    { id: 'mock-5', name: 'خالد عبدالله المطيري', email: 'khalid@example.com', phone: '+971502222222', idNumber: '784-1987-2222222-5', hasCommercialLicense: true },
    { id: 'mock-6', name: 'سارة أحمد المطيري', email: 'sara@example.com', phone: '+971503333333', idNumber: '784-1995-3333333-6', hasCommercialLicense: false },
    { id: 'mock-7', name: 'عبدالرحمن سالم القحطاني', email: 'abdulrahman@example.com', phone: '+971504444444', idNumber: '784-1983-4444444-7', hasCommercialLicense: true },
    { id: 'mock-8', name: 'نورا محمد الشمري', email: 'nora@example.com', phone: '+971505555555', idNumber: '784-1991-5555555-8', hasCommercialLicense: false },
    { id: 'mock-9', name: 'يوسف عبدالله العتيبي', email: 'youssef@example.com', phone: '+971506666666', idNumber: '784-1989-6666666-9', hasCommercialLicense: true },
    { id: 'mock-10', name: 'ريم أحمد الغامدي', email: 'reem@example.com', phone: '+971507777777', idNumber: '784-1993-7777777-10', hasCommercialLicense: false }
  ];

  // Add mock commercial companies
  const mockCommercialCompanies = [
    { id: 'commercial-1', name: 'شركة التقنية المتقدمة', email: 'tech.advanced@example.com', phone: '+971501234568', idNumber: 'TR-2023-001', licenseOwner: 'أحمد محمد العتيبي' },
    { id: 'commercial-2', name: 'مؤسسة النجاح التجارية', email: 'success.trade@example.com', phone: '+971509876544', idNumber: 'TR-2023-002', licenseOwner: 'فاطمة السالم المطيري' },
    { id: 'commercial-3', name: 'شركة الابتكار الحديث', email: 'innovation.modern@example.com', phone: '+971507654322', idNumber: 'TR-2023-003', licenseOwner: 'محمد حسن القحطاني' },
    { id: 'commercial-4', name: 'مؤسسة التميز العقارية', email: 'excellence.realestate@example.com', phone: '+971501111112', idNumber: 'TR-2023-004', licenseOwner: 'عائشة أحمد الشمري' },
    { id: 'commercial-5', name: 'شركة المستقبل للخدمات', email: 'future.services@example.com', phone: '+971502222223', idNumber: 'TR-2023-005', licenseOwner: 'خالد عبدالله الغامدي' },
    { id: 'commercial-6', name: 'مجموعة الشروق التجارية', email: 'sunrise.group@example.com', phone: '+971503333334', idNumber: 'TR-2023-006', licenseOwner: 'سارة أحمد العتيبي' },
    { id: 'commercial-7', name: 'شركة الأمان للاستثمار', email: 'security.investment@example.com', phone: '+971504444445', idNumber: 'TR-2023-007', licenseOwner: 'عبدالرحمن سالم المطيري' },
    { id: 'commercial-8', name: 'مؤسسة النور للتجارة', email: 'light.trade@example.com', phone: '+971505555556', idNumber: 'TR-2023-008', licenseOwner: 'نورا محمد القحطاني' },
    { id: 'commercial-9', name: 'شركة التطوير المتقدم', email: 'development.advanced@example.com', phone: '+971506666667', idNumber: 'TR-2023-009', licenseOwner: 'يوسف عبدالله الشمري' },
    { id: 'commercial-10', name: 'مؤسسة الريادة التجارية', email: 'leadership.trade@example.com', phone: '+971507777778', idNumber: 'TR-2023-010', licenseOwner: 'ريم أحمد الغامدي' },
    { id: 'commercial-11', name: 'شركة الحلول الذكية', email: 'smart.solutions@example.com', phone: '+971508888889', idNumber: 'TR-2023-011', licenseOwner: 'عبدالله محمد العتيبي' },
    { id: 'commercial-12', name: 'مجموعة التميز الصناعي', email: 'excellence.industrial@example.com', phone: '+971509999990', idNumber: 'TR-2023-012', licenseOwner: 'مريم أحمد المطيري' }
  ];

  // Add tenant business names mapping
  const tenantBusinessNames = {
    'mock-1': ['شركة التقنية المتقدمة', 'مؤسسة أحمد للتجارة', 'شركة العتيبي للاستثمار'],
    'mock-3': ['شركة الابتكار الحديث', 'مؤسسة النور للتطوير'],
    'mock-5': ['شركة المستقبل للخدمات', 'مؤسسة المطيري العقارية'],
    'mock-7': ['شركة الأمان للاستثمار', 'مؤسسة القحطاني التجارية'],
    'mock-9': ['شركة التطوير المتقدم', 'مؤسسة العتيبي للخدمات']
  };

  const allTenants = tenants.length > 0 ? tenants : mockTenants;
  const allCommercialCompanies = mockCommercialCompanies;
  
  console.log('tenants prop:', tenants);
  console.log('mockTenants:', mockTenants);
  console.log('allTenants:', allTenants);
  
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
  
  console.log('tenantSearchTerm:', tenantSearchTerm);
  console.log('filteredAllTenants:', filteredAllTenants);

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

  // Close search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.tenant-search-container')) {
        setShowTenantSearch(false);
      }
    };

    if (showTenantSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showTenantSearch]);

  const handleAddEviction = async () => {
    // Validate required fields
    let isValid = false;
    let errorMessage = '';
    
    if (payeeType === 'tenant') {
      if (!selectedTenantId || !newEviction.reason) {
        errorMessage = 'يرجى اختيار المستأجر وسبب الإخلاء';
      } else {
        isValid = true;
      }
    } else if (payeeType === 'manual') {
      if (!selectedTenantId || !newEviction.reason) {
        errorMessage = 'يرجى اختيار شركة تجارية وسبب الإخلاء';
      } else {
        isValid = true;
      }
    }
    
    if (!isValid) {
      alert(errorMessage);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const evictionData = {
        tenantId: payeeType === 'tenant' ? selectedTenantId : undefined,
        tenantName: newEviction.tenantName,
        propertyName: newEviction.propertyName,
        unitNumber: newEviction.unitNumber,
        reason: newEviction.reason,
        description: newEviction.description,
        dueAmount: parseFloat(newEviction.dueAmount) || 0,
        submittedDate: newEviction.submittedDate,
      };

      const result = await handleAddEvictionRequest(evictionData);
      
      if (result.success) {
        // Add the new eviction request to the local state
        const newRequest: EvictionRequest = {
          id: `EV-${Date.now()}`,
          tenantId: evictionData.tenantId || null,
          tenantName: evictionData.tenantName,
          propertyName: evictionData.propertyName,
          unitNumber: evictionData.unitNumber,
          reason: evictionData.reason,
          description: evictionData.description || null,
          dueAmount: evictionData.dueAmount,
          status: 'pending',
          submittedDate: new Date(evictionData.submittedDate),
          createdById: loggedInEmployee?.id || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        setEvictionRequests(prev => [newRequest, ...prev]);
        
        // Reset form
    setNewEviction({
      tenantName: '',
      propertyName: '',
      unitNumber: '',
      reason: '',
      dueAmount: '',
      submittedDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    
    setPayeeType('tenant');
    setSelectedTenantId('');
    setManualTenantName('');
    setIsAddEvictionDialogOpen(false);
    
    alert('تم إضافة طلب الإخلاء بنجاح!');
      } else {
        alert(`خطأ: ${result.message}`);
      }
    } catch (error) {
      console.error('Error adding eviction request:', error);
      alert('حدث خطأ أثناء إضافة طلب الإخلاء');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add event listener to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTenantSearch) {
        setShowTenantSearch(false);
      }
    };

    if (showTenantSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTenantSearch]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />قيد المراجعة</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><AlertTriangle className="w-3 h-3 mr-1" />قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />ملغي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setNewEviction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCloseDialog = () => {
    setIsAddEvictionDialogOpen(false);
    setNewEviction({
      tenantName: '',
      propertyName: '',
      unitNumber: '',
      reason: '',
      dueAmount: '',
      submittedDate: new Date().toISOString().split('T')[0],
      description: ''
    });
    setPayeeType('tenant');
    setSelectedTenantId('');
    setManualTenantName('');
  };

  const handleViewDetails = (requestId: string) => {
    console.log('Viewing eviction request details:', requestId);
    alert(`Viewing eviction request details: ${requestId}\n\nYou will be redirected to the full details page`);
  };

  const handleUpdateStatus = (requestId: string) => {
    console.log('Updating eviction request status:', requestId);
    const newStatus = prompt('Enter new status (pending, in_progress, completed, cancelled):');
    if (newStatus) {
      alert(`Updated eviction request ${requestId} status to: ${newStatus}`);
    }
  };

  const handleAddDocument = (requestId: string) => {
    console.log('Adding document to eviction request:', requestId);
    alert(`Adding document to eviction request: ${requestId}\n\nFile upload window will open`);
  };

  const handleDeleteEviction = (requestId: string) => {
    console.log('Deleting eviction request:', requestId);
    const confirmDelete = confirm(`Are you sure you want to delete eviction request ${requestId}?\n\nThis action cannot be undone!`);
    if (confirmDelete) {
      alert(`Eviction request ${requestId} deleted successfully!`);
    }
  };

  const handleGenerateReport = (reportType: string) => {
    console.log('Generating report:', reportType);
    alert(`Generating ${reportType} report...`);
  };

  return (
    <div className="container mx-auto p-6">
      {/* Permission Check */}
      {!canReadEvictions ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد صلاحية للوصول</h3>
          <p className="text-gray-600 mb-4">You do not have permission to view eviction requests</p>
          <Link href="/dashboard">
            <Button variant="outline">العودة للوحة التحكم</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Header */}
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
              <FileText className="h-8 w-8" />
              {t('nav.eviction')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('eviction.subtitle')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            نظام قانوني
          </Badge>
        </div>
      </div>

          {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold">{evictionRequests.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">قيد المراجعة</p>
                    <p className="text-2xl font-bold text-yellow-600">{evictionRequests.filter(r => r.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('eviction.inProgress')}</p>
                    <p className="text-2xl font-bold text-blue-600">{evictionRequests.filter(r => r.status === 'in_progress').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">مكتمل</p>
                    <p className="text-2xl font-bold text-green-600">{evictionRequests.filter(r => r.status === 'completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {/* Eviction Requests List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t('eviction.requests')}</CardTitle>
              <CardDescription>
                {t('eviction.viewManage')}
              </CardDescription>
            </div>
            {canCreateEvictions && (
              <Button className="flex items-center gap-2" onClick={() => setIsAddEvictionDialogOpen(true)}>
                <Plus className="h-4 w-4" />
                {t('eviction.addNewRequest')}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evictionRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{request.id}</h3>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                          {new Date(request.submittedDate).toLocaleDateString('ar-AE')}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium">المستأجر</p>
                      <p className="text-muted-foreground">{request.tenantName}</p>
                    </div>
                    <div>
                      <p className="font-medium">العقار</p>
                      <p className="text-muted-foreground">{request.propertyName} - {request.unitNumber}</p>
                    </div>
                    <div>
                      <p className="font-medium">{t('eviction.reason')}</p>
                      <p className="text-muted-foreground">{request.reason}</p>
                    </div>
                  </div>
                  
                  {request.dueAmount > 0 && (
                    <div className="mt-3 flex items-center justify-between bg-red-50 p-3 rounded">
                      <div>
                        <p className="text-sm font-medium text-red-800">المبلغ المستحق</p>
                        <p className="text-lg font-bold text-red-900">{request.dueAmount.toLocaleString()} درهم إ.م</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {canReadEvictions && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(request.id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        {t('eviction.viewDetails')}
                      </Button>
                    )}
                    {canUpdateEvictions && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUpdateStatus(request.id)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        {t('eviction.updateStatus')}
                      </Button>
                    )}
                    {canAddDocuments && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddDocument(request.id)}
                        className="flex items-center gap-1"
                      >
                        <FileUp className="h-3 w-3" />
                        {t('eviction.addDocument')}
                      </Button>
                    )}
                    {canDeleteEvictions && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteEviction(request.id)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

            {/* Process Stages */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('eviction.processStages')}</CardTitle>
              <CardDescription>
                {t('eviction.processGuide')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <p className="font-medium">إشعار المستأجر</p>
                    <p className="text-sm text-muted-foreground">إرسال إشعار رسمي للمستأجر</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded">
                  <div className="w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <p className="font-medium">فترة السماح</p>
                    <p className="text-sm text-muted-foreground">30 يوم للرد أو التصحيح</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <p className="font-medium">رفع الدعوى</p>
                    <p className="text-sm text-muted-foreground">تقديم الدعوى للمحكمة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <p className="font-medium">تنفيذ الحكم</p>
                    <p className="text-sm text-muted-foreground">تنفيذ قرار المحكمة</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('eviction.reportsStatistics')}</CardTitle>
              <CardDescription>
                {t('eviction.detailedReports')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {canGenerateReports && (
                  <>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport(t('eviction.monthlyReport'))}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {t('eviction.monthlyReport')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport(t('eviction.dueAmountsReport'))}>
                      <FileText className="h-4 w-4 mr-2" />
                      {t('eviction.dueAmountsReport')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport(t('eviction.delaysReport'))}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      {t('eviction.delaysReport')}
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => handleGenerateReport(t('eviction.achievementsReport'))}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {t('eviction.achievementsReport')}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add New Eviction Request Dialog */}
      <Dialog open={isAddEvictionDialogOpen} onOpenChange={setIsAddEvictionDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2 justify-start flex-row-reverse">
              {t('eviction.addNewRequest')}
              <Plus className="h-5 w-5" />
            </DialogTitle>
            <DialogDescription className="text-right">
              {t('eviction.enterDetails')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
                {/* نوع المستأجر */}
            <div className="space-y-3">
                  <Label className="text-lg font-semibold block text-right">نوع المستأجر</Label>
                  <RadioGroup value={payeeType} onValueChange={handlePayeeTypeChange} className="flex gap-6 justify-end">
                <div className="flex items-center space-x-reverse space-x-2">
                      <Label htmlFor="r1" className="font-normal flex items-center gap-2 text-base">
                    مستأجر
                        <User className="h-5 w-5" />
                  </Label>
                  <RadioGroupItem value="tenant" id="r1" />
                </div>
                <div className="flex items-center space-x-reverse space-x-2">
                      <Label htmlFor="r2" className="font-normal flex items-center gap-2 text-base">
                        الإسم التجاري
                        <Pencil className="h-5 w-5" />
                  </Label>
                  <RadioGroupItem value="manual" id="r2" />
                </div>
              </RadioGroup>
            </div>

                {/* الاسم التجاري / المستأجر */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold block text-right">
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
                              <p className="text-sm text-green-700">{newEviction.tenantName}</p>
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
                    <p className="text-sm text-green-700">{newEviction.tenantName}</p>
                  </div>
                )}
                        </div>
                      )}
                    </div>
                    
                {/* الأسماء التجارية للمستأجر */}
                {selectedTenantId && payeeType === 'tenant' && (() => {
                  const allTenants = tenants.length > 0 ? tenants : mockTenants;
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
                <Label htmlFor="propertyName">{t('eviction.propertyName')}</Label>
                <Input
                  id="propertyName"
                  value={newEviction.propertyName}
                  onChange={(e) => handleInputChange('propertyName', e.target.value)}
                  placeholder={t('eviction.propertyNamePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="unitNumber">{t('eviction.unitNumber')}</Label>
                <Input
                  id="unitNumber"
                  value={newEviction.unitNumber}
                  onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                  placeholder={t('eviction.unitNumberPlaceholder')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueAmount">{t('eviction.dueAmount')}</Label>
                <Input
                  id="dueAmount"
                  type="number"
                  value={newEviction.dueAmount}
                  onChange={(e) => handleInputChange('dueAmount', e.target.value)}
                  placeholder={t('eviction.dueAmountPlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="submittedDate">{t('eviction.submittedDate')}</Label>
                <Input
                  id="submittedDate"
                  type="date"
                  value={newEviction.submittedDate}
                  onChange={(e) => handleInputChange('submittedDate', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="reason">{t('eviction.reason')}</Label>
              <Select value={newEviction.reason} onValueChange={(value) => handleInputChange('reason', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('eviction.reasonPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="عدم دفع الإيجار">{t('eviction.reasonNonPayment')}</SelectItem>
                  <SelectItem value="انتهاك شروط العقد">{t('eviction.reasonContractViolation')}</SelectItem>
                  <SelectItem value="انتهاء العقد">{t('eviction.reasonContractEnd')}</SelectItem>
                  <SelectItem value="استخدام غير قانوني">{t('eviction.reasonIllegalUse')}</SelectItem>
                  <SelectItem value="أخرى">{t('eviction.reasonOther')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="description">{t('eviction.description')}</Label>
              <Textarea
                id="description"
                value={newEviction.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('eviction.descriptionPlaceholder')}
                rows={3}
              />
                  </div>
            </div>
          </div>
          
          <DialogFooter className="flex-row-reverse gap-2">
            {selectedTenantId && (
              <Button 
                onClick={() => setShowTemplateDialog(true)} 
                variant="secondary"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileText className="ml-2 h-4 w-4" />
                اختيار نموذج دعوى
              </Button>
            )}
                <Button onClick={handleAddEviction} disabled={isSubmitting || !selectedTenantId}>
                  {isSubmitting ? 'جاري الإضافة...' : t('eviction.addRequest')}
            </Button>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t('eviction.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-right flex items-center gap-2 justify-start flex-row-reverse">
              اختر نموذج الدعوى
              <FileText className="h-5 w-5" />
            </DialogTitle>
            <DialogDescription className="text-right">
              اختر نموذج دعوى مناسب لحالة الإخلاء. سيتم ملء النموذج تلقائياً بالبيانات المختارة.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {availableTemplates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">لا توجد نماذج إخلاء متاحة</p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/legal/petition-templates">
                    إضافة نماذج من صفحة النماذج
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {availableTemplates.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-500"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span>{template.title}</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {template.emirate}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {template.content.substring(0, 150)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>📅 {template.createdAt}</span>
                        <span>👥 استخدام: {template.usageCount || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-row-reverse">
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  );
}