
'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Download, Building, Users, HomeIcon, UserSquare, Receipt, WalletCards, FileSignature, Percent } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { generateReportAction } from '@/app/dashboard/actions';
import { Separator } from './ui/separator';
import { hasPermission } from '@/lib/permissions';
import { useToast } from '@/hooks/use-toast';

interface ReportingClientProps {
    loggedInEmployee: Employee | null;
}

type ReportType = 'properties' | 'units' | 'tenants' | 'leases' | 'expenses' | 'cheques';

interface ReportButtonProps {
    type: ReportType;
    title: string;
    description: string;
    icon: React.ReactNode;
}

function ReportButton({ type, title, description, icon }: ReportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleDownload = async () => {
        setIsLoading(true);
        const result = await generateReportAction(type);
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
            toast({ title: 'Success', description: `${title} report generated.` });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.message });
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-4">
                <div className="text-primary bg-primary/10 p-3 rounded-lg">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <Button onClick={handleDownload} disabled={isLoading}>
                <Download className="mr-2" />
                {isLoading ? 'Generating...' : 'Download'}
            </Button>
        </div>
    );
}

export default function ReportingClient({ loggedInEmployee }: ReportingClientProps) {
    const canExecute = hasPermission(loggedInEmployee, 'reporting:execute');

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader loggedInEmployee={loggedInEmployee} />
            <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
                <div className="space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Generate Reports</h2>
                        <p className="text-muted-foreground mt-2">
                            Download comprehensive Excel reports for various aspects of your operations.
                        </p>
                    </div>

                    {canExecute ? (
                        <>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">General Reports</h3>
                                    <Separator />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <ReportButton
                                        type="properties"
                                        title="Properties Report"
                                        description="Export a full list of all properties."
                                        icon={<Building />}
                                    />
                                    <ReportButton
                                        type="units"
                                        title="All Units Report"
                                        description="Export a list of all units across all properties."
                                        icon={<HomeIcon />}
                                    />
                                     <ReportButton
                                        type="tenants"
                                        title="Tenants Report"
                                        description="Export a comprehensive list of all tenants."
                                        icon={<UserSquare />}
                                    />
                                    <ReportButton
                                        type="leases"
                                        title="Active Leases Report"
                                        description="Export details of all currently active leases."
                                        icon={<FileSignature />}
                                    />
                                     <ReportButton
                                        type="expenses"
                                        title="Expenses Report"
                                        description="Export a full history of all recorded expenses."
                                        icon={<Receipt />}
                                    />
                                    <ReportButton
                                        type="cheques"
                                        title="Cheques Report"
                                        description="Export a list of all issued private cheques."
                                        icon={<WalletCards />}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">You do not have permission to generate reports.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
