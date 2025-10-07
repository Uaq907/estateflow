'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building, Clock, Droplets, LogIn, MapPin, Sun, Cloud, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WeatherInfo {
  description: string;
  temp: string;
  icon: React.ReactNode;
}

function getWeatherIcon(condition: string): React.ReactNode {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('clear')) return <Sun className="h-6 w-6 text-yellow-500" />;
    if (lowerCondition.includes('cloud')) return <Cloud className="h-6 w-6 text-gray-500" />;
    if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) return <Droplets className="h-6 w-6 text-blue-500" />;
    if (lowerCondition.includes('snow')) return <Snowflake className="h-6 w-6 text-blue-300" />;
    return <Sun className="h-6 w-6 text-yellow-500" />;
}

export default function LandingPage() {
  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  useEffect(() => {
    try {
      // Set time on mount and update every second
      setTime(new Date());
      const timer = setInterval(() => setTime(new Date()), 1000);

      // Set default weather (skip location/weather API to avoid server errors)
      setWeather({ description: 'Clear sky', temp: '25°C', icon: <Sun/> });

      return () => clearInterval(timer);
    } catch (error) {
      console.error('Error in useEffect:', error);
      // Set fallback values
      setTime(new Date());
      setWeather({ description: 'Clear sky', temp: '25°C', icon: <Sun/> });
    }
  }, []);

  // Format time function without date-fns
  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '12:00 PM';
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[10px_10px] dark:bg-grid-slate-400/[0.05]"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
            <Image 
              src="/uploads/logo/estateflowlogo.png" 
              alt="EstateFlow Logo"
              width={400}
              height={160}
              className="mb-8 object-contain invert dark:invert-0"
              priority
            />
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl">
                The all-in-one solution for modern real estate management. Streamline operations, manage properties, and delight tenants.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Local Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        {time ? <p className="text-2xl font-bold">{formatTime(time)}</p> : <Skeleton className="h-8 w-32" />}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Weather</CardTitle>
                        {weather ? weather.icon : <Sun className="h-4 w-4 text-muted-foreground"/>}
                    </CardHeader>
                    <CardContent>
                         {weather ? <p className="text-lg font-bold">{weather.temp} - {weather.description}</p> : <Skeleton className="h-8 w-36" />}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-10">
                <Button asChild size="lg">
                    <Link href="/login">
                        <LogIn className="mr-2" />
                        Access Your Portal
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}