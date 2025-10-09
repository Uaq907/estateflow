

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { 
    Building, LogIn, Home, Users, ChevronDown, LandPlot, UserSquare, 
    Receipt, Wrench, Package, WalletCards, MapPin, Calendar, Clock, 
    LogOut, User, Upload, FileBarChart, DollarSign, BarChart3, Settings, 
    FileSignature, ListOrdered, Bell, Lock, Scale, FileText, Gavel, Hammer,
    Globe, UserCog
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Employee } from '@/lib/types';
import { hasPermission } from '@/lib/permissions';
import { ThemeSwitcher } from '../theme-switcher';
import { LogoutButton } from './logout-button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState, useEffect, useRef } from 'react';
import ChangePasswordDialog from '../change-password-dialog';
import { useLanguage } from '../../contexts/language-context';
import { NotificationsDropdown } from './notifications-dropdown';

export function AppHeader({ loggedInEmployee }: { loggedInEmployee: Employee | null }) {
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const hasAppliedLanguage = useRef(false);

  // Apply user's preferred language automatically only once on initial mount
  useEffect(() => {
    if (!hasAppliedLanguage.current && loggedInEmployee?.preferredLanguage && loggedInEmployee.preferredLanguage !== language) {
      setLanguage(loggedInEmployee.preferredLanguage);
      hasAppliedLanguage.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInEmployee?.preferredLanguage]); // Only run when preferred language from DB changes

  const canReadEmployees = hasPermission(loggedInEmployee, 'employees:read');
  const canReadProperties = hasPermission(loggedInEmployee, 'properties:read');
  const canReadTenants = hasPermission(loggedInEmployee, 'tenants:read');
  const canReadLeases = hasPermission(loggedInEmployee, 'leases:read');
  const canReadAssets = hasPermission(loggedInEmployee, 'assets:read');
  const canReadCheques = hasPermission(loggedInEmployee, 'cheques:read');
  const canBulkImport = hasPermission(loggedInEmployee, 'bulk-import:execute');
  const canGenerateReports = hasPermission(loggedInEmployee, 'reporting:execute');
  const canReadExpenses = hasPermission(loggedInEmployee, 'expenses:read-all') || hasPermission(loggedInEmployee, 'expenses:read-own');
  const canReadMaintenance = hasPermission(loggedInEmployee, 'maintenance:read');
  const canViewOverview = hasPermission(loggedInEmployee, 'dashboard:view-overview');
  const canViewCalendar = hasPermission(loggedInEmployee, 'dashboard:view-calendar');
  const canManageSettings = hasPermission(loggedInEmployee, 'settings:manage');
  const canViewLogs = hasPermission(loggedInEmployee, 'settings:view-logs');


  // Determine if the dropdown triggers should be shown
  const canViewManagementDropdown = canReadEmployees || canReadProperties || canReadTenants || canReadAssets || canBulkImport || canGenerateReports || canViewOverview;
  const canViewFinancialsDropdown = canReadExpenses || canReadCheques || canReadLeases;
  const canViewSettingsDropdown = canManageSettings || canViewLogs;

  return (
    <>
    <header className="sticky top-0 md:top-4 z-50 md:mx-4 sm:mx-6 lg:mx-8">
      <div className="flex h-16 items-center justify-between md:rounded-lg border-b md:border bg-background/80 px-4 shadow-md backdrop-blur-sm sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
          <Image
            src="/uploads/logo/estateflowlogo.png"
            alt="EstateFlow Logo"
            width={150}
            height={40}
            className="object-contain invert dark:invert-0"
          />
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          
          {loggedInEmployee && (
            <nav className="hidden md:flex items-center gap-1 rounded-full bg-secondary/50 p-1 shadow-inner">
              <Button variant="ghost" size="sm" asChild className="rounded-full">
                  <Link href="/dashboard"><Home /><span className="xl:inline hidden ml-2">{t('nav.home')}</span></Link>
              </Button>
                {canViewManagementDropdown && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Users className="xl:hidden" />
                        <span className="xl:inline hidden">{t('nav.management')}</span>
                        <ChevronDown className="ml-0 xl:ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="xl:hidden">{t('nav.management')}</DropdownMenuLabel>
                      <DropdownMenuSeparator className="xl:hidden"/>
                      {canViewOverview && <DropdownMenuItem asChild><Link href="/dashboard/overview"><BarChart3 className="mr-2" />{t('nav.dashboardOverview')}</Link></DropdownMenuItem>}
                      {canReadEmployees && <DropdownMenuItem asChild><Link href="/dashboard/employees"><Users className="mr-2" />{t('nav.employees')}</Link></DropdownMenuItem>}
                      {canReadProperties && <DropdownMenuItem asChild><Link href="/dashboard/properties"><LandPlot className="mr-2" />{t('nav.properties')}</Link></DropdownMenuItem>}
                      {canReadTenants && <DropdownMenuItem asChild><Link href="/dashboard/tenants"><UserSquare className="mr-2" />{t('nav.tenants')}</Link></DropdownMenuItem>}
                      
                      <DropdownMenuSeparator />
                      {canBulkImport && <DropdownMenuItem asChild><Link href="/dashboard/bulk-import"><Upload className="mr-2" />{t('nav.bulkImport')}</Link></DropdownMenuItem>}
                      {canGenerateReports && <DropdownMenuItem asChild><Link href="/dashboard/reporting"><FileBarChart className="mr-2" />{t('nav.reporting')}</Link></DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {canViewFinancialsDropdown && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <DollarSign className="xl:hidden" />
                        <span className="xl:inline hidden">{t('nav.financials')}</span>
                        <ChevronDown className="ml-0 xl:ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       <DropdownMenuLabel className="xl:hidden">{t('nav.financials')}</DropdownMenuLabel>
                       <DropdownMenuSeparator className="xl:hidden"/>
                       {canReadLeases && <DropdownMenuItem asChild><Link href="/dashboard/financials/overview"><BarChart3 className="mr-2" />{t('nav.financialsDashboard')}</Link></DropdownMenuItem>}
                       {canReadLeases && <DropdownMenuItem asChild><Link href="/dashboard/financials"><FileSignature className="mr-2" />{t('nav.leasesPayments')}</Link></DropdownMenuItem>}
                       {canReadExpenses && <DropdownMenuItem asChild><Link href="/dashboard/expenses"><Receipt className="mr-2" />{t('nav.expenses')}</Link></DropdownMenuItem>}
                       {canReadExpenses && <DropdownMenuItem asChild><Link href="/dashboard/purchase-requests"><DollarSign className="mr-2" />{t('nav.purchaseRequests')}</Link></DropdownMenuItem>}
                       {canReadCheques && <DropdownMenuItem asChild><Link href="/dashboard/cheques"><WalletCards className="mr-2"/>{t('nav.cheques')}</Link></DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {/* Maintenance Dropdown */}
                {(canReadMaintenance || canReadAssets) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full">
                        <Wrench className="xl:hidden" />
                        <span className="xl:inline hidden">{t('nav.maintenance')}</span>
                        <ChevronDown className="ml-0 xl:ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel className="xl:hidden">{t('nav.maintenance')}</DropdownMenuLabel>
                      <DropdownMenuSeparator className="xl:hidden"/>
                      {canReadMaintenance && <DropdownMenuItem asChild><Link href="/dashboard/maintenance"><Wrench className="mr-2" />{t('nav.maintenance')}</Link></DropdownMenuItem>}
                      {canReadAssets && <DropdownMenuItem asChild><Link href="/dashboard/assets"><Package className="mr-2" />{t('nav.assets')}</Link></DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {/* Calendar Button */}
                {canViewCalendar && <Button variant="ghost" size="sm" asChild className="rounded-full"><Link href="/dashboard/calendar"><Calendar /><span className="xl:inline hidden ml-2">{t('nav.calendar')}</span></Link></Button>}
                {/* Cases - Legal Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Scale className="xl:hidden" />
                      <span className="xl:inline hidden">{t('nav.legal')}</span>
                      <ChevronDown className="ml-0 xl:ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="xl:hidden">{t('nav.legal')}</DropdownMenuLabel>
                    <DropdownMenuSeparator className="xl:hidden"/>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/legal/eviction">
                        <FileText className="mr-2" />
                        {t('nav.eviction')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/legal/increase">
                        <DollarSign className="mr-2" />
                        {t('nav.increase')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/legal/cases">
                        <Gavel className="mr-2" />
                        {t('nav.cases')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/legal/enforcement">
                        <Hammer className="mr-2" />
                        {t('nav.enforcement')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/legal/petition-templates">
                        <FileText className="mr-2" />
                        نماذج الدعاوى
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                 {canViewSettingsDropdown && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="rounded-full">
                          <Settings className="xl:hidden" />
                          <span className="xl:inline hidden">{t('settings.title')}</span>
                          <ChevronDown className="ml-0 xl:ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="xl:hidden">{t('settings.title')}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="xl:hidden"/>
                        {canManageSettings && <DropdownMenuItem asChild><Link href="/dashboard/settings/unit-configurations"><Settings className="mr-2" />{t('settings.unitConfigurations')}</Link></DropdownMenuItem>}
                        {canViewLogs && <DropdownMenuItem asChild><Link href="/dashboard/settings/log-analyzer"><ListOrdered className="mr-2" />{t('settings.logAnalyzer')}</Link></DropdownMenuItem>}
                        {canManageSettings && <DropdownMenuItem asChild><Link href="/dashboard/settings/reports"><BarChart3 className="mr-2" />{t('settings.reports')}</Link></DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                 )}
            </nav>
          )}

          {loggedInEmployee && <NotificationsDropdown language={language} t={t} />}
          
          <ThemeSwitcher />

          {loggedInEmployee ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 gap-2 px-2 rounded-full">
                   <Avatar className="h-8 w-8">
                    <AvatarImage src={loggedInEmployee.profilePictureUrl ?? undefined} alt={loggedInEmployee.name} />
                    <AvatarFallback>
                      <User />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{loggedInEmployee.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal md:hidden">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{loggedInEmployee.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{loggedInEmployee.email}</p>
                  </div>
                </DropdownMenuLabel>
                <div className="md:hidden">
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild><Link href="/dashboard"><Home className="mr-2" />{t('nav.home')}</Link></DropdownMenuItem>
                     {canViewCalendar && <DropdownMenuItem asChild><Link href="/dashboard/calendar"><Calendar className="mr-2" />{t('nav.calendar')}</Link></DropdownMenuItem>}
                    {canReadEmployees && <DropdownMenuItem asChild><Link href="/dashboard/employees"><Users className="mr-2" />{t('nav.employees')}</Link></DropdownMenuItem>}
                    {canReadProperties && <DropdownMenuItem asChild><Link href="/dashboard/properties"><LandPlot className="mr-2" />{t('nav.properties')}</Link></DropdownMenuItem>}
                    {canReadTenants && <DropdownMenuItem asChild><Link href="/dashboard/tenants"><UserSquare className="mr-2" />{t('nav.tenants')}</Link></DropdownMenuItem>}
                    
                    {canReadAssets && <DropdownMenuItem asChild><Link href="/dashboard/assets"><Package className="mr-2" />{t('nav.assets')}</Link></DropdownMenuItem>}
                    {canReadExpenses && <DropdownMenuItem asChild><Link href="/dashboard/expenses"><Receipt className="mr-2"/>{t('nav.expenses')}</Link></DropdownMenuItem>}
                    {canReadMaintenance && <DropdownMenuItem asChild><Link href="/dashboard/maintenance"><Wrench className="mr-2"/>{t('nav.maintenance')}</Link></DropdownMenuItem>}
                    {canReadCheques && <DropdownMenuItem asChild><Link href="/dashboard/cheques"><WalletCards className="mr-2"/>{t('nav.cheques')}</Link></DropdownMenuItem>}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard/legal/eviction"><FileText className="mr-2" />{t('nav.eviction')}</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/legal/increase"><DollarSign className="mr-2" />{t('nav.increase')}</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/legal/cases"><Gavel className="mr-2" />{t('nav.cases')}</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/legal/enforcement"><Hammer className="mr-2" />{t('nav.enforcement')}</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/legal/petition-templates"><FileText className="mr-2" />نماذج الدعاوى</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canBulkImport && <DropdownMenuItem asChild><Link href="/dashboard/bulk-import"><Upload className="mr-2" />{t('nav.bulkImport')}</Link></DropdownMenuItem>}
                    {canGenerateReports && <DropdownMenuItem asChild><Link href="/dashboard/reporting"><FileBarChart className="mr-2" />{t('nav.reporting')}</Link></DropdownMenuItem>}
                     {canViewSettingsDropdown && <DropdownMenuItem asChild><Link href="/dashboard/settings/unit-configurations"><Settings className="mr-2"/>{t('settings.title')}</Link></DropdownMenuItem>}
                </div>
                <DropdownMenuSeparator />
                
                {/* User Preferences */}
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/user-preferences">
                    <UserCog className="mr-2" />
                    {t('user.preferences')}
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem onSelect={() => setIsChangePasswordOpen(true)}>
                    <Lock className="mr-2" />
                    {t('user.changePassword')}
                </DropdownMenuItem>
                <LogoutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button asChild>
                <Link href="/login"><LogIn className="mr-2"/>Login</Link>
             </Button>
          )}
        </div>
      </div>
    </header>
    {loggedInEmployee && (
      <ChangePasswordDialog 
        isOpen={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
        employeeId={loggedInEmployee.id}
      />
    )}
    </>
  );
}
