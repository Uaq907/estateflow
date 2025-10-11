import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFReportData {
  title: string;
  description: string;
  generatedAt: Date;
  period: string;
  summary: {
    totalRecords: number;
    totalAmount: number;
    growthRate: string;
  };
  data: any;
  type: string;
}

export class PDFReportGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 15;
  private contentWidth: number = 180;
  private leftMargin: number = 15;
  private rightMargin: number = 15;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.doc.setProperties({
      title: 'EstateFlow Report',
      subject: 'Property Management Report',
      author: 'EstateFlow System',
      creator: 'EstateFlow PDF Generator',
      keywords: 'real estate, property management, report'
    });
    
    // Set default font
    this.doc.setFont('helvetica');
  }

  generateReport(reportData: PDFReportData): void {
    this.addHeader(reportData);
    this.addSummary(reportData);
    this.addContent(reportData);
    this.addFooter();
  }

  private addHeader(reportData: PDFReportData): void {
    // Header background with gradient effect
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(0, 0, 210, 35, 'F');
    
    // Top decorative line
    this.doc.setLineWidth(3);
    this.doc.setDrawColor(255, 255, 255);
    this.doc.line(0, 35, 210, 35);
    
    // Company Logo/Title with white color on blue background
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('EstateFlow', this.leftMargin, 15);
    
    // Company subtitle in white
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(240, 248, 255);
    this.doc.text('نظام إدارة العقارات المتقدم', this.leftMargin, 22);
    
    // Report ID and date on the right side
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(240, 248, 255);
    const reportId = `ID: ${reportData.type.toUpperCase()}`;
    const reportIdWidth = this.doc.getTextWidth(reportId);
    this.doc.text(reportId, 210 - this.rightMargin - reportIdWidth, 15);
    
    const dateText = new Date().toLocaleDateString('en-GB');
    const dateWidth = this.doc.getTextWidth(dateText);
    this.doc.text(dateText, 210 - this.rightMargin - dateWidth, 22);
    
    // Reset current Y position
    this.currentY = 45;
    
    // Report title in a styled box
    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, 15, 'F');
    this.doc.setLineWidth(1);
    this.doc.setDrawColor(59, 130, 246);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, 15);
    
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    const reportTitle = reportData.data?.reportTitle || reportData.title;
    const titleWidth = this.doc.getTextWidth(reportTitle);
    this.doc.text(reportTitle, this.leftMargin + (this.contentWidth - titleWidth) / 2, this.currentY + 10);
    this.currentY += 20;
    
    // Report description in a subtle box
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, 12, 'F');
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, 12);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    this.doc.text(reportData.description, this.leftMargin + 5, this.currentY + 7);
    this.currentY += 17;
    
    // Report info table
    this.addInfoTable(reportData);
    
    // Bottom decorative line
    this.currentY += 8;
    this.doc.setLineWidth(1);
    this.doc.setDrawColor(59, 130, 246);
    this.doc.line(this.leftMargin, this.currentY, 210 - this.rightMargin, this.currentY);
    this.currentY += 15;
  }

  private addInfoTable(reportData: PDFReportData): void {
    const tableData = [
      ['تاريخ الإنشاء:', reportData.generatedAt.toLocaleDateString('en-GB')],
      ['الفترة الزمنية:', reportData.period],
      ['نوع التقرير:', this.getReportTypeName(reportData.type)],
      ['حالة التقرير:', 'مكتمل']
    ];

    // Add filter information if available
    if (reportData.data?.filters) {
      const filters = reportData.data.filters;
      if (filters.owner && filters.owner !== 'جميع الملاك') {
        tableData.push(['المالك:', filters.owner]);
      }
      if (filters.property && filters.property !== 'جميع العقارات') {
        tableData.push(['العقار:', filters.property]);
      }
      if (filters.unit && filters.unit !== 'جميع الوحدات') {
        tableData.push(['الوحدة:', filters.unit]);
      }
    }

    const colWidths = [45, 135];
    const rowHeight = 7;
    const tableHeight = rowHeight * tableData.length;

    // Table header with gradient background
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, rowHeight, 'F');
    
    // Header text in white
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('معلومات التقرير', this.leftMargin + (this.contentWidth / 2) - 15, this.currentY + 5);
    
    // Table body background
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(this.leftMargin, this.currentY + rowHeight, this.contentWidth, tableHeight - rowHeight, 'F');
    
    // Table border with rounded corners effect
    this.doc.setLineWidth(1);
    this.doc.setDrawColor(59, 130, 246);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, tableHeight);

    tableData.forEach((row, rowIndex) => {
      const y = this.currentY + ((rowIndex + 1) * rowHeight);
      
      // Alternating row colors
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(this.leftMargin + 1, y, this.contentWidth - 2, rowHeight - 1, 'F');
      }
      
      // Vertical line
      this.doc.setLineWidth(0.3);
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.leftMargin + colWidths[0], y, this.leftMargin + colWidths[0], y + rowHeight);
      
      // Horizontal line
      this.doc.line(this.leftMargin, y + rowHeight, this.leftMargin + this.contentWidth, y + rowHeight);
      
      // Text
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(75, 85, 99);
      this.doc.text(row[0], this.leftMargin + 3, y + 5);
      
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(row[1], this.leftMargin + colWidths[0] + 3, y + 5);
    });

    this.currentY += tableHeight + 8;
  }

  private getReportTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      'revenue-summary': 'تقرير الإيرادات',
      'expense-analysis': 'تحليل المصروفات',
      'property-occupancy': 'معدل الإشغال',
      'maintenance-summary': 'ملخص الصيانة',
      'tenant-analysis': 'تحليل المستأجرين',
      'performance-dashboard': 'لوحة الأداء',
      'trend-analysis': 'تحليل الاتجاهات',
      'compliance-report': 'تقرير الامتثال',
      'audit-trail': 'مسار المراجعة'
    };
    return typeNames[type] || 'تقرير عام';
  }

  private addSummary(reportData: PDFReportData): void {
    // Section title with background
    this.doc.setFillColor(240, 248, 255);
    this.doc.rect(this.leftMargin, this.currentY - 3, this.contentWidth, 8, 'F');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ملخص التقرير', this.leftMargin + 3, this.currentY + 2);
    this.currentY += 12;

    // Summary cards in a 3-column layout
    const cardWidth = (this.contentWidth - 10) / 3;
    const cardHeight = 25;
    const cardSpacing = 5;

    // Card 1: Total Records
    this.addSummaryCard(
      this.leftMargin,
      this.currentY,
      cardWidth,
      cardHeight,
      reportData.summary.totalRecords.toString(),
      'إجمالي السجلات',
      [52, 152, 219] // Blue
    );

    // Card 2: Total Amount
    this.addSummaryCard(
      this.leftMargin + cardWidth + cardSpacing,
      this.currentY,
      cardWidth,
      cardHeight,
      `${reportData.summary.totalAmount.toLocaleString()} درهم إ.م`,
      'إجمالي المبلغ',
      [46, 204, 113] // Green
    );

    // Card 3: Growth Rate
    const growthRate = parseFloat(reportData.summary.growthRate);
    this.addSummaryCard(
      this.leftMargin + (cardWidth + cardSpacing) * 2,
      this.currentY,
      cardWidth,
      cardHeight,
      reportData.summary.growthRate,
      'معدل النمو',
      growthRate >= 0 ? [46, 204, 113] : [231, 76, 60] // Green or Red
    );

    this.currentY += cardHeight + 15;
  }

  private addSummaryCard(x: number, y: number, width: number, height: number, value: string, label: string, color: number[]): void {
    // Card shadow effect
    this.doc.setFillColor(220, 220, 220);
    this.doc.rect(x + 1, y + 1, width, height, 'F');
    
    // Card background with gradient effect
    this.doc.setFillColor(255, 255, 255);
    this.doc.rect(x, y, width, height, 'F');
    
    // Card border with color
    this.doc.setLineWidth(1.5);
    this.doc.setDrawColor(color[0], color[1], color[2]);
    this.doc.rect(x, y, width, height);
    
    // Top accent line
    this.doc.setLineWidth(3);
    this.doc.setDrawColor(color[0], color[1], color[2]);
    this.doc.line(x, y, x + width, y);
    
    // Icon placeholder (small circle)
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.circle(x + width - 8, y + 8, 3, 'F');
    
    // Value with enhanced styling
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(color[0], color[1], color[2]);
    const valueWidth = this.doc.getTextWidth(value);
    this.doc.text(value, x + (width - valueWidth) / 2, y + 14);
    
    // Label with better positioning
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(75, 85, 99);
    const labelWidth = this.doc.getTextWidth(label);
    this.doc.text(label, x + (width - labelWidth) / 2, y + 22);
    
    // Bottom accent line
    this.doc.setLineWidth(1);
    this.doc.setDrawColor(240, 240, 240);
    this.doc.line(x + 5, y + height - 3, x + width - 5, y + height - 3);
  }

  private addContent(reportData: PDFReportData): void {
    // Section title with background
    this.doc.setFillColor(240, 248, 255);
    this.doc.rect(this.leftMargin, this.currentY - 3, this.contentWidth, 8, 'F');
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('تفاصيل التقرير', this.leftMargin + 3, this.currentY + 2);
    this.currentY += 12;

    // Check if we need a new page
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = 20;
    }

    switch (reportData.type) {
      case 'revenue-summary':
        this.addRevenueContent(reportData.data);
        break;
      case 'property-occupancy':
        this.addOccupancyContent(reportData.data);
        break;
      case 'expense-analysis':
        this.addExpenseContent(reportData.data);
        break;
      default:
        this.addDefaultContent(reportData.data);
    }
  }

  private checkPageBreak(requiredSpace: number = 20): boolean {
    if (this.currentY + requiredSpace > this.pageHeight) {
      this.doc.addPage();
      this.currentY = 20;
      return true;
    }
    return false;
  }

  private addRevenueContent(data: any): void {
    // Main financial metrics in a table format
    this.checkPageBreak(40);
    
    const financialData = [
      { label: 'إجمالي الإيرادات', value: `${data.revenue?.toLocaleString()} درهم إ.م`, color: [46, 204, 113] },
      { label: 'إجمالي المصروفات', value: `${data.expenses?.toLocaleString()} درهم إ.م`, color: [231, 76, 60] },
      { label: 'صافي الربح', value: `${data.profit?.toLocaleString()} درهم إ.م`, color: [52, 152, 219] }
    ];

    // Create a table for financial data
    this.addDataTable('المؤشرات المالية الرئيسية', financialData);

    // Categories breakdown
    if (data.categories && data.categories.length > 0) {
      this.checkPageBreak(30);
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text('تفصيل الإيرادات حسب الفئات:', this.leftMargin, this.currentY);
      this.currentY += 8;

      // Create categories table
      const categoryData = data.categories.map((category: any) => ({
        label: category.name,
        value: `${category.amount.toLocaleString()} درهم إ.م (${category.percentage}%)`,
        color: [100, 100, 100]
      }));

      this.addDataTable('', categoryData, false);
    }
  }

  private addDataTable(title: string, data: any[], showTitle: boolean = true): void {
    if (showTitle && title) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(title, this.leftMargin, this.currentY);
      this.currentY += 8;
    }

    const rowHeight = 8;
    const colWidths = [80, 100];

    // Table header
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, rowHeight, 'F');
    
    // Table borders
    this.doc.setLineWidth(0.3);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, rowHeight * (data.length + 1));

    // Header text
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('المؤشر', this.leftMargin + 3, this.currentY + 5);
    this.doc.text('القيمة', this.leftMargin + colWidths[0] + 3, this.currentY + 5);

    // Vertical line
    this.doc.line(this.leftMargin + colWidths[0], this.currentY, this.leftMargin + colWidths[0], this.currentY + rowHeight * (data.length + 1));

    this.currentY += rowHeight;

    // Data rows
    data.forEach((item, index) => {
      // Alternating row colors
      if (index % 2 === 0) {
        this.doc.setFillColor(250, 250, 250);
        this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, rowHeight, 'F');
      }

      // Text
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(item.color[0], item.color[1], item.color[2]);
      this.doc.text(item.label, this.leftMargin + 3, this.currentY + 5);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(item.value, this.leftMargin + colWidths[0] + 3, this.currentY + 5);

      this.currentY += rowHeight;
    });

    this.currentY += 10;
  }

  private addOccupancyContent(data: any): void {
    this.checkPageBreak(40);
    
    // Overall occupancy rate in a highlighted box
    this.doc.setFillColor(240, 248, 255);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, 20, 'F');
    this.doc.setLineWidth(1);
    this.doc.setDrawColor(52, 152, 219);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, 20);
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(52, 152, 219);
    const rateText = `معدل الإشغال الإجمالي: ${data.occupancyRate}`;
    const rateWidth = this.doc.getTextWidth(rateText);
    this.doc.text(rateText, this.leftMargin + (this.contentWidth - rateWidth) / 2, this.currentY + 12);
    this.currentY += 25;

    // Properties breakdown
    if (data.properties && data.properties.length > 0) {
      this.checkPageBreak(30);
      
      const propertyData = data.properties.map((property: any) => ({
        label: property.name,
        value: `${property.occupied}/${property.total} وحدة (${property.rate})`,
        color: [100, 100, 100]
      }));

      this.addDataTable('تفصيل العقارات', propertyData);
    }
  }

  private addExpenseContent(data: any): void {
    if (data.expenses && data.expenses.length > 0) {
      this.checkPageBreak(30);
      
      const expenseData = data.expenses.map((expense: any) => {
        const trendIcon = expense.trend === 'up' ? '↗' : expense.trend === 'down' ? '↘' : '→';
        return {
          label: expense.category,
          value: `${expense.amount.toLocaleString()} درهم إ.م ${trendIcon}`,
          color: expense.trend === 'up' ? [231, 76, 60] : expense.trend === 'down' ? [46, 204, 113] : [100, 100, 100]
        };
      });

      this.addDataTable('تفصيل المصروفات', expenseData);
    }
  }

  private addDefaultContent(data: any): void {
    this.checkPageBreak(30);
    
    // Default content in a bordered box
    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, 30, 'F');
    this.doc.setLineWidth(0.5);
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(this.leftMargin, this.currentY, this.contentWidth, 30);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('هذا تقرير تجريبي. في التطبيق الحقيقي، سيتم عرض البيانات الفعلية هنا.', this.leftMargin + 5, this.currentY + 10);
    
    if (data.summary) {
      this.doc.text(`إجمالي السجلات: ${data.summary.totalRecords}`, this.leftMargin + 5, this.currentY + 18);
      this.doc.text(`إجمالي المبلغ: ${data.summary.totalAmount.toLocaleString()} درهم إ.م`, this.leftMargin + 5, this.currentY + 25);
    }
    
    this.currentY += 35;
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer background
      this.doc.setFillColor(59, 130, 246);
      this.doc.rect(0, 275, 210, 20, 'F');
      
      // Top border line
      this.doc.setLineWidth(2);
      this.doc.setDrawColor(255, 255, 255);
      this.doc.line(0, 275, 210, 275);
      
      // Footer content in white
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(255, 255, 255);
      
      // Left side - Generated by
      this.doc.text('تم إنشاؤه بواسطة EstateFlow', this.leftMargin, 285);
      
      // Right side - Page number
      const pageText = `صفحة ${i} من ${pageCount}`;
      const pageWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, 210 - this.rightMargin - pageWidth, 285);
      
      // Center - Date
      const dateText = new Date().toLocaleDateString('en-GB');
      const dateWidth = this.doc.getTextWidth(dateText);
      this.doc.text(dateText, (210 - dateWidth) / 2, 285);
      
      // Copyright notice
      this.doc.setFontSize(7);
      this.doc.setTextColor(240, 248, 255);
      const copyrightText = '© 2024 EstateFlow - جميع الحقوق محفوظة';
      const copyrightWidth = this.doc.getTextWidth(copyrightText);
      this.doc.text(copyrightText, (210 - copyrightWidth) / 2, 290);
    }
  }

  download(filename?: string): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `EstateFlow_Report_${timestamp}.pdf`;
    this.doc.save(filename || defaultFilename);
  }

  getBlob(): Blob {
    return this.doc.output('blob');
  }
}

export function generatePDFReport(reportData: PDFReportData, filename?: string): void {
  const generator = new PDFReportGenerator();
  generator.generateReport(reportData);
  generator.download(filename);
}

export function generatePDFFromHTML(elementId: string, filename?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const element = document.getElementById(elementId);
    if (!element) {
      reject(new Error('Element not found'));
      return;
    }

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const defaultFilename = `تقرير_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename || defaultFilename);
      resolve();
    }).catch(reject);
  });
}
