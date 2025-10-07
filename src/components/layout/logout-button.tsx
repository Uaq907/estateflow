
'use client';

import { LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { logout } from '@/app/dashboard/actions';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { useLanguage } from '../../contexts/language-context';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useLanguage();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await logout(null, null);
      if (result?.success) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      type="button" 
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full"
    >
      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>{isLoading ? (language === 'ar' ? 'جاري تسجيل الخروج...' : 'Logging out...') : t('user.logout')}</span>
      </DropdownMenuItem>
    </button>
  );
}
