'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { QrCode, Smartphone, Copy, Check, Wifi, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ExternalQRPage() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [externalIP, setExternalIP] = useState<string>('');
  const [localIP, setLocalIP] = useState<string>('');
  const [externalUrl, setExternalUrl] = useState<string>('');

  useEffect(() => {
    // Get local IP
    if (typeof window !== 'undefined') {
      setLocalIP(window.location.hostname);
    }

    // Get external IP and generate QR code
    const fetchExternalIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org');
        const ip = await response.text();
        setExternalIP(ip);
        setExternalUrl(`http://${ip}:5000`);
        
        // Generate QR code for external access
        const qrCodeUrl = await QRCode.toDataURL(`http://${ip}:5000`, {
          width: 300,
          margin: 3,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error fetching external IP:', error);
        // Fallback to local IP
        const fallbackUrl = typeof window !== 'undefined' ? window.location.origin : '';
        setExternalUrl(fallbackUrl);
        if (fallbackUrl) {
          const qrCodeUrl = await QRCode.toDataURL(fallbackUrl, {
            width: 300,
            margin: 3,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataUrl(qrCodeUrl);
        }
      }
    };

    fetchExternalIP();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
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
              <Globe className="h-6 w-6 text-blue-600" />
              الوصول الخارجي من أي مكان
            </CardTitle>
            <CardDescription>
              امسح الكود بالهاتف للوصول إلى EstateFlow من أي شبكة
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code للوصول الخارجي" 
                    className="w-64 h-64"
                  />
                </div>
              </div>
            )}

            {/* IP Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* External IP */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    الوصول الخارجي
                  </span>
                  <Badge variant="secondary">من الإنترنت</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded">
                    {externalUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(externalUrl)}
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
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  IP الخارجي: {externalIP}
                </p>
              </div>

              {/* Local IP */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-100">
                    الوصول المحلي
                  </span>
                  <Badge variant="secondary">شبكة محلية</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded">
                    http://{localIP}:5000
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`http://${localIP}:5000`)}
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
                <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                  IP المحلي: {localIP}
                </p>
              </div>
            </div>

            {/* Login Info */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                معلومات تسجيل الدخول
              </h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p><strong>البريد الإلكتروني:</strong> uaq907@gmail.com</p>
                <p><strong>كلمة المرور:</strong> demo123</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ تعليمات مهمة للوصول الخارجي
              </h3>
              <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2 text-right">
                <p><strong>للوصول من خارج الشبكة:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>تأكد من تفعيل Port Forwarding في الراوتر للمنفذ 5000</li>
                  <li>تأكد من إيقاف Windows Firewall أو إضافة استثناء للمنفذ 5000</li>
                  <li>استخدم عنوان IP الخارجي المعروض أعلاه</li>
                </ol>
                <p className="mt-2 text-xs">
                  <strong>ملاحظة:</strong> إذا لم يعمل الوصول الخارجي، استخدم الوصول المحلي من نفس الشبكة
                </p>
              </div>
            </div>

            {/* Usage Instructions */}
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


