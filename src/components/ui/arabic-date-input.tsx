'use client';

import { useState, useEffect } from 'react';

interface ArabicDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ArabicDateInput({ value, onChange, placeholder, className = '' }: ArabicDateInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value) {
      // تحويل التاريخ إلى اللغة العربية
      const date = new Date(value);
      const arabicDate = date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      setDisplayValue(arabicDate);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleInputClick = () => {
    // فتح نافذة اختيار التاريخ
    const input = document.createElement('input');
    input.type = 'date';
    input.value = value;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      onChange(target.value);
    };
    input.click();
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onClick={handleInputClick}
        placeholder={placeholder || 'اختر التاريخ'}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-right cursor-pointer ${className}`}
        readOnly
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
        📅
      </div>
    </div>
  );
}

// مكون لعرض التاريخ باللغة العربية
export function ArabicDateDisplay({ date }: { date: string }) {
  if (!date) return <span className="text-muted-foreground">غير محدد</span>;

  const formatArabicDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return <span>{formatArabicDate(date)}</span>;
}
