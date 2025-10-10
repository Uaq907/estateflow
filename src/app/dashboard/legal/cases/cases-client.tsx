'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Plus, Eye, Edit, FileText, Calendar, Trash2, AlertCircle, User, Pencil, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { hasPermission } from '@/lib/permissions';

// بيانات وهمية للقضايا
const mockCases = [
  {
    id: 1,
    caseNumber: 'CASE-2024-001',
    title: 'حل نزاع عقاري',
    client: 'أحمد الراشد',
    status: 'نشط',
    priority: 'عالي',
    assignedTo: 'الفريق القانوني أ',
    createdAt: '2024-01-15',
    nextHearing: '2024-02-15',
    description: 'نزاع حول حدود العقار وحقوق الملكية'
  },
  {
    id: 2,
    caseNumber: 'CASE-2024-002',
    title: 'قضية إخلال بالعقد',
    client: 'سارة جونسون',
    status: 'معلق',
    priority: 'متوسط',
    assignedTo: 'الفريق القانوني ب',
    createdAt: '2024-01-20',
    nextHearing: '2024-02-20',
    description: 'إخلال بالعقد في اتفاقية الإيجار التجاري'
  },
  {
    id: 3,
    caseNumber: 'CASE-2024-003',
    title: 'انتهاك حقوق المستأجر',
    client: 'محمد حسن',
    status: 'محلول',
    priority: 'منخفض',
    assignedTo: 'الفريق القانوني أ',
    createdAt: '2024-01-10',
    nextHearing: null,
    description: 'انتهاك حقوق المستأجر ومطالبة بالتعويض'
  },
  {
    id: 4,
    caseNumber: 'CASE-2024-004',
    title: 'قضية عدم دفع الإيجار',
    client: 'شركة التقنية المتقدمة',
    status: 'مغلق - القضية مغلقة',
    priority: 'عالي',
    assignedTo: 'الفريق القانوني ب',
    createdAt: '2024-01-10',
    nextHearing: null,
    description: 'إيقاف القضية بسبب عدم الرد من الطرف الآخر'
  },
  {
    id: 5,
    caseNumber: 'CASE-2024-005',
    title: 'نزاع عقاري حدودي',
    client: 'أحمد الراشد',
    status: 'الحكم - صدور حكم نهائي',
    priority: 'عالي',
    assignedTo: 'الفريق القانوني أ',
    createdAt: '2023-12-15',
    nextHearing: null,
    description: 'صدور حكم نهائي لصالح العميل في نزاع الحدود العقارية'
  }
];

const statusOptions = [
  'نشط',
  'معلق', 
  'محلول',
  'مغلق',
  'مغلق - القضية مغلقة',
  'الحكم - صدور حكم نهائي'
];

const statusColors = {
  'نشط': 'bg-green-100 text-green-800',
  'معلق': 'bg-yellow-100 text-yellow-800',
  'محلول': 'bg-blue-100 text-blue-800',
  'مغلق': 'bg-gray-100 text-gray-800',
  'مغلق - القضية مغلقة': 'bg-red-100 text-red-800',
  'الحكم - صدور حكم نهائي': 'bg-purple-100 text-purple-800'
};

const priorityColors = {
  'عالي': 'bg-red-100 text-red-800',
  'متوسط': 'bg-orange-100 text-orange-800',
  'منخفض': 'bg-green-100 text-green-800'
};

