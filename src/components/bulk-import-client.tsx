
'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Building, Users, HomeIcon, UserSquare } from 'lucide-react';
import type { Employee } from '@/lib/types';
import { downloadTemplateAction, uploadFileAction } from '@/app/dashboard/actions';
import { hasPermission } from '@/lib/permissions';
import { useLanguage } from '@/contexts/language-context';

interface BulkImportClientProps {
    loggedInEmployee: Employee | null;
}

type ImportType = 'properties' | 'units' | 'tenants' | 'owners';

interface UploadCardProps {
    type: ImportType;
    title: string;
    description: string;
    icon: React.ReactNode;
}

function UploadCard({ type, title, description, icon }: UploadCardProps) {
    const { t } = useLanguage();
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleDownloadTemplate = async () => {
        const result = await downloadTemplateAction(type);
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
            toast({ title: t('bulkImport.success'), description: `${title} ${t('bulkImport.templateDownloaded')}` });
        } else {
            toast({ variant: 'destructive', title: t('bulkImport.error'), description: result.message });
        }
    };

    const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsUploading(true);
        const formData = new FormData(event.currentTarget);
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            toast({ variant: 'destructive', title: t('bulkImport.error'), description: t('bulkImport.selectFile') });
            setIsUploading(false);
            return;
        }

        const result = await uploadFileAction(type, formData);
        
        if (result.success) {
            toast({ title: t('bulkImport.success'), description: result.message });
        } else {
            toast({ variant: 'destructive', title: t('bulkImport.error'), description: result.message });
        }

        setIsUploading(false);
        (event.target as HTMLFormElement).reset();
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    {icon}
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                    <Download className="mr-2" />
                    {t('bulkImport.downloadTemplate')}
                </Button>
                <form onSubmit={handleFileUpload} className="flex gap-2">
                    <Input type="file" name="file" accept=".xlsx, .xls" required />
                    <Button type="submit" disabled={isUploading}>
                        <Upload className="mr-2" />
                        {isUploading ? t('bulkImport.uploading') : t('bulkImport.upload')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function BulkImportClient({ loggedInEmployee }: BulkImportClientProps) {
    const { t } = useLanguage();
    const canExecute = hasPermission(loggedInEmployee, 'bulk-import:execute');

    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader loggedInEmployee={loggedInEmployee} />
            <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold tracking-tight">{t('bulkImport.title')}</h2>
                    {canExecute ? (
                        <>
                            <p className="text-muted-foreground">
                                {t('bulkImport.description')}
                            </p>
                            <div className="space-y-4">
                                <UploadCard
                                    type="properties"
                                    title={t('bulkImport.properties')}
                                    description={t('bulkImport.propertiesDescription')}
                                    icon={<Building className="h-8 w-8 text-primary" />}
                                />
                                <UploadCard
                                    type="units"
                                    title={t('bulkImport.units')}
                                    description={t('bulkImport.unitsDescription')}
                                    icon={<HomeIcon className="h-8 w-8 text-primary" />}
                                />
                                <UploadCard
                                    type="tenants"
                                    title={t('bulkImport.tenants')}
                                    description={t('bulkImport.tenantsDescription')}
                                    icon={<UserSquare className="h-8 w-8 text-primary" />}
                                />
                                 <UploadCard
                                    type="owners"
                                    title={t('bulkImport.owners')}
                                    description={t('bulkImport.ownersDescription')}
                                    icon={<Users className="h-8 w-8 text-primary" />}
                                />
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-muted-foreground py-10">{t('bulkImport.noPermission')}</p>
                    )}
                </div>
            </main>
        </div>
    );
}
