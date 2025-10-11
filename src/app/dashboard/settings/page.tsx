import { getEmployeeFromSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Settings, FileText, Package, Bell, Activity } from 'lucide-react';
import { hasPermission } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const loggedInEmployee = await getEmployeeFromSession();
  
  if (!loggedInEmployee) {
    redirect('/login');
  }

  const settingsPages = [
    {
      title: 'محلل السجلات',
      description: 'عرض وتحليل سجلات النشاط في النظام',
      icon: Activity,
      href: '/dashboard/settings/log-analyzer',
      permission: 'settings:view-logs'
    },
    {
      title: 'التقارير',
      description: 'إنشاء وعرض التقارير المختلفة',
      icon: FileText,
      href: '/dashboard/settings/reports',
      permission: 'reports:view'
    },
    {
      title: 'إعدادات الوحدات',
      description: 'إدارة تكوينات أنواع الوحدات',
      icon: Package,
      href: '/dashboard/settings/unit-configurations',
      permission: 'settings:manage'
    }
  ];

  const availableSettings = settingsPages.filter(page => 
    hasPermission(loggedInEmployee, page.permission)
  );

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader loggedInEmployee={loggedInEmployee} />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">الإعدادات</h1>
              <p className="text-muted-foreground">إدارة إعدادات النظام والتكوينات</p>
            </div>
          </div>

          {availableSettings.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableSettings.map((setting) => (
                <Link key={setting.href} href={setting.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <setting.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl">{setting.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base">
                        {setting.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  ليس لديك صلاحية الوصول لأي من صفحات الإعدادات
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

