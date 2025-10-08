
'use client';

import { useState, useMemo } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileSignature, Search, ServerCrash } from 'lucide-react';
import type { Employee, LeaseWithDetails } from '@/lib/types';
import LeaseList from './lease-list';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const leaseStatuses = ['Active', 'Completed', 'Cancelled', 'Completed with Dues', 'Cancelled with Dues'];

export default function LeaseManagementClient({
    initialLeases,
    loggedInEmployee,
    error,
}: {
    initialLeases: LeaseWithDetails[];
    loggedInEmployee: Employee | null;
    error?: string | null;
}) {
    const [leases, setLeases] = useState(initialLeases);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Active');
    const [currentPage, setCurrentPage] = useState(1);
    const leasesPerPage = 20;

    const filteredLeases = useMemo(() => {
        return leases.filter(item => {
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch =
                item.property.name?.toLowerCase().includes(searchLower) ||
                item.unit.unitNumber?.toLowerCase().includes(searchLower) ||
                item.tenant.name?.toLowerCase().includes(searchLower) ||
                (item.lease.businessName && item.lease.businessName.toLowerCase().includes(searchLower)) ||
                item.lease.id?.toLowerCase().includes(searchLower);

            const matchesStatus = statusFilter === 'all' || item.lease.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [leases, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredLeases.length / leasesPerPage);
    const paginatedLeases = filteredLeases.slice(
        (currentPage - 1) * leasesPerPage,
        currentPage * leasesPerPage
    );

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    
    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader loggedInEmployee={loggedInEmployee} />
            <main className="p-4 sm:p-6 lg:p-8 flex-grow pt-24">
                 {error && (
                    <Alert variant="destructive" className="mb-4">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>Error Fetching Data</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSignature className="h-6 w-6" />
                            All Leases
                        </CardTitle>
                        <CardDescription>A comprehensive list of all lease agreements across all properties.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-2 mb-4 p-4 border rounded-lg bg-muted/50">
                            <div className="relative flex-grow">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by property, unit, tenant, business..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-8 w-full"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {leaseStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <LeaseList leases={paginatedLeases} />
                    </CardContent>
                    {totalPages > 1 && (
                        <CardFooter className="flex items-center justify-end space-x-2 py-4">
                            <span className="text-sm text-muted-foreground">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </main>
        </div>
    );
}
