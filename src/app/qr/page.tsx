'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { QrCode, Smartphone, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function QRPage() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCodeUrl = await QRCode.toDataURL(currentUrl, {
          width: 300,
          margin: 3,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (currentUrl) {
      generateQRCode();
    }
  }, [currentUrl]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image 
            src="/uploads/logo/estateflowlogo.png" 
            alt="EstateFlow Logo"
            width={250}
            height={100}
            className="object-contain invert dark:invert-0"
          />
        </div>

        {/* QR Code Card */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <QrCode className="h-6 w-6 text-blue-600" />
              الوصول السريع من الهاتف
            </CardTitle>
            <CardDescription>
              امسح الكود بالهاتف للوصول المباشر إلى EstateFlow
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code للوصول السريع" 
                    className="w-64 h-64"
                  />
                </div>
              </div>
            )}

            {/* URL */}
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                رابط الوصول:
              </p>
              <div className="flex items-center justify-center gap-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                  {currentUrl}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      نسخ
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Login Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                معلومات تسجيل الدخول
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p><strong>البريد الإلكتروني:</strong> uaq907@gmail.com</p>
                <p><strong>كلمة المرور:</strong> demo123</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                كيفية الاستخدام
              </h3>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 text-right">
                <li>1. افتح كاميرا الهاتف أو تطبيق مسح QR</li>
                <li>2. امسح الكود أعلاه</li>
                <li>3. سيتم فتح صفحة تسجيل الدخول</li>
                <li>4. استخدم معلومات تسجيل الدخول المعروضة</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


