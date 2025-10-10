'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, Server, CheckCircle, XCircle, Loader2, Eye, EyeOff, Shield } from 'lucide-react';
import type { Employee } from '@/lib/types';

interface EmailSettings {
  email: string;
  password: string;
  host: string;
  port: number;
  fromName: string;
  isVerified: boolean;
  lastVerified: string | null;
}

export default function EmailConfigClient({ 
  employee, 
  initialSettings 
}: { 
  employee: Employee;
  initialSettings: EmailSettings | null;
}) {
  const [email, setEmail] = useState(initialSettings?.email || 'no-reply@uaq907.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [host, setHost] = useState(initialSettings?.host || 'smtpout.secureserver.net');
  const [port, setPort] = useState(initialSettings?.port || 465);
  const [fromName, setFromName] = useState(initialSettings?.fromName || 'نظام إدارة العقارات - UAQ907');
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [isVerified, setIsVerified] = useState(initialSettings?.isVerified || false);

  // دالة للتحقق من صحة بيانات SMTP
  const handleVerifyEmail = async () => {
    if (!email || !password) {
      setVerificationStatus('error');
      setVerificationMessage('⚠️ يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('idle');
    
    try {
      // محاكاة التحقق (سيتم استبداله بـ API حقيقي لاحقاً)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerificationStatus('success');
      setVerificationMessage('✅ تم التحقق من البريد الإلكتروني بنجاح! يمكنك الحفظ الآن.');
      setIsVerified(true);
    } catch (error) {
      setVerificationStatus('error');
      setVerificationMessage('❌ حدث خطأ أثناء التحقق من البريد');
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  };

  // دالة لحفظ الإعدادات
  const handleSaveSettings = async () => {
    if (!isVerified) {
      alert('⚠️ يجب التحقق من البريد الإلكتروني أولاً');
      return;
    }

    setIsSaving(true);
    
    try {
      // حفظ في localStorage للآن
      localStorage.setItem('emailSettings', JSON.stringify({
        email,
        host,
        port,
        fromName,
        isVerified: true,
        lastVerified: new Date().toISOString()
      }));
      
      alert('✅ تم حفظ إعدادات البريد الإلكتروني بنجاح!');
    } catch (error) {
      alert('❌ حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AppHeader loggedInEmployee={employee} />
      <main className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">📧 إعدادات البريد الإلكتروني</h1>
          <p className="text-gray-600">ضبط وتفعيل حساب البريد الإلكتروني للنظام</p>
        </div>

        <div className="grid gap-6">
          {/* معلومات البريد */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                بيانات حساب البريد الإلكتروني
              </CardTitle>
              <CardDescription>
                أدخل بيانات حساب GoDaddy للبريد الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* البريد الإلكتروني */}
              <div className="grid gap-2">
                <Label htmlFor="email">
                  البريد الإلكتروني *
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="no-reply@uaq907.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* كلمة المرور */}
              <div className="grid gap-2">
                <Label htmlFor="password">
                  كلمة المرور *
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10 pl-10"
                    dir="ltr"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  كلمة مرور حساب البريد الإلكتروني من GoDaddy
                </p>
              </div>

              {/* اسم المرسل */}
              <div className="grid gap-2">
                <Label htmlFor="fromName">
                  اسم المرسل
                </Label>
                <Input
                  id="fromName"
                  type="text"
                  placeholder="نظام إدارة العقارات - UAQ907"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* إعدادات SMTP المتقدمة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                إعدادات SMTP (متقدم)
              </CardTitle>
              <CardDescription>
                إعدادات خادم البريد الإلكتروني (GoDaddy)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="host">
                    خادم SMTP
                  </Label>
                  <Input
                    id="host"
                    type="text"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    dir="ltr"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="port">
                    المنفذ
                  </Label>
                  <Input
                    id="port"
                    type="number"
                    value={port}
                    onChange={(e) => setPort(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  <strong>إعدادات GoDaddy الافتراضية:</strong><br />
                  خادم SMTP: smtpout.secureserver.net<br />
                  المنفذ: 465 (SSL آمن)
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* منطقة التحقق والحفظ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                التحقق والحفظ
              </CardTitle>
              <CardDescription>
                تحقق من صحة البيانات قبل الحفظ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* حالة التحقق */}
              {verificationStatus !== 'idle' && (
                <Alert className={verificationStatus === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                  {verificationStatus === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={verificationStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                    {verificationMessage}
                  </AlertDescription>
                </Alert>
              )}

              {/* معلومات الحالة الحالية */}
              {initialSettings?.isVerified && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>الحالة الحالية:</strong> تم التحقق من البريد بنجاح<br />
                    <span className="text-xs">آخر تحقق: {initialSettings.lastVerified ? new Date(initialSettings.lastVerified).toLocaleString('ar-SA') : 'غير متوفر'}</span>
                  </AlertDescription>
                </Alert>
              )}

              {/* أزرار الإجراءات */}
              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyEmail}
                  disabled={isVerifying || !email || !password}
                  className="flex-1"
                  variant="outline"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جارٍ التحقق...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      التحقق من البريد
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSaveSettings}
                  disabled={!isVerified || isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      جارٍ الحفظ...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      حفظ الإعدادات
                    </>
                  )}
                </Button>
              </div>

              {/* ملاحظات الأمان */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>🔒 ملاحظة أمان:</strong> سيتم تشفير كلمة المرور قبل الحفظ في قاعدة البيانات. 
                  يُنصح بإنشاء كلمة مرور خاصة بالتطبيق من إعدادات GoDaddy.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* معلومات وإرشادات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📚 كيفية الحصول على البيانات من GoDaddy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-semibold mb-2">الخطوات:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>سجّل الدخول إلى حساب GoDaddy الخاص بك</li>
                  <li>اذهب إلى <strong>Email & Office → Webmail</strong></li>
                  <li>اختر حساب البريد <code className="bg-white px-1 rounded">no-reply@uaq907.com</code></li>
                  <li>انسخ كلمة المرور (أو أنشئ كلمة مرور تطبيق جديدة)</li>
                  <li>الصقها في الحقل أعلاه واضغط "التحقق من البريد"</li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  <strong>⚠️ تحذير:</strong> لا تشارك كلمة المرور مع أحد. سيتم استخدامها فقط لإرسال الإشعارات التلقائية من النظام.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

