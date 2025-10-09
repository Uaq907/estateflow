
'use client';

import { ServerCrash, LogIn, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { authenticate } from './actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useLanguage } from '@/contexts/language-context';


function LoginButton() {
  const { pending } = useFormStatus();
  const { t, language } = useLanguage();
  return (
    <Button className="w-full" aria-disabled={pending}>
      <LogIn className="mr-2" />
      {pending ? (language === 'ar' ? 'جاري تسجيل الدخول...' : 'Logging in...') : t('login.loginButton')}
    </Button>
  );
}



function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(undefined);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await authenticate(undefined, formData);
      setErrorMessage(result);
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t('login.email')}</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder=""
            required
            defaultValue=""
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t('login.password')}</Label>
          <div className="relative">
            <Input 
              id="password" 
              type={showPassword ? "text" : "password"} 
              name="password" 
              required 
              className="pr-10"
            />
            <button
              type="button"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none z-10"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
        
        {/* Demo Credentials Info */}
        <Alert className="w-full bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">بيانات الدخول التجريبية</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <div className="space-y-1 mt-2">
              <div><strong>البريد:</strong> uaq907@gmail.com</div>
              <div><strong>كلمة السر:</strong> demo123</div>
            </div>
          </AlertDescription>
        </Alert>
        
        {errorMessage && (
          <Alert variant="destructive" className="w-full">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>فشل تسجيل الدخول</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </form>
  )
}



export default function LoginPage() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
            <div className="flex justify-center mb-6">
                 <Image 
                    src="/uploads/logo/estateflowlogo.png" 
                    alt="EstateFlow Logo"
                    width={200}
                    height={80}
                    className="object-contain invert dark:invert-0"
                />
            </div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>{t('login.title')}</CardTitle>
                    <CardDescription>{t('login.subtitle')}</CardDescription>
                </CardHeader>
                <LoginForm />
            </Card>
        </div>
    </div>
  );
}
