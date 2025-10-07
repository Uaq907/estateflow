
'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
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
import { useToast } from '@/hooks/use-toast';
import { changePassword } from '@/app/dashboard/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ServerCrash } from 'lucide-react';

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  employeeId: string;
}


export default function ChangePasswordDialog({ isOpen, onOpenChange, employeeId }: ChangePasswordDialogProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState({ success: false, message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const result = await changePassword(null, formData);
    
    setState(result);
    setIsLoading(false);
    
    if (result.success) {
      toast({ title: 'Success', description: result.message });
      onOpenChange(false);
      formRef.current?.reset();
    }
  };

  useEffect(() => {
    // Reset form and state when dialog opens
    if (isOpen) {
        formRef.current?.reset();
        setState({ success: false, message: '' });
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current and new password below.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" name="currentPassword" type="password" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" name="newPassword" type="password" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" required />
                </div>
                 {!state.success && state.message && (
                    <Alert variant="destructive">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{state.message}</AlertDescription>
                    </Alert>
                )}
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Change Password'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
