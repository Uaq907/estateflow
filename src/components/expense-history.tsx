'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, FileWarning, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/language-context';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExpenseHistoryItem {
  id: string;
  expenseId: string;
  action: 'Created' | 'Submitted' | 'Approved' | 'Conditionally Approved' | 'Rejected' | 'Needs Correction' | 'Corrected' | 'Resubmitted';
  performedBy: string;
  performedByName: string;
  notes?: string;
  previousStatus?: string;
  newStatus?: string;
  createdAt: Date;
}

interface ExpenseHistoryProps {
  expenseId: string;
  history: ExpenseHistoryItem[];
}

export default function ExpenseHistory({ expenseId, history }: ExpenseHistoryProps) {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? ar : enUS;

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Created':
      case 'Submitted':
      case 'Resubmitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'Approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Conditionally Approved':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'Needs Correction':
        return <FileWarning className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'Approved':
        return 'default';
      case 'Conditionally Approved':
        return 'secondary';
      case 'Rejected':
        return 'destructive';
      case 'Needs Correction':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'Created': t('expenseHistory.created'),
      'Submitted': t('expenseHistory.submitted'),
      'Approved': t('expenseHistory.approved'),
      'Conditionally Approved': t('expenseHistory.conditionallyApproved'),
      'Rejected': t('expenseHistory.rejected'),
      'Needs Correction': t('expenseHistory.needsCorrection'),
      'Corrected': t('expenseHistory.corrected'),
      'Resubmitted': t('expenseHistory.resubmitted'),
    };
    return labels[action] || action;
  };

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('expenseHistory.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('expenseHistory.noHistory')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {t('expenseHistory.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline Line */}
                {index < history.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-border" />
                )}
                
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border bg-background">
                    {getActionIcon(item.action)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <Badge variant={getActionBadgeVariant(item.action)} className="w-fit">
                          {getActionLabel(item.action)}
                        </Badge>
                        {item.previousStatus && item.newStatus && (
                          <p className="text-xs text-muted-foreground">
                            {item.previousStatus} → {item.newStatus}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {format(new Date(item.createdAt), 'PPp', { locale })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{item.performedByName}</span>
                    </div>
                    
                    {item.notes && (
                      <div className="rounded-md bg-muted p-3 text-sm">
                        <p className="font-medium text-xs text-muted-foreground mb-1">
                          {t('expenseHistory.notes')}:
                        </p>
                        <p className="whitespace-pre-line">{item.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {index < history.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

