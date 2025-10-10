'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Eye, Edit, FileText, Download, Search, Building, User, Calendar, Trash2, Save, X, Bold, Italic, Underline, AlignRight, AlignLeft, AlignCenter, Type, Palette, Code, Tag } from 'lucide-react';
import Link from 'next/link';
import { hasPermission } from '@/lib/permissions';

// بيانات وهمية لنماذج الدعاوى
const petitionTemplates = [
  {
    id: 1,
    title: 'نموذج دعوى - منازعات إيجارية',
    category: 'إخلاء',
    emirate: 'أم القيوين',
    content: `لجنة فض المنازعات الإيجارية بإمارة أم القيوين
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

(مستند رقم (1) عبارة عن عقد الايجار الأول رقم .... TC-222.......)

2/ إلا أن المستأجر لم يلتزم بسداد القيمة الايجارية عن العقد رقم ([رقم_العقد]) المحرر بتاريخ من [تاريخ_البداية] حتى [تاريخ_النهاية] مع العلم ان المتبقي للسداد من العقد مبلغ وقدره [المبلغ_المتأخر] درهم المبلغ المتبقي كما انه لم يتم تجدد عقد الايجار ، مما دفع المالك لإقامة هذه الدعوى لإلزام المستأجر بسداد القيمة الايجارية من تاريخ [تاريخ_اليوم] حتى [تاريخ_النهاية] وهذه هي المده الافتراضية التي كان يجب فيها تجديد عقد الايجار والتي تقدر بمبلغ وقدره [قيمة_الايجار] درهم من زيادة نسبة 10% قيمة الايجار لسنه الميلادية بالاضافة الى مبلغ ( 300) ( 5% ) للهيئة الاتحادية لضرائب الى تاريخ الاخلاء الفعلي .

يلتمس المالك من عدلكم الموقر القضاء لها بالاتي:

أولاً من الناحية الشكليه :
1/ قبول لائحة الدعوى شكلاً والتصريح بقيدها بأقرب وقت ممكن .

ثانيا : من الناحية الموضوعية :
1/ الزام المستأجر بأن يؤدي للمالك جميع المبالع المتاخرة والجديده مع إلزام المستأجر بمبلغ الضريبة ( 5 % ) درهم تشمل القيمة الايجارية المتأخرة عن الفترة من من 01/02/2022 حتى 31/01/2023, وما يستجد من مستحقات ايجارية حتي تمام السداد وحتى تاريخ الاخلاء الفعلي .

2/ الزام المستأجر بأن يسلم للمالك براءة ذمة من هيئة الكهرباء والمياه والغاز للفواتير المستحقة على المأجور طوال مدة الايجار و حتى تاريخه.

3/ واخلاء العين المؤجرة وتسليمها خاليها من الشواغل.

4/ الزام المستأجر بالرسوم والمصاريف القضائية .

وتفضلوا بقبول فائق الاحترام والتقدير ....

مقدم الطلب
التوقيع :`,
    createdAt: '2024-01-15',
    lastModified: '2024-01-20',
    usageCount: 25
  }
];

// نموذج المسودة الجديدة
const defaultNewTemplate = {
  id: Date.now(),
  title: '',
  category: 'إخلاء',
  emirate: 'أم القيوين',
  content: '',
  createdAt: new Date().toISOString().split('T')[0],
  lastModified: new Date().toISOString().split('T')[0],
  usageCount: 0
};

// قوالب عناوين النماذج
const templateTitles = [
  'نموذج دعوى - منازعات إيجارية'
];

const categories = ['إخلاء', 'منازعات إيجارية'];
const emirates = ['أم القيوين'];

// بيانات وهمية للطلبات
const petitionRequests = [
  {
    id: 1,
    clientName: 'عبدالله محمد بن عمير ال علي',
    clientId: '784-1945-4384241-1',
    clientPhone: '0522020200',
    clientEmail: 'uaq907@gmail.com',
    propertyName: 'محل تجاري في منطقة الظهر',
    caseType: 'إخلاء',
    amount: '6,000',
    description: 'عدم دفع الإيجار لمدة 6 أشهر',
    status: 'جديد',
    createdAt: '2024-01-20',
    priority: 'عالي'
  },
  {
    id: 2,
    clientName: 'سارة أحمد السعيد',
    clientId: '784-1988-1234567-2',
    clientPhone: '0501234567',
    clientEmail: 'sara.ahmed@email.com',
    propertyName: 'شقة سكنية - برج السلام',
    caseType: 'مالية',
    amount: '4,500',
    description: 'مطالبة بدفع الإيجار المتأخر',
    status: 'قيد المراجعة',
    createdAt: '2024-01-18',
    priority: 'متوسط'
  },
  {
    id: 3,
    clientName: 'محمد عبدالرحمن الكندي',
    clientId: '784-1975-9876543-1',
    clientPhone: '0559876543',
    clientEmail: 'mohammed.kindi@email.com',
    propertyName: 'مكتب تجاري - منطقة الصناعية',
    caseType: 'تجارية',
    amount: '8,000',
    description: 'نزاع على شروط العقد التجاري',
    status: 'جديد',
    createdAt: '2024-01-22',
    priority: 'منخفض'
  }
];

interface PetitionTemplatesClientProps {
  loggedInEmployee: any;
}

