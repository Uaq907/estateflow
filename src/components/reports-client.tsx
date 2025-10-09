'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DatePicker } from '@/components/date-picker';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/layout/header';
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign, 
  Users, 
  Building, 
  Wrench, 
  WalletCards,
  TrendingUp,
  BarChart3,
  PieChart,
  Table,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Maximize2,
  FileSpreadsheet,
  ChevronDown,
  CreditCard
} from 'lucide-react';
import { generatePDFReport, generatePDFFromHTML, type PDFReportData } from '@/lib/pdf-generator';
import * as XLSX from 'xlsx';
import type { Employee, Owner, Property } from '@/lib/types';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/language-context';
import { generateTaxReportAction } from '@/app/dashboard/actions';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  id: string;
  title: string;
  description: string;
  category: 'financial' | 'operational' | 'analytical' | 'compliance' | 'tax';
  icon: React.ElementType;
  color: string;
  lastGenerated?: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

const reportTypes: ReportData[] = [
  // Financial Reports
  {
    id: 'revenue-summary',
    title: 'Revenue Summary Report',
    description: 'Comprehensive summary of revenue, expenses and profits',
    category: 'financial',
    icon: DollarSign,
    color: 'bg-green-500',
    frequency: 'monthly'
  },
  {
    id: 'expense-analysis',
    title: 'Expense Analysis',
    description: 'Detailed analysis of expenses by categories',
    category: 'financial',
    icon: WalletCards,
    color: 'bg-red-500',
    frequency: 'weekly'
  },
  {
    id: 'cheques-report',
    title: 'Cheques Report',
    description: 'Comprehensive report on all cheques status and transactions',
    category: 'financial',
    icon: CreditCard,
    color: 'bg-purple-500',
    frequency: 'weekly'
  },
  {
    id: 'bounced-cheques-report',
    title: 'Bounced Cheques Report',
    description: 'Detailed report on all bounced cheques and recovery actions',
    category: 'financial',
    icon: CreditCard,
    color: 'bg-red-500',
    frequency: 'weekly'
  },
  {
    id: 'cleared-cheques-report',
    title: 'Cleared Cheques Report',
    description: 'Report on successfully cleared cheques and payments',
    category: 'financial',
    icon: CreditCard,
    color: 'bg-green-500',
    frequency: 'daily'
  },
  {
    id: 'pending-cheques-report',
    title: 'Pending Cheques Report',
    description: 'Report on cheques pending clearance and processing',
    category: 'financial',
    icon: CreditCard,
    color: 'bg-orange-500',
    frequency: 'daily'
  },
  {
    id: 'taxable-revenue-report',
    title: 'Taxable Revenue Report',
    description: 'VAT report for revenue based on paid invoices within selected period',
    category: 'tax',
    icon: DollarSign,
    color: 'bg-emerald-600',
    frequency: 'quarterly'
  },
  {
    id: 'taxable-expenses-report',
    title: 'Taxable Expenses Report',
    description: 'VAT report for expenses based on approved expenses within selected period',
    category: 'tax',
    icon: WalletCards,
    color: 'bg-rose-600',
    frequency: 'quarterly'
  },

  // Operational Reports
  {
    id: 'property-occupancy',
    title: 'Property Occupancy Rate',
    description: 'Property and unit occupancy rates',
    category: 'operational',
    icon: Building,
    color: 'bg-blue-500',
    frequency: 'monthly'
  },
  {
    id: 'maintenance-summary',
    title: 'Maintenance Summary',
    description: 'Comprehensive maintenance work summary',
    category: 'operational',
    icon: Wrench,
    color: 'bg-orange-500',
    frequency: 'weekly'
  },
  {
    id: 'tenant-analysis',
    title: 'Tenant Analysis',
    description: 'Comprehensive report on tenants and rental patterns',
    category: 'operational',
    icon: Users,
    color: 'bg-indigo-500',
    frequency: 'monthly'
  },

  // Analytical Reports
  {
    id: 'performance-dashboard',
    title: 'Performance Dashboard',
    description: 'Key performance indicators and trends',
    category: 'analytical',
    icon: BarChart3,
    color: 'bg-teal-500',
    frequency: 'daily'
  },
  {
    id: 'trend-analysis',
    title: 'Trend Analysis',
    description: 'Trend analysis and future predictions',
    category: 'analytical',
    icon: TrendingUp,
    color: 'bg-cyan-500',
    frequency: 'monthly'
  },
  {
    id: 'comparative-analysis',
    title: 'Comparative Analysis',
    description: 'Performance comparison between properties and time periods',
    category: 'analytical',
    icon: PieChart,
    color: 'bg-pink-500',
    frequency: 'quarterly'
  },

  // Compliance Reports
  {
    id: 'compliance-report',
    title: 'Compliance Report',
    description: 'Regulatory compliance report',
    category: 'compliance',
    icon: FileText,
    color: 'bg-gray-500',
    frequency: 'quarterly'
  },
  {
    id: 'audit-trail',
    title: 'Audit Trail',
    description: 'Comprehensive report of all operations and changes',
    category: 'compliance',
    icon: Table,
    color: 'bg-slate-500',
    frequency: 'monthly'
  }
];

// categoryLabels will be replaced with translations in the component

// frequencyLabels will be replaced with translations in the component

