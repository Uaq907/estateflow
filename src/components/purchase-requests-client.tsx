'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, MoreVertical, Check, X, Eye, Trash2, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { PurchaseRequest, Employee, Property } from '@/lib/types';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/hooks/use-toast';
import {
    handleAddPurchaseRequest,
    handleApprovePurchaseRequest,
    handleRejectPurchaseRequest,
    handleDeletePurchaseRequest,
} from '@/app/dashboard/actions';

interface PurchaseRequestsClientProps {
    loggedInEmployee: Employee | null;
    initialPurchaseRequests: PurchaseRequest[];
    properties: Property[];
    canApprove: boolean;
}

export default function PurchaseRequestsClient({
    loggedInEmployee,
    initialPurchaseRequests,
    properties,
    canApprove,
}: PurchaseRequestsClientProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [purchaseRequests, setPurchaseRequests] = useState(initialPurchaseRequests);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Maintenance',
        estimatedAmount: '',
        propertyId: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await handleAddPurchaseRequest({
            ...formData,
            estimatedAmount: parseFloat(formData.estimatedAmount) || 0,
        });

        if (result.success) {
            toast({ title: t('common.success'), description: t('purchaseRequests.addedSuccessfully') });
            setIsAddDialogOpen(false);
            setFormData({ title: '', description: '', category: 'Maintenance', estimatedAmount: '', propertyId: '' });
            window.location.reload();
        } else {
            toast({ variant: 'destructive', title: t('common.error'), description: result.message });
        }
        setIsLoading(false);
    };

    const handleApprove = async (id: string) => {
        setIsLoading(true);
        const result = await handleApprovePurchaseRequest(id);
        if (result.success) {
            toast({ title: t('common.success'), description: t('purchaseRequests.approved') });
            window.location.reload();
        } else {
            toast({ variant: 'destructive', title: t('common.error'), description: result.message });
        }
        setIsLoading(false);
        setIsReviewDialogOpen(false);
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            toast({ variant: 'destructive', title: t('common.error'), description: t('purchaseRequests.rejectionReasonRequired') });
            return;
        }

        setIsLoading(true);
        const result = await handleRejectPurchaseRequest(selectedRequest.id, rejectionReason);
        if (result.success) {
            toast({ title: t('common.success'), description: t('purchaseRequests.rejected') });
            window.location.reload();
        } else {
            toast({ variant: 'destructive', title: t('common.error'), description: result.message });
        }
        setIsLoading(false);
        setIsReviewDialogOpen(false);
        setRejectionReason('');
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, any> = {
            Pending: { variant: 'secondary', color: 'bg-yellow-100 text-yellow-800' },
            Approved: { variant: 'default', color: 'bg-green-100 text-green-800' },
            Rejected: { variant: 'destructive', color: 'bg-red-100 text-red-800' },
            Completed: { variant: 'default', color: 'bg-blue-100 text-blue-800' },
            Cancelled: { variant: 'secondary', color: 'bg-gray-100 text-gray-800' },
        };
        
        return (
            <Badge className={variants[status]?.color || ''}>
                {t(`purchaseRequests.status.${status.toLowerCase()}`)}
            </Badge>
        );
    };

    const stats = {
        total: purchaseRequests.length,
        pending: purchaseRequests.filter(pr => pr.status === 'Pending').length,
        approved: purchaseRequests.filter(pr => pr.status === 'Approved').length,
        totalAmount: purchaseRequests.reduce((sum, pr) => sum + (pr.estimatedAmount || 0), 0),
    };

    return (
        <div className="flex flex-col min-h-screen" dir={t('common.direction') || 'rtl'}>
            <AppHeader loggedInEmployee={loggedInEmployee} />
            <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24 space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{t('purchaseRequests.title')}</h1>
                        <p className="text-muted-foreground mt-2">
                            {t('purchaseRequests.description')}
                        </p>
                    </div>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t('purchaseRequests.addNew')}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('purchaseRequests.totalRequests')}</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('purchaseRequests.pendingRequests')}</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('purchaseRequests.approvedRequests')}</CardTitle>
                            <Check className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{t('purchaseRequests.totalAmount')}</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">AED {stats.totalAmount.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('purchaseRequests.requestsList')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table dir="rtl">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">{t('purchaseRequests.title')}</TableHead>
                                    <TableHead className="text-right">{t('purchaseRequests.employee')}</TableHead>
                                    <TableHead className="text-right">{t('purchaseRequests.category')}</TableHead>
                                    <TableHead className="text-right">{t('purchaseRequests.property')}</TableHead>
                                    <TableHead className="text-right">{t('purchaseRequests.amount')}</TableHead>
                                    <TableHead className="text-right">{t('purchaseRequests.status')}</TableHead>
                                    <TableHead className="text-right">{t('purchaseRequests.date')}</TableHead>
                                    <TableHead className="text-right">{t('purchaseRequests.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchaseRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell className="text-right font-medium">{request.title}</TableCell>
                                        <TableCell className="text-right">{request.employeeName}</TableCell>
                                        <TableCell className="text-right">{request.category || '-'}</TableCell>
                                        <TableCell className="text-right">{request.propertyName || '-'}</TableCell>
                                        <TableCell className="text-right">AED {request.estimatedAmount?.toFixed(2) || '0.00'}</TableCell>
                                        <TableCell className="text-right">{getStatusBadge(request.status)}</TableCell>
                                        <TableCell className="text-right">{format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: ar })}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start">
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedRequest(request);
                                                        setIsReviewDialogOpen(true);
                                                    }}>
                                                        <Eye className="ml-2 h-4 w-4" />
                                                        {t('purchaseRequests.view')}
                                                    </DropdownMenuItem>
                                                    {canApprove && request.status === 'Pending' && (
                                                        <>
                                                            <DropdownMenuItem onClick={() => handleApprove(request.id)}>
                                                                <Check className="ml-2 h-4 w-4" />
                                                                {t('purchaseRequests.approve')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedRequest(request);
                                                                setIsReviewDialogOpen(true);
                                                            }}>
                                                                <X className="ml-2 h-4 w-4" />
                                                                {t('purchaseRequests.reject')}
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Add Dialog */}
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('purchaseRequests.addNew')}</DialogTitle>
                            <DialogDescription>{t('purchaseRequests.addDescription')}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">{t('purchaseRequests.titleLabel')}</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">{t('purchaseRequests.descriptionLabel')}</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">{t('purchaseRequests.categoryLabel')}</Label>
                                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Maintenance">{t('purchaseRequests.categories.maintenance')}</SelectItem>
                                        <SelectItem value="Cleaning">{t('purchaseRequests.categories.cleaning')}</SelectItem>
                                        <SelectItem value="Marketing">{t('purchaseRequests.categories.marketing')}</SelectItem>
                                        <SelectItem value="Utilities">{t('purchaseRequests.categories.utilities')}</SelectItem>
                                        <SelectItem value="Office">{t('purchaseRequests.categories.office')}</SelectItem>
                                        <SelectItem value="Other">{t('purchaseRequests.categories.other')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="estimatedAmount">{t('purchaseRequests.amountLabel')}</Label>
                                <Input
                                    id="estimatedAmount"
                                    type="number"
                                    step="0.01"
                                    value={formData.estimatedAmount}
                                    onChange={(e) => setFormData({ ...formData, estimatedAmount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="property">{t('purchaseRequests.propertyLabel')}</Label>
                                <Select value={formData.propertyId} onValueChange={(value) => setFormData({ ...formData, propertyId: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('purchaseRequests.selectProperty')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {properties.map((property) => (
                                            <SelectItem key={property.id} value={property.id}>
                                                {property.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                                    {t('common.cancel')}
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? t('common.loading') : t('purchaseRequests.submit')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Review Dialog */}
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{t('purchaseRequests.reviewTitle')}</DialogTitle>
                        </DialogHeader>
                        {selectedRequest && (
                            <div className="space-y-4">
                                <div>
                                    <Label>{t('purchaseRequests.titleLabel')}</Label>
                                    <p className="text-sm mt-1">{selectedRequest.title}</p>
                                </div>
                                <div>
                                    <Label>{t('purchaseRequests.employee')}</Label>
                                    <p className="text-sm mt-1">{selectedRequest.employeeName}</p>
                                </div>
                                <div>
                                    <Label>{t('purchaseRequests.descriptionLabel')}</Label>
                                    <p className="text-sm mt-1">{selectedRequest.description || '-'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>{t('purchaseRequests.categoryLabel')}</Label>
                                        <p className="text-sm mt-1">{selectedRequest.category || '-'}</p>
                                    </div>
                                    <div>
                                        <Label>{t('purchaseRequests.amountLabel')}</Label>
                                        <p className="text-sm mt-1 font-bold">AED {selectedRequest.estimatedAmount?.toFixed(2) || '0.00'}</p>
                                    </div>
                                </div>
                                <div>
                                    <Label>{t('purchaseRequests.status')}</Label>
                                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                                </div>
                                
                                {canApprove && selectedRequest.status === 'Pending' && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="rejectionReason">{t('purchaseRequests.rejectionReason')}</Label>
                                            <Textarea
                                                id="rejectionReason"
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                placeholder={t('purchaseRequests.rejectionReasonPlaceholder')}
                                            />
                                        </div>
                                        <DialogFooter className="gap-2">
                                            <Button type="button" variant="outline" onClick={() => handleReject()} disabled={isLoading || !rejectionReason.trim()}>
                                                <X className="mr-2 h-4 w-4" />
                                                {t('purchaseRequests.reject')}
                                            </Button>
                                            <Button type="button" onClick={() => handleApprove(selectedRequest.id)} disabled={isLoading}>
                                                <Check className="mr-2 h-4 w-4" />
                                                {t('purchaseRequests.approve')}
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}