export default function PetitionTemplatesClient({ loggedInEmployee }: PetitionTemplatesClientProps) {
  const [templates, setTemplates] = useState(petitionTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showRealData, setShowRealData] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isPreviewEditing, setIsPreviewEditing] = useState(false);
  const [previewEditingContent, setPreviewEditingContent] = useState('');
  const [showRequestsDialog, setShowRequestsDialog] = useState(false);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requests, setRequests] = useState(petitionRequests);
  const [isEditingEnabled, setIsEditingEnabled] = useState(true);
  const [isCustomTitle, setIsCustomTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [currentActiveTemplate, setCurrentActiveTemplate] = useState<string>('');
  const [formattingOptions, setFormattingOptions] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: '14px',
    fontFamily: 'Arial',
    textAlign: 'right',
    textColor: '#dc2626'
  });

  const [newTemplate, setNewTemplate] = useState({
    title: '',
    category: '',
    emirate: '',
    content: ''
  });

  const [newRequest, setNewRequest] = useState({
    clientName: '',
    clientId: '',
    clientPhone: '',
    clientEmail: '',
    propertyName: '',
    caseType: '',
    amount: '',
    description: '',
    priority: 'متوسط'
  });

  // بيانات تجريبية للمالك والمستأجر
  const sampleData = {
    اسم_المدعي: 'عبدالله محمد بن عمير ال علي',
    هوية_المدعي: '784-1945-4384241-1',
    عنوان_المدعي: 'أم القيوين – الظهر – بجانب محمل محمد سلطان للالكترونيات',
    هاتف_المدعي: '0522020200',
    ايميل_المدعي: 'uaq907@gmail.com',
    اسم_المدعى_عليه: 'رانجا جايابات هيرات موديانسيلاجي',
    هوية_المدعى_عليه: '2-15305482-1979-784',
    عنوان_المدعى_عليه: 'أم القيوين – الظهر – بجانب محمل محمد سلطان للالكترونيات',
    هاتف_المدعى_عليه: '0524259991',
    ايميل_المدعى_عليه: 'ranga.java79@yahoo.com',
    اسم_العقار: 'محل تجاري في منطقة الظهر',
    رقم_العقد: 'TC-222',
    تاريخ_العقد: '1-1-2021',
    قيمة_الايجار: '6,000',
    تاريخ_البداية: '01/02/2022',
    تاريخ_النهاية: '31/01/2023',
    المبلغ_المتأخر: '2,500',
    تاريخ_اليوم: new Date().toLocaleDateString('ar-SA')
  };

  // تحميل النماذج من localStorage مع دمج النماذج الجديدة
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedTemplates = localStorage.getItem('petitionTemplates');
      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        // دمج النماذج الافتراضية مع المحفوظة (إضافة النماذج الجديدة)
        const defaultIds = petitionTemplates.map(t => t.id);
        const savedIds = parsed.map((t: any) => t.id);
        
        // إضافة النماذج الافتراضية الجديدة التي لا توجد في المحفوظة
        const newTemplates = petitionTemplates.filter(t => !savedIds.includes(t.id));
        
        if (newTemplates.length > 0) {
          const merged = [...parsed, ...newTemplates];
          setTemplates(merged);
          localStorage.setItem('petitionTemplates', JSON.stringify(merged));
        } else {
          setTemplates(parsed);
        }
      } else {
        // أول مرة: حفظ النماذج الافتراضية
        setTemplates(petitionTemplates);
        localStorage.setItem('petitionTemplates', JSON.stringify(petitionTemplates));
      }
      
      // تحميل حالة التعديل
      const savedEditingState = localStorage.getItem('templatesEditingEnabled');
      if (savedEditingState) {
        setIsEditingEnabled(JSON.parse(savedEditingState));
      }
    } catch (error) {
      console.error('Error loading templates from localStorage:', error);
    }
  }, []);

  // قراءة النموذج النشط من localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const activeTemplate = localStorage.getItem('currentActiveTemplate');
      if (activeTemplate) {
        setCurrentActiveTemplate(activeTemplate);
      }
    } catch (error) {
      console.error('Error loading active template:', error);
    }
  }, []);

  // حفظ النماذج في localStorage
  const saveTemplates = (updatedTemplates: any[]) => {
    setTemplates(updatedTemplates);
    localStorage.setItem('petitionTemplates', JSON.stringify(updatedTemplates));
  };

  // فلترة النماذج
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || selectedCategory === 'all' || template.category === selectedCategory;
    const matchesEmirate = selectedEmirate === '' || selectedEmirate === 'all' || template.emirate === selectedEmirate;
    
    return matchesSearch && matchesCategory && matchesEmirate;
  });

  // إنشاء نموذج جديد
  const handleCreateTemplate = () => {
    if (!newTemplate.title || !newTemplate.category || !newTemplate.emirate || !newTemplate.content) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const template = {
      id: Date.now(),
      ...newTemplate,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      usageCount: 0
    };

    const updatedTemplates = [...templates, template];
    saveTemplates(updatedTemplates);
    
    setNewTemplate({ title: '', category: '', emirate: '', content: '' });
    setIsCustomTitle(false);
    setCustomTitle('');
    setShowCreateDialog(false);
    alert('تم إنشاء النموذج بنجاح!');
  };

  // تحديث نموذج
  const handleUpdateTemplate = () => {
    const updatedTemplates = templates.map(template => 
      template.id === selectedTemplate?.id 
        ? { ...template, ...newTemplate, lastModified: new Date().toISOString().split('T')[0] }
        : template
    );
    
    saveTemplates(updatedTemplates);
    setShowEditDialog(false);
    setSelectedTemplate(null);
    setIsCustomTitle(false);
    setCustomTitle('');
    alert('تم تحديث النموذج بنجاح!');
  };

  // حذف نموذج
  const handleDeleteTemplate = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا النموذج؟')) {
      const updatedTemplates = templates.filter(template => template.id !== id);
      saveTemplates(updatedTemplates);
      alert('تم حذف النموذج بنجاح!');
    }
  };

  // معاينة نموذج
  const handlePreviewTemplate = (template: any) => {
    setSelectedTemplate(template);
    setPreviewEditingContent(template.content);
    setIsPreviewEditing(false);
    setShowPreviewDialog(true);
  };

  // بدء التعديل في المعاينة
  const handleStartPreviewEdit = () => {
    setIsPreviewEditing(true);
    setPreviewEditingContent(selectedTemplate?.content || '');
  };

  // حفظ التعديل في المعاينة
  const handleSavePreviewEdit = () => {
    if (selectedTemplate && previewEditingContent.trim()) {
      const updatedTemplates = templates.map(template => 
        template.id === selectedTemplate.id 
          ? { ...template, content: previewEditingContent, lastModified: new Date().toISOString().split('T')[0] }
          : template
      );
      
      saveTemplates(updatedTemplates);
      setSelectedTemplate((prev: any) => ({ ...prev, content: previewEditingContent }));
      setIsPreviewEditing(false);
      alert('تم حفظ التعديل بنجاح!');
    }
  };

  // إلغاء التعديل في المعاينة
  const handleCancelPreviewEdit = () => {
    setIsPreviewEditing(false);
    setPreviewEditingContent(selectedTemplate?.content || '');
  };

  // إنشاء طلب جديد
  const handleCreateRequest = () => {
    if (!newRequest.clientName || !newRequest.clientId || !newRequest.propertyName || !newRequest.caseType) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const request = {
      id: Date.now(),
      ...newRequest,
      status: 'جديد',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRequests(prev => [...prev, request]);
    setNewRequest({
      clientName: '',
      clientId: '',
      clientPhone: '',
      clientEmail: '',
      propertyName: '',
      caseType: '',
      amount: '',
      description: '',
      priority: 'متوسط'
    });
    setShowNewRequestDialog(false);
    alert('تم إنشاء الطلب بنجاح!');
  };

  // اختيار طلب لملء النموذج
  const handleSelectRequest = (request: any) => {
    setSelectedRequest(request);
    setShowRequestsDialog(false);
    
    // ملء البيانات في النموذج المحدد
    const filledData = {
      اسم_المدعي: request.clientName,
      هوية_المدعي: request.clientId,
      عنوان_المدعي: request.propertyName,
      هاتف_المدعي: request.clientPhone,
      ايميل_المدعي: request.clientEmail,
      اسم_العقار: request.propertyName,
      قيمة_الايجار: request.amount,
      تاريخ_اليوم: new Date().toLocaleDateString('ar-SA')
    };

    // تطبيق البيانات على النموذج المحدد
    if (selectedTemplate) {
      const filledContent = Object.keys(filledData).reduce((content, key) => {
        return content.replace(new RegExp(`\\[${key}\\]`, 'g'), filledData[key as keyof typeof filledData]);
      }, selectedTemplate.content);
      setSelectedTemplate((prev: any) => ({ ...prev, content: filledContent }));
    }
    
    alert(`تم ملء النموذج ببيانات الطلب: ${request.clientName}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'جديد':
        return 'bg-green-100 text-green-800';
      case 'قيد المراجعة':
        return 'bg-yellow-100 text-yellow-800';
      case 'مكتمل':
        return 'bg-blue-100 text-blue-800';
      case 'ملغي':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عالي':
        return 'bg-red-100 text-red-800';
      case 'متوسط':
        return 'bg-yellow-100 text-yellow-800';
      case 'منخفض':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // تحميل نموذج
  const handleDownloadTemplate = (template: any) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${template.title}</title>
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
          <h1>${template.title}</h1>
          <p>الفئة: ${template.category} | الإمارة: ${template.emirate}</p>
          <p>تاريخ الإنشاء: ${template.createdAt}</p>
        </div>
        <div class="content">${template.content}</div>
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
            a.download = '${template.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.docx';
            a.click();
          }
          
          function downloadAsPDF() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    const newWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  // تعديل نموذج
  const handleEditTemplate = (template: any) => {
    setSelectedTemplate(template);
    
    // تحقق إذا كان العنوان من القائمة المحددة أو مخصص
    const isInList = templateTitles.includes(template.title);
    setIsCustomTitle(!isInList);
    setCustomTitle(!isInList ? template.title : '');
    
    setNewTemplate({
      title: template.title,
      category: template.category,
      emirate: template.emirate,
      content: template.content
    });
    setShowEditDialog(true);
  };

  // نسخ نموذج
  const handleDuplicateTemplate = (template: any) => {
    const duplicatedTemplate = {
      ...template,
      id: Date.now(),
      title: `${template.title} (نسخة)`,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      usageCount: 0
    };

    const updatedTemplates = [...templates, duplicatedTemplate];
    saveTemplates(updatedTemplates);
    alert('تم نسخ النموذج بنجاح!');
  };

  // إعادة تعيين النماذج
  const handleResetTemplates = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع النماذج؟ سيتم حذف جميع التعديلات.')) {
      setTemplates(petitionTemplates);
      localStorage.setItem('petitionTemplates', JSON.stringify(petitionTemplates));
      alert('تم إعادة تعيين النماذج بنجاح! ✓');
    }
  };
  
  // تحديث النماذج (إضافة النماذج الجديدة فقط)
  const handleUpdateTemplates = () => {
    const savedTemplates = localStorage.getItem('petitionTemplates');
    if (savedTemplates) {
      const parsed = JSON.parse(savedTemplates);
      const savedIds = parsed.map((t: any) => t.id);
      const newTemplates = petitionTemplates.filter(t => !savedIds.includes(t.id));
      
      if (newTemplates.length > 0) {
        const merged = [...parsed, ...newTemplates];
        setTemplates(merged);
        localStorage.setItem('petitionTemplates', JSON.stringify(merged));
        alert(`تم إضافة ${newTemplates.length} نموذج جديد! ✓\n\n${newTemplates.map(t => '• ' + t.title).join('\n')}`);
      } else {
        alert('جميع النماذج محدثة! ✓');
      }
    } else {
      setTemplates(petitionTemplates);
      localStorage.setItem('petitionTemplates', JSON.stringify(petitionTemplates));
      alert('تم تحميل النماذج الافتراضية! ✓');
    }
  };
  
  // تبديل حالة التعديل
  const toggleEditingMode = () => {
    const newState = !isEditingEnabled;
    setIsEditingEnabled(newState);
    localStorage.setItem('templatesEditingEnabled', JSON.stringify(newState));
    
    if (newState) {
      alert('✅ تم تفعيل إمكانية التعديل\n\nيمكنك الآن تعديل وحذف النماذج');
    } else {
      alert('🔒 تم تعطيل إمكانية التعديل\n\nالنماذج محمية الآن من التعديل والحذف');
      // إلغاء أي تعديل جاري
      setEditingTemplateId(null);
      setIsPreviewEditing(false);
    }
  };

  // التحرير المباشر
  const handleStartInlineEdit = (template: any) => {
    setEditingTemplateId(template.id);
    setEditingContent(template.content);
    setFormattingOptions({
      bold: false,
      italic: false,
      underline: false,
      fontSize: '14px',
      fontFamily: 'Arial',
      textAlign: 'right',
      textColor: '#dc2626'
    });
  };

  const handleSaveInlineEdit = () => {
    if (editingTemplateId && editingContent.trim()) {
      const updatedTemplates = templates.map(template => 
        template.id === editingTemplateId 
          ? { ...template, content: editingContent, lastModified: new Date().toISOString().split('T')[0] }
          : template
      );
      
      saveTemplates(updatedTemplates);
      setEditingTemplateId(null);
      setEditingContent('');
      alert('تم حفظ التعديل بنجاح!');
    }
  };

  const handleCancelInlineEdit = () => {
    setEditingTemplateId(null);
    setEditingContent('');
  };

  // تطبيق التنسيق
  const applyFormatting = (format: string) => {
    setFormattingOptions(prev => ({
      ...prev,
      [format]: !prev[format as keyof typeof prev]
    }));
  };

  const getFormattingStyle = () => {
    return {
      fontWeight: formattingOptions.bold ? 'bold' : 'normal',
      fontStyle: formattingOptions.italic ? 'italic' : 'normal',
      textDecoration: formattingOptions.underline ? 'underline' : 'none',
      fontSize: formattingOptions.fontSize,
      fontFamily: formattingOptions.fontFamily,
      textAlign: formattingOptions.textAlign as 'right' | 'left' | 'center',
      color: formattingOptions.textColor
    };
  };

  const insertDataField = (fieldType: string, currentContent: string, setContent: (content: string) => void) => {
    const fieldTag = `[${fieldType}]`;
    const newContent = currentContent + fieldTag;
    setContent(newContent);
  };

  const renderContentWithTags = (content: string, showRealData: boolean = false) => {
    const tagRegex = /\[([^\]]+)\]/g;
    const parts = content.split(tagRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const fieldName = part;
        const realData = sampleData[fieldName as keyof typeof sampleData];
        
        return (
          <span 
            key={index} 
            className={`px-1 py-0.5 rounded text-xs font-mono border ${
              showRealData 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : 'bg-blue-100 text-blue-800 border-blue-300'
            }`}
            title={showRealData ? `البيانات الفعلية: ${realData || 'غير متوفر'}` : `حقل بيانات: ${part}`}
          >
            {showRealData && realData ? realData : `[${part}]`}
          </span>
        );
      }
      return part;
    });
  };

  const FormattingToolbar = () => (
    <div className="bg-gray-100 border border-gray-300 rounded-t-md p-2 flex flex-wrap gap-2 items-center">
      <div className="flex gap-1">
        <Button
          variant={formattingOptions.bold ? "default" : "outline"}
          size="sm"
          onClick={() => applyFormatting('bold')}
          className="h-8 w-8 p-0"
          title="خط عريض"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={formattingOptions.italic ? "default" : "outline"}
          size="sm"
          onClick={() => applyFormatting('italic')}
          className="h-8 w-8 p-0"
          title="خط مائل"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={formattingOptions.underline ? "default" : "outline"}
          size="sm"
          onClick={() => applyFormatting('underline')}
          className="h-8 w-8 p-0"
          title="خط مسطر"
        >
          <Underline className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="border-l border-gray-300 pl-2 flex gap-1">
        <Select value={formattingOptions.fontSize} onValueChange={(value) => setFormattingOptions(prev => ({ ...prev, fontSize: value }))}>
          <SelectTrigger className="h-8 w-16">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12px">12</SelectItem>
            <SelectItem value="14px">14</SelectItem>
            <SelectItem value="16px">16</SelectItem>
            <SelectItem value="18px">18</SelectItem>
            <SelectItem value="20px">20</SelectItem>
            <SelectItem value="24px">24</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={formattingOptions.fontFamily} onValueChange={(value) => setFormattingOptions(prev => ({ ...prev, fontFamily: value }))}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Calibri">Calibri</SelectItem>
            <SelectItem value="Tahoma">Tahoma</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-l border-gray-300 pl-2 flex gap-1">
        <Button
          variant={formattingOptions.textAlign === 'right' ? "default" : "outline"}
          size="sm"
          onClick={() => setFormattingOptions(prev => ({ ...prev, textAlign: 'right' }))}
          className="h-8 w-8 p-0"
          title="محاذاة لليمين"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant={formattingOptions.textAlign === 'center' ? "default" : "outline"}
          size="sm"
          onClick={() => setFormattingOptions(prev => ({ ...prev, textAlign: 'center' }))}
          className="h-8 w-8 p-0"
          title="محاذاة للوسط"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={formattingOptions.textAlign === 'left' ? "default" : "outline"}
          size="sm"
          onClick={() => setFormattingOptions(prev => ({ ...prev, textAlign: 'left' }))}
          className="h-8 w-8 p-0"
          title="محاذاة لليسار"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="border-l border-gray-300 pl-2 flex gap-1">
        <Select value={formattingOptions.textColor} onValueChange={(value) => setFormattingOptions(prev => ({ ...prev, textColor: value }))}>
          <SelectTrigger className="h-8 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="#dc2626">🔴 أحمر</SelectItem>
            <SelectItem value="#000000">⚫ أسود</SelectItem>
            <SelectItem value="#1e40af">🔵 أزرق</SelectItem>
            <SelectItem value="#059669">🟢 أخضر</SelectItem>
            <SelectItem value="#7c3aed">🟣 بنفسجي</SelectItem>
            <SelectItem value="#ea580c">🟠 برتقالي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-l border-gray-300 pl-2 flex gap-1">
        <Select onValueChange={(value) => {
          if (editingTemplateId) {
            insertDataField(value, editingContent, setEditingContent);
          } else {
            insertDataField(value, newTemplate.content, (content) => setNewTemplate(prev => ({ ...prev, content })));
          }
        }}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="إدراج بيانات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="اسم_المدعي">👤 اسم المالك</SelectItem>
            <SelectItem value="هوية_المدعي">🆔 هوية المالك</SelectItem>
            <SelectItem value="عنوان_المدعي">📍 عنوان المالك</SelectItem>
            <SelectItem value="هاتف_المدعي">📞 هاتف المالك</SelectItem>
            <SelectItem value="ايميل_المدعي">📧 إيميل المالك</SelectItem>
            <SelectItem value="اسم_المدعى_عليه">👤 اسم المستأجر</SelectItem>
            <SelectItem value="هوية_المدعى_عليه">🆔 هوية المستأجر</SelectItem>
            <SelectItem value="عنوان_المدعى_عليه">📍 عنوان المستأجر</SelectItem>
            <SelectItem value="هاتف_المدعى_عليه">📞 هاتف المستأجر</SelectItem>
            <SelectItem value="ايميل_المدعى_عليه">📧 إيميل المستأجر</SelectItem>
            <SelectItem value="اسم_العقار">🏢 اسم العقار</SelectItem>
            <SelectItem value="رقم_العقد">📄 رقم العقد</SelectItem>
            <SelectItem value="تاريخ_العقد">📅 تاريخ العقد</SelectItem>
            <SelectItem value="قيمة_الايجار">💰 قيمة الإيجار</SelectItem>
            <SelectItem value="تاريخ_البداية">📅 تاريخ البداية</SelectItem>
            <SelectItem value="تاريخ_النهاية">📅 تاريخ النهاية</SelectItem>
            <SelectItem value="المبلغ_المتأخر">💸 المبلغ المتأخر</SelectItem>
            <SelectItem value="تاريخ_اليوم">📅 تاريخ اليوم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-l border-gray-300 pl-2 flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (editingTemplateId) {
              const filledContent = Object.keys(sampleData).reduce((content, key) => {
                return content.replace(new RegExp(`\\[${key}\\]`, 'g'), sampleData[key as keyof typeof sampleData]);
              }, editingContent);
              setEditingContent(filledContent);
            } else {
              const filledContent = Object.keys(sampleData).reduce((content, key) => {
                return content.replace(new RegExp(`\\[${key}\\]`, 'g'), sampleData[key as keyof typeof sampleData]);
              }, newTemplate.content);
              setNewTemplate(prev => ({ ...prev, content: filledContent }));
            }
          }}
          className="h-8 px-2 text-xs"
          title="ملء جميع العلامات بالبيانات التجريبية"
        >
          🔄 ملء البيانات
        </Button>
      </div>
    </div>
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'إخلاء':
        return 'bg-red-100 text-red-800';
      case 'مالية':
        return 'bg-green-100 text-green-800';
      case 'عقارية':
        return 'bg-blue-100 text-blue-800';
      case 'تجارية':
        return 'bg-purple-100 text-purple-800';
      case 'سكنية':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPermission(loggedInEmployee, 'legal:eviction:read')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مخول للوصول</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذا القسم</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            نماذج الدعاوى
            {!isEditingEnabled && (
              <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-300 flex items-center gap-1">
                🔒 محمي من التعديل
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة وتحرير نماذج الدعاوى القانونية
            {!isEditingEnabled && (
              <span className="text-green-600 font-medium"> (وضع القراءة فقط)</span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={toggleEditingMode} 
            variant={isEditingEnabled ? "default" : "outline"}
            className={`flex items-center gap-2 ${
              isEditingEnabled 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-50 hover:bg-green-100 border-green-300 text-green-700'
            }`}
          >
            {isEditingEnabled ? '🔓 تعطيل التعديل' : '🔒 تفعيل التعديل'}
          </Button>
          <Button onClick={handleUpdateTemplates} variant="outline" className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-300 text-blue-700">
            ⬆️ تحديث النماذج
          </Button>
          <Button onClick={handleResetTemplates} variant="outline" className="flex items-center gap-2" disabled={!isEditingEnabled}>
            🔄 إعادة تعيين
          </Button>
          <Button onClick={() => setShowRequestsDialog(true)} variant="outline" className="flex items-center gap-2">
            📋 قائمة الطلبات
          </Button>
          <Button onClick={() => setShowNewRequestDialog(true)} variant="outline" className="flex items-center gap-2">
            ➕ طلب جديد
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" disabled={!isEditingEnabled}>
                <Plus className="h-4 w-4" />
                إنشاء نموذج جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  إنشاء نموذج دعوى جديد
                </DialogTitle>
                <DialogDescription>
                  قم بملء البيانات التالية لإنشاء نموذج دعوى جديد
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">عنوان النموذج *</Label>
                    <Select 
                      value={isCustomTitle ? 'مخصص' : newTemplate.title} 
                      onValueChange={(value) => {
                        if (value === 'مخصص') {
                          setIsCustomTitle(true);
                          setNewTemplate(prev => ({ ...prev, title: customTitle }));
                        } else {
                          setIsCustomTitle(false);
                          setNewTemplate(prev => ({ ...prev, title: value }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر عنوان النموذج" />
                      </SelectTrigger>
                      <SelectContent>
                        {templateTitles.map((title) => (
                          <SelectItem key={title} value={title}>
                            {title}
                          </SelectItem>
                        ))}
                        <SelectItem value="مخصص">✏️ عنوان مخصص</SelectItem>
                      </SelectContent>
                    </Select>
                    {isCustomTitle && (
                      <Input
                        value={customTitle}
                        onChange={(e) => {
                          setCustomTitle(e.target.value);
                          setNewTemplate(prev => ({ ...prev, title: e.target.value }));
                        }}
                        placeholder="أدخل عنوان مخصص"
                        className="mt-2"
                      />
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="category">الفئة *</Label>
                    <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emirate">الإمارة *</Label>
                  <Select value={newTemplate.emirate} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, emirate: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الإمارة" />
                    </SelectTrigger>
                    <SelectContent>
                      {emirates.map((emirate) => (
                        <SelectItem key={emirate} value={emirate}>
                          {emirate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="content" className="text-lg font-semibold">محتوى النموذج</Label>
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">النص باللون الأحمر قابل للتعديل</span>
                  </div>
                  <div className="border rounded-md bg-white shadow-sm">
                    <FormattingToolbar />
                    <div className="p-4">
                      <Textarea
                        id="content"
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="اكتب محتوى النموذج هنا..."
                        className="min-h-[400px] resize-y border-0 bg-transparent text-red-600 font-medium"
                        rows={20}
                        style={{
                          lineHeight: '1.8',
                          direction: 'rtl',
                          ...getFormattingStyle()
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleCreateTemplate}>
                  إنشاء النموذج
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي النماذج</p>
                <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">النماذج المُفلترة</p>
                <p className="text-2xl font-bold text-gray-900">{filteredTemplates.length}</p>
              </div>
              <Search className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الاستخدام</p>
                <p className="text-2xl font-bold text-gray-900">{templates.reduce((sum, template) => sum + template.usageCount, 0)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">محفوظ تلقائياً</p>
                <p className="text-2xl font-bold text-gray-900">✓</p>
              </div>
              <Save className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث في النماذج..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="جميع الفئات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedEmirate} onValueChange={setSelectedEmirate}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="جميع الإمارات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الإمارات</SelectItem>
            {emirates.map((emirate) => (
              <SelectItem key={emirate} value={emirate}>
                {emirate}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          // تحقق من تطابق النموذج مع النموذج النشط
          const isActiveTemplate = currentActiveTemplate && template.content === currentActiveTemplate;
          
          return (
          <Card 
            key={template.id} 
            className={`hover:shadow-lg transition-all ${
              isActiveTemplate 
                ? 'border-4 border-red-500 bg-red-50 shadow-2xl ring-4 ring-red-200' 
                : 'hover:shadow-lg'
            }`}
          >
            <CardHeader className="pb-3">
              {isActiveTemplate && (
                <div className="mb-2 bg-red-600 text-white px-3 py-1 rounded-lg text-center font-bold text-sm flex items-center justify-center gap-2">
                  <span className="animate-pulse">🔴</span>
                  <span>النموذج النشط الحالي</span>
                  <span className="animate-pulse">🔴</span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className={`text-lg leading-tight ${isActiveTemplate ? 'text-red-700 font-bold' : ''}`}>
                    {template.title}
                  </CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-4">
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                    <span className="flex items-center gap-1 text-sm">
                      <Building className="h-3 w-3" />
                      {template.emirate}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                    className="h-8 w-8 p-0"
                    title="نسخ النموذج"
                    disabled={!isEditingEnabled}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                    className="h-8 w-8 p-0"
                    title={isEditingEnabled ? "تعديل النموذج" : "التعديل معطل"}
                    disabled={!isEditingEnabled}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    title={isEditingEnabled ? "حذف النموذج" : "الحذف معطل"}
                    disabled={!isEditingEnabled}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {template.createdAt}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {template.usageCount} استخدام
                  </span>
                </div>

                <div className="space-y-2">
                  {editingTemplateId === template.id ? (
                    <div className="space-y-2">
                      <div className="border rounded-md bg-white shadow-sm">
                        <FormattingToolbar />
                        <div className="p-3">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[200px] resize-y border-0 bg-transparent text-red-600 font-medium"
                            rows={8}
                            style={{
                              lineHeight: '1.8',
                              direction: 'rtl',
                              ...getFormattingStyle()
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveInlineEdit} size="sm" className="flex items-center gap-1">
                          <Save className="h-3 w-3" />
                          حفظ
                        </Button>
                        <Button onClick={handleCancelInlineEdit} variant="outline" size="sm" className="flex items-center gap-1">
                          <X className="h-3 w-3" />
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 max-h-32 overflow-y-auto">
                      <div className="whitespace-pre-wrap">
                        {template.content.length > 200 
                          ? renderContentWithTags(template.content.substring(0, 200) + "...", false)
                          : renderContentWithTags(template.content, false)
                        }
                      </div>
                      <div className="mt-2 flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const filledContent = Object.keys(sampleData).reduce((content, key) => {
                              return content.replace(new RegExp(`\\[${key}\\]`, 'g'), sampleData[key as keyof typeof sampleData]);
                            }, template.content);
                            alert(`النموذج مع البيانات:\n\n${filledContent.substring(0, 300)}...`);
                          }}
                          className="h-6 px-2 text-xs"
                          title="عرض النموذج مع البيانات التجريبية"
                        >
                          🔄 عرض البيانات
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartInlineEdit(template)}
                    className="flex-1 flex items-center gap-2"
                    disabled={!isEditingEnabled}
                    title={isEditingEnabled ? "تعديل مباشر" : "التعديل معطل"}
                  >
                    <Edit className="h-3 w-3" />
                    تعديل مباشر
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewTemplate(template)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Eye className="h-3 w-3" />
                    معاينة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTemplate(template)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Download className="h-3 w-3" />
                    تحميل
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              معاينة النموذج
            </DialogTitle>
            <DialogDescription>
              معاينة وتصدير نموذج الدعوى
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* معلومات النموذج */}
              <div className="bg-white p-6 border rounded-lg shadow-sm">
                <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  معلومات النموذج
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">العنوان</Label>
                    <p className="text-gray-900">{selectedTemplate.title}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الفئة</Label>
                    <Badge className={getCategoryColor(selectedTemplate.category)}>
                      {selectedTemplate.category}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">الإمارة</Label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {selectedTemplate.emirate}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">تاريخ الإنشاء</Label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {selectedTemplate.createdAt}
                    </p>
                  </div>
                </div>
              </div>

              {/* محتوى النموذج */}
              <div className="bg-white p-6 border rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    محتوى النموذج
                  </h3>
                  <div className="flex gap-2">
                    {!isPreviewEditing ? (
                      <>
                        <Button
                          variant={showRealData ? "default" : "outline"}
                          size="sm"
                          onClick={() => setShowRealData(!showRealData)}
                          className="h-8 px-3 text-xs"
                        >
                          {showRealData ? "🔵 عرض العلامات" : "🟢 عرض البيانات"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const filledContent = Object.keys(sampleData).reduce((content, key) => {
                              return content.replace(new RegExp(`\\[${key}\\]`, 'g'), sampleData[key as keyof typeof sampleData]);
                            }, selectedTemplate.content);
                            setSelectedTemplate((prev: any) => ({ ...prev, content: filledContent }));
                          }}
                          className="h-8 px-3 text-xs"
                          title="ملء النموذج بالبيانات التجريبية"
                        >
                          🔄 ملء البيانات
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleStartPreviewEdit}
                          className="h-8 px-3 text-xs"
                          title={isEditingEnabled ? "تعديل النموذج" : "التعديل معطل"}
                          disabled={!isEditingEnabled}
                        >
                          ✏️ تعديل
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleSavePreviewEdit}
                          className="h-8 px-3 text-xs"
                          title="حفظ التعديلات"
                        >
                          💾 حفظ
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelPreviewEdit}
                          className="h-8 px-3 text-xs"
                          title="إلغاء التعديل"
                        >
                          ❌ إلغاء
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {isPreviewEditing ? (
                  <div className="space-y-3">
                    <div className="border rounded-md bg-white shadow-sm">
                      <FormattingToolbar />
                      <div className="p-4">
                        <Textarea
                          value={previewEditingContent}
                          onChange={(e) => setPreviewEditingContent(e.target.value)}
                          placeholder="اكتب محتوى النموذج هنا..."
                          className="min-h-[400px] resize-y border-0 bg-transparent text-red-600 font-medium"
                          rows={20}
                          style={{
                            lineHeight: '1.8',
                            direction: 'rtl',
                            ...getFormattingStyle()
                          }}
                        />
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                      💡 <strong>وضع التعديل:</strong> يمكنك تعديل النص مباشرة مع استخدام أدوات التنسيق
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 p-4 rounded border">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                        {selectedTemplate.content ? renderContentWithTags(selectedTemplate.content, showRealData) : 'لا يوجد محتوى متاح لهذا النموذج.'}
                      </div>
                    </div>
                    {showRealData && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                        💡 <strong>وضع عرض البيانات:</strong> العلامات الخضراء تظهر البيانات الفعلية من النظام
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* خيارات التصدير */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  خيارات التصدير
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleDownloadTemplate(selectedTemplate)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    📄 تصدير كـ Word
                  </Button>
                  <Button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html dir="rtl" lang="ar">
                            <head>
                              <title>${selectedTemplate.title}</title>
                              <style>
                                body { font-family: Arial, sans-serif; direction: rtl; text-align: right; margin: 40px; line-height: 1.8; }
                                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                                .content { white-space: pre-line; font-size: 14px; }
                              </style>
                            </head>
                            <body>
                              <div class="header">
                                <h1>${selectedTemplate.title}</h1>
                                <p>الفئة: ${selectedTemplate.category} | الإمارة: ${selectedTemplate.emirate}</p>
                              </div>
                              <div class="content">${selectedTemplate.content}</div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                  >
                    🖨️ طباعة PDF
                  </Button>
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedTemplate.content);
                      alert('تم نسخ المحتوى إلى الحافظة!');
                    }}
                    variant="outline"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    📋 نسخ النص
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPreviewDialog(false);
                setIsPreviewEditing(false);
                setPreviewEditingContent('');
              }} 
              className="flex-1"
            >
              إغلاق المعاينة
            </Button>
            {selectedTemplate && (
              <Button 
                onClick={() => {
                  setShowPreviewDialog(false);
                  handleDownloadTemplate(selectedTemplate);
                }}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                تصدير مباشر
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showEditDialog && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل النموذج</DialogTitle>
              <DialogDescription>
                قم بتعديل تفاصيل النموذج وحفظ التغييرات
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">عنوان النموذج *</Label>
                  <Select 
                    value={isCustomTitle ? 'مخصص' : newTemplate.title} 
                    onValueChange={(value) => {
                      if (value === 'مخصص') {
                        setIsCustomTitle(true);
                        setNewTemplate(prev => ({ ...prev, title: customTitle }));
                      } else {
                        setIsCustomTitle(false);
                        setNewTemplate(prev => ({ ...prev, title: value }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر عنوان النموذج" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTitles.map((title) => (
                        <SelectItem key={title} value={title}>
                          {title}
                        </SelectItem>
                      ))}
                      <SelectItem value="مخصص">✏️ عنوان مخصص</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCustomTitle && (
                    <Input
                      value={customTitle}
                      onChange={(e) => {
                        setCustomTitle(e.target.value);
                        setNewTemplate(prev => ({ ...prev, title: e.target.value }));
                      }}
                      placeholder="أدخل عنوان مخصص"
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-category">الفئة *</Label>
                  <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-emirate">الإمارة *</Label>
                <Select value={newTemplate.emirate} onValueChange={(value) => setNewTemplate(prev => ({ ...prev, emirate: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الإمارة" />
                  </SelectTrigger>
                  <SelectContent>
                    {emirates.map((emirate) => (
                      <SelectItem key={emirate} value={emirate}>
                        {emirate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-content" className="text-lg font-semibold">محتوى النموذج</Label>
                  <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">النص باللون الأحمر قابل للتعديل</span>
                </div>
                <div className="border rounded-md bg-white shadow-sm">
                  <FormattingToolbar />
                  <div className="p-4">
                    <Textarea
                      id="edit-content"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="اكتب محتوى النموذج هنا..."
                      className="min-h-[400px] resize-y border-0 bg-transparent text-red-600 font-medium"
                      rows={20}
                      style={{
                        lineHeight: '1.8',
                        direction: 'rtl',
                        ...getFormattingStyle()
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleUpdateTemplate}>
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* نافذة قائمة الطلبات */}
      {showRequestsDialog && (
        <Dialog open={showRequestsDialog} onOpenChange={setShowRequestsDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                📋 قائمة طلبات الدعاوى
              </DialogTitle>
              <DialogDescription>
                اختر طلباً لملء النموذج بالبيانات أو قم بإنشاء طلب جديد
              </DialogDescription>
            </DialogHeader>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{requests.filter(r => r.status === 'جديد').length}</div>
                <div className="text-xs text-green-700">جديد</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">{requests.filter(r => r.status === 'قيد المراجعة').length}</div>
                <div className="text-xs text-yellow-700">قيد المراجعة</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{requests.filter(r => r.status === 'مكتمل').length}</div>
                <div className="text-xs text-blue-700">مكتمل</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-600">{requests.length}</div>
                <div className="text-xs text-gray-700">إجمالي</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((request, index) => (
                <div 
                  key={request.id} 
                  className="border rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer bg-white hover:bg-blue-50 border-l-4 border-l-blue-500"
                  onClick={() => handleSelectRequest(request)}
                >
                  {/* رقم الطلب والرأس */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{request.clientName}</h3>
                        <p className="text-xs text-gray-500">طلب رقم #{request.id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge className={`${getStatusColor(request.status)} text-xs px-2 py-1`}>
                        {request.status}
                      </Badge>
                      <Badge className={`${getPriorityColor(request.priority)} text-xs px-2 py-1`}>
                        {request.priority}
                      </Badge>
                    </div>
                  </div>

                  {/* معلومات العقار */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-700 text-sm">العقار</span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{request.propertyName}</p>
                  </div>

                  {/* تفاصيل سريعة */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">نوع القضية:</span>
                      <span className="font-medium text-gray-900">{request.caseType}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">المبلغ:</span>
                      <span className="font-bold text-green-600">{request.amount} درهم</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">التاريخ:</span>
                      <span className="font-medium text-gray-900">{request.createdAt}</span>
                    </div>
                  </div>

                  {/* الوصف المختصر */}
                  {request.description && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-xs font-medium text-gray-600">الوصف</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{request.description}</p>
                    </div>
                  )}

                  {/* أزرار العمل */}
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRequest(request);
                      }}
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      استخدام
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`تفاصيل الطلب:\n\nالعميل: ${request.clientName}\nالرقم المدني: ${request.clientId}\nالهاتف: ${request.clientPhone}\nالإيميل: ${request.clientEmail}\nالعقار: ${request.propertyName}\nنوع القضية: ${request.caseType}\nالمبلغ: ${request.amount} درهم\nالأولوية: ${request.priority}\nالحالة: ${request.status}\nالتاريخ: ${request.createdAt}\nالوصف: ${request.description}`);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* معلومات إضافية في الأسفل */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>📞 {request.clientPhone}</span>
                      <span>📧 {request.clientEmail}</span>
                    </div>
                  </div>
                </div>
              ))}

              {requests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>لا توجد طلبات متاحة</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRequestsDialog(false);
                      setShowNewRequestDialog(true);
                    }}
                    className="mt-4"
                  >
                    إنشاء طلب جديد
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRequestsDialog(false)}>
                إغلاق
              </Button>
              <Button onClick={() => {
                setShowRequestsDialog(false);
                setShowNewRequestDialog(true);
              }}>
                ➕ إنشاء طلب جديد
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* نافذة إنشاء طلب جديد */}
      {showNewRequestDialog && (
        <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                ➕ إنشاء طلب دعوى جديد
              </DialogTitle>
              <DialogDescription>
                أدخل تفاصيل طلب الدعوى الجديد
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">اسم العميل *</Label>
                  <Input
                    id="clientName"
                    value={newRequest.clientName}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="أدخل اسم العميل"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">الرقم المدني *</Label>
                  <Input
                    id="clientId"
                    value={newRequest.clientId}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, clientId: e.target.value }))}
                    placeholder="784-xxxx-xxxxx-x"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">رقم الهاتف</Label>
                  <Input
                    id="clientPhone"
                    value={newRequest.clientPhone}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, clientPhone: e.target.value }))}
                    placeholder="05xxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">البريد الإلكتروني</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={newRequest.clientEmail}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, clientEmail: e.target.value }))}
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyName">اسم العقار *</Label>
                <Input
                  id="propertyName"
                  value={newRequest.propertyName}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, propertyName: e.target.value }))}
                  placeholder="وصف العقار"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="caseType">نوع القضية *</Label>
                  <Select value={newRequest.caseType} onValueChange={(value) => setNewRequest(prev => ({ ...prev, caseType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع القضية" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ (درهم)</Label>
                  <Input
                    id="amount"
                    value={newRequest.amount}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">الأولوية</Label>
                <Select value={newRequest.priority} onValueChange={(value) => setNewRequest(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="عالي">عالي</SelectItem>
                    <SelectItem value="متوسط">متوسط</SelectItem>
                    <SelectItem value="منخفض">منخفض</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">وصف الطلب</Label>
                <Textarea
                  id="description"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="اكتب تفاصيل الطلب..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewRequestDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateRequest}>
                إنشاء الطلب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
