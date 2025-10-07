
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import type { Employee, PropertyDocument } from '@/lib/types';
import { Upload, Trash2, FileText, ServerCrash } from 'lucide-react';
import { handleDeletePropertyDocument, handleAddPropertyDocument } from '@/app/dashboard/actions';
import { getPropertyDocuments } from '@/lib/db';
import { format, formatDistanceToNow } from 'date-fns';
import { hasPermission } from '@/lib/permissions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface PropertyDocumentsProps {
  propertyId: string;
  initialDocuments: PropertyDocument[];
  loggedInEmployee: Employee | null;
}

const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_FILE_SIZE_MB) || 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;


export default function PropertyDocuments({ propertyId, initialDocuments, loggedInEmployee }: PropertyDocumentsProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<PropertyDocument | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { toast } = useToast();
  const [selectedFileSize, setSelectedFileSize] = useState<number | null>(null);


  const canUpload = hasPermission(loggedInEmployee, 'properties:documents:update');
  const canDelete = hasPermission(loggedInEmployee, 'properties:documents:delete');

  const refreshDocuments = async () => {
    const updatedDocs = await getPropertyDocuments(propertyId);
    setDocuments(updatedDocs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setSelectedFileSize(selectedFile.size);
        if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
            setFileError(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
        } else {
            setFileError(null);
        }
    } else {
        setSelectedFileSize(null);
        setFileError(null);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return null;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canUpload) {
        toast({ variant: 'destructive', title: 'Error', description: 'Permission denied.' });
        return;
    }
    if (fileError) {
        toast({ variant: 'destructive', title: 'Error', description: fileError });
        return;
    }
    
    setIsUploading(true);
    
    const formData = new FormData(event.currentTarget);
    const result = await handleAddPropertyDocument(formData);

    if (result.success) {
      toast({ title: 'Success', description: 'Document uploaded successfully.' });
      await refreshDocuments();
      (event.target as HTMLFormElement).reset();
      setSelectedFileSize(null);
      setFileError(null);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }

    setIsUploading(false);
  };
  
  const handleDelete = async (docId: string) => {
    const result = await handleDeletePropertyDocument(docId);
    if (result.success) {
      toast({ title: 'Success', description: 'Document deleted successfully.' });
      await refreshDocuments();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsAlertOpen(false);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Documents</CardTitle>
        <CardDescription>Manage floor plans, diagrams, and other property-specific files.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground"/>
                        {doc.documentName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {doc.createdAt ? formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true }) : 'Unknown'}
                    </TableCell>
                    <TableCell className="text-right">
                       {doc.documentUrl ? (
                         <Button asChild variant="outline" size="sm" className="mr-2">
                           <Link href={doc.documentUrl} target="_blank">View</Link>
                         </Button>
                       ) : (
                         <Button variant="outline" size="sm" className="mr-2" disabled>
                           No Link
                         </Button>
                       )}
                      {canDelete && (
                        <Button variant="destructive" size="sm" onClick={() => { setDocToDelete(doc); setIsAlertOpen(true); }}>
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No documents uploaded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {canUpload && (
          <form onSubmit={handleUpload} className="space-y-4 pt-4 border-t">
             <input type="hidden" name="propertyId" value={propertyId} />
             <h4 className="font-medium">Upload New Document</h4>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="documentName">Document Name</Label>
                    <Input 
                        id="documentName" 
                        name="documentName"
                        placeholder="e.g., Ground Floor Plan"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="document">File</Label>
                    <Input id="document" name="document" type="file" onChange={handleFileChange} required />
                </div>
             </div>
              <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                <span>Max file size: {MAX_FILE_SIZE_MB}MB.</span>
                {selectedFileSize && <span>Selected: {formatFileSize(selectedFileSize)}</span>}
              </div>
             {fileError && <p className="text-sm text-destructive">{fileError}</p>}
             <Button type="submit" disabled={isUploading || !!fileError}>
                <Upload className="mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Document'}
             </Button>
          </form>
        )}
      </CardContent>

       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document: <span className="font-semibold">{docToDelete?.documentName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(docToDelete!.id)} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