export function CasesPageClient() {
  const [cases, setCases] = useState(mockCases);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [showTemplateSelectionDialog, setShowTemplateSelectionDialog] = useState(false);
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [payeeType, setPayeeType] = useState<'tenant' | 'manual'>('tenant');
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');
  const [showTenantSearch, setShowTenantSearch] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedBusinessName, setSelectedBusinessName] = useState<string>('');
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  const [newCase, setNewCase] = useState({
    client: '',
    priority: '',
    assignedTo: '',
    description: '',
    propertyName: '',
    unitNumber: '',
    dueAmount: '',
    submittedDate: new Date().toISOString().split('T')[0],
    contactPhone: '',
    contactEmail: ''
  });

  // بيانات وهمية للمستأجرين
  const mockTenants = [
    {
      id: 'mock-1',
      name: 'أحمد محمد علي',
      email: 'ahmed@example.com',
      phone: '+971501234567',
      idNumber: '784-1985-1234567-1',
      nationality: 'الإمارات',
      hasCommercialLicense: true
    },
    {
      id: 'mock-2',
      name: 'فاطمة السالم',
      email: 'fatima@example.com',
      phone: '+971509876543',
      idNumber: '784-1990-9876543-2',
      nationality: 'الإمارات',
      hasCommercialLicense: false
    },
    {
      id: 'mock-3',
      name: 'محمد حسن النور',
      email: 'mohammed@example.com',
      phone: '+971507654321',
      idNumber: '784-1988-7654321-3',
      nationality: 'السودان',
      hasCommercialLicense: true
    },
    {
      id: 'mock-4',
      name: 'عائشة أحمد الزهراني',
      email: 'aisha@example.com',
      phone: '+971501111111',
      idNumber: '784-1992-1111111-4',
      nationality: 'السعودية',
      hasCommercialLicense: false
    },
    {
      id: 'mock-5',
      name: 'خالد عبدالله المطيري',
      email: 'khalid@example.com',
      phone: '+971502222222',
      idNumber: '784-1987-2222222-5',
      nationality: 'الكويت',
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
      idNumber: '1234567890',
      nationality: 'الإمارات'
    },
    {
      id: 'commercial-2',
      name: 'مؤسسة المستقبل للخدمات',
      licenseOwner: 'محمد حسن النور',
      phone: '+971507654321',
      email: 'info@mustaqbal.com',
      idNumber: '0987654321',
      nationality: 'السودان'
    },
    {
      id: 'commercial-3',
      name: 'شركة الأمان للاستثمار',
      licenseOwner: 'خالد عبدالله المطيري',
      phone: '+971502222222',
      email: 'info@aman.com',
      idNumber: '1122334455',
      nationality: 'الكويت'
    }
  ];

  // ربط الأسماء التجارية بالمستأجرين
  const tenantBusinessNames = {
    'mock-1': ['شركة النخيل التجارية', 'مؤسسة النخيل العقارية'],
    'mock-3': ['مؤسسة المستقبل للخدمات', 'شركة المستقبل العقارية'],
    'mock-5': ['شركة الأمان للاستثمار', 'مؤسسة القحطاني التجارية']
  };

  // ربط بيانات العقار والوحدة بالمستأجرين
  const tenantPropertyData: Record<string, { propertyName: string; unitNumber: string; dueAmount: number }> = {
    'mock-1': { propertyName: 'برج النخيل السكني', unitNumber: 'A-201', dueAmount: 45000 },
    'mock-2': { propertyName: 'فيلا الشاطئ', unitNumber: 'V-105', dueAmount: 60000 },
    'mock-3': { propertyName: 'مجمع المستقبل', unitNumber: 'B-304', dueAmount: 38000 },
    'mock-4': { propertyName: 'برج الزهراء', unitNumber: 'C-102', dueAmount: 42000 },
    'mock-5': { propertyName: 'مجمع الأمان التجاري', unitNumber: 'T-501', dueAmount: 75000 },
    'commercial-1': { propertyName: 'مجمع النخيل التجاري', unitNumber: 'T-101', dueAmount: 80000 },
    'commercial-2': { propertyName: 'برج المستقبل', unitNumber: 'R-205', dueAmount: 95000 },
    'commercial-3': { propertyName: 'مركز الأمان للأعمال', unitNumber: 'T-301', dueAmount: 120000 }
  };

  // إغلاق قائمة البحث عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.tenant-search-container')) {
        setShowTenantSearch(false);
      }
    };

    if (showTenantSearch) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTenantSearch]);

  // Mock permissions - replace with actual permission checks
  const canReadCases = true; // hasPermission(loggedInEmployee, 'legal:cases:read') || true;
  const canCreateCases = true; // hasPermission(loggedInEmployee, 'legal:cases:create') || true;
  const canUpdateCases = true; // hasPermission(loggedInEmployee, 'legal:cases:update') || true;
  const canDeleteCases = true; // hasPermission(loggedInEmployee, 'legal:cases:delete') || true;
  const canAddDocuments = true; // hasPermission(loggedInEmployee, 'legal:cases:documents:add') || true;
  const canGenerateReports = true; // hasPermission(loggedInEmployee, 'legal:cases:reports:generate') || true;
  const canScheduleHearings = true; // hasPermission(loggedInEmployee, 'legal:cases:hearings:schedule') || true;

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
    setShowCompanyDetails(false);
    
    // مسح جميع بيانات النموذج عند تغيير نوع المستأجر
    setNewCase({
      client: '',
      priority: '',
      assignedTo: '',
      description: '',
      propertyName: '',
      unitNumber: '',
      dueAmount: '',
      submittedDate: new Date().toISOString().split('T')[0],
      contactPhone: '',
      contactEmail: ''
    });
  };

  // دالة لحفظ النموذج المعدل
  const handleSaveTemplate = () => {
    if (!newCase.priority.trim()) {
      alert('⚠️ النموذج فارغ! يرجى إضافة محتوى أولاً');
      return;
    }
    
    if (!templateName.trim()) {
      alert('⚠️ يرجى إدخال اسم للنموذج');
      return;
    }
    
    try {
      // إزالة العلامات الحمراء قبل الحفظ
      const cleanedTemplate = newCase.priority.replace(/🔴/g, '');
      
      // جلب النماذج الموجودة
      const existingTemplates = JSON.parse(localStorage.getItem('customPetitionTemplates') || '[]');
      
      // إضافة النموذج الجديد
      const newTemplate = {
        id: Date.now(),
        title: templateName,
        category: payeeType === 'tenant' ? 'سكنية' : 'تجارية',
        emirate: 'أم القيوين',
        content: cleanedTemplate,
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        usageCount: 0,
        isCustom: true
      };
      
      existingTemplates.push(newTemplate);
      localStorage.setItem('customPetitionTemplates', JSON.stringify(existingTemplates));
      
      setIsSaveTemplateDialogOpen(false);
      setTemplateName('');
      alert('✅ تم حفظ النموذج بنجاح! يمكنك الوصول إليه من صفحة النماذج');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('❌ حدث خطأ أثناء حفظ النموذج');
    }
  };

  // دالة لتفريغ البيانات وإعادة placeholders الأصلية
  const clearFilledData = () => {
    if (newCase.priority && newCase.priority.trim()) {
      let clearedTemplate = newCase.priority;
      
      // إزالة البيانات المعبأة وإعادة placeholders الأصلية
      // بيانات المدعي
      clearedTemplate = clearedTemplate.replace(/🔴عبدالله محمد بن عمير ال علي🔴/g, '[اسم_المدعي]');
      clearedTemplate = clearedTemplate.replace(/🔴784-1945-4384241-1🔴/g, '[هوية_المدعي]');
      clearedTemplate = clearedTemplate.replace(/🔴أم القيوين – الظهر🔴/g, '[عنوان_المدعي]');
      clearedTemplate = clearedTemplate.replace(/🔴0522020200🔴/g, '[هاتف_المدعي]');
      clearedTemplate = clearedTemplate.replace(/🔴uaq907@gmail\.com🔴/g, '[ايميل_المدعي]');
      
      // إزالة جميع البيانات المعبأة الأخرى (بين 🔴...🔴)
      clearedTemplate = clearedTemplate.replace(/🔴(.*?)🔴/g, (match, content) => {
        // إذا كان المحتوى يحتوي على بيانات معبأة، نعيد placeholder مناسب
        if (content.includes('@')) return '[ايميل_المدعى_عليه]';
        if (content.includes('+971') || content.startsWith('05')) return '[هاتف_المدعى_عليه]';
        if (content.includes('784-')) return '[هوية_المدعى_عليه]';
        if (content.includes('/')) return '[تاريخ_اليوم]';
        if (content.match(/^\d+$/)) return '[المبلغ_المتأخر]';
        if (content.includes('TC-')) return '[رقم_العقد]';
        if (content.includes('برج') || content.includes('فيلا') || content.includes('مجمع')) return '[اسم_العقار]';
        if (content.match(/^[A-Z]-\d+$/) || content.match(/^[VTR]-\d+$/)) return '[رقم_الوحدة]';
        // اسماء الأشخاص والشركات
        return '[اسم_المدعى_عليه]';
      });
      
      setNewCase(prev => ({
        ...prev,
        priority: clearedTemplate
      }));
    }
  };

  // دالة لتعبئة البيانات في نموذج الدعوى مع علامات للون الأحمر
  const fillTemplateData = (client: string, tenantId: string, propertyName?: string, unitNumber?: string, dueAmount?: string) => {
    console.log('🔍 fillTemplateData called:', { client, tenantId, propertyName, unitNumber, dueAmount });
    const tenant = allTenants.find(t => t.id === tenantId);
    const company = allCommercialCompanies.find(c => c.id === tenantId);
    
    console.log('📋 Found tenant/company:', tenant || company);
    console.log('📝 Current newCase.priority length:', newCase.priority?.length);
    
    if (newCase.priority && newCase.priority.trim()) {
      let updatedTemplate = newCase.priority;
      console.log('✅ Template loaded, starting data filling...');
      
      // تعبئة بيانات المدعي (المالك) - بيانات افتراضية
      updatedTemplate = updatedTemplate.replace(/\[اسم_المدعي\]/g, 'عبدالله محمد بن عمير ال علي');
      updatedTemplate = updatedTemplate.replace(/\[جنسية_المدعي\]/g, 'إماراتي');
      updatedTemplate = updatedTemplate.replace(/\[هوية_المدعي\]/g, '784-1945-4384241-1');
      updatedTemplate = updatedTemplate.replace(/\[عنوان_المدعي\]/g, 'أم القيوين – الظهر');
      updatedTemplate = updatedTemplate.replace(/\[هاتف_المدعي\]/g, '0522020200');
      updatedTemplate = updatedTemplate.replace(/\[ايميل_المدعي\]/g, 'uaq907@gmail.com');
      
      // تعبئة بيانات المدعى عليه (المستأجر)
      if (tenant) {
        updatedTemplate = updatedTemplate.replace(/\[اسم_المدعى_عليه\]/g, tenant.name);
        updatedTemplate = updatedTemplate.replace(/\[جنسية_المدعى_عليه\]/g, tenant.nationality || 'غير محدد');
        updatedTemplate = updatedTemplate.replace(/\[هوية_المدعى_عليه\]/g, tenant.idNumber || 'غير محدد');
        updatedTemplate = updatedTemplate.replace(/\[عنوان_المدعى_عليه\]/g, propertyName && unitNumber ? `${propertyName} - وحدة ${unitNumber}` : 'غير محدد');
        updatedTemplate = updatedTemplate.replace(/\[هاتف_المدعى_عليه\]/g, tenant.phone || 'غير محدد');
        updatedTemplate = updatedTemplate.replace(/\[ايميل_المدعى_عليه\]/g, tenant.email || 'غير محدد');
      } else if (company) {
        updatedTemplate = updatedTemplate.replace(/\[اسم_المدعى_عليه\]/g, company.name);
        updatedTemplate = updatedTemplate.replace(/\[جنسية_المدعى_عليه\]/g, company.nationality || 'غير محدد');
        updatedTemplate = updatedTemplate.replace(/\[هوية_المدعى_عليه\]/g, company.idNumber || 'غير محدد');
        updatedTemplate = updatedTemplate.replace(/\[عنوان_المدعى_عليه\]/g, propertyName && unitNumber ? `${propertyName} - وحدة ${unitNumber}` : 'غير محدد');
        updatedTemplate = updatedTemplate.replace(/\[هاتف_المدعى_عليه\]/g, company.phone || 'غير محدد');
        updatedTemplate = updatedTemplate.replace(/\[ايميل_المدعى_عليه\]/g, company.email || 'غير محدد');
      }
      
      // تعبئة بيانات العقار
      if (propertyName) {
        updatedTemplate = updatedTemplate.replace(/\[اسم_العقار\]/g, propertyName);
      }
      
      if (unitNumber) {
        updatedTemplate = updatedTemplate.replace(/\[رقم_الوحدة\]/g, unitNumber);
      }
      
      // تعبئة البيانات المالية
      if (dueAmount) {
        const dueAmountNum = parseFloat(dueAmount);
        const taxAmount = (dueAmountNum * 0.05).toFixed(2); // ضريبة 5%
        const totalAmount = (dueAmountNum + parseFloat(taxAmount)).toFixed(2);
        
        updatedTemplate = updatedTemplate.replace(/\[المبلغ_المتأخر\]/g, dueAmount);
        updatedTemplate = updatedTemplate.replace(/\[قيمة_الايجار\]/g, dueAmount);
        updatedTemplate = updatedTemplate.replace(/\[قيمة_الضريبة\]/g, taxAmount);
        updatedTemplate = updatedTemplate.replace(/\[اجمالي_المطالبة\]/g, totalAmount);
        
        // حساب عدد الدفعات وقيمة كل دفعة (افتراضياً 4 دفعات)
        const numberOfPayments = 4;
        const paymentAmount = (dueAmountNum / numberOfPayments).toFixed(2);
        updatedTemplate = updatedTemplate.replace(/\[عدد_الدفعات\]/g, numberOfPayments.toString());
        updatedTemplate = updatedTemplate.replace(/\[قيمة_الدفعة\]/g, paymentAmount);
      }
      
      // تعبئة التواريخ
      const today = new Date();
      const startDate = new Date(today.getFullYear(), 0, 1); // 1 يناير من السنة الحالية
      const endDate = new Date(today.getFullYear(), 11, 31); // 31 ديسمبر من السنة الحالية
      const delayStartDate = new Date(today.getFullYear(), today.getMonth() - 3, 1); // قبل 3 أشهر
      
      updatedTemplate = updatedTemplate.replace(/\[تاريخ_اليوم\]/g, today.toLocaleDateString('ar-SA'));
      updatedTemplate = updatedTemplate.replace(/\[تاريخ_العقد\]/g, startDate.toLocaleDateString('ar-SA'));
      updatedTemplate = updatedTemplate.replace(/\[تاريخ_البداية\]/g, startDate.toLocaleDateString('ar-SA'));
      updatedTemplate = updatedTemplate.replace(/\[تاريخ_النهاية\]/g, endDate.toLocaleDateString('ar-SA'));
      updatedTemplate = updatedTemplate.replace(/\[تاريخ_بداية_التأخير\]/g, delayStartDate.toLocaleDateString('ar-SA'));
      updatedTemplate = updatedTemplate.replace(/\[تاريخ_نهاية_التأخير\]/g, today.toLocaleDateString('ar-SA'));
      updatedTemplate = updatedTemplate.replace(/\[رقم_العقد\]/g, 'TC-2025-001');
      
      // حساب عدد الأشهر المتأخرة
      const monthsDiff = Math.floor((today.getTime() - delayStartDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      updatedTemplate = updatedTemplate.replace(/\[عدد_الاشهر_المتأخرة\]/g, monthsDiff.toString());
      
      // تعبئة بيانات الإنذار
      const warningDate = new Date(today.getFullYear(), today.getMonth() - 1, 15); // قبل شهر تقريباً
      updatedTemplate = updatedTemplate.replace(/\[وسيلة_الانذار\]/g, 'رسالة نصية ورسالة بريد إلكتروني');
      updatedTemplate = updatedTemplate.replace(/\[تاريخ_الانذار\]/g, warningDate.toLocaleDateString('ar-SA'));
      
      console.log('✨ Data filling completed!');
      
      setNewCase(prev => ({
        ...prev,
        priority: updatedTemplate
      }));
    } else {
      console.log('⚠️ newCase.priority is empty or not loaded yet!');
    }
  };

  const handleTenantSelect = (tenantId: string) => {
    console.log('handleTenantSelect called with:', tenantId);
    
    if (payeeType === 'tenant') {
      const tenant = allTenants.find(t => t.id === tenantId);
      if (tenant) {
        console.log('Found tenant:', tenant.name);
        setSelectedTenantId(tenantId);
        
        // نموذج دعوى مطالبة مالية - تأخير إيجار
        const residentialTemplate = `لجنة فض المنازعات الإيجارية بإمارة أم القيوين
لائحة الدعوى رقم          لسنة / 2025 - مطالبة مالية (تأخير إيجار)
المحدد لها جلسة بتاريخ      /       / 2025م

صحيفة دعوى مطالبة مالية

مقدمة من المالك: [اسم_المدعي] - [جنسية_المدعي] الجنسية
بطاقة هوية رقم: [هوية_المدعي]
العنوان: [عنوان_المدعي]
رقم الهاتف: [هاتف_المدعي]
البريد الإلكتروني: [ايميل_المدعي]

ضـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــد

المدعى عليه (المستأجر): [اسم_المدعى_عليه]
الجنسية: [جنسية_المدعى_عليه]
بطاقة هوية رقم: [هوية_المدعى_عليه]
العنوان: [عنوان_المدعى_عليه]
رقم الهاتف: [هاتف_المدعى_عليه]
البريد الإلكتروني: [ايميل_المدعى_عليه]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

الموضوع: المطالبة بالقيمة الإيجارية المتأخرة

الوقائع:

أولاً: بموجب عقد إيجار موثق برقم [رقم_العقد] الصادر بتاريخ [تاريخ_العقد] من بلدية أم القيوين، استأجر المدعى عليه من المدعي العقار الكائن في: [اسم_العقار] - رقم الوحدة: [رقم_الوحدة].

ثانياً: مدة الإيجار من تاريخ [تاريخ_البداية] وحتى [تاريخ_النهاية]، بقيمة إيجارية سنوية قدرها [قيمة_الايجار] درهم إماراتي.

ثالثاً: التزم المستأجر بموجب العقد بدفع القيمة الإيجارية على [عدد_الدفعات] دفعات، كل دفعة بقيمة [قيمة_الدفعة] درهم.

رابعاً: لم يلتزم المدعى عليه بسداد المبالغ المستحقة في مواعيدها المحددة، حيث تراكمت عليه المبالغ المتأخرة التالية:

   • المبلغ الأساسي المتأخر: [المبلغ_المتأخر] درهم
   • الفترة: من [تاريخ_بداية_التأخير] حتى [تاريخ_نهاية_التأخير]
   • عدد الأشهر المتأخرة: [عدد_الاشهر_المتأخرة] شهر
   
خامساً: تم إنذار المدعى عليه بضرورة السداد عبر [وسيلة_الانذار] بتاريخ [تاريخ_الانذار]، إلا أنه لم يستجب ولم يقم بالسداد.

سادساً: المبلغ الإجمالي المطالب به:
   • القيمة الإيجارية المتأخرة: [المبلغ_المتأخر] درهم
   • ضريبة القيمة المضافة (5%): [قيمة_الضريبة] درهم
   • الإجمالي: [اجمالي_المطالبة] درهم

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

الأسانيد القانونية:

- القانون الاتحادي رقم (26) لسنة 2007 بشأن تنظيم العلاقة بين المؤجر والمستأجر في إمارة أم القيوين
- المادة (25) من قانون المعاملات المدنية الاتحادي
- أحكام عقد الإيجار المبرم بين الطرفين

المستندات المرفقة:

1. صورة من عقد الإيجار الموثق رقم [رقم_العقد]
2. صورة من إشعار الدفع وكشف حساب المستأجر
3. صورة من الإنذار الموجه للمستأجر
4. أي مستندات أخرى تدعم الدعوى

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

بناءً عليه،

يلتمس المدعي من عدالة اللجنة الموقرة الحكم بالآتي:

أولاً - من الناحية الشكلية:
   1. قبول الدعوى شكلاً لتقديمها وفق الأوضاع القانونية المقررة.

ثانياً - من الناحية الموضوعية:
   1. إلزام المدعى عليه بأن يؤدي للمدعي مبلغاً وقدره [اجمالي_المطالبة] درهم (القيمة الإيجارية المتأخرة + ضريبة القيمة المضافة).
   
   2. إلزام المدعى عليه بسداد ما يستجد من مبالغ إيجارية حتى تاريخ السداد الفعلي أو الإخلاء.
   
   3. إلزام المدعى عليه بالرسوم والمصاريف القضائية وأتعاب المحاماة.

وتفضلوا بقبول فائق الاحترام والتقدير

مقدم الطلب / المدعي
الاسم: [اسم_المدعي]
التوقيع: _______________
التاريخ: [تاريخ_اليوم]`;
        
        // جلب بيانات العقار والوحدة تلقائياً
        const propertyData = tenantPropertyData[tenantId];
        if (propertyData) {
          setNewCase(prev => ({
            ...prev, 
            client: tenant.name, 
            contactPhone: tenant.phone, 
            contactEmail: tenant.email,
            propertyName: propertyData.propertyName,
            unitNumber: propertyData.unitNumber,
            dueAmount: propertyData.dueAmount.toString(),
            priority: residentialTemplate
          }));
          
          // تعبئة البيانات تلقائياً بعد تحميل النموذج
          setTimeout(() => {
            fillTemplateData(tenant.name, tenantId, propertyData.propertyName, propertyData.unitNumber, propertyData.dueAmount.toString());
          }, 100);
        } else {
          setNewCase(prev => ({
            ...prev, 
            client: tenant.name, 
            contactPhone: tenant.phone, 
            contactEmail: tenant.email,
            priority: residentialTemplate
          }));
        }
        
        setTenantSearchTerm(''); // إزالة النص من خانة البحث
        setShowTenantSearch(false); // إغلاق قائمة البحث
      }
    } else if (payeeType === 'manual') {
      const company = allCommercialCompanies.find(c => c.id === tenantId);
      if (company) {
        console.log('Found company:', company.name);
        setSelectedTenantId(tenantId);
        
        // استخدام نفس النموذج السكني للشركات التجارية
        const residentialTemplate = `لجنة فض المنازعات الإيجارية بإمارة أم القيوين
لائحة الدعوى رقم          لسنة / 2025 منازعات إيجارية أم القيوين
المحدد لها جلسة بتاريخ      /       / 2025م

صحيفة الدعوى

مقدمة من المالك: [اسم_المدعي] - إماراتية الجنسية- حمل بطاقة هوية رقم ([هوية_المدعي])
العنوان : [عنوان_المدعي]
رقم الهاتف : [هاتف_المدعي]
الايميل : [ايميل_المدعي]

ضـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــد

المستأجر: [اسم_المدعى_عليه] – سير لانكا الجنسية- يحمل بطاقة هوية رقم ([هوية_المدعى_عليه])
العنوان: [عنوان_المدعى_عليه] – رقم الهاتف: [هاتف_المدعى_عليه]
الايميل : [ايميل_المدعى_عليه]

الوقائع والأسانيد :

أولاً : الوقـــائع

1/ بموجب عقد إيجار موثق بالرقم ([رقم_العقد]) الصادر بتاريخ ([تاريخ_العقد]) من دائرة بلدية أم القيوين، استأجر المستأجر من المالك عقار عبارة عن ([اسم_العقار]) في منطقة الظهر – أم القيوين لمدة عام ، في الفترة من [تاريخ_البداية] حتى تاريخ [تاريخ_النهاية] بقيمة إيجارية سنوية وتقدر بمبلغ وقدره [قيمة_الايجار] درهم، وبعد انتهاء عقد الإيجار.

يلتمس المالك من عدلكم الموقر القضاء لها بالاتي:

أولاً من الناحية الشكليه :
1/ قبول لائحة الدعوى شكلاً والتصريح بقيدها بأقرب وقت ممكن .

ثانيا : من الناحية الموضوعية :
1/ الزام المستأجر بأن يؤدي للمالك جميع المبالع المتاخرة والجديده
2/ الزام المستأجر بأن يسلم للمالك براءة ذمة من هيئة الكهرباء والمياه
3/ واخلاء العين المؤجرة وتسليمها خاليها من الشواغل
4/ الزام المستأجر بالرسوم والمصاريف القضائية

وتفضلوا بقبول فائق الاحترام والتقدير ....

مقدم الطلب
التوقيع :`;
        
        // جلب بيانات العقار والوحدة تلقائياً
        const propertyData = tenantPropertyData[tenantId];
        if (propertyData) {
          setNewCase(prev => ({
            ...prev, 
            client: company.name, 
            contactPhone: company.phone, 
            contactEmail: company.email,
            propertyName: propertyData.propertyName,
            unitNumber: propertyData.unitNumber,
            dueAmount: propertyData.dueAmount.toString(),
            priority: residentialTemplate
          }));
          
          // تعبئة البيانات تلقائياً بعد تحميل النموذج
          setTimeout(() => {
            fillTemplateData(company.name, tenantId, propertyData.propertyName, propertyData.unitNumber, propertyData.dueAmount.toString());
          }, 100);
        } else {
          setNewCase(prev => ({
            ...prev, 
            client: company.name, 
            contactPhone: company.phone, 
            contactEmail: company.email,
            priority: residentialTemplate
          }));
        }
        
        setTenantSearchTerm(''); // إزالة النص من خانة البحث
        setShowTenantSearch(false); // إغلاق قائمة البحث
      }
    }
  };

  const handleBusinessNameSelect = (businessName: string) => {
    setSelectedBusinessName(businessName);
    
    // جلب بيانات العقار ورقم الوحدة تلقائياً
    const mockPropertyData = {
      'شركة النخيل التجارية': {
        propertyName: 'مجمع النخيل التجاري',
        unitNumber: 'T-101',
        dueAmount: 15000
      },
      'مؤسسة النخيل العقارية': {
        propertyName: 'برج النخيل العقاري',
        unitNumber: 'R-205',
        dueAmount: 25000
      }
    };
    
    const propertyData = mockPropertyData[businessName as keyof typeof mockPropertyData];
    if (propertyData) {
      setNewCase(prev => ({
        ...prev,
        propertyName: propertyData.propertyName,
        unitNumber: propertyData.unitNumber,
        dueAmount: propertyData.dueAmount.toString()
      }));
    }
  };

  const handleAddCase = () => {
    if (!newCase.client || !newCase.priority || !newCase.assignedTo) {
      alert('يرجى ملء جميع الحقول المطلوبة (العميل، الأولوية، المُعين إلى)');
      return;
    }

    // إضافة القضية الجديدة إلى القائمة
    const newCaseItem = {
      id: Date.now(),
      caseNumber: `CASE-2024-${String(Date.now()).slice(-3)}`,
      title: newCase.description || 'قضية جديدة',
      client: newCase.client,
      status: 'نشط',
      priority: newCase.priority,
      assignedTo: newCase.assignedTo,
      createdAt: new Date().toISOString().split('T')[0],
      nextHearing: null,
      description: newCase.description
    };

    setCases(prev => [...prev, newCaseItem]);
    
    // إغلاق النافذة وإعادة تعيين البيانات
    setIsAddDialogOpen(false);
    handleResetCaseData();
    
    alert('تم إضافة القضية بنجاح!');
  };

  const handleResetCaseData = () => {
    setNewCase({
      client: '',
      priority: '',
      assignedTo: '',
      description: '',
      propertyName: '',
      unitNumber: '',
      dueAmount: '',
      submittedDate: new Date().toISOString().split('T')[0],
      contactPhone: '',
      contactEmail: ''
    });
    setPayeeType('tenant');
    setTenantSearchTerm('');
    setShowTenantSearch(false);
    setSelectedTenantId(null);
    setSelectedBusinessName('');
    setShowCompanyDetails(false);
  };

  const handleExportPetition = () => {
    const petitionContent = newCase.priority;
    if (!petitionContent.trim()) {
      alert('يرجى إدخال محتوى الدعوى أولاً');
      return;
    }

    // استبدال علامات البيانات المعبأة باللون الأحمر
    const formattedContent = petitionContent.replace(/🔴(.*?)🔴/g, '<span style="color: #dc2626; font-weight: bold;">$1</span>');

    // إنشاء محتوى HTML للدعوى
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لائحة الدعوى</title>
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
          <h1>لائحة الدعوى</h1>
          <p>تاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
        <div class="content">${formattedContent}</div>
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
            a.download = 'لائحة_الدعوى_' + new Date().toISOString().split('T')[0] + '.docx';
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

  const handleInputChange = (field: string, value: string) => {
    setNewCase(prev => ({
      ...prev,
      [field]: value
    }));
    
    // تحديث النموذج تلقائياً عند تغيير البيانات
    if (selectedTenantId && (field === 'propertyName' || field === 'unitNumber' || field === 'dueAmount')) {
      setTimeout(() => {
        const updatedCase = { ...newCase, [field]: value };
        fillTemplateData(
          updatedCase.client, 
          selectedTenantId, 
          updatedCase.propertyName, 
          updatedCase.unitNumber, 
          updatedCase.dueAmount
        );
      }, 100);
    }
  };

  const handleViewDetails = (caseId: number) => {
    alert(`عرض تفاصيل القضية ${caseId}`);
  };

  const handleUpdateStatus = (caseId: number) => {
    const currentCase = cases.find(c => c.id === caseId);
    setSelectedCaseId(caseId);
    setSelectedStatus(currentCase?.status || '');
    setIsStatusDialogOpen(true);
  };

  const handleConfirmStatusUpdate = () => {
    if (selectedCaseId && selectedStatus) {
      setCases(prevCases => 
        prevCases.map(case_ => 
          case_.id === selectedCaseId 
            ? { ...case_, status: selectedStatus as any }
            : case_
        )
      );
      setIsStatusDialogOpen(false);
      setSelectedCaseId(null);
      setSelectedStatus('');
    }
  };

  const handleAddDocument = (caseId: number) => {
    alert(`إضافة مستند للقضية ${caseId}`);
  };

  const handleScheduleHearing = (caseId: number) => {
    const hearingDate = prompt('أدخل تاريخ الجلسة (YYYY-MM-DD):');
    if (hearingDate) {
      alert(`تم جدولة جلسة للقضية ${caseId} في ${hearingDate}`);
    }
  };

  const handleDeleteCase = (caseId: number) => {
    if (confirm(`هل أنت متأكد من حذف القضية ${caseId}؟`)) {
      alert(`تم حذف القضية ${caseId}`);
    }
  };

  if (!canReadCases) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">لا توجد صلاحية للوصول</h2>
              <p className="text-muted-foreground">ليس لديك صلاحية لعرض القضايا.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* شريط علوي */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة للوحة التحكم
              </Button>
            </Link>
            <Badge variant="outline" className="text-sm">
              النظام القانوني
            </Badge>
          </div>
        </div>

        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">القضايا القانونية</h1>
          <p className="text-muted-foreground">إدارة ومتابعة القضايا القانونية والإجراءات</p>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي القضايا</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cases.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">القضايا النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {cases.filter(c => c.status === 'نشط').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">القضايا المعلقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {cases.filter(c => c.status === 'معلق').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">القضايا المحلولة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {cases.filter(c => c.status === 'محلول').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أزرار الإجراءات */}
        {canCreateCases && (
          <div className="mb-6 flex gap-4">
            <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة قضية جديدة
                </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    إضافة قضية جديدة
                  </DialogTitle>
                  <DialogDescription>
                    إنشاء قضية قانونية جديدة.
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
                                <p className="text-sm text-green-700">{newCase.client}</p>
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
                            <div className="flex items-center justify-between">
                              <div 
                                className="cursor-pointer"
                                onClick={() => {
                                  setSelectedBusinessName(newCase.client);
                                  setNewCase({...newCase, client: ''});
                                  
                                  // جلب بيانات العقار ورقم الوحدة تلقائياً للمستأجر الشخصي
                                  const mockPersonalPropertyData = {
                                    'أحمد محمد علي': {
                                      propertyName: 'فيلا أحمد الشخصية',
                                      unitNumber: 'V-001',
                                      dueAmount: 12000
                                    }
                                  };
                                  
                                  const personalPropertyData = mockPersonalPropertyData[newCase.client as keyof typeof mockPersonalPropertyData];
                                  if (personalPropertyData) {
                                    setNewCase(prev => ({
                                      ...prev,
                                      propertyName: personalPropertyData.propertyName,
                                      unitNumber: personalPropertyData.unitNumber,
                                      dueAmount: personalPropertyData.dueAmount.toString()
                                    }));
                                  }
                                }}
                              >
                                <p className="text-sm font-medium text-green-800">المستأجر المحدد:</p>
                                <p className="text-sm text-green-700">{newCase.client}</p>
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
                                  const tenant = allTenants.find(t => t.id === selectedTenantId);
                                  return tenant ? (
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <p><span className="font-medium">رقم الهوية:</span> {tenant.idNumber}</p>
                                      <p><span className="font-medium">الهاتف:</span> {tenant.phone}</p>
                                      <p><span className="font-medium">البريد الإلكتروني:</span> {tenant.email}</p>
                                    </div>
                                  ) : null;
                                })()}
                              </div>
                            )}
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
                                className={`p-3 border rounded-lg transition-colors ${
                                  selectedBusinessName === businessName 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div 
                                    className="flex items-center cursor-pointer"
                                    onClick={() => handleBusinessNameSelect(businessName)}
                                  >
                                    <Pencil className="h-4 w-4 text-green-600 mr-2" />
                                    <span className="text-sm font-medium">{businessName}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      handleBusinessNameSelect(businessName);
                                      setShowCompanyDetails(!showCompanyDetails);
                                    }}
                                    className="text-xs"
                                  >
                                    {selectedBusinessName === businessName && showCompanyDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                                  </Button>
                                </div>
                                
                                {/* عرض التفاصيل في نفس الحقل */}
                                {selectedBusinessName === businessName && showCompanyDetails && (
                                  <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-800 mb-2">تفاصيل إضافية:</h4>
                                    <div className="space-y-1 text-xs text-gray-600">
                                      <p><span className="font-medium">الاسم التجاري:</span> {businessName}</p>
                                      <p><span className="font-medium">صاحب الرخصة:</span> {selectedTenant?.name}</p>
                                      <p><span className="font-medium">رقم الهوية:</span> {selectedTenant?.idNumber}</p>
                                      <p><span className="font-medium">الهاتف:</span> {selectedTenant?.phone}</p>
                                      <p><span className="font-medium">البريد الإلكتروني:</span> {selectedTenant?.email}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {selectedBusinessName && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm font-medium text-green-800">
                                {selectedBusinessName === newCase.client ? 'الاسم الشخصي المحدد:' : 'الاسم التجاري المحدد:'}
                              </p>
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
                        <Label htmlFor="propertyName">اسم العقار</Label>
                        <Input
                          id="propertyName"
                          value={newCase.propertyName}
                          onChange={(e) => handleInputChange('propertyName', e.target.value)}
                          placeholder="أدخل اسم العقار"
                        />
                      </div>
                      <div>
                        <Label htmlFor="unitNumber">رقم الوحدة</Label>
                        <Input
                          id="unitNumber"
                          value={newCase.unitNumber}
                          onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                          placeholder="أدخل رقم الوحدة"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dueAmount">المبلغ المستحق</Label>
                        <Input
                          id="dueAmount"
                          type="number"
                          value={newCase.dueAmount}
                          onChange={(e) => handleInputChange('dueAmount', e.target.value)}
                          placeholder="أدخل المبلغ المستحق"
                        />
                      </div>
                      <div>
                        <Label htmlFor="submittedDate" className="block text-right">تاريخ تقديم الطلب</Label>
                        <Input
                          id="submittedDate"
                          type="date"
                          value={newCase.submittedDate}
                          onChange={(e) => handleInputChange('submittedDate', e.target.value)}
                          lang="en"
                        />
                      </div>
                    </div>

                  {/* نموذج إضافة الدعوى */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        نموذج الدعوى
                      </h3>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if (selectedTenantId) {
                              fillTemplateData(
                                newCase.client, 
                                selectedTenantId, 
                                newCase.propertyName, 
                                newCase.unitNumber, 
                                newCase.dueAmount
                              );
                              alert('✓ تم تعبئة البيانات في النموذج بنجاح!');
                            } else {
                              alert('⚠️ يرجى اختيار المستأجر أولاً');
                            }
                          }}
                          className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                        >
                          🔄 تعبئة البيانات
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            clearFilledData();
                            alert('✓ تم تفريغ البيانات المعبأة!');
                          }}
                          className="text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                        >
                          🗑️ تفريغ البيانات
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // حفظ النموذج الحالي في localStorage للتمييز
                            if (newCase.priority && newCase.priority.trim()) {
                              localStorage.setItem('currentActiveTemplate', newCase.priority.replace(/🔴/g, ''));
                            }
                            // فتح صفحة النماذج في نافذة جديدة
                            window.open('/dashboard/legal/petition-templates', '_blank');
                          }}
                          className="text-xs"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          اختيار/تعديل نموذج
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setIsSaveTemplateDialogOpen(true);
                          }}
                          className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                        >
                          💾 حفظ النموذج
                        </Button>
                      </div>
                    </div>

                    <div className="border rounded-md bg-white shadow-sm">
                      {/* شريط أدوات التنسيق */}
                      <div className="border-b p-3 bg-gray-100 flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-700">أدوات التنسيق:</span>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const text = newCase.priority;
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
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleExportPetition()}
                          className="text-xs"
                        >
                          📄 معاينة
                        </Button>
                      </div>
                      
                      {/* منطقة النص */}
                      <div className="p-4">
                        <Textarea
                          id="petition"
                          value={newCase.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          placeholder="اكتب تفاصيل الدعوى هنا أو انسخ نموذجاً جاهزاً من صفحة النماذج..."
                          className="min-h-[600px] resize-y border-0 bg-transparent text-sm leading-relaxed"
                          rows={30}
                          style={{
                            fontFamily: 'Arial, sans-serif',
                            lineHeight: '1.8',
                            direction: 'rtl',
                            textAlign: 'right'
                          }}
                        />
                      </div>
                      
                      <div className="border-t p-3 bg-gray-50 text-xs text-gray-500 text-center">
                        💡 يمكنك كتابة الدعوى مباشرة أو نسخ نموذج جاهز من صفحة النماذج
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="assignedTo">مُعين إلى *</Label>
                    <Input
                      id="assignedTo"
                      value={newCase.assignedTo}
                      onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                        placeholder="أدخل الفريق/الشخص المُعين"
                    />
                  </div>

                  <div className="grid gap-2">
                      <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={newCase.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="أدخل وصف القضية"
                      rows={3}
                    />
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleAddCase}>
                    إضافة القضية
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline"
              onClick={() => {
                window.open('/dashboard/legal/petition-templates', '_blank');
                alert('تم فتح صفحة نماذج الدعاوى. يمكنك تصفح جميع النماذج المتاحة.');
              }}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              نماذج الدعاوى
            </Button>
          </div>
        )}

        {/* قائمة القضايا */}
        <div className="grid gap-6">
          {cases.map((caseItem) => (
            <Card key={caseItem.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                    <CardDescription className="mt-1">
                      القضية #{caseItem.caseNumber} • العميل: {caseItem.client}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className={statusColors[caseItem.status as keyof typeof statusColors]}>
                      {caseItem.status}
                    </Badge>
                    <Badge className={priorityColors[caseItem.priority as keyof typeof priorityColors]}>
                      {caseItem.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{caseItem.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">مُعين إلى:</span>
                      <p className="text-muted-foreground">{caseItem.assignedTo}</p>
                    </div>
                    <div>
                      <span className="font-medium">تاريخ الإنشاء:</span>
                      <p className="text-muted-foreground">{caseItem.createdAt}</p>
                    </div>
                    <div>
                      <span className="font-medium">الجلسة القادمة:</span>
                      <p className="text-muted-foreground">{caseItem.nextHearing || 'غير مجدولة'}</p>
                    </div>
                    <div>
                      <span className="font-medium">رقم القضية:</span>
                      <p className="text-muted-foreground">{caseItem.id}</p>
                    </div>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {canReadCases && (
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(caseItem.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        عرض التفاصيل
                      </Button>
                    )}
                    {canUpdateCases && (
                      <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(caseItem.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        تحديث الحالة
                      </Button>
                    )}
                    {canAddDocuments && (
                      <Button variant="outline" size="sm" onClick={() => handleAddDocument(caseItem.id)}>
                        <FileText className="h-4 w-4 mr-2" />
                        إضافة مستند
                      </Button>
                    )}
                    {canScheduleHearings && (
                      <Button variant="outline" size="sm" onClick={() => handleScheduleHearing(caseItem.id)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        جدولة جلسة
                      </Button>
                    )}
                    {canDeleteCases && (
                      <Button variant="outline" size="sm" onClick={() => handleDeleteCase(caseItem.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4 mr-2" />
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* نافذة اختيار النموذج */}
      <Dialog open={showTemplateSelectionDialog} onOpenChange={setShowTemplateSelectionDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-blue-600" />
              اختر نموذج الدعوى
            </DialogTitle>
            <DialogDescription>
              اختر النموذج المناسب من القائمة أدناه، ثم ستتمكن من ملء بيانات القضية
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* إحصائيات سريعة */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">نماذج الدعاوى المتاحة</h3>
                  <p className="text-sm text-blue-700">اختر النموذج المناسب لبدء إنشاء القضية</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open('/dashboard/legal/petition-templates', '_blank');
                  }}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  تصفح جميع النماذج
                </Button>
            </div>
          </div>

            {/* قائمة النماذج */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* نموذج دعوى إخلاء */}
              <div 
                className="border-2 border-green-200 rounded-lg p-5 hover:bg-green-50 transition-all cursor-pointer hover:shadow-lg group"
                onClick={() => {
                  setNewCase(prev => ({
                    ...prev,
                    priority: `لجنة فض المنازعات الإيجارية بإمارة أم القيوين
لائحة الدعوى رقم          لسنة / 2025 منازعات إيجارية أم القيوين
المحدد لها جلسة بتاريخ      /       / 2025م

صحيفة الدعوى

مقدمة من المالك: [اسم_المدعي] - إماراتية الجنسية- حمل بطاقة هوية رقم ([هوية_المدعي])
العنوان : [عنوان_المدعي]
رقم الهاتف : [هاتف_المدعي]
الايميل : [ايميل_المدعي]

ضـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــد

المستأجر: [اسم_المدعى_عليه] – سير لانكا الجنسية- يحمل بطاقة هوية رقم ([هوية_المدعى_عليه])
العنوان: [عنوان_المدعى_عليه] – رقم الهاتف: [هاتف_المدعى_عليه]
الايميل : [ايميل_المدعى_عليه]

الوقائع والأسانيد :

أولاً : الوقـــائع

1/ بموجب عقد إيجار موثق بالرقم ([رقم_العقد]) الصادر بتاريخ ([تاريخ_العقد]) من دائرة بلدية أم القيوين، استأجر المستأجر من المالك عقار عبارة عن ([اسم_العقار]) في منطقة الظهر – أم القيوين لمدة عام ، في الفترة من [تاريخ_البداية] حتى تاريخ [تاريخ_النهاية] بقيمة إيجارية سنوية وتقدر بمبلغ وقدره [قيمة_الايجار] درهم، وبعد انتهاء عقد الإيجار.

يلتمس المالك من عدلكم الموقر القضاء لها بالاتي:

أولاً من الناحية الشكليه :
1/ قبول لائحة الدعوى شكلاً والتصريح بقيدها بأقرب وقت ممكن .

ثانيا : من الناحية الموضوعية :
1/ الزام المستأجر بأن يؤدي للمالك جميع المبالع المتاخرة والجديده
2/ الزام المستأجر بأن يسلم للمالك براءة ذمة من هيئة الكهرباء والمياه
3/ واخلاء العين المؤجرة وتسليمها خاليها من الشواغل
4/ الزام المستأجر بالرسوم والمصاريف القضائية

وتفضلوا بقبول فائق الاحترام والتقدير ....

مقدم الطلب
التوقيع :`
                  }));
                  setShowTemplateSelectionDialog(false);
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-7 w-7 text-green-600" />
                </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">لائحة دعوى إخلاء</h3>
                    <p className="text-sm text-gray-600 mb-2">منازعات إيجارية - أم القيوين</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-100 text-green-700 text-xs">إخلاء</Badge>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">منازعات إيجارية</Badge>
                </div>
                </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  نموذج شامل لدعاوى الإخلاء بسبب عدم دفع الإيجار، يتضمن جميع البنود القانونية المطلوبة
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-green-100">
                  <span className="text-xs text-gray-500">✓ جاهز للاستخدام</span>
                  <span className="text-sm font-medium text-green-600 group-hover:text-green-700">
                    انقر للاختيار →
                  </span>
              </div>
            </div>

              {/* نموذج دعوى مالية */}
              <div 
                className="border-2 border-blue-200 rounded-lg p-5 hover:bg-blue-50 transition-all cursor-pointer hover:shadow-lg group"
                onClick={() => {
                  setNewCase(prev => ({
                    ...prev,
                    priority: `لجنة فض المنازعات الإيجارية بإمارة دبي
دعوى مطالبة مالية - تأخير إيجار

المدعي: [اسم_المدعي]
الهوية: [هوية_المدعي]
العنوان: [عنوان_المدعي]

المدعى عليه: [اسم_المدعى_عليه]
الهوية: [هوية_المدعى_عليه]
العنوان: [عنوان_المدعى_عليه]

الوقائع:
1. تم إبرام عقد إيجار برقم [رقم_العقد] بتاريخ [تاريخ_العقد]
2. المبلغ المتأخر: [المبلغ_المتأخر] درهم
3. فترة التأخير: من [تاريخ_البداية] إلى [تاريخ_النهاية]

الطلب:
يلتمس المدعي إلزام المدعى عليه بدفع المبلغ المتأخر والفوائد القانونية.`
                  }));
                  setShowTemplateSelectionDialog(false);
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-7 w-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">دعوى مطالبة مالية</h3>
                    <p className="text-sm text-gray-600 mb-2">تأخير إيجار - دبي</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-100 text-blue-700 text-xs">مالية</Badge>
                      <Badge className="bg-purple-100 text-purple-700 text-xs">مطالبة</Badge>
                  </div>
                </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  نموذج للمطالبات المالية وتأخير الإيجارات مع الفوائد القانونية
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-blue-100">
                  <span className="text-xs text-gray-500">✓ جاهز للاستخدام</span>
                  <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                    انقر للاختيار →
                  </span>
                </div>
              </div>

              {/* نموذج دعوى عقارية */}
              <div 
                className="border-2 border-purple-200 rounded-lg p-5 hover:bg-purple-50 transition-all cursor-pointer hover:shadow-lg group"
                onClick={() => {
                  setNewCase(prev => ({
                    ...prev,
                    priority: `لجنة فض المنازعات الإيجارية بإمارة أبوظبي
دعوى إخلاء - مخالفة شروط العقد

المدعي: [اسم_المدعي]
المدعى عليه: [اسم_المدعى_عليه]

الوقائع:
1. العقد رقم [رقم_العقد] بتاريخ [تاريخ_العقد]
2. العقار: [اسم_العقار]
3. المخالفة: عدم دفع الإيجار لمدة تزيد عن شهرين
4. المبلغ المتأخر: [المبلغ_المتأخر] درهم

الطلب:
إخلاء العقار وتسليمه للمدعي مع دفع المبالغ المستحقة.`
                  }));
                  setShowTemplateSelectionDialog(false);
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText className="h-7 w-7 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">دعوى عقارية</h3>
                    <p className="text-sm text-gray-600 mb-2">مخالفة شروط العقد - أبوظبي</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-purple-100 text-purple-700 text-xs">عقارية</Badge>
                      <Badge className="bg-red-100 text-red-700 text-xs">مخالفة</Badge>
                  </div>
                </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  نموذج لدعاوى الإخلاء بسبب مخالفة شروط العقد
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-purple-100">
                  <span className="text-xs text-gray-500">✓ جاهز للاستخدام</span>
                  <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
                    انقر للاختيار →
                  </span>
                </div>
              </div>

              {/* خيار فارغ */}
              <div 
                className="border-2 border-gray-200 rounded-lg p-5 hover:bg-gray-50 transition-all cursor-pointer hover:shadow-lg group"
                onClick={() => {
                  setNewCase(prev => ({
                    ...prev,
                    priority: ''
                  }));
                  setShowTemplateSelectionDialog(false);
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="h-7 w-7 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">نموذج فارغ</h3>
                    <p className="text-sm text-gray-600 mb-2">ابدأ من الصفر</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-gray-100 text-gray-700 text-xs">مخصص</Badge>
                  </div>
                </div>
              </div>
                <p className="text-sm text-gray-600 mb-3">
                  ابدأ بنموذج فارغ واكتب الدعوى بنفسك من البداية
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">✓ مرونة كاملة</span>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-gray-700">
                    انقر للاختيار →
                  </span>
                  </div>
                  </div>
                </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setShowTemplateSelectionDialog(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* حوار تحديث الحالة */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>تحديث حالة القضية</DialogTitle>
            <DialogDescription>
              اختر الحالة الجديدة للقضية
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">الحالة الجديدة</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]?.split(' ')[0]}`}></span>
                        {status}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              </div>
            </div>

            <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                إلغاء
              </Button>
            <Button onClick={handleConfirmStatusUpdate} disabled={!selectedStatus}>
              تأكيد التحديث
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      {/* حوار حفظ النموذج */}
      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              💾 حفظ النموذج المعدل
            </DialogTitle>
            <DialogDescription>
              احفظ النموذج المعدل كنموذج جديد يمكنك استخدامه في المستقبل
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="templateName">اسم النموذج</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="مثال: نموذج إخلاء مخصص 2025"
                className="mt-2"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">معلومات النموذج</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• النوع: {payeeType === 'tenant' ? 'نموذج سكني' : 'نموذج تجاري'}</li>
                    <li>• سيتم إزالة العلامات الحمراء تلقائياً</li>
                    <li>• يمكنك الوصول إليه من صفحة نماذج الدعاوى</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSaveTemplateDialogOpen(false);
                setTemplateName('');
              }}
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveTemplate} className="bg-blue-600 hover:bg-blue-700">
              💾 حفظ النموذج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}