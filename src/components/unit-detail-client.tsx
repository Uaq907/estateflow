'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  Phone, 
  Mail, 
  MapPin,
  Building,
  Bed,
  Bath,
  Car,
  Wifi,
  Shield,
  Star
} from 'lucide-react';
import { format } from 'date-fns';
import type { Employee } from '@/lib/types';

interface UnitDetailClientProps {
  unitDetails: {
    unit: any;
    property: any;
    currentLease: any;
    previousLeases: any[];
    currentTenant: any;
    previousTenants: any[];
    currentPayments: any[];
    previousPayments: any[];
  };
  loggedInEmployee: Employee | null;
}

export default function UnitDetailClient({ unitDetails, loggedInEmployee }: UnitDetailClientProps) {
  const { unit, property, currentLease, previousLeases, currentTenant, previousTenants, currentPayments, previousPayments } = unitDetails;

  if (!unit) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">الوحدة غير موجودة</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تفاصيل الوحدة {unit.unitNumber}</h1>
          <p className="text-muted-foreground">{property?.name || 'عقار غير محدد'}</p>
        </div>
        <Badge variant={unit.status === 'مشغول' ? 'default' : 'secondary'}>
          {unit.status}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unit Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                معلومات الوحدة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">النوع:</span>
                  <span className="font-medium">{unit.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">غرف النوم:</span>
                  <span className="font-medium">{unit.bedrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">الحمامات:</span>
                  <span className="font-medium">{unit.bathrooms}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">الطابق:</span>
                  <span className="font-medium">{unit.floor}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">المساحة:</span>
                  <span className="font-medium">{unit.size} متر مربع</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">الإيجار:</span>
                  <span className="font-medium">AED {unit.rent?.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">رقم الحساب:</span>
                  <span className="font-medium">{unit.accountNumber}</span>
                </div>
              </div>

              {unit.amenities && unit.amenities.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">المرافق المتاحة</h4>
                    <div className="flex flex-wrap gap-2">
                      {unit.amenities.map((amenity: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Current Tenant */}
          {currentTenant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  المستأجر الحالي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">الاسم:</span>
                    <span className="font-medium">{currentTenant.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">البريد:</span>
                    <span className="font-medium">{currentTenant.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">الهاتف:</span>
                    <span className="font-medium">{currentTenant.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Lease */}
          {currentLease && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  العقد الحالي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">تاريخ البداية:</span>
                    <span className="font-medium">{format(new Date(currentLease.startDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">تاريخ النهاية:</span>
                    <span className="font-medium">{format(new Date(currentLease.endDate), 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">الإيجار الشهري:</span>
                    <span className="font-medium">AED {currentLease.monthlyRent?.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Information */}
          {property && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  معلومات العقار
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">اسم العقار:</span>
                  <p className="font-medium">{property.name}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">العنوان:</span>
                  <p className="font-medium">{property.address}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">المالك:</span>
                  <p className="font-medium">{property.ownerName}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Owner Information */}
          {unit.ownerName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  معلومات المالك
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">اسم المالك:</span>
                  <p className="font-medium">{unit.ownerName}</p>
                </div>
                {unit.ownerEmail && (
                  <div>
                    <span className="text-sm text-muted-foreground">البريد الإلكتروني:</span>
                    <p className="font-medium">{unit.ownerEmail}</p>
                  </div>
                )}
                {unit.ownerPhone && (
                  <div>
                    <span className="text-sm text-muted-foreground">الهاتف:</span>
                    <p className="font-medium">{unit.ownerPhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                عرض العقد
              </Button>
              <Button variant="outline" className="w-full">
                <DollarSign className="mr-2 h-4 w-4" />
                عرض الدفعات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