export default function ReportsClient({ 
  loggedInEmployee, 
  owners, 
  properties 
}: { 
  loggedInEmployee: Employee | null;
  owners: Owner[];
  properties: Property[];
}) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChequeStatus, setSelectedChequeStatus] = useState<string>('all');
  const [selectedTaxType, setSelectedTaxType] = useState<string>('all');
  
  // Translation functions for categories and frequencies
  const getCategoryLabel = (category: string) => {
    const reportTranslations: Record<string, string> = {
      'revenue-summary': t('reports.revenueSummaryReport'),
      'cheques-report': t('reports.chequesReport'),
      'bounced-cheques-report': t('reports.bouncedChequesReport'),
      'cleared-cheques-report': t('reports.clearedChequesReport'),
      'pending-cheques-report': t('reports.pendingChequesReport'),
      'taxable-revenue-report': t('reports.taxableRevenueReport'),
      'taxable-expenses-report': t('reports.taxableExpensesReport'),
      'expense-analysis': t('reports.expenseAnalysis'),
      'property-occupancy': t('reports.propertyOccupancy'),
      'maintenance-summary': t('reports.maintenanceSummary'),
      'tenant-analysis': t('reports.tenantAnalysis'),
      'performance-dashboard': t('reports.performanceDashboard'),
      'trend-analysis': t('reports.trendAnalysis'),
      'comparative-analysis': t('reports.comparativeAnalysis'),
      'compliance-report': t('reports.complianceReport'),
      'audit-trail': t('reports.auditTrail')
    };
    
    if (reportTranslations[category]) {
      return reportTranslations[category];
    }
    
    const categoryTranslations: Record<string, string> = {
      financial: t('reports.financial'),
      operational: t('reports.operational'),
      analytical: t('reports.analytical'),
      compliance: t('reports.compliance'),
      tax: t('reports.tax')
    };
    return categoryTranslations[category] || category;
  };
  
  const getFrequencyLabel = (frequency: string) => {
    const translations: Record<string, string> = {
      daily: t('reports.daily'),
      weekly: t('reports.weekly'),
      monthly: t('reports.monthly'),
      quarterly: t('reports.quarterly'),
      yearly: t('reports.yearly')
    };
    return translations[frequency] || frequency;
  };
  
  // Function to get translated report title and description
  const getTranslatedReport = (report: any) => {
    let titleKey, descKey;
    
    // Handle special cases for report IDs
    if (report.id === 'revenue-summary') {
      titleKey = 'reports.revenueSummaryReport';
      descKey = 'reports.revenueSummaryDescription';
    } else if (report.id === 'cheques-report') {
      titleKey = 'reports.chequesReport';
      descKey = 'reports.chequesReportDesc';
    } else if (report.id === 'bounced-cheques-report') {
      titleKey = 'reports.bouncedChequesReport';
      descKey = 'reports.bouncedChequesReportDesc';
    } else if (report.id === 'cleared-cheques-report') {
      titleKey = 'reports.clearedChequesReport';
      descKey = 'reports.clearedChequesReportDesc';
    } else if (report.id === 'pending-cheques-report') {
      titleKey = 'reports.pendingChequesReport';
      descKey = 'reports.pendingChequesReportDesc';
    } else {
      titleKey = `reports.${report.id.replace(/-([a-z])/g, (g: string) => g[1].toUpperCase())}`;
      descKey = `${titleKey}Desc`;
    }
    
    return {
      ...report,
      title: t(titleKey) || report.title,
      description: t(descKey) || report.description
    };
  };
  const [selectedFrequency, setSelectedFrequency] = useState<string>('all');
  const [selectedOwner, setSelectedOwner] = useState<string>('all');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [isViewing, setIsViewing] = useState<string | null>(null);
  const [viewedReport, setViewedReport] = useState<ReportData | null>(null);
  const [reportData, setReportData] = useState<Record<string, any>>({});

  const filteredReports = useMemo(() => {
    let reports = reportTypes;
    
    // If cheques report is selected from category filter, show only cheques-related reports
    if (selectedCategory === 'cheques-report') {
      reports = reportTypes.filter(report => 
        report.id === 'cheques-report' || 
        report.title.toLowerCase().includes('cheque') ||
        report.description.toLowerCase().includes('cheque')
      );
    } else {
      reports = reportTypes.filter(report => {
        // Category filter - now supports specific report IDs
        if (selectedCategory === 'all') {
          // Show all reports when "All Categories" is selected
          return true;
        } else if (selectedCategory === report.id) {
          // Show specific report when its ID is selected
          return true;
        } else if (report.category !== selectedCategory) {
          return false;
        }
        
        const matchesFrequency = selectedFrequency === 'all' || report.frequency === selectedFrequency;
        return matchesFrequency;
      });
    }
    
    // Apply tax type filter when tax category is selected
    if (selectedCategory === 'tax') {
      if (selectedTaxType === 'revenue') {
        reports = reports.filter(report => report.id === 'taxable-revenue-report');
      } else if (selectedTaxType === 'expenses') {
        reports = reports.filter(report => report.id === 'taxable-expenses-report');
      }
      // If 'all', show both tax reports (no additional filtering needed)
    }
    
    return reports.map(report => getTranslatedReport(report));
  }, [selectedCategory, selectedFrequency, selectedTaxType, t]);

  // Filter properties based on selected owner
  const filteredProperties = useMemo(() => {
    if (selectedOwner === 'all') {
      return properties;
    }
    return properties.filter(property => property.ownerId === selectedOwner);
  }, [properties, selectedOwner]);

  // Get units for the selected property
  const filteredUnits = useMemo(() => {
    if (selectedProperty === 'all') {
      return [];
    }
    const property = properties.find(p => p.id === selectedProperty);
    if (!property) return [];
    
    // Generate mock units for the property
    const units = [];
    for (let i = 1; i <= (property.totalUnits || 10); i++) {
      units.push({
        id: `${property.id}-unit-${i}`,
        name: `Unit ${i}`,
        propertyId: property.id
      });
    }
    return units;
  }, [properties, selectedProperty]);

  const handleGenerateReport = async (reportId: string) => {
    setIsGenerating(reportId);
    
    // Handle tax reports specially
    if (reportId === 'taxable-revenue-report' || reportId === 'taxable-expenses-report') {
      if (!dateRange.from || !dateRange.to) {
        toast({ 
          variant: 'destructive', 
          title: t('common.error'), 
          description: t('reports.selectDateRangeError') 
        });
        setIsGenerating(null);
        return;
      }
      
      const reportType = reportId === 'taxable-revenue-report' ? 'revenue' : 'expenses';
      const result = await generateTaxReportAction(reportType, dateRange.from, dateRange.to);
      
      if (result.success && result.file) {
        const blob = new Blob([new Uint8Array(result.file)], { type: result.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast({ 
          title: t('common.success'), 
          description: t('reports.taxReportGenerated') 
        });
      } else {
        toast({ 
          variant: 'destructive', 
          title: t('common.error'), 
          description: result.message 
        });
      }
      setIsGenerating(null);
      return;
    }
    
    // Simulate report generation for other reports
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(null);
    // Here you would implement actual report generation
  };

  const handleViewReport = async (reportId: string) => {
    setIsViewing(reportId);
    const report = reportTypes.find(r => r.id === reportId);
    
    // Simulate loading report data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock report data based on report type
    const mockData = generateMockReportData(reportId);
    setReportData(prev => ({ ...prev, [reportId]: mockData }));
    setViewedReport(report || null);
    setIsViewing(null);
  };

  const generateMockReportData = (reportId: string) => {
    const selectedOwnerData = selectedOwner !== 'all' ? owners.find(o => o.id === selectedOwner) : null;
    const selectedPropertyData = selectedProperty !== 'all' ? properties.find(p => p.id === selectedProperty) : null;
    const selectedUnitData = selectedUnit !== 'all' ? filteredUnits.find(u => u.id === selectedUnit) : null;
    
    // Generate mock data based on report type and selected filters
    const baseData = {
      generatedAt: new Date(),
      period: dateRange.from && dateRange.to ? 
        `${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}` : 
        'Last 30 days',
      summary: {
        totalRecords: Math.floor(Math.random() * 1000) + 100,
        totalAmount: Math.floor(Math.random() * 100000) + 10000,
        growthRate: (Math.random() * 20 - 10).toFixed(1) + '%'
      },
      filters: {
        owner: selectedOwner === 'all' ? 'All Owners' : selectedOwnerData?.name || 'Not Specified',
        property: selectedProperty === 'all' ? 'All Properties' : selectedPropertyData?.name || 'Not Specified',
        unit: selectedUnit === 'all' ? 'All Units' : selectedUnitData?.name || 'Not Specified',
        category: selectedCategory === 'all' ? t('reports.allCategories') : getCategoryLabel(selectedCategory),
        frequency: selectedFrequency === 'all' ? t('reports.allFrequencies') : getFrequencyLabel(selectedFrequency)
      },
      ownerSpecific: selectedOwner !== 'all',
      propertySpecific: selectedProperty !== 'all',
      unitSpecific: selectedUnit !== 'all',
      ownerName: selectedOwnerData?.name || null,
      propertyName: selectedPropertyData?.name || null,
      unitName: selectedUnitData?.name || null
    };

    switch (reportId) {
      case 'revenue-summary':
        // Generate owner/property/unit-specific revenue data
        const ownerProperties = selectedOwner !== 'all' ? 
          properties.filter(p => p.ownerId === selectedOwner) : 
          properties;
        
        const baseRevenue = selectedOwner !== 'all' ? 
          Math.floor(Math.random() * 200000) + 50000 : // Lower range for single owner
          selectedProperty !== 'all' ? 
          Math.floor(Math.random() * 100000) + 20000 : // Lower range for single property
          Math.floor(Math.random() * 500000) + 100000; // Higher range for all properties
        
        const unitRevenue = selectedUnit !== 'all' ? 
          Math.floor(baseRevenue * 0.1) : // Much lower for single unit
          baseRevenue;
        
        return {
          ...baseData,
          revenue: unitRevenue,
          expenses: Math.floor(unitRevenue * 0.6), // 60% of revenue
          profit: Math.floor(unitRevenue * 0.4), // 40% profit margin
          categories: [
            { name: 'Rent', amount: Math.floor(unitRevenue * 0.7), percentage: 70 },
            { name: 'Services', amount: Math.floor(unitRevenue * 0.2), percentage: 20 },
            { name: 'Other', amount: Math.floor(unitRevenue * 0.1), percentage: 10 }
          ],
          ownerProperties: ownerProperties.length,
          reportTitle: selectedUnit !== 'all' ? 
            `Revenue Report - ${selectedUnitData?.name}` : 
            selectedProperty !== 'all' ? 
            `Revenue Report - ${selectedPropertyData?.name}` : 
            selectedOwner !== 'all' ? 
            `Revenue Report - ${selectedOwnerData?.name}` : 
            'Comprehensive Revenue Report'
        };
      case 'expense-analysis':
        const baseExpenseAmount = selectedOwner !== 'all' ? 
          Math.floor(Math.random() * 100000) + 20000 : // Lower range for single owner
          selectedProperty !== 'all' ? 
          Math.floor(Math.random() * 50000) + 10000 : // Lower range for single property
          Math.floor(Math.random() * 300000) + 50000; // Higher range for all properties
        
        const unitExpenseAmount = selectedUnit !== 'all' ? 
          Math.floor(baseExpenseAmount * 0.1) : // Much lower for single unit
          baseExpenseAmount;
        
        return {
          ...baseData,
          expenses: [
            { category: 'Maintenance', amount: Math.floor(unitExpenseAmount * 0.4), trend: 'up' },
            { category: 'Utilities', amount: Math.floor(unitExpenseAmount * 0.3), trend: 'down' },
            { category: 'Management', amount: Math.floor(unitExpenseAmount * 0.2), trend: 'stable' },
            { category: 'Other', amount: Math.floor(unitExpenseAmount * 0.1), trend: 'stable' }
          ],
          reportTitle: selectedUnit !== 'all' ? 
            `Expense Analysis - ${selectedUnitData?.name}` : 
            selectedProperty !== 'all' ? 
            `Expense Analysis - ${selectedPropertyData?.name}` : 
            selectedOwner !== 'all' ? 
            `Expense Analysis - ${selectedOwnerData?.name}` : 
            'Comprehensive Expense Analysis'
        };
      case 'property-occupancy':
        const propertiesForOccupancy = selectedOwner !== 'all' ? 
          properties.filter(p => p.ownerId === selectedOwner) :
          selectedProperty !== 'all' ? 
          [properties.find(p => p.id === selectedProperty)].filter(Boolean) : 
          properties;
        
        // Calculate overall occupancy rate based on selected properties
        const totalUnits = propertiesForOccupancy.reduce((sum, p) => sum + (p?.totalUnits || 0), 0);
        const occupiedUnits = propertiesForOccupancy.reduce((sum, p) => sum + (p?.occupiedUnits || 0), 0);
        const overallOccupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0.0';
        
        return {
          ...baseData,
          occupancyRate: overallOccupancyRate + '%',
          properties: propertiesForOccupancy.slice(0, 5).map(property => ({
            name: property?.name || '',
            occupied: property?.occupiedUnits || 0,
            total: property?.totalUnits || 0,
            rate: property?.totalUnits && property.totalUnits > 0 ? 
              `${Math.round(((property.occupiedUnits || 0) / property.totalUnits) * 100)}%` : 
              '0%'
          })),
          reportTitle: selectedProperty !== 'all' ? 
            `Occupancy Rate - ${selectedPropertyData?.name}` : 
            selectedOwner !== 'all' ? 
            `Occupancy Rate - ${selectedOwnerData?.name}` : 
            'Comprehensive Occupancy Rate'
        };
      case 'cheques-report':
        const baseChequeAmount = selectedOwner !== 'all' ? 
          Math.floor(Math.random() * 150000) + 30000 : // Lower range for single owner
          selectedProperty !== 'all' ? 
          Math.floor(Math.random() * 75000) + 15000 : // Lower range for single property
          Math.floor(Math.random() * 400000) + 75000; // Higher range for all properties
        
        const unitChequeAmount = selectedUnit !== 'all' ? 
          Math.floor(baseChequeAmount * 0.15) : // Much lower for single unit
          baseChequeAmount;
        
        // Filter cheques by status if specified
        const allCheques = [
          { status: 'Cleared', count: Math.floor(Math.random() * 50) + 20, amount: Math.floor(unitChequeAmount * 0.6) },
          { status: 'Pending', count: Math.floor(Math.random() * 20) + 5, amount: Math.floor(unitChequeAmount * 0.25) },
          { status: 'Bounced', count: Math.floor(Math.random() * 10) + 2, amount: Math.floor(unitChequeAmount * 0.1) },
          { status: 'Submitted', count: Math.floor(Math.random() * 15) + 3, amount: Math.floor(unitChequeAmount * 0.05) }
        ];
        
        const filteredCheques = selectedChequeStatus !== 'all' ? 
          allCheques.filter(cheque => cheque.status.toLowerCase() === selectedChequeStatus.toLowerCase()) :
          allCheques;
        
        return {
          ...baseData,
          cheques: filteredCheques,
          totalCheques: filteredCheques.reduce((sum, cheque) => sum + cheque.count, 0),
          clearedAmount: filteredCheques.find(c => c.status === 'Cleared')?.amount || 0,
          pendingAmount: filteredCheques.find(c => c.status === 'Pending')?.amount || 0,
          bouncedAmount: filteredCheques.find(c => c.status === 'Bounced')?.amount || 0,
          submittedAmount: filteredCheques.find(c => c.status === 'Submitted')?.amount || 0,
          reportTitle: selectedUnit !== 'all' ? 
            `Cheques Report - ${selectedUnitData?.name}` : 
            selectedProperty !== 'all' ? 
            `Cheques Report - ${selectedPropertyData?.name}` : 
            selectedOwner !== 'all' ? 
            `Cheques Report - ${selectedOwnerData?.name}` : 
            'Comprehensive Cheques Report'
        };
      default:
        return baseData;
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedFrequency('all');
    setSelectedOwner('all');
    setSelectedProperty('all');
    setSelectedUnit('all');
    setSelectedChequeStatus('all');
    setSelectedTaxType('all');
    setDateRange({});
  };

  const handleDownloadPDF = (reportId: string) => {
    const report = reportTypes.find(r => r.id === reportId);
    const data = reportData[reportId];
    
    if (!report || !data) {
      alert('يرجى عرض التقرير أولاً قبل التنزيل');
      return;
    }

    const pdfData: PDFReportData = {
      title: report.title,
      description: report.description,
      generatedAt: data.generatedAt,
      period: data.period,
      summary: data.summary,
      data: data,
      type: reportId
    };

    try {
      generatePDFReport(pdfData, `${report.title}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    }
  };

  const generateExcelReport = (report: any, data: any) => {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Prepare summary data
    const summaryData = [
      [t('reports.reportTitle'), report.title],
      [t('reports.description'), report.description],
      [t('reports.generatedAt'), format(data.generatedAt, 'yyyy-MM-dd HH:mm:ss')],
      [t('reports.period'), data.period],
      ['', ''],
      [t('reports.summary'), ''],
      [t('reports.totalRecords'), data.summary.totalRecords],
      [t('reports.totalAmount'), `${data.summary.totalAmount.toLocaleString()} درهم إ.م`],
      [t('reports.growthRate'), data.summary.growthRate],
    ];

    // Create summary worksheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Prepare detailed data based on report type
    let detailedData: any[] = [];
    let sheetName = 'Details';

    switch (report.id) {
      case 'revenue-summary':
        detailedData = data.revenueBreakdown || [];
        sheetName = 'Revenue Details';
        break;
      case 'expense-analysis':
        detailedData = data.expenseBreakdown || [];
        sheetName = 'Expense Details';
        break;
      case 'property-occupancy':
        detailedData = data.occupancyData || [];
        sheetName = 'Occupancy Details';
        break;
      case 'maintenance-summary':
        detailedData = data.maintenanceData || [];
        sheetName = 'Maintenance Details';
        break;
      case 'tenant-analysis':
        detailedData = data.tenantData || [];
        sheetName = 'Tenant Details';
        break;
      default:
        detailedData = data.detailedData || [];
    }

    if (detailedData.length > 0) {
      // Convert detailed data to worksheet
      const detailedSheet = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(workbook, detailedSheet, sheetName);
    }

    // Generate and download the file
    const fileName = `${report.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleDownloadExcel = (reportId: string) => {
    const report = reportTypes.find(r => r.id === reportId);
    const data = reportData[reportId];
    
    if (!report || !data) {
      alert('يرجى عرض التقرير أولاً قبل التنزيل');
      return;
    }

    try {
      generateExcelReport(report, data);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('حدث خطأ أثناء إنشاء ملف Excel');
    }
  };

  const handleDownloadFromView = () => {
    if (!viewedReport) return;
    
    try {
      generatePDFFromHTML('report-view-content', `${viewedReport.title}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF from view:', error);
      alert('Error occurred while creating PDF from view');
    }
  };

  const handleCloseView = () => {
    setViewedReport(null);
  };

  const reportStats = useMemo(() => {
    const total = reportTypes.length;
    const byCategory = reportTypes.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, byCategory };
  }, []);

  return (
    <div className="flex flex-col min-h-screen" dir={t('common.direction') || 'rtl'}>
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-start" dir={t('common.direction') || 'rtl'}>
          <div>
            <h1 className="text-3xl font-bold">{t('reports.comprehensiveReports')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('reports.generateAndDownload')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('reports.refresh')}
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t('reports.downloadAll')}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5" dir={t('common.direction') || 'rtl'}>
          <Card dir={t('common.direction') || 'rtl'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.totalReports')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.total}</div>
            </CardContent>
          </Card>
          <Card dir={t('common.direction') || 'rtl'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.financialReports')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.byCategory.financial || 0}</div>
            </CardContent>
          </Card>
          <Card dir={t('common.direction') || 'rtl'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.operationalReports')}</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.byCategory.operational || 0}</div>
            </CardContent>
          </Card>
          <Card dir={t('common.direction') || 'rtl'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.analyticalReports')}</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.byCategory.analytical || 0}</div>
            </CardContent>
          </Card>
          <Card dir={t('common.direction') || 'rtl'}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('reports.taxReports')}</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportStats.byCategory.tax || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card dir={t('common.direction') || 'rtl'}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('reports.advancedSearchFilters')}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('reports.clearFilters')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 
              ترتيب الفلاتر من اليمين لليسار في اللغة العربية:
              1. تصفية حسب المالك (أقصى اليمين)
              2. تصفية حسب العقار
              3. تصفية حسب الوحدة
              4. تصفية حسب الفئة (بداية الصف الثاني)
              5. تصفية حسب التكرار
              6. من تاريخ
              7. إلى تاريخ (بداية الصف الثالث)
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir={t('common.direction') || 'rtl'}>
              {/* 1. Owner Filter - أقصى اليمين في الصف الأول */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('reports.filterByOwner')}</label>
                <Select value={selectedOwner} onValueChange={(value) => {
                  setSelectedOwner(value);
                  setSelectedProperty('all'); // Reset property when owner changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.selectOwner')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('reports.allOwners')}</SelectItem>
                    {owners.map(owner => (
                      <SelectItem key={owner.id} value={owner.id}>
                        {owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Property Filter - وسط الصف الأول */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('reports.filterByProperty')}</label>
                <Select value={selectedProperty} onValueChange={(value) => {
                  setSelectedProperty(value);
                  setSelectedUnit('all'); // Reset unit when property changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.selectProperty')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('reports.allProperties')}</SelectItem>
                    {filteredProperties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Unit Filter - أقصى اليسار في الصف الأول */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('reports.filterByUnit')}</label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.selectUnit')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('reports.allUnits')}</SelectItem>
                    {filteredUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Report Category - أقصى اليمين في الصف الثاني */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('reports.filterByCategory')}</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.selectCategory')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('reports.allCategories')}</SelectItem>
                    <SelectItem value="financial">{t('reports.financial')}</SelectItem>
                    <SelectItem value="operational">{t('reports.operational')}</SelectItem>
                    <SelectItem value="analytical">{t('reports.analytical')}</SelectItem>
                    <SelectItem value="compliance">{t('reports.compliance')}</SelectItem>
                    <SelectItem value="tax">{t('reports.tax')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Frequency - وسط الصف الثاني */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('reports.filterByFrequency')}</label>
                <Select value={selectedFrequency} onValueChange={setSelectedFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('reports.selectFrequency')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('reports.allFrequencies')}</SelectItem>
                    {Array.from(new Set(reportTypes.map(report => report.frequency)))
                      .filter(frequency => frequency !== undefined)
                      .map(frequency => (
                        <SelectItem key={frequency} value={frequency}>
                          {getFrequencyLabel(frequency)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 6. Date From - أقصى اليسار في الصف الثاني */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('reports.fromDate')}</label>
                <DatePicker
                  name="date-from"
                  placeholder={t('reports.selectDate')}
                  value={dateRange.from}
                  onSelect={date => setDateRange(prev => ({ ...prev, from: date }))}
                />
              </div>

              {/* 7. Date To - أقصى اليمين في الصف الثالث */}
              <div>
                <label className="text-sm font-medium mb-2 block">{t('reports.toDate')}</label>
                <DatePicker
                  name="date-to"
                  placeholder={t('reports.selectDate')}
                  value={dateRange.to}
                  onSelect={date => setDateRange(prev => ({ ...prev, to: date }))}
                />
              </div>

              {/* Cheque Status Filter - Show when cheques report is selected from category filter */}
              {selectedCategory === 'cheques-report' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('reports.filterByStatus')}</label>
                  <Select value={selectedChequeStatus} onValueChange={setSelectedChequeStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('reports.filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('reports.allStatuses')}</SelectItem>
                      <SelectItem value="cleared">{t('reports.cleared')}</SelectItem>
                      <SelectItem value="pending">{t('reports.pending')}</SelectItem>
                      <SelectItem value="bounced">{t('reports.bounced')}</SelectItem>
                      <SelectItem value="submitted">{t('reports.submitted')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Tax Type Filter - Show when tax category is selected */}
              {selectedCategory === 'tax' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('reports.filterByTaxType')}</label>
                  <Select value={selectedTaxType} onValueChange={setSelectedTaxType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('reports.selectTaxType')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('reports.allTaxTypes')}</SelectItem>
                      <SelectItem value="revenue">{t('reports.taxRevenue')}</SelectItem>
                      <SelectItem value="expenses">{t('reports.taxExpenses')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

          </CardContent>
        </Card>

        {/* Reports Grid */}
        <div className="space-y-4" dir={t('common.direction') || 'rtl'}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{t('reports.availableReports')}</h2>
            <Badge variant="secondary" className="text-sm">
              {filteredReports.length} {filteredReports.length === 1 ? t('reports.reportsFound') : t('reports.reportsFoundPlural')}
            </Badge>
          </div>
          
          {filteredReports.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">{t('reports.noReportsFound')}</h3>
                <p className="text-sm">
                  {t('reports.noReportsMatch')}
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" dir={t('common.direction') || 'rtl'}>
              {filteredReports.map((report) => {
                const Icon = report.icon;
                return (
                  <Card key={report.id} className="hover:shadow-lg transition-shadow" dir={t('common.direction') || 'rtl'}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg text-white ${report.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{report.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {report.description}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryLabel(report.category)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{t('reports.frequency')}: {getFrequencyLabel(report.frequency)}</span>
                        <span>{t('reports.lastGenerated')}: {report.lastGenerated ? format(report.lastGenerated, 'MMM dd') : t('reports.never')}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1" 
                          onClick={() => handleGenerateReport(report.id)}
                          disabled={isGenerating === report.id}
                        >
                          {isGenerating === report.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              {t('reports.generating')}
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4 mr-2" />
                              {t('reports.generateReport')}
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleViewReport(report.id)}
                          disabled={isViewing === report.id}
                        >
                          {isViewing === report.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              {t('reports.loading')}
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('reports.viewReport')}
                            </>
                          )}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="px-3"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {t('reports.download')}
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleDownloadExcel(report.id)}
                              className="cursor-pointer"
                            >
                              <FileSpreadsheet className="h-4 w-4 mr-2" />
                              {t('reports.downloadExcel')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDownloadPDF(report.id)}
                              className="cursor-pointer"
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              {t('reports.downloadPDF')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Report View Modal */}
        {viewedReport && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir={t('common.direction') || 'rtl'}>
            <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg text-white ${viewedReport.color}`}>
                    {React.createElement(viewedReport.icon, { className: "h-5 w-5" })}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{viewedReport.title}</h2>
                    <p className="text-muted-foreground">{viewedReport.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadFromView}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCloseView}>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
              
              <div id="report-view-content" className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {reportData[viewedReport.id] && (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {reportData[viewedReport.id].summary?.totalRecords || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('reports.totalRecords')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {reportData[viewedReport.id].summary?.totalAmount?.toLocaleString() || '0'} درهم إ.م
                        </div>
                        <div className="text-sm text-muted-foreground">{t('reports.totalAmount')}</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${parseFloat(reportData[viewedReport.id].summary?.growthRate || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {reportData[viewedReport.id].summary?.growthRate || '0%'}
                        </div>
                        <div className="text-sm text-muted-foreground">{t('reports.growthRate')}</div>
                      </div>
                    </div>

                    {/* Report Period */}
                    <div className="text-center text-sm text-muted-foreground">
                      {t('reports.period')}: {reportData[viewedReport.id].period}
                    </div>

                    {/* Report Content based on type */}
                    {viewedReport.id === 'revenue-summary' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{t('reports.revenueSummary')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {reportData[viewedReport.id].revenue?.toLocaleString()} درهم إ.م
                              </div>
                              <div className="text-sm text-muted-foreground">{t('reports.totalRevenue')}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {reportData[viewedReport.id].expenses?.toLocaleString()} درهم إ.م
                              </div>
                              <div className="text-sm text-muted-foreground">{t('reports.totalExpenses')}</div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {reportData[viewedReport.id].profit?.toLocaleString()} درهم إ.م
                              </div>
                              <div className="text-sm text-muted-foreground">{t('reports.netProfit')}</div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}

                    {viewedReport.id === 'property-occupancy' && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Property Occupancy</h3>
                        <div className="text-center mb-4">
                          <div className="text-4xl font-bold text-primary">
                            {reportData[viewedReport.id].occupancyRate}
                          </div>
                          <div className="text-sm text-muted-foreground">Overall Occupancy Rate</div>
                        </div>
                        <div className="space-y-2">
                          {reportData[viewedReport.id].properties?.map((property: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                              <span className="font-medium">{property.name}</span>
                              <div className="text-right">
                                <div className="font-bold">{property.rate}</div>
                                <div className="text-sm text-muted-foreground">{property.occupied}/{property.total} units</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

    {viewedReport.id === 'cheques-report' && (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('reports.comprehensiveChequeReport')}</h3>
        
        {/* Cheque Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {reportData[viewedReport.id].totalCheques}
              </div>
              <div className="text-sm text-muted-foreground">{t('reports.totalCheques')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reportData[viewedReport.id].clearedAmount?.toLocaleString()} درهم إ.م
              </div>
              <div className="text-sm text-muted-foreground">{t('reports.clearedCheques')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {reportData[viewedReport.id].pendingAmount?.toLocaleString()} درهم إ.م
              </div>
              <div className="text-sm text-muted-foreground">{t('reports.pendingCheques')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {reportData[viewedReport.id].bouncedAmount?.toLocaleString()} درهم إ.م
              </div>
              <div className="text-sm text-muted-foreground">{t('reports.bouncedCheques')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {reportData[viewedReport.id].submittedAmount?.toLocaleString()} درهم إ.م
              </div>
              <div className="text-sm text-muted-foreground">{t('reports.submittedCheques')}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Detailed Cheque Status Breakdown */}
        <div className="space-y-2">
          <h4 className="text-md font-semibold">{t('reports.chequeStatusBreakdown')}</h4>
          {reportData[viewedReport.id].cheques?.map((cheque: any, index: number) => (
            <div key={index} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  cheque.status === 'Cleared' ? 'bg-green-500' :
                  cheque.status === 'Pending' ? 'bg-orange-500' :
                  cheque.status === 'Bounced' ? 'bg-red-500' :
                  'bg-gray-500'
                }`}></div>
                <span className="font-medium text-lg">{cheque.status}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{cheque.count} {t('reports.chequeCounts')}</div>
                <div className="text-sm text-muted-foreground">{cheque.amount?.toLocaleString()} درهم إ.م</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Cheque Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('reports.chequeAmounts')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('reports.cleared')}:</span>
                  <span className="font-bold text-green-600">{reportData[viewedReport.id].clearedAmount?.toLocaleString()} درهم إ.م</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('reports.pending')}:</span>
                  <span className="font-bold text-orange-500">{reportData[viewedReport.id].pendingAmount?.toLocaleString()} درهم إ.م</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('reports.bounced')}:</span>
                  <span className="font-bold text-red-600">{reportData[viewedReport.id].bouncedAmount?.toLocaleString()} درهم إ.م</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('reports.submitted')}:</span>
                  <span className="font-bold text-gray-600">{reportData[viewedReport.id].submittedAmount?.toLocaleString()} درهم إ.م</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('reports.chequeStatuses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('reports.cleared')}:</span>
                  <span className="font-bold">{reportData[viewedReport.id].cheques?.find((c: any) => c.status === 'Cleared')?.count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('reports.pending')}:</span>
                  <span className="font-bold">{reportData[viewedReport.id].cheques?.find((c: any) => c.status === 'Pending')?.count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('reports.bounced')}:</span>
                  <span className="font-bold">{reportData[viewedReport.id].cheques?.find((c: any) => c.status === 'Bounced')?.count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('reports.submitted')}:</span>
                  <span className="font-bold">{reportData[viewedReport.id].cheques?.find((c: any) => c.status === 'Submitted')?.count || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )}

    {/* Bounced Cheques Report */}
    {viewedReport.id === 'bounced-cheques-report' && (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('reports.bouncedChequesReport')}</h3>
        
        {/* Bounced Cheques Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {reportData[viewedReport.id].totalBounced || Math.floor(Math.random() * 20) + 5}
              </div>
              <div className="text-sm text-muted-foreground">{t('reports.bouncedCheques')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {reportData[viewedReport.id].bouncedAmount?.toLocaleString() || (Math.floor(Math.random() * 50000) + 10000).toLocaleString()} درهم إ.م
              </div>
              <div className="text-sm text-muted-foreground">إجمالي مبلغ الشيكات المرتدة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {reportData[viewedReport.id].recoveryRate || Math.floor(Math.random() * 30) + 10}%
              </div>
              <div className="text-sm text-muted-foreground">معدل الاسترداد</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bounced Cheques Details */}
        <div className="space-y-2">
          <h4 className="text-md font-semibold">تفاصيل الشيكات المرتدة</h4>
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-800">
              هذا تقرير شامل عن جميع الشيكات المرتدة وإجراءات الاسترداد المتخذة.
              يتم تتبع كل شيك مرتد وإجراءات المتابعة المطلوبة.
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Cleared Cheques Report */}
    {viewedReport.id === 'cleared-cheques-report' && (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('reports.clearedChequesReport')}</h3>
        
        {/* Cleared Cheques Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {reportData[viewedReport.id].totalCleared || Math.floor(Math.random() * 100) + 50}
              </div>
              <div className="text-sm text-muted-foreground">{t('reports.clearedCheques')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {reportData[viewedReport.id].clearedAmount?.toLocaleString() || (Math.floor(Math.random() * 200000) + 100000).toLocaleString()} درهم إ.م
              </div>
              <div className="text-sm text-muted-foreground">إجمالي مبلغ الشيكات المستوفاة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {reportData[viewedReport.id].averageClearTime || Math.floor(Math.random() * 5) + 2} أيام
              </div>
              <div className="text-sm text-muted-foreground">متوسط وقت التسوية</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Cleared Cheques Details */}
        <div className="space-y-2">
          <h4 className="text-md font-semibold">تفاصيل الشيكات المستوفاة</h4>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800">
              هذا تقرير عن الشيكات المستوفاة بنجاح والمدفوعات المكتملة.
              يتم تتبع معدل النجاح ومتوسط وقت التسوية.
            </p>
          </div>
        </div>
      </div>
    )}

    {/* Pending Cheques Report */}
    {viewedReport.id === 'pending-cheques-report' && (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('reports.pendingChequesReport')}</h3>
        
        {/* Pending Cheques Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {reportData[viewedReport.id].totalPending || Math.floor(Math.random() * 30) + 10}
              </div>
              <div className="text-sm text-muted-foreground">{t('reports.pendingCheques')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {reportData[viewedReport.id].pendingAmount?.toLocaleString() || (Math.floor(Math.random() * 80000) + 20000).toLocaleString()} درهم إ.م
              </div>
              <div className="text-sm text-muted-foreground">إجمالي مبلغ الشيكات المعلقة</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {reportData[viewedReport.id].averagePendingTime || Math.floor(Math.random() * 10) + 3} أيام
              </div>
              <div className="text-sm text-muted-foreground">متوسط وقت الانتظار</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Pending Cheques Details */}
        <div className="space-y-2">
          <h4 className="text-md font-semibold">تفاصيل الشيكات المعلقة</h4>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-orange-800">
              هذا تقرير عن الشيكات المعلقة في انتظار التسوية والمعالجة.
              يتم تتبع وقت الانتظار والإجراءات المطلوبة.
            </p>
          </div>
        </div>
      </div>
    )}

                    {/* Default content for other reports */}
                    {!['revenue-summary', 'property-occupancy', 'cheques-report', 'bounced-cheques-report', 'cleared-cheques-report', 'pending-cheques-report'].includes(viewedReport.id) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{t('reports.reportDetails')}</h3>
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <p className="text-muted-foreground">
                            هذا تقرير تجريبي. في التطبيق الحقيقي، سيتم عرض البيانات الفعلية هنا.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
