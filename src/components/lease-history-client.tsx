'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Employee } from '@/lib/types';
import { LeaseHistoryItem } from '@/lib/db';
import { useLanguage } from '@/contexts/language-context';
import { AppHeader } from './layout/header';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Search, 
  Calendar, 
  Building, 
  User, 
  DollarSign, 
  FileText, 
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';

interface LeaseHistoryClientProps {
  leaseHistory: LeaseHistoryItem[];
  loggedInEmployee: Employee;
}

export default function LeaseHistoryClient({ 
  leaseHistory, 
  loggedInEmployee 
}: LeaseHistoryClientProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    return leaseHistory.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.property?.name?.toLowerCase().includes(searchLower) ||
        item.unit?.unitNumber?.toLowerCase().includes(searchLower) ||
        item.tenant?.name?.toLowerCase().includes(searchLower) ||
        item.lease?.businessName?.toLowerCase().includes(searchLower)
      );
    });
  }, [leaseHistory, searchTerm]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-500">{t('leaseHistory.completed')}</Badge>;
      case 'Completed with Dues':
        return <Badge className="bg-orange-500">{t('leaseHistory.completedWithDues')}</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">{t('leaseHistory.cancelled')}</Badge>;
      case 'Cancelled with Dues':
        return <Badge variant="destructive">{t('leaseHistory.cancelledWithDues')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return `AED ${amount.toLocaleString()}`;
  };

  // إحصائيات سريعة
  const stats = useMemo(() => {
    const totalLeases = filteredHistory.length;
    const totalRevenue = filteredHistory.reduce((sum, item) => sum + item.totalPaidAmount, 0);
    const totalDues = filteredHistory.reduce((sum, item) => 
      sum + (item.totalDueAmount - item.totalPaidAmount), 0
    );
    const completedCount = filteredHistory.filter(item => 
      item.lease.status === 'Completed'
    ).length;

    return { totalLeases, totalRevenue, totalDues, completedCount };
  }, [filteredHistory]);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      
      <main className="flex-1 p-6 space-y-6">
        {/* العنوان والوصف */}
        <div>
          <h1 className="text-3xl font-bold">{t('leaseHistory.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('leaseHistory.description')}
          </p>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('leaseHistory.totalLeases')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeases}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('leaseHistory.completedLeases')}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('leaseHistory.totalRevenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('leaseHistory.outstandingDues')}
              </CardTitle>
              <XCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalDues)}</div>
            </CardContent>
          </Card>
        </div>

        {/* شريط البحث */}
        <Card>
          <CardHeader>
            <CardTitle>{t('leaseHistory.searchTitle')}</CardTitle>
            <CardDescription>{t('leaseHistory.searchDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('leaseHistory.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* جدول السجل */}
        <Card>
          <CardHeader>
            <CardTitle>{t('leaseHistory.historyTable')}</CardTitle>
            <CardDescription>
              {t('leaseHistory.showing')} {filteredHistory.length} {t('leaseHistory.of')} {leaseHistory.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border" dir="rtl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">{t('leaseHistory.property')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.unit')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.tenant')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.startDate')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.endDate')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.duration')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.totalAmount')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.paid')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.remaining')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.payments')}</TableHead>
                    <TableHead className="text-right">{t('leaseHistory.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                        {t('leaseHistory.noResults')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredHistory.map((item) => {
                      const startDate = new Date(item.lease.startDate);
                      const endDate = new Date(item.lease.endDate);
                      const durationMonths = Math.round(
                        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
                      );
                      const remaining = item.totalDueAmount - item.totalPaidAmount;

                      return (
                        <TableRow key={item.lease.id}>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <div>
                                <div className="font-medium">{item.property.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {item.property.location}
                                </div>
                              </div>
                              <Building className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline">{item.unit.unitNumber}</Badge>
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.unit.type}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <div>
                                <div className="font-medium">{item.tenant.name}</div>
                                {item.lease.businessName && (
                                  <div className="text-sm text-muted-foreground">
                                    {item.lease.businessName}
                                  </div>
                                )}
                              </div>
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm">
                                {format(startDate, 'dd/MM/yyyy', { locale: language === 'ar' ? ar : undefined })}
                              </span>
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm">
                                {format(endDate, 'dd/MM/yyyy', { locale: language === 'ar' ? ar : undefined })}
                              </span>
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-sm">{durationMonths} {t('leaseHistory.months')}</span>
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.totalDueAmount)}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {formatCurrency(item.totalPaidAmount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={remaining > 0 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                              {formatCurrency(remaining)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              <span className="text-green-600 font-medium">{item.completedPaymentsCount}</span>
                              <span className="text-muted-foreground"> / {item.paymentsCount}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {getStatusBadge(item.lease.status)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

